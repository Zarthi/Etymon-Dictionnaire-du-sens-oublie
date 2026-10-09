import { teinte, translitterationDe } from "./etymologie.ts";
import { racines } from "./fiches.ts";

/** Clé comparable d'une forme : sa translittération si l'écriture n'est pas latine, sinon la forme elle-même. */
export function cleForme(f: { forme: string; translitteration?: string }): string {
  return translitterationDe(f) ?? f.forme;
}

/** Racines par clé « famille:forme » (famille : latin ou grec), pour retrouver celle d'une forme. */
const parForme = new Map<string, string>();
for (const racine of racines.values()) {
  const famille = teinte(racine.langue);
  if (famille) parForme.set(`${famille}:${cleForme(racine)}`, racine.id);
}

/**
 * Identifiant de la racine d'une forme de la chaîne, s'il y en a une (latin ou grec) : une forme
 * qui a sa page devient un lien. La comparaison se fait dans la même famille de langue.
 */
export function racineDe(f: { forme: string; translitteration?: string }, langue?: string): string | undefined {
  const famille = teinte(langue);
  return famille ? parForme.get(`${famille}:${cleForme(f)}`) : undefined;
}

