import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { prefixe } from "../src/lib/decoupage.ts";
import type { EntreeIndex, FicheIdentifiee } from "../src/lib/types.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

export const DOSSIER_SORTIE = fileURLToPath(new URL("../src/generes", import.meta.url));

/**
 * Données de l'app, à partir de toutes les fiches triées par id (ordre stable pour le mot du jour) :
 * un index léger pour la recherche et le tirage, et les fiches complètes regroupées par préfixe.
 * Le statut accompagne chaque fiche : l'app signale celles qui ne sont pas encore validées.
 */
export function assembler(fiches: FicheIdentifiee[]): { index: EntreeIndex[]; lots: Map<string, FicheIdentifiee[]> } {
  // Un doublet ou un renvoi n'est déclaré que sur une des deux fiches : l'app le reçoit des deux côtés.
  const symetrique = (champ: "doublets" | "renvois") => {
    const relations = new Map(fiches.map((f) => [f.id, new Set(f[champ])]));
    for (const f of fiches) for (const cible of f[champ]) relations.get(cible)?.add(f.id);
    return (id: string) => [...(relations.get(id) ?? [])].sort();
  };
  const doublets = symetrique("doublets");
  const renvois = symetrique("renvois");
  const triees = fiches
    .map((f) => ({ ...f, doublets: doublets(f.id), renvois: renvois(f.id) }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const lots = new Map<string, FicheIdentifiee[]>();
  for (const fiche of triees) {
    const lot = lots.get(prefixe(fiche.id)) ?? [];
    lot.push(fiche);
    lots.set(prefixe(fiche.id), lot);
  }
  return { index: triees.map(({ id, mot, statut }) => ({ id, mot, statut })), lots };
}

if (import.meta.main) {
  const { fiches, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const { index, lots } = assembler(fiches);
  await rm(DOSSIER_SORTIE, { recursive: true, force: true });
  await mkdir(join(DOSSIER_SORTIE, "fiches"), { recursive: true });
  await writeFile(join(DOSSIER_SORTIE, "index.json"), JSON.stringify(index) + "\n");
  for (const [p, lot] of lots) await writeFile(join(DOSSIER_SORTIE, "fiches", `${p}.json`), JSON.stringify(lot) + "\n");
  const validees = index.filter((e) => e.statut === "validee").length;
  console.log(`✓ ${index.length} fiche(s) assemblée(s), dont ${validees} validée(s), en ${lots.size} lot(s) dans src/generes/`);
}
