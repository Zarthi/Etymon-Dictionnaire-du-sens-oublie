import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { chercherNotices, noticeDe, type Notice } from "./lib/bnf.ts";
import { lireReflexion, preparerAuteur, preparerOuvrage, versYaml } from "./lib/redaction.ts";
import { DOSSIER_DATA, formaterErreur, validerDepot } from "./valider-fiches.ts";

/**
 * Fiches d'auteurs et d'ouvrages d'après leur notice d'autorité BnF (étape 4 de docs/methode.md).
 * Sans --cb : cherche les notices et les affiche. Avec --cb : écrit la fiche en brouillon, avec
 * les faits de la notice (dates, élément d'entrée) et sa source ; l'agent ne fournit que ce que la
 * notice ne donne pas (nom usuel, description, traditions ; titre français et licence d'un ouvrage).
 *
 * Usage :
 *   npm run bnf -- auteur "Bleuler Eugen"
 *   npm run bnf -- auteur --cb cb12065087s --id eugen-bleuler --description "…" --modele "…" [--nom "…"] [--nom-complet "…"] [--traditions juive,chrétienne]
 *   npm run bnf -- ouvrage "More Utopia"
 *   npm run bnf -- ouvrage --cb cb11938048d --id utopia --titre "L'Utopie" --licence "domaine public" --description "…" --modele "…" [--auteur thomas-more] [--abrege …] [--titre-original …] [--texte https://…] [--traditions …]
 */
function afficher(n: Notice): string {
  const nom = n.type === "personne" ? [n.entree, n.rejet].filter(Boolean).join(", ") : `${n.entree}${n.auteur ? ` (${n.auteur})` : ""}`;
  const dates = n.type === "personne" ? (n.naissance || n.mort ? ` (${n.naissance ?? "?"} – ${n.mort ?? "?"})` : "") : n.date ? ` (${n.date})` : "";
  const variantes = n.variantes.length > 0 ? `\n    variantes : ${n.variantes.slice(0, 4).join(" ; ")}` : "";
  return `${n.cb}  ${nom}${dates}${n.note ? ` — ${n.note.slice(0, 120)}` : ""}${variantes}`;
}

/** Sans process.exit après un fetch : Node sous Windows s'arrête sinon sur une assertion de libuv. */
async function principal(): Promise<number> {
  const { values: v, positionals } = parseArgs({
    allowPositionals: true,
    options: Object.fromEntries(
      ["cb", "id", "nom", "nom-complet", "description", "modele", "reflexion", "traditions", "titre", "abrege", "titre-original", "auteur", "licence", "texte"].map((o) => [
        o,
        { type: "string" as const },
      ]),
    ),
  });
  const [genre, recherche] = positionals;
  if (genre !== "auteur" && genre !== "ouvrage") {
    console.log('Usage : npm run bnf -- auteur|ouvrage "<nom ou titre>"  (écrire : --cb … --id … --description … --modele …)');
    return 1;
  }
  const type = genre === "auteur" ? "personne" : "oeuvre";

  if (v.cb === undefined) {
    const notices = await chercherNotices(type, recherche ?? "");
    console.log(notices.length === 0 ? "Aucune notice." : notices.map(afficher).join("\n"));
    return 0;
  }

  const notice = await noticeDe(v.cb);
  if (notice?.type !== type) {
    console.error(`${v.cb} : pas une notice ${type === "personne" ? "de personne" : "d'œuvre"}.`);
    return 1;
  }
  if (!v.id || !v.description || !v.modele) {
    console.error("--id, --description et --modele sont requis pour écrire la fiche.");
    return 1;
  }
  const dossier = genre === "auteur" ? "auteurs" : "ouvrages";
  const chemin = join(DOSSIER_DATA, dossier, `${v.id}.yaml`);
  if (existsSync(chemin)) {
    console.error(`${dossier}/${v.id}.yaml existe déjà.`);
    return 1;
  }
  const traditions = v.traditions?.split(",").map((t) => t.trim());
  const nomUsuel = v.nom ?? [notice.rejet, notice.entree].filter(Boolean).join(" ");
  const contenu =
    genre === "auteur"
      ? {
          nom: nomUsuel,
          nomComplet: v["nom-complet"],
          naissance: notice.naissance,
          mort: notice.mort,
          description: v.description,
          traditions,
          // L'élément d'entrée de la notice, s'il diffère du nom usuel : l'app le reconnaît dans les textes.
          cite: notice.entree !== nomUsuel ? [notice.entree] : undefined,
        }
      : {
          titre: v.titre,
          abrege: v.abrege,
          titreOriginal: v["titre-original"],
          auteur: v.auteur,
          traditions,
          date: notice.date,
          licence: v.licence,
          texte: v.texte,
          description: v.description,
        };
  const brute = Object.fromEntries(Object.entries(contenu).filter(([, valeur]) => valeur !== undefined));
  const reflexion = lireReflexion(v.reflexion);
  if ("erreur" in reflexion) {
    console.error(reflexion.erreur);
    return 1;
  }
  const moteur = { modele: v.modele, ...reflexion };
  const resultat = genre === "auteur" ? preparerAuteur(brute, moteur) : preparerOuvrage(brute, moteur);
  if ("erreurs" in resultat) {
    console.error(resultat.erreurs.join("\n"));
    return 1;
  }
  // La notice a été consultée par ce script : elle est la source, et la fiche passe en brouillon.
  const { redaction, statut: _statut, ...reste } = resultat.fiche;
  await writeFile(chemin, versYaml({ ...reste, sources: [{ ouvrage: "bnf", entree: v.cb }], redaction, statut: "brouillon" }));
  const { erreurs } = await validerDepot();
  const siennes = erreurs.filter((e) => e.fichier.endsWith(`${dossier}/${v.id}.yaml`));
  console.log(`✓ data/${dossier}/${v.id}.yaml écrit (brouillon, source BnF ${v.cb}).`);
  if (siennes.length > 0) console.log(`À corriger :\n${siennes.map(formaterErreur).join("\n")}`);
  return siennes.length > 0 ? 1 : 0;
}

if (import.meta.main) process.exitCode = await principal();
