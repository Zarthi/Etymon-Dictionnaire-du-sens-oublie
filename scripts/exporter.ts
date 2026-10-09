import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import langues from "../data/langues.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import type { FicheIdentifiee, Ouvrage, RacineIdentifiee } from "../src/lib/types.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

/**
 * Export stable et versionné des données d'Étymon, à destination d'un autre projet — le jeu
 * Sphynx, qui en fait un mod hors ligne (voir docs/export.md). Ce n'est pas un fichier de l'app :
 * il ne se régénère pas au build, il se publie ; sa `version` change quand sa forme change.
 *
 * Il contient tout ce qu'un consommateur peut vouloir : les fiches validées par le schéma (statut
 * compris, pour qu'il choisisse), les racines grecques et latines avec les mots qui en sont issus,
 * les ouvrages (attribution, la licence CC BY-SA l'exige) et les listes fermées (langues, thèmes).
 */
export const VERSION_EXPORT = 2;

export const CHEMIN_EXPORT = fileURLToPath(new URL("../export/etymon.json", import.meta.url));

const parId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export interface ExportEtymon {
  version: number;
  fiches: FicheIdentifiee[];
  racines: RacineIdentifiee[];
  ouvrages: Ouvrage[];
  langues: string[];
  themes: string[];
}

/** Construit l'export, trié par identifiant (ordre stable, quel que soit l'ordre d'entrée). */
export function exporter(fiches: FicheIdentifiee[], ouvrages: Ouvrage[], racines: RacineIdentifiee[] = []): ExportEtymon {
  return {
    version: VERSION_EXPORT,
    fiches: [...fiches].sort(parId),
    racines: [...racines].sort(parId),
    ouvrages: [...ouvrages].sort(parId),
    langues: [...langues].sort(),
    themes: [...themes].sort(),
  };
}

if (import.meta.main) {
  const { fiches, ouvrages, racines, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const donnees = exporter(fiches, ouvrages, racines);
  await mkdir(dirname(CHEMIN_EXPORT), { recursive: true });
  await writeFile(CHEMIN_EXPORT, `${JSON.stringify(donnees, null, 2)}\n`);
  console.log(`✓ export v${VERSION_EXPORT} : ${fiches.length} fiche(s), ${racines.length} racine(s), ${ouvrages.length} ouvrage(s) → export/etymon.json`);
}
