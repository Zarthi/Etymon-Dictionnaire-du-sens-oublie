import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { prefixe } from "../src/lib/decoupage.ts";
import type { EntreeIndex, FicheIdentifiee } from "../src/lib/types.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

export const DOSSIER_SORTIE = fileURLToPath(new URL("../src/generes", import.meta.url));

/**
 * Données de l'app, à partir des fiches `validee` triées par id (ordre stable pour le mot du jour) :
 * un index léger pour la recherche et le tirage, et les fiches complètes regroupées par préfixe.
 * `avecBrouillons` ajoute les brouillons, pour les relire en développement seulement ;
 * les fiches `a-verifier`, rédigées de mémoire, n'apparaissent jamais.
 */
export function assembler(
  fiches: FicheIdentifiee[],
  { avecBrouillons = false } = {},
): { index: EntreeIndex[]; lots: Map<string, FicheIdentifiee[]> } {
  const retenues = fiches
    .filter((f) => f.statut === "validee" || (avecBrouillons && f.statut === "brouillon"))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const lots = new Map<string, FicheIdentifiee[]>();
  for (const fiche of retenues) {
    const lot = lots.get(prefixe(fiche.id)) ?? [];
    lot.push(fiche);
    lots.set(prefixe(fiche.id), lot);
  }
  return { index: retenues.map(({ id, mot }) => ({ id, mot })), lots };
}

if (import.meta.main) {
  const { fiches, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const avecBrouillons = process.argv.includes("--brouillons");
  const { index, lots } = assembler(fiches, { avecBrouillons });
  await rm(DOSSIER_SORTIE, { recursive: true, force: true });
  await mkdir(join(DOSSIER_SORTIE, "fiches"), { recursive: true });
  await writeFile(join(DOSSIER_SORTIE, "index.json"), JSON.stringify(index) + "\n");
  for (const [p, lot] of lots) await writeFile(join(DOSSIER_SORTIE, "fiches", `${p}.json`), JSON.stringify(lot) + "\n");
  const nature = avecBrouillons ? "validée(s) ou brouillon(s)" : "validée(s)";
  console.log(`✓ ${index.length} fiche(s) ${nature} assemblée(s) en ${lots.size} lot(s) dans src/generes/`);
}
