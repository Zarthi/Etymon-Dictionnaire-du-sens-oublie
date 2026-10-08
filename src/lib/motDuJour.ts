import type { EntreeIndex } from "./types.ts";

const FUSEAU = "Europe/Paris";
const MS_PAR_JOUR = 86_400_000;

/** Date du jour (AAAA-MM-JJ) à Paris : le mot du jour change à la même heure pour tous. */
export function dateDuJour(maintenant = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSEAU }).format(maintenant);
}

/**
 * Mots qui se tirent (mot du jour, au hasard) : pas les mots sacrés, qu'on ne tire pas comme une
 * carte (« ne donnez pas ce qui est saint aux chiens », Matthieu 7, 6) ; on y vient par la recherche.
 */
export function tirables(index: EntreeIndex[]): EntreeIndex[] {
  return index.filter((e) => !e.sacre);
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/**
 * Mot du jour, déterministe à partir de la date.
 * Le pas, premier avec le nombre de mots, parcourt tout l'index avant de revenir au même mot,
 * en sautant loin dans l'alphabet d'un jour à l'autre.
 * Tiré parmi toutes les fiches non sacrées, quel que soit leur statut : une fiche non validée
 * s'affiche avec sa mention « En relecture ».
 */
export function motDuJour(index: EntreeIndex[], date: string): EntreeIndex | undefined {
  const choix = tirables(index);
  const n = choix.length;
  if (n === 0) return undefined;
  const jour = Math.floor(Date.parse(`${date}T00:00:00Z`) / MS_PAR_JOUR);
  let pas = Math.floor(n * 0.618) + 1;
  while (pgcd(pas, n) !== 1) pas++;
  return choix[(((jour * pas) % n) + n) % n];
}

/** Mot tiré au hasard, différent de `exclu` quand c'est possible. */
export function motAuHasard(index: EntreeIndex[], exclu?: string, aleatoire = Math.random): EntreeIndex | undefined {
  const tires = tirables(index);
  const candidats = tires.length > 1 ? tires.filter((e) => e.id !== exclu) : tires;
  return candidats[Math.floor(aleatoire() * candidats.length)];
}
