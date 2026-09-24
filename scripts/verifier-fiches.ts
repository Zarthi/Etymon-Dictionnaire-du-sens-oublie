import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isScalar, parseDocument, type YAMLMap } from "yaml";
import { formesComparables } from "../src/lib/etymologie.ts";
import { controler } from "./lib/controles.ts";
import { chercher, verdict } from "./lib/littre.ts";
import { cheminFiche } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";
import { arreterSiErreurs, DOSSIER_DATA, validerDepot } from "./valider-fiches.ts";

/**
 * Confronte au Littré local les fiches `a-verifier` (rédigées de mémoire).
 * Concordance sans doute exprimé : la source Littré est ajoutée et la fiche passe en `brouillon`.
 * Sinon, la fiche reste `a-verifier` et figure dans le rapport, pour une vérification à la main
 * (TLFi pour un mot absent du Littré, postérieur à 1872).
 * Toutes les fiches passent ensuite les contrôles automatiques (nature, famille, formes d'origine,
 * auteur nommé sans référence), qui signalent sans bloquer.
 */
if (import.meta.main) {
  const { fiches, auteurs, ouvrages, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const index = await chargerIndexLittre();
  const aVoir: string[] = [];
  let promues = 0;

  for (const fiche of fiches.filter((f) => f.statut === "a-verifier")) {
    const formes = formesComparables(fiche.etymologie);
    const v = verdict(formes, chercher(index, fiche.mot));
    if (v.resultat === "concorde") {
      const chemin = join(DOSSIER_DATA, "fiches", cheminFiche(fiche.id));
      const document = parseDocument(await readFile(chemin, "utf8"));
      // L'adresse du Littré se déduit de l'entrée : inutile de l'écrire.
      const source = { ouvrage: "littre", entree: v.entree.terme };
      const autres = fiche.sources.filter((s) => s.ouvrage !== "littre");
      // Les sources précèdent la rédaction, même quand la fiche n'en avait pas encore.
      const noeud = document.createNode([source, ...autres]);
      if (document.has("sources")) document.set("sources", noeud);
      else {
        const paires = (document.contents as YAMLMap).items;
        const place = paires.findIndex((p) => isScalar(p.key) && p.key.value === "redaction");
        paires.splice(place === -1 ? paires.length : place, 0, document.createPair("sources", noeud));
      }
      document.set("statut", "brouillon");
      await writeFile(chemin, document.toString({ lineWidth: 80 }));
      promues++;
    } else {
      const extrait = v.resultat === "absent" ? " (mot absent du Littré : vérifier au TLFi)" : ` — Littré : ${v.entree.etymologie.slice(0, 160)}`;
      aVoir.push(`${fiche.mot} (${formes[0] ?? "?"}) : ${v.resultat}${extrait}`);
    }
  }

  console.log(`✓ ${promues} fiche(s) concordante(s) avec le Littré, passée(s) en brouillon.`);
  if (aVoir.length > 0) console.log(`\nÀ vérifier à la main (${aVoir.length}) :\n- ${aVoir.join("\n- ")}`);

  const controles = fiches.flatMap((f) => controler(f, index, auteurs, ouvrages).map((s) => `${f.mot} › ${s}`));
  if (controles.length > 0) console.log(`\nContrôles à relire (${controles.length}) :\n- ${controles.join("\n- ")}`);
}
