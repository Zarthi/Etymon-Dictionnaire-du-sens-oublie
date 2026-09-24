import auteursAssembles from "../generes/auteurs.json";
import index from "../generes/index.json";
import ouvragesAssembles from "../generes/ouvrages.json";
import { prefixe } from "./decoupage.ts";
import type { AuteurAssemble, EntreeIndex, FicheIdentifiee, OuvrageAssemble } from "./types.ts";

// Fichiers générés à partir de fiches validées par le schéma : le JSON n'en garde pas les types littéraux.

/** Index léger de toutes les fiches publiées, embarqué dans l'app. */
export const entrees = index as EntreeIndex[];

/** Auteurs et ouvrages, peu nombreux : embarqués, pour nommer et relier ce que les fiches citent. */
export const auteurs = new Map((auteursAssembles as AuteurAssemble[]).map((a) => [a.id, a]));
export const ouvrages = new Map((ouvragesAssembles as OuvrageAssemble[]).map((o) => [o.id, o]));

/** Lots de fiches complètes, un par préfixe, chargés à la demande (et mis en cache hors ligne). */
const lots = import.meta.glob<FicheIdentifiee[]>("../generes/fiches/*.json", { import: "default" });

export async function chargerFiche(id: string): Promise<FicheIdentifiee | undefined> {
  const charger = lots[`../generes/fiches/${prefixe(id)}.json`];
  return charger ? (await charger()).find((f) => f.id === id) : undefined;
}
