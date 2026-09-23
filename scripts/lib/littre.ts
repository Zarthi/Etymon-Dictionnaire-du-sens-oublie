import { normaliser } from "../../src/lib/recherche.ts";

/** Entrée du Littré réduite à ce qui nous sert : la vedette et son étymologie. */
export interface EntreeLittre {
  terme: string;
  etymologie: string;
}

/** Index du Littré : forme normalisée du mot → entrées (plusieurs en cas d'homonymes). */
export type IndexLittre = Record<string, EntreeLittre[]>;

const ENTITES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Texte brut d'un fragment XML : balises retirées, entités décodées, blancs réduits. */
export function texteBrut(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (tout, code: string) => {
      if (code[0] !== "#") return ENTITES[code] ?? tout;
      return String.fromCodePoint(code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** Entrées d'un fichier XMLittré qui ont une étymologie (supplément compris). */
export function extraireEntrees(xml: string): EntreeLittre[] {
  const entrees: EntreeLittre[] = [];
  for (const [, attributs, contenu] of xml.matchAll(/<entree ([^>]*)>([\s\S]*?)<\/entree>/g)) {
    const terme = /terme="([^"]+)"/.exec(attributs)?.[1];
    if (!terme) continue;
    const etymologie = [...contenu.matchAll(/<rubrique nom="ÉTYMOLOGIE">([\s\S]*?)<\/rubrique>/g)]
      .map(([, texte]) => texteBrut(texte))
      .filter((texte) => texte !== "")
      .join(" ");
    if (etymologie !== "") entrees.push({ terme: texteBrut(terme).toLowerCase(), etymologie });
  }
  return entrees;
}

export function indexer(entrees: EntreeLittre[]): IndexLittre {
  const index: IndexLittre = {};
  for (const entree of entrees) (index[normaliser(entree.terme)] ??= []).push(entree);
  return index;
}

export function urlLittre(terme: string): string {
  return `https://www.littre.org/definition/${encodeURIComponent(terme)}`;
}

/** Lettres seules, sans accents ni ponctuation : « ex-tonare » → « extonare ». */
function lettres(texte: string): string {
  return normaliser(texte).replace(/[^a-z]/g, "");
}

/**
 * L'étymologie du Littré mentionne-t-elle l'étymon de la fiche ?
 * On compare le radical (étymon moins ses deux dernières lettres, 4 au minimum),
 * pour tolérer les cas latins : « merces » est cité « mercedem », « potio » « potionem ».
 */
export function concorde(etymon: string, etymologie: string): boolean {
  const forme = lettres(etymon);
  if (forme.length < 3) return false;
  const radical = forme.length <= 4 ? forme : forme.slice(0, Math.max(4, forme.length - 2));
  return lettres(etymologie).includes(radical);
}

/** Le Littré exprime-t-il lui-même un doute sur l'étymologie ? */
export function douteux(etymologie: string): boolean {
  return /douteu|incertain|obscur|inconnu/i.test(etymologie);
}

export type Verdict =
  | { resultat: "concorde"; entree: EntreeLittre }
  | { resultat: "doute" | "discordance"; entree: EntreeLittre }
  | { resultat: "absent" };

/**
 * Verdict du Littré sur l'étymon d'une fiche rédigée de mémoire.
 * Seule une concordance sans doute exprimé permet de passer la fiche en brouillon.
 */
export function verdict(etymon: string, entrees: EntreeLittre[] | undefined): Verdict {
  if (!entrees || entrees.length === 0) return { resultat: "absent" };
  const concordante = entrees.find((e) => concorde(etymon, e.etymologie));
  if (!concordante) return { resultat: "discordance", entree: entrees[0] };
  return { resultat: douteux(concordante.etymologie) ? "doute" : "concorde", entree: concordante };
}
