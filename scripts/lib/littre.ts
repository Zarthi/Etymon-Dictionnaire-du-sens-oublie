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
    // La vedette porte parfois le féminin : « ABSOLU, UE ». On ne garde que la première forme.
    if (etymologie !== "") entrees.push({ terme: texteBrut(terme).toLowerCase().split(",")[0].trim(), etymologie });
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

/** Entrées du Littré pour un mot, au singulier ou au pluriel (« ANCÊTRES »). */
export function chercher(index: IndexLittre, mot: string): EntreeLittre[] | undefined {
  const cle = normaliser(mot);
  return index[cle] ?? index[`${cle}s`] ?? index[cle.replace(/s$/, "")];
}

/** Translittération des lettres grecques, pour comparer aux étymons écrits en alphabet latin. */
const GREC: Record<string, string> = {
  α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "e", θ: "th", ι: "i", κ: "k", ϰ: "k", λ: "l", μ: "m",
  ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "ph", χ: "kh", ψ: "ps", ω: "o",
};

/** Lettres latines seules, sans accents ni ponctuation, grec translittéré : « ex-tonare » → « extonare ». */
function lettres(texte: string): string {
  const sansAccents = texte.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return [...sansAccents].map((c) => GREC[c] ?? c).join("").replace(/[^a-z]/g, "");
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
 * Verdict du Littré sur une fiche rédigée de mémoire : l'étymon ou la racine doit figurer
 * dans son étymologie. Seule une concordance sans doute exprimé permet de passer la fiche en brouillon.
 */
export function verdict(formes: string[], entrees: EntreeLittre[] | undefined): Verdict {
  if (!entrees || entrees.length === 0) return { resultat: "absent" };
  const concordante = entrees.find((e) => formes.some((f) => concorde(f, e.etymologie)));
  if (!concordante) return { resultat: "discordance", entree: entrees[0] };
  return { resultat: douteux(concordante.etymologie) ? "doute" : "concorde", entree: concordante };
}
