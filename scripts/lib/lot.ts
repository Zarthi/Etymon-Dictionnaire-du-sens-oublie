import type { z } from "zod";
import type { schemaVerdict } from "./atelier.ts";
import { tronquer } from "./formes.ts";
import { urlLittre, type EntreeLittre } from "./littre.ts";
import { urlApiTlfi, type Tlfi } from "./tlfi.ts";

/**
 * Pièces d'un lot (npm run lot) : le dossier brut d'un mot (`sources.md`), les remplacements d'un
 * verdict appliqués à une fiche, le rapport de ce qui reste à reprendre, et le report des décisions
 * dans le journal. Des fonctions pures : les lectures de fichiers et de pages sont dans scripts/lot.ts.
 */

/** Longueur au-delà de laquelle une étymologie qui nomme le mot n'est plus celle d'un dérivé (« Re… et lire »), mais un rapprochement. */
const ETYMOLOGIE_COURTE = 100;

/** Dérivés ou proches d'un mot dans l'index du Littré : les entrées qui partagent son début, ou dont l'étymologie, courte, le nomme. */
export function famille(index: Record<string, EntreeLittre[]>, mot: string, limite = 25): string[] {
  const m = mot.toLowerCase();
  // Début commun : le mot sans sa terminaison verbale ou nominale, quatre lettres au moins (« lire » n'en a pas assez).
  const debut = m.replace(/(?:er|ir|re|e|s|x)$/, "");
  const nomme = new RegExp(`(?<!\\p{L})${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\p{L})`, "iu");
  const trouves = new Set<string>();
  for (const entrees of Object.values(index)) {
    for (const e of entrees) {
      const terme = e.terme.toLowerCase();
      if (terme === m) continue;
      if ((debut.length >= 4 && terme.startsWith(debut)) || (e.etymologie.length <= ETYMOLOGIE_COURTE && nomme.test(e.etymologie))) trouves.add(e.nature ? `${terme} (${e.nature})` : terme);
    }
  }
  const liste = [...trouves].sort();
  return liste.length > limite ? [...liste.slice(0, limite), `… ${liste.length - limite} autre(s)`] : liste;
}

/** Page d'un dictionnaire des étymons : son texte réduit, ou la raison pour laquelle on ne l'a pas. */
export interface EntreeEtymon {
  cle: string;
  url: string;
  texte: string;
}
export interface EtymonConsulte {
  forme: string;
  entrees: EntreeEtymon[];
  /** Les clés essayées, si aucune entrée n'a été trouvée. */
  essayees?: string[];
  /** Une page n'a pas pu être lue : ce n'est pas une absence d'entrée. */
  injoignable?: string;
}

export interface PassageCorpus {
  oeuvre: string;
  tradition: string;
  total: number;
  expliquent: number;
  lignes: string[];
}

export interface DonneesSources {
  mot: string;
  littre: EntreeLittre[];
  famille: string[];
  tlfi: { graphie: string; tlfi?: Tlfi; injoignable?: string; autres?: string[] };
  latins: EtymonConsulte[];
  grecs: EtymonConsulte[];
  /** Recherche dans le corpus de réflexe ; `absent` : il n'a pas été téléchargé. */
  corpus: { forme: string; radical: string; resultats: PassageCorpus[] }[] | "absent";
}

const AVERTISSEMENT = "⚠";

const sectionEtymons = (titre: string, etymons: EtymonConsulte[]): string[] => {
  if (etymons.length === 0) return [];
  const lignes = [`## ${titre}`, ""];
  for (const e of etymons) {
    if (e.injoignable) lignes.push(`### ${e.forme}`, `${AVERTISSEMENT} injoignable (${e.injoignable}) : relancer, ne pas conclure à l'absence de l'entrée.`, "");
    else if (e.entrees.length === 0) lignes.push(`### ${e.forme}`, `Aucune entrée (clés essayées : ${e.essayees?.join(", ")}).`, "");
    else for (const entree of e.entrees) lignes.push(`### ${e.forme} → ${entree.cle}`, entree.url, entree.texte, "");
  }
  return lignes;
};

