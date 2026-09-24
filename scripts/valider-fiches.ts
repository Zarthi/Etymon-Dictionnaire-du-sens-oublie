import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  referentiel,
  validerAuteurs,
  validerCandidats,
  validerComptes,
  validerFiches,
  validerOuvrages,
  verifierSourcesDesReferences,
  type Erreur,
  type FichierSource,
} from "./lib/validation.ts";

export const DOSSIER_DATA = fileURLToPath(new URL("../data", import.meta.url));

/** Fichiers d'un dossier et de ses sous-dossiers (fichiers cachés exclus), chemins relatifs en « / » ; aucun si le dossier n'existe pas. */
async function lireDossier(dossier: string): Promise<FichierSource[]> {
  if (!existsSync(dossier)) return [];
  const entrees = await readdir(dossier, { recursive: true, withFileTypes: true });
  const chemins = entrees
    .filter((e) => e.isFile() && !e.name.startsWith("."))
    .map((e) => relative(dossier, join(e.parentPath, e.name)).split(sep).join("/"))
    .sort();
  return Promise.all(chemins.map(async (fichier) => ({ fichier, texte: await readFile(join(dossier, fichier), "utf8") })));
}

const prefixer = (prefixe: string) => (e: Erreur): Erreur => ({ ...e, fichier: `${prefixe}/${e.fichier}` });

/** Valide les auteurs, les ouvrages, les fiches, les candidats et les comptes d'un dossier de données. */
export async function validerDepot(dossierData = DOSSIER_DATA) {
  const nomDepot = basename(dossierData);
  const { auteurs, erreurs: erreursAuteurs } = validerAuteurs(await lireDossier(join(dossierData, "auteurs")));
  const { ouvrages, erreurs: erreursOuvrages } = validerOuvrages(
    await lireDossier(join(dossierData, "ouvrages")),
    new Map(auteurs.map((a) => [a.id, a])),
  );
  const ref = referentiel(auteurs, ouvrages);
  const { fiches, erreurs: erreursFiches } = validerFiches(await lireDossier(join(dossierData, "fiches")), ref);
  const { candidats, erreurs: erreursCandidats } = validerCandidats(
    await lireDossier(join(dossierData, "candidats")),
    new Set(fiches.map((f) => f.id)),
  );
  const { comptes, erreurs: erreursComptes } = validerComptes({
    fichier: "comptes.json",
    texte: await readFile(join(dossierData, "comptes.json"), "utf8"),
  });
  const erreurs = [
    ...erreursAuteurs.map(prefixer(`${nomDepot}/auteurs`)),
    ...erreursOuvrages.map(prefixer(`${nomDepot}/ouvrages`)),
    ...verifierSourcesDesReferences(ref, (id) => `auteurs/${id}.yaml`, (id) => `ouvrages/${id}.yaml`).map(prefixer(nomDepot)),
    ...erreursFiches.map(prefixer(`${nomDepot}/fiches`)),
    ...erreursCandidats.map(prefixer(`${nomDepot}/candidats`)),
    ...erreursComptes.map(prefixer(nomDepot)),
  ];
  return { fiches, auteurs, ouvrages, ref, candidats, comptes, erreurs };
}

export function formaterErreur({ fichier, champ, regle }: Erreur): string {
  return `${fichier} › ${champ} : ${regle}`;
}

/** Affiche les erreurs et termine le processus en échec s'il y en a. */
export function arreterSiErreurs(erreurs: Erreur[]): void {
  if (erreurs.length === 0) return;
  for (const erreur of erreurs) console.error(formaterErreur(erreur));
  console.error(`\n✗ ${erreurs.length} erreur(s).`);
  process.exit(1);
}

if (import.meta.main) {
  const { fiches, auteurs, ouvrages, candidats, comptes, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  console.log(
    `✓ ${fiches.length} fiche(s), ${auteurs.length} auteur(s), ${ouvrages.length} ouvrage(s), ${candidats.length} candidat(s) et ${comptes.length} ligne(s) de comptes conformes.`,
  );
}
