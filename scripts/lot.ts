import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { ecrireReference } from "./bnf.ts";
import { corpusTelecharge, rechercherDansLeCorpus } from "./corpus.ts";
import { creerSquelette } from "./dossier.ts";
import {
  cheminAReprendre,
  cheminDecisions,
  cheminDossier,
  cheminFicheAtelier,
  cheminReferences,
  cheminSources,
  cheminVerdict,
  oeuvresNonConsultees,
  schemaDossier,
  schemaReferences,
  schemaVerdict,
} from "./lib/atelier.ts";
import { lignePassage } from "./lib/corpus.ts";
import { pageIntrouvable, texteDePage } from "./lib/en-ligne.ts";
import { clesGrecques, clesLatines, entreeBailly, entreePerseus, formesGrecques, formesLatines, NUMEROS_PERSEUS, radicalLatin, tronquer } from "./lib/formes.ts";
import { appliquerVerdict, composerSources, extraitCorpus, famille, rapportAReprendre, remarquesOuvertes, reporterDecisions, type DonneesSources, type EtymonConsulte, type Restante } from "./lib/lot.ts";
import { chercher } from "./lib/littre.ts";
import { lireReflexion, type Moteur } from "./lib/redaction.ts";
import { regenererContrat } from "./lib/regenerer.ts";
import { lireAvecRelance } from "./lib/reseau.ts";
import { consulterTlfiDuMot } from "./lib/tlfi.ts";
import { slug } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";
import { lireLot, rediger, type Brute } from "./rediger-lot.ts";
import { adresse } from "./texte.ts";
import { DOSSIER_DATA, formaterErreur } from "./valider-fiches.ts";

/**
 * Un lot de rédaction (docs/methode.md §3), en trois commandes qui font ce qu'un script fait seul :
 * - `sources <mot>…` : pour chaque mot, `atelier/<id>/sources.md`, ce que disent le Littré, le TLFi,
 *   les dictionnaires des étymons et le corpus de réflexe, sans interpréter ; l'agent en tire le dossier ;
 * - `reprendre <mot>…` : applique à `atelier/<id>/fiche.json` les remplacements des verdicts, et écrit
 *   `atelier/a-reprendre.md` pour ce qui demande encore le rédacteur ;
 * - `clore <mot>…` : écrit les fiches (lectures comprises), crée les auteurs et ouvrages de
 *   `atelier/references.json`, reporte `atelier/decisions.md` dans docs/decisions.md, régénère le
 *   contrat, vérifie (en ligne, contrôles, validation, tests) et rend un résumé court.
 * data/ et docs/ ne changent qu'à `clore` : le lot se fait dans atelier/.
 *
 * Usage : npm run lot -- sources|reprendre|clore <mot>… [--modele "Claude Opus 5.5"] [--reflexion élevée]
 */
const RACINE = fileURLToPath(new URL("..", import.meta.url));
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Pause entre deux requêtes au même site, et reprises (429, 503) plus courtes que pour un téléchargement. */
const PAUSE_REQUETES_MS = 400;
const PAUSE_RELANCE_MS = 3_000;
/** Formes relevées par mot qu'on va chercher dans les dictionnaires, et dans le corpus : de quoi couvrir la chaîne sans noyer le lecteur. */
const MAX_FORMES = 4;
const MAX_FORMES_CORPUS = 3;
const PASSAGES_PAR_OEUVRE = 3;
const LONGUEUR_ENTREE = 900;

