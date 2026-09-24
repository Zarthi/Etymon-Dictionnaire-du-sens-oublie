import type { Candidat, FicheIdentifiee } from "../src/lib/types.ts";
import { cheminFiche } from "./lib/validation.ts";
import { formaterErreur, validerDepot } from "./valider-fiches.ts";

/** Comptes par statut, pour suivre l'avancement du dictionnaire. */
export function resumer(fiches: FicheIdentifiee[], candidats: Candidat[]) {
  const compter = <T>(liste: T[], critere: (x: T) => boolean) => liste.filter(critere).length;
  return {
    fiches: fiches.length,
    validees: compter(fiches, (f) => f.statut === "validee"),
    brouillons: compter(fiches, (f) => f.statut === "brouillon"),
    aVerifier: compter(fiches, (f) => f.statut === "a-verifier"),
    incertaines: compter(fiches, (f) => f.incertain),
    candidatsAFaire: compter(candidats, (c) => c.statut === "a-faire"),
    candidatsSansSource: compter(candidats, (c) => c.statut === "sans-source"),
    candidatsEcartes: compter(candidats, (c) => c.statut === "ecarte"),
    lectures: fiches.reduce((n, f) => n + f.lecturesTraditionnelles.length, 0),
    lecturesIASeule: lecturesIASeule(fiches).length,
  };
}

/**
 * Lectures traditionnelles sans œuvre consultée et rédigées par l'IA seule. Permises, mais à
 * compléter à terme par une œuvre (une lecture rédigée par Étymon n'est pas signalée).
 */
export function lecturesIASeule(fiches: FicheIdentifiee[]) {
  return fiches.flatMap((f) =>
    f.lecturesTraditionnelles
      .filter((l) => l.sources.length === 0 && (l.redaction ?? f.redaction).every((r) => r.par === "IA"))
      .map((l) => ({ mot: f.mot, auteur: l.auteur, chemin: `data/fiches/${cheminFiche(f.id)}` })),
  );
}

/** Fiches en brouillon, triées par id : mot, emplacement et incertitude, pour la relecture. */
export function listerBrouillons(fiches: FicheIdentifiee[]) {
  return fiches
    .filter((f) => f.statut === "brouillon")
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((f) => ({ mot: f.mot, chemin: `data/fiches/${cheminFiche(f.id)}`, incertain: f.incertain }));
}

/** Les `nombre` premiers candidats à traiter, dans l'ordre des listes. */
export function prochainsCandidats(candidats: Candidat[], nombre: number): string[] {
  return candidats.filter((c) => c.statut === "a-faire").slice(0, nombre).map((c) => c.mot);
}

const AIDE = `Usage : npm run etat [-- commande]
  (aucune)          résumé de l'avancement
  brouillons        fiches à relire (aussi : npm run brouillons)
  candidats [n]     les n prochains mots à traiter (20 par défaut)
  lectures-ia       lectures traditionnelles sourcées par l'IA seule, à compléter`;

if (import.meta.main) {
  const { fiches, candidats, erreurs } = await validerDepot();
  const [commande, argument] = process.argv.slice(2);
  if (commande === undefined) {
    const r = resumer(fiches, candidats);
    console.log(`Fiches      : ${r.fiches} (${r.validees} validée(s), ${r.brouillons} brouillon(s), ${r.aVerifier} à vérifier, ${r.incertaines} incertaine(s))`);
    console.log(`Candidats   : ${r.candidatsAFaire} à faire, ${r.candidatsSansSource} sans source, ${r.candidatsEcartes} écarté(s)`);
    console.log(`Lectures    : ${r.lectures} lecture(s) traditionnelle(s), dont ${r.lecturesIASeule} sourcée(s) par l'IA seule`);
    console.log(`Validation  : ${erreurs.length === 0 ? "conforme" : `${erreurs.length} erreur(s), voir npm run valider`}`);
  } else if (commande === "brouillons") {
    const liste = listerBrouillons(fiches);
    const largeur = Math.max(0, ...liste.map((b) => b.mot.length));
    for (const b of liste) console.log(`${b.mot.padEnd(largeur)}  ${b.incertain ? "incertain " : "          "}${b.chemin}`);
    console.log(`
${liste.length} brouillon(s) à relire.`);
  } else if (commande === "candidats") {
    for (const mot of prochainsCandidats(candidats, Number(argument ?? 20))) console.log(mot);
  } else if (commande === "lectures-ia") {
    const liste = lecturesIASeule(fiches);
    for (const l of liste) console.log(`${l.mot} (${l.auteur})  ${l.chemin}`);
    console.log(`\n${liste.length} lecture(s) à compléter par une œuvre consultée.`);
  } else {
    console.log(AIDE);
    process.exit(1);
  }
  if (commande !== undefined && erreurs.length > 0) console.error(`\n${erreurs.map(formaterErreur).join("\n")}`);
}
