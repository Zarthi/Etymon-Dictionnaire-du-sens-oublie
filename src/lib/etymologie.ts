import { translitterer } from "./grec.ts";
import type { Fiche, Maillon } from "./types.ts";

/** Une forme et ce qui permet de la lire : écriture d'origine, translittération éventuelle. */
type AvecForme = { forme: string; translitteration?: string };

const GREC = /[\u0370-\u03ff\u1f00-\u1fff]/u;
const LATIN = /^[\p{Script=Latin}\p{M}\p{N}\s*'’().\-]+$/u;

/** La forme s'écrit-elle en grec (φρήν) ? Sa translittération se déduit alors. */
export function enGrec(forme: string): boolean {
  return GREC.test(forme);
}

/** La forme s'écrit-elle en alphabet latin (religio, *extonare, per sonare, *(s)tenh₂-) ? */
export function enAlphabetLatin(forme: string): boolean {
  return LATIN.test(forme);
}

/**
 * Translittération à afficher après une forme en écriture non latine : celle donnée, sinon
 * celle du grec, déduite (φρήν → phrēn) ; rien pour une forme en alphabet latin.
 */
export function translitterationDe({ forme, translitteration }: AvecForme): string | undefined {
  if (translitteration) return translitteration;
  if (GREC.test(forme)) return translitterer(forme.replace(/^\*/, ""));
  return undefined;
}

/** Le maillon porte-t-il un sens à afficher (le sien, ou ceux de ses éléments) ? */
function porteSens(m: Maillon): boolean {
  return m.sens !== undefined || (m.forme === undefined && m.elements !== undefined);
}

/**
 * Maillon du sens premier, affiché en tête : celui marqué `premier`, sinon le plus lointain
 * maillon attesté (non reconstruit) qui porte un sens, sinon le premier qui en porte un.
 */
export function indexPremier(etymologie: Maillon[]): number {
  const marque = etymologie.findIndex((m) => m.premier);
  if (marque !== -1) return marque;
  const attestes = etymologie.map((m, i) => ({ m, i })).filter(({ m }) => porteSens(m) && !m.forme?.startsWith("*"));
  if (attestes.length > 0) return attestes.at(-1)!.i;
  return Math.max(0, etymologie.findIndex(porteSens));
}

/** Sens premier en texte (celui du maillon, ou ceux de ses éléments) : pour les contrôles de redite. */
export function sensPremier(etymologie: Maillon[]): string {
  const m = etymologie[indexPremier(etymologie)];
  return m.sens ?? (m.elements ?? []).map((e) => e.sens).join(", ");
}

/** Toutes les formes d'un maillon, avec leurs écritures : pour l'italique et les vérifications. */
export function formesDuMaillon(m: Maillon): AvecForme[] {
  const formes: AvecForme[] = [];
  if (m.forme) formes.push({ forme: m.forme, translitteration: m.translitteration });
  for (const e of m.elements ?? []) formes.push(e);
  for (const a of m.alternatives?.formes ?? []) {
    if (a.forme) formes.push({ forme: a.forme, translitteration: a.translitteration });
    for (const e of a.elements ?? []) formes.push(e);
  }
  if (m.modele) formes.push(m.modele);
  return formes;
}

/**
 * Formes étrangères qu'une fiche connaît, mises en italique par l'app dans ses textes :
 * toutes les formes de la chaîne, leurs translittérations et les étymologies écartées.
 */
export function formesItaliques(fiche: Pick<Fiche, "etymologie" | "ecartees">): string[] {
  const formes = [...fiche.etymologie.flatMap(formesDuMaillon), ...fiche.ecartees];
  return [...new Set(formes.flatMap((f) => [f.forme, translitterationDe(f)]).filter((f): f is string => Boolean(f)))];
}

/** Formes de la chaîne, en alphabet latin (translittérées au besoin) : ce que cite une étymologie de dictionnaire. */
export function formesComparables(etymologie: Maillon[]): string[] {
  return etymologie.flatMap(formesDuMaillon).flatMap((f) => [f.forme, translitterationDe(f)].filter((x): x is string => Boolean(x)));
}
