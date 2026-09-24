import { Document, isScalar, Scalar, visit } from "yaml";
import { z } from "zod";
import { schemaEntreeAuteur, schemaEntreeOuvrage, schemaEntreeRedaction, type NATURES } from "../../src/lib/schema.ts";

const NBSP = "\u00a0";

/**
 * Typographie française posée à la place du rédacteur : espace insécable avant « : ; ? ! »
 * et à l'intérieur des guillemets, guillemets droits remplacés par « ». Rien d'autre n'est touché.
 */
export function corrigerTypographie(texte: string): string {
  return texte
    .replace(/"([^"]*)"/g, "«$1»")
    .replace(/[ \u00a0\u202f]*([:;?!])/g, (tout, signe: string, i: number, t: string) => (i === 0 || "?!".includes(t[i - 1]) ? tout : NBSP + signe))
    .replace(/«[ \u00a0\u202f]*/g, "«" + NBSP)
    .replace(/[ \u00a0\u202f]*»/g, NBSP + "»");
}

/** Champs de texte affichés, dont la typographie est corrigée où qu'ils se trouvent. */
const TEXTES = new Set(["sens", "explication", "raison", "description"]);

/**
 * Contenu nettoyé : typographie corrigée dans les textes, valeurs par défaut retirées (listes
 * vides, booléens faux), pour des fiches sans bruit.
 */
function nettoyer(valeur: unknown, cle = ""): unknown {
  if (typeof valeur === "string") return TEXTES.has(cle) ? corrigerTypographie(valeur) : valeur;
  if (Array.isArray(valeur)) return valeur.map((v) => nettoyer(v));
  if (valeur && typeof valeur === "object") {
    const sortie: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valeur)) {
      if (v === undefined || v === false || (Array.isArray(v) && v.length === 0)) continue;
      sortie[k] = nettoyer(v, k);
    }
    return sortie;
  }
  return valeur;
}

/** Champs que les scripts écrivent : l'IA ne les fournit jamais. */
const CHAMPS_INTERDITS = ["sources", "redaction", "lecturesTraditionnelles", "statut", "historique"];

type Resultat = { fiche: Record<string, unknown> } | { erreurs: string[] };

/** Contenu validé par son schéma d'entrée, puis complété du socle éditorial (a-verifier, rédaction IA). */
function preparer<T extends object>(
  brute: Record<string, unknown>,
  schema: z.ZodType<T>,
  modele: string,
  completer: (contenu: T) => Record<string, unknown> | string = (c) => ({ ...c }) as Record<string, unknown>,
): Resultat {
  const interdits = CHAMPS_INTERDITS.filter((c) => c in brute);
  if (interdits.length > 0) {
    return { erreurs: [`${interdits.join(", ")} : écrits par les scripts (sources : npm run verifier ; lectures : passe à part)`] };
  }
  const resultat = schema.safeParse(brute);
  if (!resultat.success) return { erreurs: resultat.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`) };
  const complete = completer(resultat.data);
  if (typeof complete === "string") return { erreurs: [complete] };
  const contenu = nettoyer(complete) as Record<string, unknown>;
  return { fiche: { ...contenu, redaction: [{ par: "IA", detail: modele }], statut: "a-verifier" } };
}

/** Fiche d'un mot à partir du contenu rédigé par l'IA ; la nature est tirée du Littré si absente. */
export function preparerFiche(
  brute: Record<string, unknown>,
  { modele, natureLittre }: { modele: string; natureLittre?: (typeof NATURES)[number] },
): Resultat {
  return preparer(brute, schemaEntreeRedaction, modele, (e) => {
    const nature = e.nature ?? (natureLittre ? [natureLittre] : undefined);
    if (nature === undefined) return "nature : absente du Littré, à fournir";
    const { mot, nature: _donnee, ...reste } = e;
    return { mot, nature, ...reste };
  });
}

/** Fiche d'un auteur ou d'un ouvrage à partir du contenu rédigé par l'IA. */
export function preparerAuteur(brute: Record<string, unknown>, modele: string): Resultat {
  return preparer(brute, schemaEntreeAuteur, modele);
}
export function preparerOuvrage(brute: Record<string, unknown>, modele: string): Resultat {
  return preparer(brute, schemaEntreeOuvrage, modele);
}

/** YAML d'une fiche, au style des fiches existantes : listes de mots en ligne, textes longs en bloc replié. */
export function versYaml(fiche: Record<string, unknown>): string {
  const document = new Document(fiche);
  visit(document, {
    Seq(_, liste) {
      if (liste.items.length > 0 && liste.items.every(isScalar)) liste.flow = true;
    },
  });
  for (const cle of ["explication", "description"]) {
    const texte = document.get(cle, true);
    if (isScalar(texte)) (texte as Scalar).type = Scalar.BLOCK_FOLDED;
  }
  return document.toString({ lineWidth: 80 });
}
