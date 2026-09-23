import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validerComptes, validerFiches, type Erreur } from "./lib/validation.ts";

export const DOSSIER_DATA = fileURLToPath(new URL("../data", import.meta.url));

/** Valide les fiches (`fiches/*.yaml`) et les comptes (`comptes.json`) d'un dossier de données. */
export async function validerDepot(dossierData = DOSSIER_DATA) {
  const nomDepot = basename(dossierData);
  const dossierFiches = join(dossierData, "fiches");
  const noms = (await readdir(dossierFiches)).filter((nom) => !nom.startsWith(".")).sort();
  const sources = await Promise.all(
    noms.map(async (nom) => ({
      fichier: `${nomDepot}/fiches/${nom}`,
      texte: await readFile(join(dossierFiches, nom), "utf8"),
    })),
  );
  const { fiches, erreurs: erreursFiches } = validerFiches(sources);
  const { comptes, erreurs: erreursComptes } = validerComptes({
    fichier: `${nomDepot}/comptes.json`,
    texte: await readFile(join(dossierData, "comptes.json"), "utf8"),
  });
  return { fiches, comptes, erreurs: [...erreursFiches, ...erreursComptes] };
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
  const { fiches, comptes, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const validees = fiches.filter((f) => f.statut === "validee").length;
  console.log(
    `✓ ${fiches.length} fiche(s) conforme(s) (${validees} validée(s), ${fiches.length - validees} brouillon(s)), ` +
      `${comptes.length} ligne(s) de comptes conforme(s).`,
  );
}
