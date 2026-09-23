import { normaliser } from "../src/lib/recherche.ts";
import { urlLittre } from "./lib/littre.ts";
import { chargerIndexLittre } from "./littre.ts";

/** Affiche l'étymologie du Littré (et son lien) pour chaque mot demandé. */
if (import.meta.main) {
  const mots = process.argv.slice(2);
  if (mots.length === 0) {
    console.log("Usage : npm run preparer -- <mot> [<mot>…]");
    process.exit(1);
  }
  const index = await chargerIndexLittre();
  for (const mot of mots) {
    const entrees = index[normaliser(mot)] ?? [];
    if (entrees.length === 0) console.log(`\n■ ${mot} : absent du Littré (ou sans étymologie)`);
    for (const { terme, etymologie } of entrees) console.log(`\n■ ${terme}  ${urlLittre(terme)}\n${etymologie}`);
  }
}
