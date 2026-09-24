import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { chercher, natureDepuisLittre } from "./lib/littre.ts";
import { preparerAuteur, preparerFiche, preparerOuvrage, versYaml } from "./lib/redaction.ts";
import { cheminFiche, slug } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";
import { DOSSIER_DATA, formaterErreur, validerDepot } from "./valider-fiches.ts";

/**
 * Écrit un lot de fiches rédigées par l'IA (statut a-verifier) et retire les mots des candidats.
 * Le lot est un fichier JSON au format de docs/prompt-redaction.md : une liste de fiches de
 * mots, ou `{ fiches, auteurs, ouvrages }` quand le lot cite des auteurs ou des ouvrages qui
 * n'ont pas encore leur fiche (le contenu seul ; statut, rédaction et sources sont posés ici ou
 * par npm run verifier). Un mot écarté par Thibault n'est jamais rédigé.
 *
 * Usage : npm run rediger -- <lot.json> --modele "Claude Fable 5.1" [--remplacer]
 */
if (import.meta.main) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { modele: { type: "string" }, remplacer: { type: "boolean", default: false } },
  });
  const [fichierLot] = positionals;
  if (!fichierLot || !values.modele) {
    console.log('Usage : npm run rediger -- <lot.json> --modele "Claude Fable 5.1" [--remplacer]');
    process.exit(1);
  }
  type Brute = Record<string, unknown>;
  const contenu: Brute[] | { fiches?: Brute[]; auteurs?: Brute[]; ouvrages?: Brute[] } = JSON.parse(await readFile(fichierLot, "utf8"));
  const lot = Array.isArray(contenu) ? contenu : (contenu.fiches ?? []);
  const references = Array.isArray(contenu) ? { auteurs: [], ouvrages: [] } : { auteurs: contenu.auteurs ?? [], ouvrages: contenu.ouvrages ?? [] };
  const index = await chargerIndexLittre();
  const dossierCandidats = join(DOSSIER_DATA, "candidats");
  const candidats = new Map<string, { fichier: string; ecarte: boolean }>();
  for (const f of await readdir(dossierCandidats)) {
    for (const ligne of (await readFile(join(dossierCandidats, f), "utf8")).split("\n")) {
      const mot = /mot: ([^,}]+)/.exec(ligne)?.[1].trim();
      if (mot) candidats.set(slug(mot), { fichier: f, ecarte: /statut: ecarte/.test(ligne) });
    }
  }

  const ecrits: string[] = [];
  const refus: string[] = [];

  // Auteurs et ouvrages d'abord : les fiches du lot peuvent les citer.
  let referencesEcrites = 0;
  for (const [dossier, liste, preparer, nom] of [
    ["auteurs", references.auteurs, preparerAuteur, (b: Brute) => String(b.nom ?? "?")],
    ["ouvrages", references.ouvrages, preparerOuvrage, (b: Brute) => String(b.abrege ?? b.titre ?? "?")],
  ] as const) {
    for (const brute of liste) {
      const id = slug(nom(brute));
      const chemin = join(DOSSIER_DATA, dossier, `${id}.yaml`);
      if (existsSync(chemin) && !values.remplacer) {
        refus.push(`${dossier}/${id} : la fiche existe déjà (--remplacer pour l'écraser)`);
        continue;
      }
      const resultat = preparer(brute, values.modele);
      if ("erreurs" in resultat) {
        refus.push(...resultat.erreurs.map((e) => `${dossier}/${id} › ${e}`));
        continue;
      }
      await mkdir(dirname(chemin), { recursive: true });
      await writeFile(chemin, versYaml(resultat.fiche));
      referencesEcrites++;
    }
  }
  for (const brute of lot) {
    const mot = String(brute.mot ?? "?");
    const id = slug(mot);
    const chemin = join(DOSSIER_DATA, "fiches", cheminFiche(id));
    if (candidats.get(id)?.ecarte) {
      refus.push(`${mot} : écarté par Thibault (data/candidats), non rédigé`);
      continue;
    }
    if (existsSync(chemin) && !values.remplacer) {
      refus.push(`${mot} : la fiche existe déjà (--remplacer pour l'écraser)`);
      continue;
    }
    const natureLittre = (chercher(index, mot) ?? []).map((e) => natureDepuisLittre(e.nature)).find(Boolean);
    const resultat = preparerFiche(brute, { modele: values.modele, natureLittre });
    if ("erreurs" in resultat) {
      refus.push(...resultat.erreurs.map((e) => `${mot} › ${e}`));
      continue;
    }
    await mkdir(dirname(chemin), { recursive: true });
    await writeFile(chemin, versYaml(resultat.fiche));
    ecrits.push(id);
  }

  // Candidats : les mots rédigés en sortent.
  const retires = new Set(ecrits);
  for (const f of await readdir(dossierCandidats)) {
    const chemin = join(dossierCandidats, f);
    const lignes = (await readFile(chemin, "utf8")).split("\n");
    const gardees = lignes.filter((l) => {
      const mot = /mot: ([^,}]+)/.exec(l)?.[1].trim();
      return !(mot && retires.has(slug(mot)));
    });
    if (gardees.length !== lignes.length) await writeFile(chemin, gardees.join("\n"));
  }

  console.log(`✓ ${ecrits.length} fiche(s) de mot et ${referencesEcrites} fiche(s) d'auteur ou d'ouvrage écrite(s) en a-verifier.`);
  if (refus.length > 0) console.log(`\nNon écrites (${refus.length}) :\n- ${refus.join("\n- ")}`);
  const { erreurs } = await validerDepot();
  const concernees = erreurs.filter((e) => ecrits.some((id) => e.fichier.endsWith(`/${id}.yaml`)));
  if (concernees.length > 0) console.log(`\nÀ corriger (npm run valider) :\n${concernees.map(formaterErreur).join("\n")}`);
  console.log("\nSuite : npm run verifier, puis npm run valider.");
}