/** Entrée du Lewis & Short (Perseus) d'une forme latine : sa forme de dictionnaire, numérotée s'il y a des homographes. */
async function consulterLewisShort(forme: string): Promise<EtymonConsulte> {
  const entrees: EtymonConsulte["entrees"] = [];
  const essayees: string[] = [];
  for (const base of clesLatines(forme)) {
    for (const numero of NUMEROS_PERSEUS) {
      const cle = `${base}${numero}`;
      essayees.push(cle);
      const url = adresse(`lewis-short:${cle}`)!;
      const page = await lireAvecRelance(url, undefined, undefined, PAUSE_RELANCE_MS);
      await attendre(PAUSE_REQUETES_MS);
      const texte = page.lue ? entreePerseus(page.texte) : undefined;
      if (texte) entrees.push({ cle, url, texte: tronquer(texte, LONGUEUR_ENTREE) });
      // Perseus répond par une redirection (302, que le proxy refuse en 403) à une entrée qui n'existe pas.
      else if (!page.lue && ![302, 403, 404].includes(page.statut ?? 0)) return { forme, entrees, injoignable: page.raison };
      // Sans entrée sans numéro, les entrées numérotées viennent ; avec elle, il n'y en a pas ; et la 2 ne suit pas une 1 absente.
      if (numero === "" && texte) break;
      if (numero === "1" && !texte) break;
    }
    if (entrees.length > 0) break;
  }
  return { forme, entrees, ...(entrees.length === 0 ? { essayees } : {}) };
}

/** Entrée du Bailly d'une forme grecque : sa forme de dictionnaire (λέγειν, λέγω). */
async function consulterBailly(forme: string): Promise<EtymonConsulte> {
  const essayees: string[] = [];
  for (const cle of clesGrecques(forme)) {
    essayees.push(cle);
    const url = adresse(`bailly:${cle}`)!;
    const page = await lireAvecRelance(url, undefined, undefined, PAUSE_RELANCE_MS);
    await attendre(PAUSE_REQUETES_MS);
    if (!page.lue && page.statut === 404) continue;
    if (!page.lue) return { forme, entrees: [], injoignable: page.raison };
    if (pageIntrouvable(page.texte)) continue;
    // Certaines pages (bailly.app) portent des retours à la ligne échappés : « \n » écrit en deux signes.
    const texte = entreeBailly(texteDePage(page.texte).replace(/\\n/g, " "));
    if (texte) return { forme, entrees: [{ cle, url, texte: tronquer(texte, LONGUEUR_ENTREE) }] };
  }
  return { forme, entrees: [], essayees };
}

/** Recherche des radicaux des formes latines dans le corpus de réflexe : passages ★ d'abord, extraits courts. */
async function chercherDansLeCorpus(latins: string[]): Promise<DonneesSources["corpus"]> {
  if (!corpusTelecharge()) return "absent";
  const vus = new Set<string>();
  const resultats: Exclude<DonneesSources["corpus"], "absent"> = [];
  for (const forme of latins.slice(0, MAX_FORMES_CORPUS)) {
    const radical = radicalLatin(forme);
    if (vus.has(radical)) continue;
    vus.add(radical);
    const parOeuvre = await rechercherDansLeCorpus(radical);
    resultats.push({
      forme,
      radical,
      resultats: parOeuvre.map(({ oeuvre, passages }) => ({
        oeuvre: oeuvre.titre,
        tradition: oeuvre.tradition,
        total: passages.length,
        expliquent: passages.filter((p) => p.explique).length,
        lignes: passages.slice(0, PASSAGES_PAR_OEUVRE).map((p) => lignePassage({ ...p, passage: extraitCorpus(p.passage) })),
      })),
    });
  }
  return resultats;
}

/** Ce qui, dans `sources.md`, n'a pas pu être lu : à relancer, jamais pris pour une absence. */
const avertissements = (md: string) => md.split("\n").filter((l) => l.includes("⚠") || l.includes("injoignable"));

