import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { chercherDans, CORPUS, pageWikisource, type Oeuvre, type Page } from "./lib/corpus.ts";
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
/** Pages d'une œuvre telles qu'elles ont été téléchargées : leur rang est celui de leur fichier. */
const sommaire = (oeuvre: string) => join(DOSSIER, oeuvre, "pages.json");

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

/** Pages d'une œuvre : sa liste, ou celles de son préfixe sur Wikisource, demandées à l'API. */
async function pagesDe(oeuvre: Oeuvre): Promise<Page[]> {
  if (oeuvre.pages) return oeuvre.pages;
  const { langue, prefixe } = oeuvre.wikisource!;
  const titres: string[] = [];
  let suite: string | undefined;
  do {
    await attendre(800);
    const url = `https://${langue}.wikisource.org/w/api.php?action=query&list=allpages&apnamespace=0&aplimit=500&format=json&apprefix=${encodeURIComponent(prefixe)}${suite ? `&apcontinue=${encodeURIComponent(suite)}` : ""}`;
    const reponse = await lire(url);
    if (!reponse?.ok) throw new Error(`${oeuvre.titre} : liste des pages inaccessible`);
    const donnees = (await reponse.json()) as { query: { allpages: { title: string }[] }; continue?: { apcontinue: string } };
    titres.push(...donnees.query.allpages.map((p) => p.title));
    suite = donnees.continue?.apcontinue;
  } while (suite);
  return titres.map((titre) => ({ repere: titre.slice(prefixe.length), url: pageWikisource(langue, titre) }));
}

async function telecharger(): Promise<number> {
  let echecs = 0;
  for (const oeuvre of CORPUS) {
    await mkdir(join(DOSSIER, oeuvre.id), { recursive: true });
    const pages = existsSync(sommaire(oeuvre.id)) ? (JSON.parse(await readFile(sommaire(oeuvre.id), "utf8")) as Page[]) : await pagesDe(oeuvre);
    await writeFile(sommaire(oeuvre.id), JSON.stringify(pages, null, 1));
    let nouvelles = 0;
    for (const [rang, page] of pages.entries()) {
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
    console.log(`✓ ${oeuvre.titre} : ${pages.length} page(s), dont ${nouvelles} téléchargée(s)`);
  }
  return echecs > 0 ? 1 : 0;
}

async function chercher(formes: string[], parOeuvre: number): Promise<number> {
  for (const forme of formes) {
    console.log(`■ ${forme}`);
    for (const oeuvre of CORPUS) {
      const trouves: { ligne: string; explique: boolean }[] = [];
      if (!existsSync(sommaire(oeuvre.id))) continue;
      const pages = JSON.parse(await readFile(sommaire(oeuvre.id), "utf8")) as Page[];
      for (const [rang, page] of pages.entries()) {
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
