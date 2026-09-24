import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extraireEntrees, indexer, type IndexLittre } from "./lib/littre.ts";

/**
 * Copie locale du Littré (XMLittré, François Gannaz, CC BY-SA 3.0), hors du dépôt.
 * Version figée pour des résultats reproductibles.
 */
const DEPOT = "https://raw.githubusercontent.com/funkypitt/xmlittre-data";
const VERSION = "b44d144d12a153799e2c8f357ea91b049f8d83e2";
const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export const DOSSIER_LITTRE = fileURLToPath(new URL("../sources/littre", import.meta.url));
const FICHIER_INDEX = join(DOSSIER_LITTRE, "index.json");

export async function chargerIndexLittre(): Promise<IndexLittre> {
  if (!existsSync(FICHIER_INDEX)) {
    console.error("Index du Littré absent : lancer d'abord « npm run littre ».");
    process.exit(1);
  }
  return JSON.parse(await readFile(FICHIER_INDEX, "utf8"));
}

if (import.meta.main) {
  const dossierXml = join(DOSSIER_LITTRE, "xml");
  await mkdir(dossierXml, { recursive: true });
  const entrees = [];
  for (const lettre of LETTRES) {
    const fichier = join(dossierXml, `${lettre}.xml`);
    if (!existsSync(fichier)) {
      process.stdout.write(`téléchargement ${lettre}.xml… `);
      const reponse = await fetch(`${DEPOT}/${VERSION}/${lettre}.xml`);
      if (!reponse.ok) throw new Error(`${lettre}.xml : HTTP ${reponse.status}`);
      await writeFile(fichier, await reponse.text());
      console.log("ok");
    }
    entrees.push(...extraireEntrees(await readFile(fichier, "utf8")));
  }
  await writeFile(FICHIER_INDEX, JSON.stringify(indexer(entrees)));
  console.log(`✓ ${entrees.length} entrées du Littré indexées dans sources/littre/index.json`);
}
