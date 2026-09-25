/**
 * Ce qu'une langue de l'application doit fournir (docs : AGENTS.md §7). Trois parts :
 * - la grammaire (pattern Strategy) : tout ce qui compose une phrase selon les règles de la langue ;
 * - les libellés : les identifiants des listes fermées (langues, thèmes…), rendus dans la langue ;
 * - les messages : les textes de l'interface.
 * Le contenu des fiches (sens, explications, lectures) n'en fait pas partie : il est rédigé.
 */

export interface Grammaire {
  /** Code de la langue (attribut `lang`) et paramètres régionaux (dates). */
  code: string;
  locale: string;
  /** Complément d'origine : « du latin », « de l'italien ». */
  origine(langue: string): string;
  /** Préposition devant une forme, avec son espace : « de relegere », « d'adolescere ». */
  de(forme: string): string;
  /** La matière d'un mot forgé : « sur le grec », « sur l'arabe ». */
  sur(langue: string): string;
  /** Date ISO en toutes lettres : « 23 septembre 2026 ». */
  dateLongue(dateIso: string): string;
  /** Guillemets ouvrant et fermant, avec leurs espaces : ceux d'une citation qui garde sa propre langue. */
  guillemets: [string, string];
  /** Un sens ou une citation entre guillemets : « esprit fendu ». */
  citer(texte: string): string;
  /** Deux-points et point-virgule, avec l'espace qui les précède selon la langue. */
  deuxPoints: string;
  pointVirgule: string;
  /** Liste en toutes lettres : « juive et chrétienne », « a, b ou c ». */
  enumerer(elements: string[], liaison: "et" | "ou"): string;
  /** Première lettre en majuscule (début de phrase). */
  majuscule(texte: string): string;
}

/** Libellé de chaque valeur des listes fermées : l'identifiant reste, le libellé suit la langue. */
export interface Libelles {
  langue(id: string): string;
  theme(id: string): string;
  nature(id: string): string;
  tradition(id: string): string;
  licence(id: string): string;
  redacteur(id: string): string;
  reflexion(id: string): string;
}
