import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { FicheIdentifiee } from "../src/lib/types.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

export const FICHIER_SORTIE = fileURLToPath(new URL("../src/generes/fiches.json", import.meta.url));

/** Fiches visibles dans l'app : statut `validee`, triées par id (ordre stable pour le mot du jour). */
export function assembler(fiches: FicheIdentifiee[]): FicheIdentifiee[] {
  return fiches.filter((f) => f.statut === "validee").sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

if (import.meta.main) {
  const { fiches, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const assemblees = assembler(fiches);
  await mkdir(dirname(FICHIER_SORTIE), { recursive: true });
  await writeFile(FICHIER_SORTIE, JSON.stringify(assemblees) + "\n");
  console.log(`✓ ${assemblees.length} fiche(s) validée(s) assemblée(s) dans src/generes/fiches.json`);
}
