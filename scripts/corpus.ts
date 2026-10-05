import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { chercherDans, chercherParagraphes, CORPUS, pageSuivante, pageWikisource, paragraphesThomas, repereDePage, type Oeuvre, type Page } from "./lib/corpus.ts";
import { texteDePage } from "./lib/en-ligne.ts";
import { lire as lirePage, type Lecture } from "./lib/reseau.ts";

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

async function lire(url: string, encodage?: string): Promise<Lecture> {
  let page = await lirePage(url, ENTETES, encodage);
  for (let essai = 1; essai < 4 && !page.lue && page.statut === 429; essai++) {
    await attendre(15_000 * essai);
    page = await lirePage(url, ENTETES, encodage);
  }
  return page;
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
    if (!reponse.lue) throw new Error(`${oeuvre.titre} : liste des pages inaccessible`);
    const donnees = JSON.parse(reponse.texte) as { query: { allpages: { title: string }[] }; continue?: { apcontinue: string } };
    titres.push(...donnees.query.allpages.map((p) => p.title));
    suite = donnees.continue?.apcontinue;
  } while (suite);
  return titres.map((titre) => ({ repere: titre.slice(prefixe.length), url: pageWikisource(langue, titre) }));
}

/**
 * Œuvre en chaîne de pages (Corpus Thomisticum, en latin-1) : on part de la première, chaque page
 * donne la suivante. Le sommaire s'écrit page après page, de quoi reprendre où l'on s'est arrêté.
 */
async function telechargerChaine(oeuvre: Oeuvre): Promise<{ pages: number; nouvelles: number; echecs: number }> {
  const pages: Page[] = existsSync(sommaire(oeuvre.id)) ? (JSON.parse(await readFile(sommaire(oeuvre.id), "utf8")) as Page[]) : [];
  let url: string | undefined = pages.length > 0 ? pages.at(-1)!.suivante : oeuvre.chaine;
  let nouvelles = 0;
  // Une page déjà lue ferme la chaîne (la dernière page renvoie à une page connue, ou à l'index).
  while (url && !pages.some((p) => p.url === url)) {
    await attendre(800);
    const reponse = await lire(url, "latin1");
    if (!reponse.lue) {
      console.log(`✗ ${oeuvre.titre} : ${reponse.raison} (${url}), à reprendre`);
      return { pages: pages.length, nouvelles, echecs: 1 };
    }
    const suivante = pageSuivante(reponse.texte);
    await writeFile(fichier(oeuvre.id, pages.length), paragraphesThomas(reponse.texte));
    pages.push({ repere: repereDePage(reponse.texte), url, ...(suivante ? { suivante } : {}) });
    await writeFile(sommaire(oeuvre.id), JSON.stringify(pages, null, 1));
    nouvelles++;
    url = suivante;
  }
  return { pages: pages.length, nouvelles, echecs: 0 };
}

async function telecharger(): Promise<number> {
  let echecs = 0;
  for (const oeuvre of CORPUS) {
    await mkdir(join(DOSSIER, oeuvre.id), { recursive: true });
    if (oeuvre.chaine) {
      const bilan = await telechargerChaine(oeuvre);
      echecs += bilan.echecs;
      if (bilan.echecs === 0) console.log(`✓ ${oeuvre.titre} : ${bilan.pages} page(s), dont ${bilan.nouvelles} téléchargée(s)`);
      continue;
    }
    const pages = existsSync(sommaire(oeuvre.id)) ? (JSON.parse(await readFile(sommaire(oeuvre.id), "utf8")) as Page[]) : await pagesDe(oeuvre);
    await writeFile(sommaire(oeuvre.id), JSON.stringify(pages, null, 1));
    let nouvelles = 0;
    for (const [rang, page] of pages.entries()) {
      if (existsSync(fichier(oeuvre.id, rang))) continue;
      await attendre(800);
      const reponse = await lire(page.url);
      if (!reponse.lue) {
        console.log(`✗ ${oeuvre.titre}, ${page.repere} : ${reponse.raison} (${page.url})`);
        echecs++;
        continue;
      }
      await writeFile(fichier(oeuvre.id, rang), texteDePage(reponse.texte));
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
        const texte = await readFile(fichier(oeuvre.id, rang), "utf8");
        // Œuvre aux paragraphes repérés : le repère du passage précise celui de la page.
        const passages = oeuvre.chaine ? chercherParagraphes(texte, forme) : chercherDans(texte, forme).map((t) => ({ repere: page.repere, ...t }));
        for (const { repere, passage, explique } of passages) {
          trouves.push({ ligne: `  ${explique ? "★ " : ""}${repere ? `${repere} · ` : ""}${passage}\n    ${page.url}`, explique });
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
