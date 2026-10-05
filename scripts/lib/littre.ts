import { normaliser } from "../../src/lib/recherche.ts";
import type { NATURES } from "../../src/lib/schema.ts";

/** Entrée du Littré réduite à ce qui nous sert : la vedette, sa nature grammaticale et son étymologie (vide si absente). */
export interface EntreeLittre {
  terme: string;
  nature?: string;
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

/** Entrées d'un fichier XMLittré, avec ou sans étymologie (supplément compris). */
export function extraireEntrees(xml: string): EntreeLittre[] {
  const entrees: EntreeLittre[] = [];
  for (const [, attributs, contenu] of xml.matchAll(/<entree ([^>]*)>([\s\S]*?)<\/entree>/g)) {
    const terme = /terme="([^"]+)"/.exec(attributs)?.[1];
    if (!terme) continue;
    const etymologie = [...contenu.matchAll(/<rubrique nom="ÉTYMOLOGIE">([\s\S]*?)<\/rubrique>/g)]
      .map(([, texte]) => texteBrut(texte))
      .filter((texte) => texte !== "")
      .join(" ");
    const nature = /<entete>[^]*?<nature>([^<]+)<\/nature>[^]*?<\/entete>/.exec(contenu)?.[1];
    // La vedette porte parfois le féminin : « ABSOLU, UE ». On ne garde que la première forme.
    entrees.push({
      terme: texteBrut(terme).toLowerCase().split(",")[0].trim(),
      ...(nature ? { nature: texteBrut(nature) } : {}),
      etymologie,
    });
  }
  return entrees;
}

export function indexer(entrees: EntreeLittre[]): IndexLittre {
  const index: IndexLittre = {};
  for (const entree of entrees) (index[normaliser(entree.terme)] ??= []).push(entree);
  return index;
}

/** Nature grammaticale du Littré (« s. f. », « v. a. », « adj. ») traduite dans la liste fermée des fiches. */
export function natureDepuisLittre(nature: string | undefined): (typeof NATURES)[number] | undefined {
  // « s. m. et f. » → « smetf », « s. f. pl. » → « sf » : points, blancs et pluriel ignorés.
  const n = nature?.toLowerCase().replace(/[.\s]/g, "").replace(/pl$/, "");
  const natures: Record<string, (typeof NATURES)[number]> = {
    sm: "nom masculin",
    sf: "nom féminin",
    smetf: "nom",
    va: "verbe",
    vn: "verbe",
    vréfl: "verbe",
    adj: "adjectif",
    adjm: "adjectif",
    adjf: "adjectif",
    adv: "adverbe",
    interj: "interjection",
  };
  return n === undefined ? undefined : natures[n];
}

export function urlLittre(terme: string): string {
  return `https://www.littre.org/definition/${encodeURIComponent(terme)}`;
}

/** Entrées du Littré pour un mot, au singulier ou au pluriel (« ANCÊTRES »). */
export function chercher(index: IndexLittre, mot: string): EntreeLittre[] | undefined {
  const cle = normaliser(mot);
  return index[cle] ?? index[`${cle}s`] ?? index[cle.replace(/s$/, "")];
}

/**
 * Nature d'un mot d'après ses entrées du Littré : celle de l'entrée écrite comme le mot, accents
 * compris (« âme », non l'adjectif « amé », que la normalisation confond), sinon la première connue.
 */
export function natureDuMot(entrees: EntreeLittre[], mot: string): (typeof NATURES)[number] | undefined {
  const exactes = entrees.filter((e) => e.terme.toLowerCase() === mot.toLowerCase());
  return [...exactes, ...entrees].map((e) => natureDepuisLittre(e.nature)).find(Boolean);
}

/** Translittération des lettres grecques, pour comparer aux étymons écrits en alphabet latin. */
const GREC: Record<string, string> = {
  α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "e", θ: "th", ι: "i", κ: "k", ϰ: "k", λ: "l", μ: "m",
  ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "ph", χ: "kh", ψ: "ps", ω: "o",
};

/** Mots en lettres latines seules, sans accents ni ponctuation, grec translittéré : « ex-tonare » → « extonare ». */
function mots(texte: string): string[] {
  const sansAccents = texte.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const latin = [...sansAccents].map((c) => GREC[c] ?? c).join("");
  return latin.replace(/-/g, "").replace(/[^a-z]+/g, " ").trim().split(" ").filter((m) => m !== "");
}

/** Radical d'un mot : moins ses deux dernières lettres, 4 au minimum, pour tolérer les cas latins (« merces » cité « mercedem »). */
const radical = (mot: string) => (mot.length <= 4 ? mot : mot.slice(0, Math.max(4, mot.length - 2)));

/**
 * L'étymologie du Littré mentionne-t-elle l'étymon de la fiche ?
 * Comparaison par mots entiers (le mot cité commence par le radical du mot cherché), jamais en
 * sous-chaîne : « res » ne concorde pas avec « pressare ». Une forme de moins de 5 lettres est refusée.
 */
export function concorde(etymon: string, etymologie: string): boolean {
  const cherches = mots(etymon);
  if (cherches.join("").length < 5) return false;
  const cites = mots(etymologie);
  return cites.some((_, i) => cherches.every((c, j) => cites[i + j]?.startsWith(radical(c))));
}
