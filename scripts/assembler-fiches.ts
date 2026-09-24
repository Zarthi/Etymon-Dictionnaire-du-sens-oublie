import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { prefixe } from "../src/lib/decoupage.ts";
import type { Auteur, AuteurAssemble, EntreeIndex, FicheIdentifiee, MotCite, Ouvrage, OuvrageAssemble } from "../src/lib/types.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

export const DOSSIER_SORTIE = fileURLToPath(new URL("../src/generes", import.meta.url));

const parId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Données de l'app, à partir de toutes les fiches triées par id (ordre stable pour le mot du jour) :
 * un index léger pour la recherche et le tirage, et les fiches complètes regroupées par préfixe.
 * Le statut accompagne chaque fiche : l'app signale celles qui ne sont pas encore validées.
 */
export function assembler(fiches: FicheIdentifiee[]): { index: EntreeIndex[]; lots: Map<string, FicheIdentifiee[]> } {
  // Un renvoi peut viser un candidat : l'app ne reçoit que les fiches écrites.
  const ecrites = new Set(fiches.map((f) => f.id));
  // Un doublet ou un renvoi n'est déclaré que sur une des deux fiches : l'app le reçoit des deux côtés.
  const symetrique = (champ: "doublets" | "renvois") => {
    const relations = new Map(fiches.map((f) => [f.id, new Set(champ === "renvois" ? f.renvois.filter((id) => ecrites.has(id)) : f[champ])]));
    for (const f of fiches) for (const cible of f[champ]) relations.get(cible)?.add(f.id);
    return (id: string) => [...(relations.get(id) ?? [])].sort();
  };
  const doublets = symetrique("doublets");
  const renvois = symetrique("renvois");
  const triees = fiches
    .map((f) => ({ ...f, doublets: doublets(f.id), renvois: renvois(f.id), renvoisTradition: f.renvoisTradition.filter((id) => ecrites.has(id)) }))
    .sort(parId);
  const lots = new Map<string, FicheIdentifiee[]>();
  for (const fiche of triees) {
    const lot = lots.get(prefixe(fiche.id)) ?? [];
    lot.push(fiche);
    lots.set(prefixe(fiche.id), lot);
  }
  return { index: triees.map(({ id, mot, statut }) => ({ id, mot, statut })), lots };
}

/**
 * Auteurs et ouvrages, avec ce qui se calcule à partir des fiches et ne s'écrit jamais :
 * œuvres, mots forgés, hypothèses défendues, lectures signées, mots issus d'un nom ou d'un titre.
 */
export function assemblerReferences(
  fiches: FicheIdentifiee[],
  auteurs: Auteur[],
  ouvrages: Ouvrage[],
): { auteurs: AuteurAssemble[]; ouvrages: OuvrageAssemble[] } {
  const mots = (critere: (f: FicheIdentifiee) => boolean): MotCite[] =>
    fiches
      .filter(critere)
      .map(({ id, mot }) => ({ id, mot }))
      .sort(parId);
  const maillons = (f: FicheIdentifiee) => f.etymologie;
  const tenants = (f: FicheIdentifiee) => [
    ...maillons(f).flatMap((m) => (m.alternatives?.formes ?? []).flatMap((a) => a.selon ?? [])),
    ...f.ecartees.flatMap((e) => e.selon ?? []),
  ];
  return {
    auteurs: auteurs.sort(parId).map((a) => ({
      ...a,
      oeuvres: ouvrages.filter((o) => o.auteur === a.id).map((o) => o.id).sort(),
      forges: mots((f) => maillons(f).some((m) => m.forge?.par.includes(a.id))),
      hypotheses: mots((f) => tenants(f).includes(a.id)),
      lectures: mots((f) => f.lecturesTraditionnelles.some((l) => l.auteur === a.id)),
      issus: mots((f) => maillons(f).some((m) => m.personne === a.id)),
    })),
    ouvrages: ouvrages.sort(parId).map((o) => ({
      ...o,
      lectures: mots((f) => f.lecturesTraditionnelles.some((l) => l.sources.some((s) => s.ouvrage === o.id))),
      forges: mots((f) => maillons(f).some((m) => m.forge?.ouvrage === o.id)),
      issus: mots((f) => maillons(f).some((m) => m.ouvrage === o.id)),
    })),
  };
}

if (import.meta.main) {
  const { fiches, auteurs, ouvrages, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const { index, lots } = assembler(fiches);
  const references = assemblerReferences(fiches, auteurs, ouvrages);
  await rm(DOSSIER_SORTIE, { recursive: true, force: true });
  await mkdir(join(DOSSIER_SORTIE, "fiches"), { recursive: true });
  await writeFile(join(DOSSIER_SORTIE, "index.json"), JSON.stringify(index) + "\n");
  await writeFile(join(DOSSIER_SORTIE, "auteurs.json"), JSON.stringify(references.auteurs) + "\n");
  await writeFile(join(DOSSIER_SORTIE, "ouvrages.json"), JSON.stringify(references.ouvrages) + "\n");
  for (const [p, lot] of lots) await writeFile(join(DOSSIER_SORTIE, "fiches", `${p}.json`), JSON.stringify(lot) + "\n");
  const validees = index.filter((e) => e.statut === "validee").length;
  console.log(
    `✓ ${index.length} fiche(s) assemblée(s), dont ${validees} validée(s), en ${lots.size} lot(s), ${auteurs.length} auteur(s) et ${ouvrages.length} ouvrage(s) dans src/generes/`,
  );
}
