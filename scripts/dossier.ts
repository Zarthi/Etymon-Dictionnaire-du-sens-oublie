import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { cheminDossier, cheminVerdict, schemaDossier, schemaVerdict, squeletteDossier } from "./lib/atelier.ts";
import { chercher, urlLittre } from "./lib/littre.ts";
import { consulterTlfi } from "./lib/tlfi.ts";
import { slug } from "./lib/validation.ts";
import { chargerIndexLittre } from "./littre.ts";

/**
 * Dossier de faits d'un mot (étape 1 de docs/methode.md), dans atelier/<id>/dossier.json.
 * Crée le dossier s'il n'existe pas, avec les entrées du Littré local (domaine public, recopiées),
 * et affiche ce qu'il faut lire pour le compléter : le Littré, l'étymologie du TLFi (consultée, non
 * recopiée : l'agent n'en garde que les faits) et les adresses des dictionnaires des étymons.
 * Avec --consulter, affiche seulement, sans créer de dossier (un mot voisin : « déverbal de ennuyer »).
 * Avec --verifier, contrôle un dossier complété, et le verdict du relecteur s'il existe.
 *
 * Usage : npm run dossier -- [--consulter | --verifier] <mot>…
 */
const problemes = (issues: { path: PropertyKey[]; message: string }[]) =>
  issues.map((i) => `  ${i.path.join(".") || "(racine)"} : ${i.message}`).join("\n");

async function principal(): Promise<number> {
  const { values, positionals: mots } = parseArgs({
    allowPositionals: true,
    options: { verifier: { type: "boolean", default: false }, consulter: { type: "boolean", default: false } },
  });
  if (mots.length === 0) {
    console.log("Usage : npm run dossier -- [--consulter | --verifier] <mot>…");
    return 1;
  }

  if (values.verifier) {
    let echecs = 0;
    for (const mot of mots) {
      const chemin = cheminDossier(slug(mot));
      if (!existsSync(chemin)) {
        console.log(`✗ ${mot} : pas de dossier (npm run dossier -- ${mot})`);
        echecs++;
        continue;
      }
      const resultat = schemaDossier.safeParse(JSON.parse(await readFile(chemin, "utf8")));
      if (resultat.success) console.log(`✓ ${mot} : ${resultat.data.chemin}, ${resultat.data.faits.length} fait(s)`);
      else {
        echecs++;
        console.log(`✗ ${mot} :\n${problemes(resultat.error.issues)}`);
      }
      const fichierVerdict = cheminVerdict(slug(mot));
      if (!existsSync(fichierVerdict)) continue;
      const verdict = schemaVerdict.safeParse(JSON.parse(await readFile(fichierVerdict, "utf8")));
      if (verdict.success) console.log(`  verdict : ${verdict.data.decision}${verdict.data.remarques.length ? `, ${verdict.data.remarques.length} remarque(s)` : ""}`);
      else {
        echecs++;
        console.log(`✗ ${mot}, verdict :\n${problemes(verdict.error.issues)}`);
      }
    }
    return echecs > 0 ? 1 : 0;
  }

  const index = await chargerIndexLittre();
  for (const mot of mots) {
    const id = slug(mot);
    const chemin = cheminDossier(id);
    const littre = chercher(index, mot) ?? [];
    const cree = !values.consulter && !existsSync(chemin);
    if (cree) {
      await mkdir(dirname(chemin), { recursive: true });
      await writeFile(chemin, JSON.stringify(squeletteDossier(mot, littre), null, 2) + "\n");
    }
    const tlfi = await consulterTlfi(mot);
    console.log(values.consulter ? `■ ${mot}` : `■ ${mot} → atelier/${id}/dossier.json (${cree ? "créé" : "existant"})`);
    if (littre.length === 0) console.log("Littré : absent (mot postérieur à 1872, ou autre graphie)");
    for (const e of littre)
      console.log(`Littré, « ${e.terme} »${e.nature ? ` (${e.nature})` : ""} ${urlLittre(e.terme)}\n  ${e.etymologie || "(sans étymologie)"}`);
    console.log(
      tlfi
        ? `TLFi${tlfi.nature ? ` (${tlfi.nature})` : ""} https://www.cnrtl.fr/etymologie/${encodeURIComponent(mot)} — consultation : n'en garder que les faits\n  Sens :\n${tlfi.sens.length ? tlfi.sens.map((s) => `    ${s}`).join("\n") : "    (pas de plan des sens par l'API)"}\n  Étymologie et historique : ${tlfi.etymologie}`
        : `TLFi : rien par l'API pour cette graphie ; voir https://www.cnrtl.fr/etymologie/${encodeURIComponent(mot)} dans le navigateur intégré`,
    );
    console.log("Étymons : npm run texte -- bailly:<forme grecque> ; Gaffiot (gaffiot.fr/#<forme latine>) dans le navigateur intégré, s'il le faut.\n");
  }
  return 0;
}

if (import.meta.main) process.exitCode = await principal();
