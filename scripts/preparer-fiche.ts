import { chercher, urlLittre } from "./lib/littre.ts";
import { chargerIndexLittre } from "./littre.ts";

/** Affiche la nature, l'étymologie du Littré et son lien pour chaque mot demandé. */
if (import.meta.main) {
  const mots = process.argv.slice(2);
  if (mots.length === 0) {
    console.log("Usage : npm run preparer -- <mot> [<mot>…]");
    process.exit(1);
  }
  const index = await chargerIndexLittre();
  for (const mot of mots) {
    const entrees = chercher(index, mot) ?? [];
    if (entrees.length === 0) console.log(`\n■ ${mot} : absent du Littré`);
    for (const { terme, nature, etymologie } of entrees) {
      console.log(`\n■ ${terme}${nature ? ` (${nature})` : ""}  ${urlLittre(terme)}\n${etymologie || "(sans étymologie)"}`);
    }
  }
}
