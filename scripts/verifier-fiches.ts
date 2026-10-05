import { controler } from "./lib/controles.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";
import { chargerIndexLittre } from "./littre.ts";

/**
 * Contrôles automatiques de toutes les fiches contre le Littré local : nature, famille, formes
 * d'origine, auteur nommé sans référence. Ils signalent sans bloquer, et ne changent aucune fiche :
 * ni le statut, ni les sources (le Littré n'y est ajouté qu'à la rédaction, d'après le dossier).
 */
if (import.meta.main) {
  const { fiches, auteurs, ouvrages, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const index = await chargerIndexLittre();
  const controles = fiches.flatMap((f) => controler(f, index, auteurs, ouvrages).map((s) => `${f.mot} › ${s}`));
  console.log(`✓ ${fiches.length} fiche(s) contrôlée(s).`);
  if (controles.length > 0) console.log(`\nContrôles à relire (${controles.length}) :\n- ${controles.join("\n- ")}`);
}
