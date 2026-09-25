import { normaliserCitation } from "./en-ligne.ts";

/**
 * Corpus de réflexe des lectures traditionnelles (docs/methode.md) : les œuvres qu'on interroge
 * pour chaque mot, parce qu'elles lisent les mots eux-mêmes, qu'on peut y chercher un mot, et que
 * leur texte original est en ligne, du domaine public. C'est un plancher, jamais une limite : tout
 * autre auteur traditionnel qui a lu le mot se cherche aussi.
 */
export interface Oeuvre {
  id: string;
  titre: string;
  tradition: string;
  langue: string;
  /** Ce qu'elle apporte, en une ligne, pour la consigne des lectures. */
  role: string;
  pages: { repere: string; url: string }[];
}

const WIKISOURCE_LA = "https://la.wikisource.org/wiki/";
const WIKISOURCE_HE = "https://he.wikisource.org/wiki/";
const ROMAINS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

/** Numéral hébreu d'un chapitre (1 à 99) : א, ט״ו s'écrit טו, ט״ז s'écrit טז. */
export function numeralHebreu(n: number): string {
  if (n === 15) return "טו";
  if (n === 16) return "טז";
  const dizaines = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"][Math.floor(n / 10)];
  const unites = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"][n % 10];
  return dizaines + unites;
}

const TORAH: [string, number][] = [
  ["בראשית", 50],
  ["שמות", 40],
  ["ויקרא", 27],
  ["במדבר", 36],
  ["דברים", 34],
];

export const CORPUS: Oeuvre[] = [
  {
    id: "etymologies",
    titre: "Isidore de Séville, Étymologies",
    tradition: "chrétienne",
    langue: "latin",
    role: "l'origine des mots latins, rangés par choses : la force du mot par l'interprétation",
    pages: ROMAINS.map((r) => ({ repere: `livre ${r}`, url: `${WIKISOURCE_LA}Etymologiarum_libri_XX/Liber_${r}` })),
  },
  {
    id: "differences",
    titre: "Isidore de Séville, Différences",
    tradition: "chrétienne",
    langue: "latin",
    role: "ce qui distingue deux mots voisins (misericordia et miseratio)",
    pages: [{ repere: "livres I et II", url: `${WIKISOURCE_LA}Differentiae` }],
  },
  {
    id: "noms-hebreux",
    titre: "Jérôme, Livre des noms hébreux",
    tradition: "chrétienne",
    langue: "latin",
    role: "le sens des noms hébreux de la Bible",
    pages: [{ repere: "", url: `${WIKISOURCE_LA}De_nominibus_Hebraicis_(Hieronymus)` }],
  },
  {
    id: "rashi-torah",
    titre: "Rashi, Commentaire sur la Torah",
    tradition: "juive",
    langue: "hébreu",
    role: "le sens des mots hébreux de la Torah, verset par verset",
    pages: TORAH.flatMap(([livre, chapitres]) =>
      Array.from({ length: chapitres }, (_, i) => ({
        repere: `${livre} ${i + 1}`,
        url: `${WIKISOURCE_HE}${encodeURIComponent(`רש"י על ${livre} ${numeralHebreu(i + 1)}`)}`,
      })),
    ),
  },
];

/** Phrases d'un texte : on cherche et on rend des unités qui se lisent, non des morceaux coupés. */
export function phrases(texte: string): string[] {
  return texte.split(/(?<=[.;:?!׃])\s+|\s(?=\[\d+\])/).filter((p) => p.trim() !== "");
}

/**
 * Marques d'une explication de mot : l'auteur ne se contente pas d'employer le mot, il dit d'où il
 * vient ou ce qu'il veut dire (latin : dicta, appellata, quasi, unde ; Rashi : לשון, כמו).
 */
const EXPLICATION = /\b(dict|appellat|vocat|nominat|nomen|quasi|unde|etymolog)|לשון|כמו/i;

/** Longueur d'un extrait : de quoi juger le passage, qu'on lit ensuite en entier (npm run texte). */
const LARGEUR = 360;

/** Extrait d'une phrase autour de la forme, si la phrase est trop longue pour être lue d'un coup. */
function extrait(phrase: string, forme: string): string {
  const p = phrase.trim();
  if (p.length <= LARGEUR) return p;
  const i = Math.max(0, p.toLowerCase().indexOf(forme.toLowerCase()));
  const debut = Math.max(0, i - LARGEUR / 2);
  return `${debut > 0 ? "…" : ""}${p.slice(debut, debut + LARGEUR)}…`;
}

/**
 * Passages qui contiennent la forme cherchée (radical, sans égard aux accents, aux voyelles
 * hébraïques ni à u/v, i/j) : ceux qui expliquent un mot d'abord (`explique`), puis les simples emplois.
 */
export function chercherDans(texte: string, forme: string): { passage: string; explique: boolean }[] {
  const cle = normaliserCitation(forme);
  if (cle === "") return [];
  return phrases(texte)
    .filter((p) => normaliserCitation(p).includes(cle))
    .map((p) => ({ passage: extrait(p, forme), explique: EXPLICATION.test(p) }))
    .sort((a, b) => Number(b.explique) - Number(a.explique));
}
