import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { urlDe } from "../src/lib/ouvrages.ts";
import { texteDePage } from "./lib/en-ligne.ts";
import { DOSSIER_DATA } from "./valider-fiches.ts";

/**
 * Texte brut d'une page en ligne, tel quel (un outil de lecture qui résume ne convient pas à une
 * citation mot pour mot) : une adresse, ou `<ouvrage>:<entrée>` pour un dictionnaire dont l'adresse
 * se déduit de l'entrée (bailly:φρήν). Avec --autour, seulement les passages qui contiennent le
 * texte cherché (sans égard à la casse), pour ne pas lire un livre entier.
 *
 * Usage : npm run texte -- <adresse | ouvrage:entrée> [--autour "<texte>"] [--largeur 600]
 */
function adresse(cible: string): string | undefined {
  if (/^https?:\/\//.test(cible)) return cible;
  const [ouvrage, ...reste] = cible.split(":");
  const fichier = readdirSync(join(DOSSIER_DATA, "ouvrages")).find((f) => f === `${ouvrage}.yaml`);
  if (!fichier || reste.length === 0) return undefined;
  const { modeleEntree } = parse(readFileSync(join(DOSSIER_DATA, "ouvrages", fichier), "utf8"));
  return urlDe({ entree: reste.join(":") }, modeleEntree);
}

/** Passages de `largeur` caractères autour de chaque occurrence, fusionnés s'ils se chevauchent. */
export function passages(texte: string, cherche: string, largeur: number): string[] {
  const bas = texte.toLowerCase();
  const cible = cherche.toLowerCase();
  const fenetres: [number, number][] = [];
  for (let i = bas.indexOf(cible); i !== -1; i = bas.indexOf(cible, i + cible.length)) {
    const debut = Math.max(0, i - largeur / 2);
    const fin = Math.min(texte.length, i + cible.length + largeur / 2);
    const derniere = fenetres.at(-1);
    if (derniere && debut <= derniere[1]) derniere[1] = fin;
    else fenetres.push([debut, fin]);
  }
  return fenetres.map(([d, f]) => texte.slice(d, f));
}

async function principal(): Promise<number> {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { autour: { type: "string" }, largeur: { type: "string", default: "600" } } });
  const url = positionals[0] && adresse(positionals[0]);
  if (!url) {
    console.log('Usage : npm run texte -- <adresse | ouvrage:entrée> [--autour "<texte>"] [--largeur 600]');
    return 1;
  }
  const reponse = await fetch(url).catch(() => undefined);
  if (!reponse?.ok) {
    console.error(`${url} : ${reponse ? `HTTP ${reponse.status}` : "injoignable"}`);
    return 1;
  }
  // Certaines pages (bailly.app) portent des retours à la ligne échappés : « \n » écrit en deux signes.
  const texte = texteDePage(await reponse.text()).replace(/\\n/g, " ");
  console.log(url);
  if (values.autour === undefined) {
    console.log(texte || "(page vide : elle se construit dans le navigateur, la lire dans le navigateur intégré)");
    return 0;
  }
  const trouves = passages(texte, values.autour, Number(values.largeur));
  console.log(
    trouves.length === 0
      ? `« ${values.autour} » absent de la page.`
      : trouves
          .slice(0, 8)
          .map((p) => `… ${p} …`)
          .join("\n\n"),
  );
  if (trouves.length > 8) console.log(`\n(${trouves.length - 8} autre(s) passage(s) : préciser la recherche)`);
  return 0;
}

if (import.meta.main) process.exitCode = await principal();
