import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOSSIER_DATA } from "./valider-fiches.ts";

/**
 * Ajoute une valeur à une liste fermée (docs/methode.md, « Les listes fermées ») : aucune n'est
 * exhaustive d'avance, elles grandissent avec les mots, mais par ce seul point. Le contrat et les
 * consignes, qui citent les listes, sont régénérés. Retirer ou fusionner reste une décision de
 * relecture, faite à la main.
 *
 * Usage : npm run liste -- <langues | themes | traditions> "<valeur>"
 */
export const LISTES = ["langues", "themes", "traditions"] as const;

/** La liste avec la valeur ajoutée à la fin, ou telle quelle si elle y est déjà. */
export function ajouter(liste: string[], valeur: string): string[] {
  return liste.includes(valeur) ? liste : [...liste, valeur];
}

function principal(): number {
  const [nom, brute] = process.argv.slice(2);
  const valeur = brute?.trim();
  if (!LISTES.includes(nom as (typeof LISTES)[number]) || !valeur) {
    console.log(`Usage : npm run liste -- <${LISTES.join(" | ")}> "<valeur>"`);
    return 1;
  }
  const fichier = join(DOSSIER_DATA, `${nom}.json`);
  const liste: string[] = JSON.parse(readFileSync(fichier, "utf8"));
  if (liste.includes(valeur)) {
    console.log(`« ${valeur} » figure déjà dans data/${nom}.json.`);
    return 0;
  }
  writeFileSync(fichier, JSON.stringify(ajouter(liste, valeur), null, 2) + "\n");
  // Un autre processus : celui-ci a déjà lu les listes à l'import du schéma.
  execFileSync(process.execPath, [fileURLToPath(new URL("./contrat.ts", import.meta.url))], { stdio: "inherit" });
  console.log(`✓ « ${valeur} » ajouté à data/${nom}.json. À noter au journal de méthode, avec sa raison.`);
  return 0;
}

if (import.meta.main) process.exitCode = principal();
