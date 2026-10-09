import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { cheminDossier, schemaDossier, sourcesDuDossier } from "./lib/atelier.ts";
import { chercher, natureDuMot } from "./lib/littre.ts";
import { lireReflexion, preparerAuteur, preparerFiche, preparerOuvrage, versYaml, type Moteur } from "./lib/redaction.ts";
import { regenererContrat } from "./lib/regenerer.ts";
import { cheminFiche, slug, type Erreur } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";
import { DOSSIER_DATA, formaterErreur, validerDepot } from "./valider-fiches.ts";

/**
 * Écrit des fiches rédigées par l'IA et retire les mots des candidats.
 * Chaque fichier est au format de docs/consignes/redaction.md : une fiche, une liste de fiches, ou
 * `{ fiches, auteurs, ouvrages }` quand il faut créer des auteurs ou des ouvrages (le contenu seul ;
 * statut, rédaction et sources sont posés ici ou par npm run verifier). Un mot écarté par Thibault
 * n'est jamais rédigé.
 * - --dossier (obligatoire) : fiches rédigées d'après leur dossier (atelier/<id>/dossier.json,
 *   docs/methode.md) : les entrées consultées du dossier deviennent leurs sources, et elles
 *   passent en `brouillon`. Une fiche ne s'écrit jamais de mémoire ;
 * - --essai : rien n'est écrit ; chaque fiche est validée avec le dépôt, et les auteurs ou ouvrages
 *   qui n'ont pas encore leur fiche sont signalés à part (à créer : npm run bnf).
 *
 * Une fiche peut porter ses lectures traditionnelles (`tradition.lectures`), validées comme dans data/.
 * `npm run lot -- reprendre` et `clore` appellent `rediger` sans passer par la ligne de commande.
 *
 * Usage : npm run rediger -- <fichier.json>… --modele "Claude Opus 5.5" [--reflexion élevée] --dossier [--essai] [--remplacer]
 */
export type Brute = Record<string, unknown>;

/** Contenu d'un fichier rédigé : une fiche seule, une liste, ou fiches, auteurs et ouvrages. */
export function lireLot(contenu: Brute | Brute[]): { fiches: Brute[]; auteurs: Brute[]; ouvrages: Brute[] } {
  if (Array.isArray(contenu)) return { fiches: contenu, auteurs: [], ouvrages: [] };
  if ("mot" in contenu) return { fiches: [contenu], auteurs: [], ouvrages: [] };
  const { fiches = [], auteurs = [], ouvrages = [] } = contenu as { fiches?: Brute[]; auteurs?: Brute[]; ouvrages?: Brute[] };
  return { fiches, auteurs, ouvrages };
}

/** Une référence sans fiche n'est pas une faute de rédaction : elle est à créer (étape 4). */
const A_CREER = /« ([^»]+) » sans fiche \(data\/(auteurs|ouvrages)\)/;

/** Ce qu'une rédaction a fait, ou, en essai, ce qu'elle ferait. `id` est celui du mot (`auteurs/x` pour une référence). */
export interface Bilan {
  ecrits: string[];
  referencesEcrites: number;
  refus: { id: string; message: string }[];
  aCorriger: Erreur[];
  aCreer: string[];
  /** Fiches préparées en essai : rien n'est écrit. */
  essais: number;
}

/**
 * Prépare les fiches d'un lot d'après leur dossier et les écrit dans data/ (brouillon), ou, en
 * essai, les valide avec le dépôt sans rien écrire. Les mots rédigés sortent des candidats. Le contrat
 * est régénéré après l'écriture, sauf avec `contrat: false` (la clôture d'un lot le fait une fois).
 */
