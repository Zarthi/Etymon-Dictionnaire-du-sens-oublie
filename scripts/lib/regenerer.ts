import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Régénère le contrat et les consignes (npm run contrat) après une écriture dans data/ : ils
 * citent les listes fermées, les auteurs et les ouvrages, qui ne doivent pas vieillir pendant un
 * lot. Dans un autre processus : celui-ci a déjà lu data/ à l'import du schéma.
 */
export function regenererContrat(): void {
  execFileSync(process.execPath, [fileURLToPath(new URL("../contrat.ts", import.meta.url))], { stdio: "inherit" });
}