/** `sources.md` d'un mot : ce que disent le Littré, le TLFi, les dictionnaires des étymons et le corpus de réflexe, sans rien interpréter. */
export function composerSources(d: DonneesSources): string {
  const lignes = [`# ${d.mot} : sources consultées par script`, "", "## Littré (local, domaine public)", ""];
  if (d.littre.length === 0) lignes.push("Absent (mot postérieur à 1872, ou autre graphie).");
  for (const e of d.littre) lignes.push(`« ${e.terme} »${e.nature ? ` (${e.nature})` : ""} ${urlLittre(e.terme)}`, `  ${e.etymologie || "(sans étymologie)"}`);
  if (d.famille.length > 0) lignes.push("", `Famille (index du Littré, à trier) : ${d.famille.join(", ")}`);

  lignes.push("", "## TLFi (non libre : n'en garder que les faits)", "");
  const { graphie, tlfi, injoignable, autres } = d.tlfi;
  if (tlfi) {
    lignes.push(`« ${graphie} »${tlfi.nature ? ` (${tlfi.nature})` : ""} https://www.cnrtl.fr/etymologie/${encodeURIComponent(graphie)}`, "Sens :");
    lignes.push(...(tlfi.sens.length > 0 ? tlfi.sens.map((s) => `  - ${s}`) : ["  (pas de plan des sens par l'API)"]));
    lignes.push("", `Étymologie et historique : ${tlfi.etymologie}`);
  } else if (injoignable) lignes.push(`${AVERTISSEMENT} injoignable (${injoignable}) : relancer, ne pas conclure à l'absence de l'article.`);
  else lignes.push("Rien par l'API pour cette graphie (voir cnrtl.fr/etymologie/<mot> dans le navigateur intégré).");
  if (autres?.length) lignes.push("", `Autres articles pour « ${graphie} » (à lire si ce n'est pas le bon) : ${autres.map((n) => `${n} ${urlApiTlfi(graphie, n)}`).join(" ; ")}`);

  lignes.push("");
  if (d.latins.length + d.grecs.length === 0) lignes.push("## Étymons", "", "Aucune forme latine ni grecque relevée dans le Littré ni le TLFi.", "");
  lignes.push(...sectionEtymons("Étymons latins (Lewis & Short, Perseus : début de l'entrée)", d.latins));
  lignes.push(...sectionEtymons("Étymons grecs (Bailly : début de l'entrée)", d.grecs));

  lignes.push("## Corpus de réflexe (passages ★ d'abord, extraits)", "");
  if (d.corpus === "absent") lignes.push(`${AVERTISSEMENT} corpus non téléchargé (npm run corpus -- telecharger) : lectures à chercher à la main.`);
  else if (d.corpus.length === 0) lignes.push("Aucune forme latine à chercher.");
  else
    for (const { forme, radical, resultats } of d.corpus) {
      lignes.push(`### ${forme} (radical « ${radical} »)`);
      if (resultats.length === 0) lignes.push("Rien dans aucune œuvre.");
      for (const r of resultats) lignes.push(`${r.oeuvre} (${r.tradition}) : ${r.total} passage(s), dont ${r.expliquent} qui expliquent (★)`, ...r.lignes);
      lignes.push("");
    }
  return lignes.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/** Extrait d'un passage du corpus pour `sources.md` : l'extrait du script, plus court. */
export const extraitCorpus = (passage: string) => tronquer(passage, 240);

type Verdict = z.infer<typeof schemaVerdict>;
type Remarque = Verdict["remarques"][number];

/** Chemin d'un champ de la fiche, séparé par des points : un nom de champ, ou le rang d'un élément de liste. */
function segments(champ: string): string[] {
  const parties = champ.split(".");
  if (parties.some((p) => p === "" || p === "__proto__" || p === "constructor" || p === "prototype")) throw new Error(`chemin invalide : « ${champ} »`);
  return parties;
}

const rang = (segment: string, longueur: number, borne: number): number => {
  const n = Number(segment);
  if (!Number.isInteger(n) || n < 0 || n >= longueur + borne) throw new Error(`rang inexistant : « ${segment} »`);
  return n;
};

/**
 * Fiche dont le champ `champ` vaut `valeur` (null le retire : champ d'un objet, élément d'une liste) ;
 * la fiche donnée n'est pas modifiée. Un chemin qui ne mène nulle part est une erreur.
 */
export function appliquerRemplacement(fiche: unknown, champ: string, valeur: unknown): unknown {
  const copie = structuredClone(fiche) as Record<string, unknown>;
  const chemin = segments(champ);
  let courant: unknown = copie;
  for (const s of chemin.slice(0, -1)) {
    if (Array.isArray(courant)) courant = courant[rang(s, courant.length, 0)];
    else if (courant && typeof courant === "object" && s in courant) courant = (courant as Record<string, unknown>)[s];
    else throw new Error(`champ inexistant : « ${s} » (dans ${champ})`);
  }
  const dernier = chemin.at(-1)!;
  if (Array.isArray(courant)) {
    // Un rang égal à la longueur ajoute à la fin.
    const i = rang(dernier, courant.length, 1);
    if (valeur === null) {
      if (i === courant.length) throw new Error(`rang inexistant : « ${dernier} »`);
      courant.splice(i, 1);
    } else courant[i] = valeur;
  } else if (courant && typeof courant === "object") {
    if (valeur === null) delete (courant as Record<string, unknown>)[dernier];
    else (courant as Record<string, unknown>)[dernier] = valeur;
  } else throw new Error(`champ inexistant : « ${champ} »`);
  return copie;
}

/** Remarques d'un verdict qui ne sont pas encore réglées par un remplacement. */
export const remarquesOuvertes = (verdict: Verdict): Remarque[] => verdict.remarques.filter((r) => r.statut !== "appliquee");

/** Une remarque restée à l'agent, avec la raison pour laquelle le script ne l'a pas réglée. */
export type Restante = Remarque & { raison: string };

/**
 * Applique à la fiche les remplacements du verdict qui ne le sont pas encore, dans l'ordre (les rangs
 * sont ceux de la fiche telle qu'elle est après les précédents). Une remarque réglée devient
 * `appliquee` ; une remarque sans remplacement, ou dont le chemin ne mène nulle part, reste.
 */
export function appliquerVerdict(fiche: unknown, verdict: Verdict): { fiche: unknown; verdict: Verdict; restantes: Restante[] } {
  let courante = fiche;
  const restantes: Restante[] = [];
  const remarques = verdict.remarques.map((r): Remarque => {
    if (r.statut === "appliquee") return r;
    if (!r.remplacement) {
      restantes.push({ ...r, raison: "sans remplacement" });
      return r;
    }
    try {
      courante = appliquerRemplacement(courante, r.remplacement.champ, r.remplacement.valeur);
      return { ...r, statut: "appliquee" };
    } catch (erreur) {
      restantes.push({ ...r, raison: (erreur as Error).message });
      return r;
    }
  });
  return { fiche: courante, verdict: { ...verdict, remarques }, restantes };
}

/** `atelier/a-reprendre.md` : pour chaque mot, ce que le script n'a pas pu régler seul. */
export function rapportAReprendre(mots: { mot: string; restantes: Restante[]; essai: string[] }[]): string {
  const lignes = ["# À reprendre", "", "Remarques que `npm run lot -- reprendre` n'a pas réglées seul : seules elles demandent le rédacteur.", ""];
  for (const { mot, restantes, essai } of mots) {
    lignes.push(`## ${mot}`, "");
    for (const r of restantes) {
      lignes.push(`- [${r.critere}] \`${r.champ}\` : ${r.probleme}${r.proposition ? ` Proposition : ${r.proposition}` : ""} (${r.raison})`);
    }
    if (essai.length > 0) lignes.push(`- Essai de la fiche (\`npm run rediger -- atelier/<id>/fiche.json --essai\`), fiche.json telle qu'elle est après les remplacements qui ont réussi, ou telle qu'avant si c'est eux qui l'ont rendue invalide :`, ...essai.map((e) => `  - ${e}`));
    lignes.push("");
  }
  return lignes.join("\n");
}

/**
 * Journal des décisions avec, en tête, la section datée des décisions du lot (`atelier/decisions.md`) :
 * des lignes de tableau (sujet, décision, raison, relecture) reçoivent leur en-tête de tableau ; un texte libre est reporté tel quel.
 */
export function reporterDecisions(journal: string, decisions: string, date: string, mots: string[]): string {
  const texte = decisions.trim();
  const lignes = texte.split("\n").filter((l) => l.trim() !== "");
  const tableau = lignes.every((l) => l.trim().startsWith("|"));
  const section = [
    `## ${date} — Lot : ${mots.join(", ")}`,
    "",
    ...(tableau ? ["| Sujet | Décision | Raison | Relecture |", "|---|---|---|---|", ...lignes.map((l) => l.trim())] : [texte]),
    "",
    "",
  ].join("\n");
  const premiere = journal.search(/^## /m);
  return premiere === -1 ? `${journal.trimEnd()}\n\n${section}`.trimEnd() + "\n" : journal.slice(0, premiere) + section + journal.slice(premiere);
}
