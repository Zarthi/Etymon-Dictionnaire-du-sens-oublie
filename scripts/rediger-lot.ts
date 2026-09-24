import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { cheminDossier, schemaDossier, sourcesDuDossier } from "./lib/atelier.ts";
import { chercher, natureDepuisLittre } from "./lib/littre.ts";
import { preparerAuteur, preparerFiche, preparerOuvrage, versYaml } from "./lib/redaction.ts";
import { cheminFiche, slug } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";
import { DOSSIER_DATA, formaterErreur, validerDepot } from "./valider-fiches.ts";

/**
 * Écrit des fiches rédigées par l'IA et retire les mots des candidats.
 * Chaque fichier est au format de docs/consignes/redaction.md : une fiche, une liste de fiches, ou
 * `{ fiches, auteurs, ouvrages }` quand il faut créer des auteurs ou des ouvrages (le contenu seul ;
 * statut, rédaction et sources sont posés ici ou par npm run verifier). Un mot écarté par Thibault
 * n'est jamais rédigé.
 * - sans option : fiches en `a-verifier` (rédigées de mémoire) ;
 * - --dossier : fiches rédigées d'après leur dossier (atelier/<id>/dossier.json, docs/methode.md) :
 *   les entrées consultées du dossier deviennent leurs sources, et elles passent en `brouillon` ;
 * - --essai : rien n'est écrit ; chaque fiche est validée avec le dépôt, et les auteurs ou ouvrages
 *   qui n'ont pas encore leur fiche sont signalés à part (à créer : npm run bnf).
 *
 * Usage : npm run rediger -- <fichier.json>… --modele "Claude Fable 5.1" [--dossier] [--essai] [--remplacer]
 */
type Brute = Record<string, unknown>;

/** Contenu d'un fichier rédigé : une fiche seule, une liste, ou fiches, auteurs et ouvrages. */
function lireLot(contenu: Brute | Brute[]): { fiches: Brute[]; auteurs: Brute[]; ouvrages: Brute[] } {
  if (Array.isArray(contenu)) return { fiches: contenu, auteurs: [], ouvrages: [] };
  if ("mot" in contenu) return { fiches: [contenu], auteurs: [], ouvrages: [] };
  const { fiches = [], auteurs = [], ouvrages = [] } = contenu as { fiches?: Brute[]; auteurs?: Brute[]; ouvrages?: Brute[] };
  return { fiches, auteurs, ouvrages };
}

/** Une référence sans fiche n'est pas une faute de rédaction : elle est à créer (étape 4). */
const A_CREER = /« ([^»]+) » sans fiche \(data\/(auteurs|ouvrages)\)/;

async function principal(): Promise<number> {
  const { values, positionals: fichiers } = parseArgs({
    allowPositionals: true,
    options: {
      modele: { type: "string" },
      remplacer: { type: "boolean", default: false },
      dossier: { type: "boolean", default: false },
      essai: { type: "boolean", default: false },
    },
  });
  if (fichiers.length === 0 || (!values.modele && !values.essai)) {
    console.log('Usage : npm run rediger -- <fichier.json>… --modele "Claude Fable 5.1" [--dossier] [--essai] [--remplacer]');
    return 1;
  }
  const modele = values.modele ?? "essai";
  const lots = await Promise.all(fichiers.map(async (f) => lireLot(JSON.parse(await readFile(f, "utf8")))));
  const lot = lots.flatMap((l) => l.fiches);
  const references = { auteurs: lots.flatMap((l) => l.auteurs), ouvrages: lots.flatMap((l) => l.ouvrages) };
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
  const essais: { fichier: string; texte: string }[] = [];
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
      const resultat = preparer(brute, modele);
      if ("erreurs" in resultat) {
        refus.push(...resultat.erreurs.map((e) => `${dossier}/${id} › ${e}`));
        continue;
      }
      if (values.essai) continue;
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
    const resultat = preparerFiche(brute, { modele, natureLittre });
    if ("erreurs" in resultat) {
      refus.push(...resultat.erreurs.map((e) => `${mot} › ${e}`));
      continue;
    }
    let fiche = resultat.fiche;
    if (values.dossier) {
      if (!existsSync(cheminDossier(id))) {
        refus.push(`${mot} : pas de dossier (atelier/${id}/dossier.json)`);
        continue;
      }
      const dossier = schemaDossier.safeParse(JSON.parse(await readFile(cheminDossier(id), "utf8")));
      if (!dossier.success) {
        refus.push(`${mot} : dossier incomplet (npm run dossier -- --verifier ${mot})`);
        continue;
      }
      // Les sources précèdent la rédaction, comme dans les fiches écrites à la main.
      const { redaction, statut: _statut, ...contenu } = fiche;
      fiche = { ...contenu, sources: sourcesDuDossier(dossier.data), redaction, statut: "brouillon" };
    }
    if (values.essai) {
      essais.push({ fichier: cheminFiche(id), texte: versYaml(fiche) });
      continue;
    }
    await mkdir(dirname(chemin), { recursive: true });
    await writeFile(chemin, versYaml(fiche));
    ecrits.push(id);
  }

  if (values.essai) {
    const { erreurs } = await validerDepot(DOSSIER_DATA, essais);
    const siennes = erreurs.filter((e) => essais.some((s) => e.fichier.endsWith(`/${s.fichier}`)));
    const aCreer = [
      ...new Set(
        siennes
          .map((e) => A_CREER.exec(e.regle))
          .filter((m) => m !== null)
          .map((m) => `${m[2] === "auteurs" ? "auteur" : "ouvrage"} ${m[1]}`),
      ),
    ];
    const aCorriger = siennes.filter((e) => !A_CREER.test(e.regle));
    console.log(`Essai : ${essais.length} fiche(s) préparée(s), rien n'est écrit.`);
    if (refus.length > 0) console.log(`\nRefusées (${refus.length}) :\n- ${refus.join("\n- ")}`);
    if (aCorriger.length > 0) console.log(`\nÀ corriger :\n${aCorriger.map(formaterErreur).join("\n")}`);
    if (aCreer.length > 0) console.log(`\nÀ créer (npm run bnf) : ${aCreer.join(", ")}`);
    if (refus.length === 0 && aCorriger.length === 0) console.log("\n✓ Conforme.");
    return refus.length > 0 || aCorriger.length > 0 ? 1 : 0;
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

  const statut = values.dossier ? "brouillon" : "a-verifier";
  console.log(`✓ ${ecrits.length} fiche(s) de mot (${statut}) et ${referencesEcrites} fiche(s) d'auteur ou d'ouvrage écrite(s).`);
  if (refus.length > 0) console.log(`\nNon écrites (${refus.length}) :\n- ${refus.join("\n- ")}`);
  const { erreurs } = await validerDepot();
  const concernees = erreurs.filter((e) => ecrits.some((id) => e.fichier.endsWith(`/${id}.yaml`)));
  if (concernees.length > 0) console.log(`\nÀ corriger (npm run valider) :\n${concernees.map(formaterErreur).join("\n")}`);
  console.log(`\nSuite : ${values.dossier ? "" : "npm run verifier, puis "}npm run valider.`);
  return concernees.length > 0 ? 1 : 0;
}

if (import.meta.main) process.exitCode = await principal();
