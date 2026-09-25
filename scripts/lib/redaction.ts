import { Document, isScalar, Scalar, visit } from "yaml";
import { z } from "zod";
import { schemaEntreeAuteur, schemaEntreeOuvrage, schemaEntreeRedaction, type NATURES } from "../../src/lib/schema.ts";
import { REFLEXIONS, type Reflexion } from "../../src/lib/sources.ts";

/** Niveau de réflexion lu sur la ligne de commande : rien, un niveau connu, ou une erreur. */
export function lireReflexion(valeur: string | undefined): { reflexion?: Reflexion } | { erreur: string } {
  if (valeur === undefined) return {};
  return (REFLEXIONS as readonly string[]).includes(valeur) ? { reflexion: valeur as Reflexion } : { erreur: `--reflexion : ${REFLEXIONS.join(", ")}` };
}

/** Le moteur qui a rédigé : son modèle, et le niveau de réflexion s'il est connu. */
export interface Moteur {
  modele: string;
  reflexion?: Reflexion;
}

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
      const propre = nettoyer(v, k);
      // Un objet vidé de ses valeurs par défaut (tradition sans renvoi) ne s'écrit pas non plus.
      if (propre && typeof propre === "object" && !Array.isArray(propre) && Object.keys(propre).length === 0) continue;
      sortie[k] = propre;
    }
    return sortie;
  }
  return valeur;
}

/** Champs que les scripts écrivent : l'IA ne les fournit jamais. */
const CHAMPS_INTERDITS = ["sources", "redaction", "statut", "historique"];

type Resultat = { fiche: Record<string, unknown> } | { erreurs: string[] };

/** Contenu validé par son schéma d'entrée, puis complété du socle éditorial (a-verifier, rédaction IA). */
function preparer<T extends object>(
  brute: Record<string, unknown>,
  schema: z.ZodType<T>,
  { modele, reflexion }: Moteur,
  completer: (contenu: T) => Record<string, unknown> | string = (c) => ({ ...c }) as Record<string, unknown>,
): Resultat {
  const tradition = brute.tradition as Record<string, unknown> | undefined;
  const interdits = [...CHAMPS_INTERDITS.filter((c) => c in brute), ...(tradition && "lectures" in tradition ? ["tradition.lectures"] : [])];
  if (interdits.length > 0) {
    return { erreurs: [`${interdits.join(", ")} : écrits par les scripts (sources : npm run verifier ; lectures : passe à part)`] };
  }
  const resultat = schema.safeParse(brute);
  if (!resultat.success) return { erreurs: resultat.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`) };
  const complete = completer(resultat.data);
  if (typeof complete === "string") return { erreurs: [complete] };
  const contenu = nettoyer(complete) as Record<string, unknown>;
  return { fiche: { ...contenu, redaction: [{ par: "IA", detail: modele, ...(reflexion ? { reflexion } : {}) }], statut: "a-verifier" } };
}

/** Fiche d'un mot à partir du contenu rédigé par l'IA ; la nature est tirée du Littré si absente. */
export function preparerFiche(
  brute: Record<string, unknown>,
  { natureLittre, ...moteur }: Moteur & { natureLittre?: (typeof NATURES)[number] },
): Resultat {
  return preparer(brute, schemaEntreeRedaction, moteur, (e) => {
    const nature = e.nature ?? (natureLittre ? [natureLittre] : undefined);
    if (nature === undefined) return "nature : absente du Littré, à fournir";
    const { mot, nature: _donnee, ...reste } = e;
    return { mot, nature, ...reste };
  });
}

/** Fiche d'un auteur ou d'un ouvrage à partir du contenu rédigé par l'IA. */
export function preparerAuteur(brute: Record<string, unknown>, moteur: Moteur): Resultat {
  return preparer(brute, schemaEntreeAuteur, moteur);
}
export function preparerOuvrage(brute: Record<string, unknown>, moteur: Moteur): Resultat {
  return preparer(brute, schemaEntreeOuvrage, moteur);
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
