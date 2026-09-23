import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseDocument } from "yaml";
import { chercher, urlLittre, verdict } from "./lib/littre.ts";
import { cheminFiche } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";
import { arreterSiErreurs, DOSSIER_DATA, validerDepot } from "./valider-fiches.ts";

/**
 * Confronte au Littré local les fiches `a-verifier` (rédigées de mémoire).
 * Concordance sans doute exprimé : la source Littré est ajoutée et la fiche passe en `brouillon`.
 * Sinon, la fiche reste `a-verifier` et figure dans le rapport, pour une vérification à la main.
 */
if (import.meta.main) {
  const { fiches, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const index = await chargerIndexLittre();
  const aVoir: string[] = [];
  let promues = 0;

  for (const fiche of fiches.filter((f) => f.statut === "a-verifier")) {
    const formes = fiche.racine ? [fiche.etymon, fiche.racine.forme] : [fiche.etymon];
    const v = verdict(formes, chercher(index, fiche.mot));
    if (v.resultat === "concorde") {
      const chemin = join(DOSSIER_DATA, "fiches", cheminFiche(fiche.id));
      const document = parseDocument(await readFile(chemin, "utf8"));
      const source = { ouvrage: "Littré", entree: v.entree.terme, url: urlLittre(v.entree.terme) };
      const autres = fiche.sources.filter((s) => s.ouvrage !== "Littré");
      document.set("sources", document.createNode([source, ...autres]));
      document.set("statut", "brouillon");
      await writeFile(chemin, document.toString({ lineWidth: 80 }));
      promues++;
    } else {
      const extrait = v.resultat === "absent" ? "" : ` — Littré : ${v.entree.etymologie.slice(0, 160)}`;
      aVoir.push(`${fiche.mot} (${fiche.etymon}) : ${v.resultat}${extrait}`);
    }
  }

  console.log(`✓ ${promues} fiche(s) concordante(s) avec le Littré, passée(s) en brouillon.`);
  if (aVoir.length > 0) console.log(`\nÀ vérifier à la main (${aVoir.length}) :\n- ${aVoir.join("\n- ")}`);
}
