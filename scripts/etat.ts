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
    incertaines: compter(fiches, (f) => f.incertain),
    candidatsAFaire: compter(candidats, (c) => c.statut === "a-faire"),
    candidatsSansSource: compter(candidats, (c) => c.statut === "sans-source"),
    candidatsEcartes: compter(candidats, (c) => c.statut === "ecarte"),
  };
}

/** Les `nombre` premiers candidats à traiter, dans l'ordre des listes. */
export function prochainsCandidats(candidats: Candidat[], nombre: number): string[] {
  return candidats.filter((c) => c.statut === "a-faire").slice(0, nombre).map((c) => c.mot);
}

const AIDE = `Usage : npm run etat [-- commande]
  (aucune)          résumé de l'avancement
  brouillons        chemins des fiches à relire
  candidats [n]     les n prochains mots à traiter (20 par défaut)`;

if (import.meta.main) {
  const { fiches, candidats, erreurs } = await validerDepot();
  const [commande, argument] = process.argv.slice(2);
  if (commande === undefined) {
    const r = resumer(fiches, candidats);
    console.log(`Fiches      : ${r.fiches} (${r.validees} validée(s), ${r.brouillons} brouillon(s), ${r.incertaines} incertaine(s))`);
    console.log(`Candidats   : ${r.candidatsAFaire} à faire, ${r.candidatsSansSource} sans source, ${r.candidatsEcartes} écarté(s)`);
    console.log(`Validation  : ${erreurs.length === 0 ? "conforme" : `${erreurs.length} erreur(s), voir npm run valider`}`);
  } else if (commande === "brouillons") {
    for (const f of fiches.filter((f) => f.statut === "brouillon")) console.log(`data/fiches/${cheminFiche(f.id)}`);
  } else if (commande === "candidats") {
    for (const mot of prochainsCandidats(candidats, Number(argument ?? 20))) console.log(mot);
  } else {
    console.log(AIDE);
    process.exit(1);
  }
  if (commande !== undefined && erreurs.length > 0) console.error(`\n${erreurs.map(formaterErreur).join("\n")}`);
}
