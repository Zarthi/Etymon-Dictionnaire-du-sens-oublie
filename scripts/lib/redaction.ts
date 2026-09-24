import { Document, isMap, isScalar, isSeq, Scalar } from "yaml";
import { z } from "zod";
import { schemaEntreeRedaction, type NATURES } from "../../src/lib/schema.ts";

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

type Entree = z.infer<typeof schemaEntreeRedaction>;

/** Champs que les scripts écrivent : l'IA ne les fournit jamais. */
const CHAMPS_INTERDITS = ["sources", "redaction", "lecturesTraditionnelles", "statut", "historique"];

/**
 * Fiche complète à partir du contenu rédigé par l'IA : typographie corrigée, nature tirée du
 * Littré si absente, valeurs par défaut omises, statut a-verifier et rédaction IA posés.
 */
export function preparerFiche(
  brute: Record<string, unknown>,
  { modele, natureLittre }: { modele: string; natureLittre?: (typeof NATURES)[number] },
): { fiche: Record<string, unknown> } | { erreurs: string[] } {
  const interdits = CHAMPS_INTERDITS.filter((c) => c in brute);
  if (interdits.length > 0) {
    return { erreurs: [`${interdits.join(", ")} : écrits par les scripts (sources : npm run verifier ; lectures : passe à part)`] };
  }
  const resultat = schemaEntreeRedaction.safeParse(brute);
  if (!resultat.success) return { erreurs: resultat.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`) };
  const e: Entree = resultat.data;
  const nature = e.nature ?? (natureLittre ? [natureLittre] : undefined);
  if (nature === undefined) return { erreurs: ["nature : absente du Littré, à fournir"] };

  const t = corrigerTypographie;
  const fiche: Record<string, unknown> = {
    mot: e.mot,
    nature,
    etymon: e.etymon,
    ...(e.graphie ? { graphie: e.graphie } : {}),
    langue: e.langue,
    ...(e.forge ? { forge: e.forge } : {}),
    sens: t(e.sens),
    explication: t(e.explication),
    ...(e.legende ? { legende: { ...e.legende, sens: t(e.legende.sens), ...(e.legende.explication ? { explication: t(e.legende.explication) } : {}) } } : {}),
    ...(e.incertain ? { incertain: true } : {}),
    ...(e.origine
      ? {
          origine: {
            ...(e.origine.mode !== "filiation" ? { mode: e.origine.mode } : {}),
            formes: e.origine.formes.map((f) => ({ ...f, sens: t(f.sens) })),
          },
        }
      : {}),
    ...(e.doublets.length > 0 ? { doublets: e.doublets } : {}),
    ...(e.famille.length > 0 ? { famille: e.famille } : {}),
    themes: e.themes,
    redaction: [{ par: "IA", detail: modele }],
    statut: "a-verifier",
  };
  return { fiche };
}

/** YAML d'une fiche, au style des fiches existantes : listes courtes en ligne, explication en bloc replié. */
export function versYaml(fiche: Record<string, unknown>): string {
  const document = new Document(fiche);
  const enLigne = ["nature", "doublets", "famille", "themes"];
  for (const cle of enLigne) {
    const liste = document.get(cle, true);
    if (isSeq(liste)) liste.flow = true;
  }
  const formes = document.getIn(["origine", "formes"], true);
  if (isSeq(formes)) {
    for (const forme of formes.items) {
      const selon = isMap(forme) ? forme.get("selon", true) : undefined;
      if (isSeq(selon)) selon.flow = true;
    }
  }
  const explication = document.get("explication", true);
  if (isScalar(explication)) (explication as Scalar).type = Scalar.BLOCK_FOLDED;
  return document.toString({ lineWidth: 80 });
}
