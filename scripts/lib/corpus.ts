import { normaliserCitation, texteDePage } from "./en-ligne.ts";

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
  /** Pages de l'œuvre ; ou, pour une œuvre découpée en beaucoup de pages, le préfixe de ses pages sur Wikisource, listées au téléchargement. */
  pages?: Page[];
  wikisource?: { langue: "la" | "he"; prefixe: string };
  /** Œuvre en chaîne de pages (Corpus Thomisticum) : adresse de la première, les suivantes se lisent dans chaque page. */
  chaine?: string;
}

export interface Page {
  repere: string;
  url: string;
  /** Page suivante, pour une œuvre en chaîne : de quoi reprendre un téléchargement interrompu. */
  suivante?: string;
}

/** Adresse d'une page de Wikisource. */
export const pageWikisource = (langue: string, titre: string) =>
  `https://${langue}.wikisource.org/wiki/${encodeURIComponent(titre.replaceAll(" ", "_")).replaceAll("%2F", "/")}`;

const WIKISOURCE_LA = "https://la.wikisource.org/wiki/";
const WIKISOURCE_HE = "https://he.wikisource.org/wiki/";
const CORPUS_THOMISTICUM = "https://www.corpusthomisticum.org/";
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
  {
    id: "cite-de-dieu",
    titre: "Augustin, La Cité de Dieu",
    tradition: "chrétienne",
    langue: "latin",
    role: "les noms de la cité et du culte, lus par Augustin (religio, X, 3)",
    wikisource: { langue: "la", prefixe: "De civitate Dei/" },
  },
  {
    id: "confessions",
    titre: "Augustin, Confessions",
    tradition: "chrétienne",
    langue: "latin",
    role: "les mots de l'âme et de la mémoire",
    wikisource: { langue: "la", prefixe: "Confessiones/" },
  },
  {
    id: "doctrine-chretienne",
    titre: "Augustin, De la doctrine chrétienne",
    tradition: "chrétienne",
    langue: "latin",
    role: "les signes et les mots de l'Écriture",
    wikisource: { langue: "la", prefixe: "De Doctrina Christiana/" },
  },
  {
    id: "somme-theologique",
    titre: "Thomas d'Aquin, Somme théologique",
    tradition: "chrétienne",
    langue: "latin",
    role: "le nom d'une notion, souvent discuté en tête d'article (« nomen … dicitur ») ; la Somme entière, Corpus Thomisticum (édition léonine), repérée par article (« IIa-IIae q. 8 a. 1 co. »)",
    chaine: CORPUS_THOMISTICUM + "sth1001.html",
  },
];

/** Menus de Wikisource restés dans les pages téléchargées : ils contiennent « Legere » (lire) sans rien lire. */
const MENU_WIKISOURCE = /Nexus addere|Instrumenta Tools|Toggle the table of contents/;

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

/** Passage d'une œuvre qui contient la forme cherchée, avec son repère (livre, chapitre, article). */
export interface Passage {
  repere: string;
  passage: string;
  explique: boolean;
}

/** Un passage sur deux lignes : ★ s'il explique un mot, son repère et son extrait, puis l'adresse de la page. */
export const lignePassage = (p: Passage & { url: string }) => `  ${p.explique ? "★ " : ""}${p.repere ? `${p.repere} · ` : ""}${p.passage}\n    ${p.url}`;

/**
 * Passages qui contiennent la forme cherchée (radical, sans égard aux accents, aux voyelles
 * hébraïques ni à u/v, i/j) : ceux qui expliquent un mot d'abord (`explique`), puis les simples emplois.
 */
export function chercherDans(texte: string, forme: string): { passage: string; explique: boolean }[] {
  const cle = normaliserCitation(forme);
  if (cle === "") return [];
  return phrases(texte)
    .filter((p) => normaliserCitation(p).includes(cle) && !MENU_WIKISOURCE.test(p))
    .map((p) => ({ passage: extrait(p, forme), explique: EXPLICATION.test(p) }))
    .sort((a, b) => Number(b.explique) - Number(a.explique));
}

/** Entités des pages du Corpus Thomisticum (HTML en latin-1), que `texteBrut` ne décode pas. */
const ENTITES_THOMAS: Record<string, string> = { ordf: "ª", nbsp: " ", copy: "©", aelig: "æ", oelig: "œ", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú" };
const decoder = (html: string) => html.replace(/&([a-z]+);/g, (tout, nom: string) => ENTITES_THOMAS[nom] ?? tout);

/** Adresse de la page suivante d'une page du Corpus Thomisticum (la flèche « ageultra »), s'il y en a une. */
export function pageSuivante(html: string): string | undefined {
  const href = /<A HREF="(sth\d+\.html)"><IMG SRC="icons\/ageultra/i.exec(html)?.[1];
  return href ? CORPUS_THOMISTICUM + href : undefined;
}

/** Repère d'une page, tiré de son titre : « IIa-IIae q. 1-16 ». */
export function repereDePage(html: string): string {
  const titre = /<TITLE>[^<]*?Summa Theologiae,\s*([^<]*)<\/TITLE>/i.exec(html)?.[1] ?? "";
  return texteDePage(decoder(titre)).replaceAll("ª", "a");
}

/**
 * Texte d'une page du Corpus Thomisticum, un paragraphe par ligne, chacun précédé de son repère
 * d'article : « [IIa-IIae q. 8 a. 1 co.] Respondeo dicendum… ». Ce que la page ajoute (menus,
 * notes de bas de page) n'est pas gardé.
 */
export function paragraphesThomas(html: string): string {
  const lignes: string[] = [];
  for (const [, ref, corps] of html.matchAll(/<P TITLE="[^"]*"><A NAME="\d+"><SPAN CLASS="ref">\[\d+\]([^<]*)<\/SPAN><\/A>([\s\S]*?)<\/P>/gi)) {
    const repere = texteDePage(decoder(ref)).replaceAll("ª", "a");
    lignes.push(`[${repere}] ${texteDePage(decoder(corps))}`);
  }
  return lignes.join("\n");
}

/**
 * Passages d'un texte à paragraphes repérés (`paragraphesThomas`) : comme `chercherDans`, avec le
 * repère du paragraphe où chaque passage se trouve.
 */
export function chercherParagraphes(texte: string, forme: string): Passage[] {
  return texte.split("\n").flatMap((ligne) => {
    const m = /^\[([^\]]+)\] ([\s\S]*)$/.exec(ligne);
    return m ? chercherDans(m[2], forme).map((t) => ({ repere: m[1], ...t })) : [];
  });
}
