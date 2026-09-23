import index from "../generes/index.json";
import { prefixe } from "./decoupage.ts";
import type { EntreeIndex, FicheIdentifiee } from "./types.ts";

/** Index léger de toutes les fiches publiées, embarqué dans l'app. */
export const entrees: EntreeIndex[] = index;

/** Lots de fiches complètes, un par préfixe, chargés à la demande (et mis en cache hors ligne). */
const lots = import.meta.glob<FicheIdentifiee[]>("../generes/fiches/*.json", { import: "default" });

export async function chargerFiche(id: string): Promise<FicheIdentifiee | undefined> {
  const charger = lots[`../generes/fiches/${prefixe(id)}.json`];
  return charger ? (await charger()).find((f) => f.id === id) : undefined;
}