async function sources(mots: string[]): Promise<number> {
  const index = await chargerIndexLittre();
  const problemes: string[] = [];
  for (const mot of mots) {
    const id = slug(mot);
    const littre = chercher(index, mot) ?? [];
    await creerSquelette(mot, littre);
    const tlfi = await consulterTlfiDuMot(mot, littre);
    const etymologies = [...littre.map((e) => e.etymologie), tlfi.tlfi?.etymologie ?? ""].join(" ");
    const latins = formesLatines(etymologies).slice(0, MAX_FORMES);
    const grecs = formesGrecques(etymologies).slice(0, MAX_FORMES);
    const donnees: DonneesSources = {
      mot,
      littre,
      famille: famille(index, mot),
      tlfi,
      latins: [],
      grecs: [],
      corpus: await chercherDansLeCorpus(latins),
    };
    for (const forme of latins) donnees.latins.push(await consulterLewisShort(forme));
    for (const forme of grecs) donnees.grecs.push(await consulterBailly(forme));
    const md = composerSources(donnees);
    await mkdir(dirname(cheminSources(id)), { recursive: true });
    await writeFile(cheminSources(id), md);
    const manques = avertissements(md);
    console.log(`■ ${mot} → atelier/${id}/sources.md (${md.split("\n").length} lignes${latins.length ? `, latin : ${latins.join(" ")}` : ""}${grecs.length ? `, grec : ${grecs.join(" ")}` : ""})`);
    problemes.push(...manques.map((m) => `${mot} : ${m.trim()}`));
  }
  if (problemes.length > 0) console.log(`\n⚠ À relancer ou à lire dans le navigateur (jamais une absence) :\n- ${problemes.join("\n- ")}`);
  return 0;
}

/** Fichier JSON de l'atelier, ou rien s'il n'existe pas. */
async function lireJson(chemin: string): Promise<unknown> {
  return existsSync(chemin) ? JSON.parse(await readFile(chemin, "utf8")) : undefined;
}

const ecrireJson = (chemin: string, valeur: unknown) => writeFile(chemin, JSON.stringify(valeur, null, 2) + "\n");

async function reprendre(mots: string[]): Promise<number> {
  type Etat = { mot: string; id: string; avant: unknown; avantVerdict: unknown; fiche: unknown; verdict: ReturnType<typeof appliquerVerdict>["verdict"]; restantes: Restante[]; appliquees: number };
  const etats: Etat[] = [];
  const absents: string[] = [];
  for (const mot of mots) {
    const id = slug(mot);
    const brute = (await lireJson(cheminFicheAtelier(id))) as Brute | undefined;
    const avantVerdict = await lireJson(cheminVerdict(id));
    if (!brute || !avantVerdict) {
      absents.push(`${mot} : ${brute ? "pas de verdict" : "pas de fiche.json"} (atelier/${id}/)`);
      continue;
    }
    const verdict = schemaVerdict.safeParse(avantVerdict);
    if (!verdict.success) {
      absents.push(`${mot} : verdict invalide (npm run dossier -- --verifier ${mot})`);
      continue;
    }
    const { fiche, verdict: apres, restantes } = appliquerVerdict(brute, verdict.data);
    etats.push({ mot, id, avant: brute, avantVerdict, fiche, verdict: apres, restantes, appliquees: apres.remarques.filter((r) => r.statut === "appliquee").length - verdict.data.remarques.filter((r) => r.statut === "appliquee").length });
  }

  // Essai de chaque fiche telle qu'elle serait : validée avec le dépôt, rien n'est écrit dans data/.
  const lot = etats.map((e) => lireLot(e.fiche as Brute).fiches[0]);
  const bilan = await rediger({ fiches: lot, auteurs: [], ouvrages: [] }, { modele: "essai" }, { essai: true });
  const aReprendre: { mot: string; restantes: Restante[]; essai: string[] }[] = [];
  for (const e of etats) {
    const essai = [
      ...bilan.refus.filter((r) => r.id === e.id).map((r) => r.message),
      ...bilan.aCorriger.filter((x) => x.fichier.endsWith(`/${e.id}.yaml`)).map(formaterErreur),
    ];
    if (essai.length > 0 && e.appliquees > 0) {
      // Les remplacements ont rendu la fiche invalide : elle reste comme elle était, et le rédacteur règle toutes les remarques ouvertes.
      const verdictAvant = schemaVerdict.parse(e.avantVerdict);
      aReprendre.push({ mot: e.mot, restantes: remarquesOuvertes(verdictAvant).map((r) => ({ ...r, raison: r.remplacement ? "remplacement annulé, essai refusé" : "sans remplacement" })), essai });
      console.log(`✗ ${e.mot} : l'essai refuse la fiche après les remplacements, fiche.json inchangée`);
      continue;
    }
    await ecrireJson(cheminFicheAtelier(e.id), e.fiche);
    await ecrireJson(cheminVerdict(e.id), e.verdict);
    if (e.restantes.length > 0 || essai.length > 0) aReprendre.push({ mot: e.mot, restantes: e.restantes, essai });
    console.log(`${e.restantes.length + essai.length === 0 ? "✓" : "✗"} ${e.mot} : ${e.appliquees} remplacement(s) appliqué(s)${e.restantes.length ? `, ${e.restantes.length} remarque(s) restée(s) au rédacteur` : ""}${essai.length ? `, essai refusé (${essai.length})` : ""}`);
  }
  if (bilan.aCreer.length > 0) console.log(`À créer (atelier/references.json) : ${bilan.aCreer.join(", ")}`);
  for (const a of absents) console.log(`✗ ${a}`);
  if (aReprendre.length > 0) {
    await writeFile(cheminAReprendre, rapportAReprendre(aReprendre));
    console.log(`\n${aReprendre.length} mot(s) à reprendre par le rédacteur : atelier/a-reprendre.md`);
  } else {
    await rm(cheminAReprendre, { force: true });
    if (absents.length === 0) console.log("\nRien à reprendre par le rédacteur.");
  }
  return absents.length > 0 ? 1 : 0;
}

