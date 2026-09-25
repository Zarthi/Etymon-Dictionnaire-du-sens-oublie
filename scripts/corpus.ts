import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { chercherDans, CORPUS } from "./lib/corpus.ts";
import { texteDePage } from "./lib/en-ligne.ts";

/**
 * Corpus de réflexe des lectures traditionnelles (scripts/lib/corpus.ts), en local, hors du dépôt,
 * comme le Littré : des textes du domaine public, téléchargés une fois.
 *
 * Usage :
 *   npm run corpus -- telecharger
 *   npm run corpus -- chercher <forme>… [--par-oeuvre 6]   (un radical : misericord, religi, שטן)
 */
const DOSSIER = fileURLToPath(new URL("../sources/corpus", import.meta.url));
const fichier = (oeuvre: string, rang: number) => join(DOSSIER, oeuvre, `${rang}.txt`);

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Wikimedia demande qu'un script s'identifie, et limite le débit : une page à la fois, reprise après un refus. */
const ENTETES = { "User-Agent": "Etymon/0.1 (https://github.com/Zarthi/Etymon-Dictionnaire-du-sens-oublie)" };

async function lire(url: string): Promise<Response | undefined> {
  for (let essai = 0; essai < 4; essai++) {
    const reponse = await fetch(url, { headers: ENTETES }).catch(() => undefined);
    if (reponse?.status !== 429) return reponse;
    await attendre(15_000 * (essai + 1));
  }
  return undefined;
}

async function telecharger(): Promise<number> {
  let echecs = 0;
  for (const oeuvre of CORPUS) {
    await mkdir(join(DOSSIER, oeuvre.id), { recursive: true });
    let nouvelles = 0;
    for (const [rang, page] of oeuvre.pages.entries()) {
      if (existsSync(fichier(oeuvre.id, rang))) continue;
      await attendre(800);
      const reponse = await lire(page.url);
      if (!reponse?.ok) {
        console.log(`✗ ${oeuvre.titre}, ${page.repere} : ${reponse ? `HTTP ${reponse.status}` : "injoignable"} (${page.url})`);
        echecs++;
        continue;
      }
      await writeFile(fichier(oeuvre.id, rang), texteDePage(await reponse.text()));
      nouvelles++;
    }
    console.log(`✓ ${oeuvre.titre} : ${oeuvre.pages.length} page(s), dont ${nouvelles} téléchargée(s)`);
  }
  return echecs > 0 ? 1 : 0;
}

async function chercher(formes: string[], parOeuvre: number): Promise<number> {
  for (const forme of formes) {
    console.log(`■ ${forme}`);
    for (const oeuvre of CORPUS) {
      const trouves: { ligne: string; explique: boolean }[] = [];
      for (const [rang, page] of oeuvre.pages.entries()) {
        if (!existsSync(fichier(oeuvre.id, rang))) continue;
        for (const { passage, explique } of chercherDans(await readFile(fichier(oeuvre.id, rang), "utf8"), forme)) {
          trouves.push({ ligne: `  ${explique ? "★ " : ""}${page.repere ? `${page.repere} · ` : ""}${passage}\n    ${page.url}`, explique });
        }
      }
      if (trouves.length === 0) continue;
      // Les explications de mots d'abord, toutes pages confondues : ce sont elles qui peuvent faire une lecture.
      trouves.sort((a, b) => Number(b.explique) - Number(a.explique));
      console.log(`${oeuvre.titre} (${oeuvre.tradition}) : ${trouves.length} passage(s), dont ${trouves.filter((t) => t.explique).length} qui expliquent (★)`);
      console.log(trouves.slice(0, parOeuvre).map((t) => t.ligne).join("\n"));
      if (trouves.length > parOeuvre) console.log(`  … ${trouves.length - parOeuvre} autre(s) : préciser la forme`);
    }
  }
  return 0;
}

async function principal(): Promise<number> {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { "par-oeuvre": { type: "string", default: "6" } } });
  const [commande, ...formes] = positionals;
  if (commande === "telecharger") return telecharger();
  if (commande === "chercher" && formes.length > 0) {
    if (!existsSync(DOSSIER)) {
      console.log("Corpus absent : npm run corpus -- telecharger");
      return 1;
    }
    return chercher(formes, Number(values["par-oeuvre"]));
  }
  console.log("Usage : npm run corpus -- telecharger | chercher <forme>… [--par-oeuvre 6]");
  return 1;
}

if (import.meta.main) process.exitCode = await principal();