export async function rediger(
  lots: { fiches: Brute[]; auteurs: Brute[]; ouvrages: Brute[] },
  moteur: Moteur,
  { essai = false, remplacer = false, contrat = true }: { essai?: boolean; remplacer?: boolean; contrat?: boolean } = {},
): Promise<Bilan> {
  const lot = lots.fiches;
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
  const refus: Bilan["refus"] = [];

  // Auteurs et ouvrages d'abord : les fiches du lot peuvent les citer.
  let referencesEcrites = 0;
  for (const [dossier, liste, preparer, nom] of [
    ["auteurs", lots.auteurs, preparerAuteur, (b: Brute) => String(b.nom ?? "?")],
    ["ouvrages", lots.ouvrages, preparerOuvrage, (b: Brute) => String(b.abrege ?? b.titre ?? "?")],
  ] as const) {
    for (const brute of liste) {
      const id = slug(nom(brute));
      const chemin = join(DOSSIER_DATA, dossier, `${id}.yaml`);
      if (existsSync(chemin) && !remplacer) {
        refus.push({ id: `${dossier}/${id}`, message: `la fiche existe déjà (--remplacer pour l'écraser)` });
        continue;
      }
      const resultat = preparer(brute, moteur);
      if ("erreurs" in resultat) {
        refus.push(...resultat.erreurs.map((e) => ({ id: `${dossier}/${id}`, message: e })));
        continue;
      }
      if (essai) continue;
      await mkdir(dirname(chemin), { recursive: true });
      await writeFile(chemin, versYaml(resultat.fiche));
      referencesEcrites++;
    }
  }
  for (const brute of lot) {
    const mot = String(brute.mot ?? "?");
    const id = slug(mot);
    const chemin = join(DOSSIER_DATA, "fiches", cheminFiche(id));
    const refuser = (message: string) => refus.push({ id, message });
    if (candidats.get(id)?.ecarte) {
      refuser("écarté par Thibault (data/candidats), non rédigé");
      continue;
    }
    if (existsSync(chemin) && !remplacer) {
      refuser("la fiche existe déjà (--remplacer pour l'écraser)");
      continue;
    }
    const natureLittre = natureDuMot(chercher(index, mot) ?? [], mot);
    const resultat = preparerFiche(brute, { ...moteur, natureLittre });
    if ("erreurs" in resultat) {
      resultat.erreurs.forEach(refuser);
      continue;
    }
    if (!existsSync(cheminDossier(id))) {
      refuser(`pas de dossier (atelier/${id}/dossier.json)`);
      continue;
    }
    const dossier = schemaDossier.safeParse(JSON.parse(await readFile(cheminDossier(id), "utf8")));
    if (!dossier.success) {
      refuser(`dossier incomplet (npm run dossier -- --verifier ${mot})`);
      continue;
    }
    if (dossier.data.chemin === "sacre") {
      refuser("mot sacré, il se rédige à part (texte d'origine sous les yeux), non en lot");
      continue;
    }
    // Les sources précèdent la rédaction, comme dans les fiches écrites à la main.
    const { redaction, statut: _statut, ...contenu } = resultat.fiche;
    const fiche = { ...contenu, sources: sourcesDuDossier(dossier.data), redaction, statut: "brouillon" as const };
    if (essai) {
      essais.push({ fichier: cheminFiche(id), texte: versYaml(fiche) });
      continue;
    }
    await mkdir(dirname(chemin), { recursive: true });
    await writeFile(chemin, versYaml(fiche));
    ecrits.push(id);
  }

  const concernees = (erreurs: Erreur[], ids: string[]) => erreurs.filter((e) => ids.some((id) => e.fichier.endsWith(`/${id}.yaml`)));
  if (essai) {
    const { erreurs } = await validerDepot(DOSSIER_DATA, essais);
    const siennes = concernees(erreurs, essais.map((s) => s.fichier.split("/").pop()!.replace(/\.yaml$/, "")));
    const aCreer = [
      ...new Set(
        siennes
          .map((e) => A_CREER.exec(e.regle))
          .filter((m) => m !== null)
          .map((m) => `${m[2] === "auteurs" ? "auteur" : "ouvrage"} ${m[1]}`),
      ),
    ];
    return { ecrits, referencesEcrites, refus, aCorriger: siennes.filter((e) => !A_CREER.test(e.regle)), aCreer, essais: essais.length };
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
    if (gardees.length === lignes.length) continue;
    // Une liste vidée de son dernier candidat est refusée par la validation : on la retire.
    if (gardees.every((l) => l.trim() === "")) await rm(chemin);
    else await writeFile(chemin, gardees.join("\n"));
  }

  if (contrat && ecrits.length + referencesEcrites > 0) regenererContrat();
  const { erreurs } = await validerDepot();
  return { ecrits, referencesEcrites, refus, aCorriger: concernees(erreurs, ecrits), aCreer: [], essais: 0 };
}

async function principal(): Promise<number> {
  const { values, positionals: fichiers } = parseArgs({
    allowPositionals: true,
    options: {
      modele: { type: "string" },
      reflexion: { type: "string" },
      remplacer: { type: "boolean", default: false },
      dossier: { type: "boolean", default: false },
      essai: { type: "boolean", default: false },
    },
  });
  if (fichiers.length === 0 || (!values.modele && !values.essai)) {
    console.log('Usage : npm run rediger -- <fichier.json>… --modele "Claude Opus 5.5" [--reflexion élevée] --dossier [--essai] [--remplacer]');
    return 1;
  }
  if (!values.dossier) {
    console.log("Rédiger d'après un dossier (--dossier) : une fiche ne s'écrit pas de mémoire. Voir npm run dossier -- <mot>.");
    return 1;
  }
  const reflexion = lireReflexion(values.reflexion);
  if ("erreur" in reflexion) {
    console.log(reflexion.erreur);
    return 1;
  }
  const lots = await Promise.all(fichiers.map(async (f) => lireLot(JSON.parse(await readFile(f, "utf8")))));
  const bilan = await rediger(
    { fiches: lots.flatMap((l) => l.fiches), auteurs: lots.flatMap((l) => l.auteurs), ouvrages: lots.flatMap((l) => l.ouvrages) },
    { modele: values.modele ?? "essai", ...reflexion },
    { essai: values.essai, remplacer: values.remplacer },
  );
  const refus = bilan.refus.map((r) => `${r.id} › ${r.message}`);
  if (values.essai) {
    console.log(`Essai : ${bilan.essais} fiche(s) préparée(s), rien n'est écrit.`);
    if (refus.length > 0) console.log(`\nRefusées (${refus.length}) :\n- ${refus.join("\n- ")}`);
    if (bilan.aCorriger.length > 0) console.log(`\nÀ corriger :\n${bilan.aCorriger.map(formaterErreur).join("\n")}`);
    if (bilan.aCreer.length > 0) console.log(`\nÀ créer (npm run bnf) : ${bilan.aCreer.join(", ")}`);
    if (refus.length === 0 && bilan.aCorriger.length === 0) console.log("\n✓ Conforme.");
    return refus.length > 0 || bilan.aCorriger.length > 0 ? 1 : 0;
  }
  console.log(`✓ ${bilan.ecrits.length} fiche(s) de mot (brouillon) et ${bilan.referencesEcrites} fiche(s) d'auteur ou d'ouvrage écrite(s).`);
  if (refus.length > 0) console.log(`\nNon écrites (${refus.length}) :\n- ${refus.join("\n- ")}`);
  if (bilan.aCorriger.length > 0) console.log(`\nÀ corriger (npm run valider) :\n${bilan.aCorriger.map(formaterErreur).join("\n")}`);
  console.log("\nSuite : npm run valider.");
  return bilan.aCorriger.length > 0 ? 1 : 0;
}

if (import.meta.main) process.exitCode = await principal();