/** Sortie d'un script lancé par la clôture. */
function lancer(args: string[], { proxy = false } = {}): { ok: boolean; sortie: string } {
  const r = spawnSync(process.execPath, [...(proxy ? ["--use-env-proxy"] : []), ...args], { cwd: RACINE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, sortie: `${r.stdout ?? ""}${r.stderr ?? ""}`.replace(/\(node:\d+\) \[UNDICI-EHPA\][^\n]*\n(\(Use[^\n]*\n)?/g, "") };
}

const fin = (sortie: string, lignes: number) => sortie.trim().split("\n").slice(-lignes).join("\n");

async function clore(mots: string[], moteur: Moteur): Promise<number> {
  const script = (nom: string) => join(RACINE, "scripts", nom);
  const ids = mots.map(slug);

  // Tout ou rien avant d'écrire : un lot dont un mot n'est pas relu ou reste en remarque ne s'écrit pas à moitié.
  const fiches: Brute[] = [];
  const refus: string[] = [];
  const signalements: string[] = [];
  for (const mot of mots) {
    const id = slug(mot);
    const brute = (await lireJson(cheminFicheAtelier(id))) as Brute | undefined;
    const verdict = schemaVerdict.safeParse(await lireJson(cheminVerdict(id)));
    if (!brute) refus.push(`${mot} : pas de fiche.json (atelier/${id}/)`);
    else if (!verdict.success) refus.push(`${mot} : pas de verdict valide (relecture non faite ?)`);
    else if (remarquesOuvertes(verdict.data).length > 0) refus.push(`${mot} : ${remarquesOuvertes(verdict.data).length} remarque(s) ouverte(s) (npm run lot -- reprendre ${mot})`);
    else fiches.push(...lireLot(brute).fiches);
    const dossier = schemaDossier.safeParse(await lireJson(cheminDossier(id)));
    if (dossier.success) {
      const manquantes = oeuvresNonConsultees(dossier.data);
      if (manquantes.length > 0) signalements.push(`${mot} : corpus de réflexe non noté au dossier (${manquantes.join(", ")})`);
    }
  }
  if (refus.length > 0) {
    console.log(`✗ Clôture refusée, rien n'est écrit :\n- ${refus.join("\n- ")}`);
    return 1;
  }

  // Auteurs et ouvrages d'abord : les fiches du lot les citent.
  const references = schemaReferences.safeParse((await lireJson(cheminReferences)) ?? {});
  let creees = 0;
  const echecs: string[] = [];
  if (!references.success) echecs.push(`atelier/references.json : ${references.error.issues.map((i) => `${i.path.join(".")} : ${i.message}`).join(" ; ")}`);
  else
    for (const [genre, liste] of [["auteur", references.data.auteurs], ["ouvrage", references.data.ouvrages]] as const) {
      for (const { cb, id, ...reste } of liste) {
        if (existsSync(join(DOSSIER_DATA, genre === "auteur" ? "auteurs" : "ouvrages", `${id}.yaml`))) continue;
        const ecrit = await ecrireReference(genre, { cb, id, ...reste }, moteur);
        if ("erreur" in ecrit) echecs.push(`${genre} ${id} : ${ecrit.erreur}`);
        else creees++;
      }
    }

  const bilan = await rediger({ fiches, auteurs: [], ouvrages: [] }, moteur);
  const problemes = [...echecs, ...bilan.refus.map((r) => `${r.id} : ${r.message}`), ...bilan.aCorriger.map(formaterErreur)];

  // Décisions : reportées en tête du journal une fois les fiches écrites, puis retirées de l'atelier.
  let decisions = 0;
  const texteDecisions = existsSync(cheminDecisions) ? (await readFile(cheminDecisions, "utf8")).trim() : "";
  if (texteDecisions !== "" && bilan.ecrits.length > 0) {
    const journal = join(RACINE, "docs", "decisions.md");
    await writeFile(journal, reporterDecisions(await readFile(journal, "utf8"), texteDecisions, new Date().toISOString().slice(0, 10), mots));
    await rm(cheminDecisions);
    decisions = texteDecisions.split("\n").filter((l) => l.trim() !== "").length;
  }

  regenererContrat();
  const enLigne = lancer([script("verifier-en-ligne.ts"), ...ids], { proxy: true });
  const controles = lancer([script("verifier-fiches.ts")]);
  const validation = lancer([script("valider-fiches.ts")]);
  const tests = lancer([join(RACINE, "node_modules", "vitest", "vitest.mjs"), "run"]);

  const duLot = controles.sortie.split("\n").filter((l) => l.startsWith("- ") && ids.includes(slug(l.slice(2).split(" › ")[0])));
  const coche = (ok: boolean) => (ok ? "✓" : "✗");
  console.log(`${coche(problemes.length === 0)} ${bilan.ecrits.length}/${mots.length} fiche(s) écrite(s) en brouillon ; ${creees} auteur(s) ou ouvrage(s) créé(s) ; ${decisions} ligne(s) de décisions reportées`);
  if (problemes.length > 0) console.log(`  À corriger :\n  - ${problemes.join("\n  - ")}`);
  console.log(`${coche(enLigne.ok)} en ligne : ${/(\d+\/\d+) adresse/.exec(enLigne.sortie)?.[1] ?? "?"} adresse(s) et citation(s)`);
  if (!enLigne.ok) console.log(fin(enLigne.sortie, 12));
  console.log(`${coche(controles.ok)} verifier : ${duLot.length} contrôle(s) à relire pour le lot`);
  for (const l of duLot) console.log(`    ${l}`);
  console.log(`${coche(validation.ok)} valider${validation.ok ? "" : `\n${fin(validation.sortie, 12)}`}`);
  console.log(`${coche(tests.ok)} tests${/Tests\s+(\d+ passed)/.exec(tests.sortie)?.[1] ? ` : ${/Tests\s+(\d+ passed)/.exec(tests.sortie)![1]}` : ""}${tests.ok ? "" : `\n${fin(tests.sortie, 20)}`}`);
  for (const s of signalements) console.log(`  signalement : ${s}`);
  return problemes.length === 0 && enLigne.ok && controles.ok && validation.ok && tests.ok ? 0 : 1;
}

async function principal(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { modele: { type: "string", default: "Claude Opus 5.5" }, reflexion: { type: "string", default: "élevée" } },
  });
  const [commande, ...mots] = positionals;
  if (!["sources", "reprendre", "clore"].includes(commande) || mots.length === 0) {
    console.log('Usage : npm run lot -- sources|reprendre|clore <mot>… [--modele "Claude Opus 5.5"] [--reflexion élevée]');
    return 1;
  }
  if (commande === "sources") return sources(mots);
  if (commande === "reprendre") return reprendre(mots);
  const reflexion = lireReflexion(values.reflexion);
  if ("erreur" in reflexion) {
    console.log(reflexion.erreur);
    return 1;
  }
  return clore(mots, { modele: values.modele, ...reflexion });
}

if (import.meta.main) process.exitCode = await principal();
