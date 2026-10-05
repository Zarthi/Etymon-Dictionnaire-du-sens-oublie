import { urlDe } from "../src/lib/ouvrages.ts";
import { slug } from "./lib/validation.ts";
import { morceauxAbsents, nomDeLaVoix, pageIntrouvable, texteDePage } from "./lib/en-ligne.ts";
import { lire, type Lecture } from "./lib/reseau.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

/**
 * Vérifications qui demandent le réseau, pour les fiches demandées (toutes par défaut) :
 * - chaque entrée d'un ouvrage dont l'adresse se déduit d'une translittération (Bailly) existe,
 *   et toute adresse donnée explicitement répond, comme le texte en ligne de chaque ouvrage ;
 * - chaque citation d'une lecture traditionnelle figure mot pour mot dans le texte à l'adresse
 *   de sa source (u/v, i/j, accents et ponctuation confondus).
 * Usage : npm run verifier:en-ligne [-- <mot>…]
 */
const pages = new Map<string, Promise<Lecture>>();
function charger(url: string) {
  if (!pages.has(url)) pages.set(url, lire(url));
  return pages.get(url)!;
}

/** Ce qu'on dit d'une page qui n'a pas pu être lue : elle n'est pas fouillée, on ne conclut rien de son contenu. */
const injoignable = (page: Extract<Lecture, { lue: false }>) => `injoignable (${page.raison})`;

if (import.meta.main) {
  const { fiches, ref, erreurs } = await validerDepot();
  arreterSiErreurs(erreurs);
  const demandes = new Set(process.argv.slice(2).map(slug));
  const retenues = fiches.filter((f) => demandes.size === 0 || demandes.has(f.id));
  const problemes: string[] = [];
  let verifiees = 0;

  if (demandes.size === 0) {
    for (const ouvrage of ref.ouvrages.values()) {
      if (!ouvrage.texte) continue;
      verifiees++;
      const page = await charger(ouvrage.texte);
      if (!page.lue) problemes.push(`ouvrage ${ouvrage.id} › texte : ${injoignable(page)} (${ouvrage.texte})`);
    }
  }
  for (const fiche of retenues) {
    for (const source of fiche.sources) {
      const modele = ref.ouvrages.get(source.ouvrage)?.modeleEntree;
      if (!modele?.includes("{grec}") && source.url === undefined) continue;
      const url = urlDe(source, modele);
      if (url === undefined) continue;
      const page = await charger(url);
      verifiees++;
      if (!page.lue) problemes.push(`${fiche.mot} › ${source.ouvrage} « ${source.entree} » : ${injoignable(page)} (${url})`);
      else if (pageIntrouvable(page.texte)) problemes.push(`${fiche.mot} › ${source.ouvrage} « ${source.entree} » : adresse introuvable (${url})`);
    }
    for (const lecture of fiche.tradition.lectures) {
      const voix = nomDeLaVoix(lecture, ref.auteurs, ref.ouvrages);
      const textes = await Promise.all(lecture.sources.map((s) => charger(s.url)));
      verifiees++;
      const nonLue = textes.find((t) => !t.lue);
      if (nonLue && !nonLue.lue) {
        problemes.push(`${fiche.mot} › citation de ${voix} : source ${injoignable(nonLue)}`);
        continue;
      }
      const absents = morceauxAbsents(lecture.citation, textes.map((t) => (t.lue ? texteDePage(t.texte) : "")).join(" "));
      if (absents.length > 0) {
        problemes.push(`${fiche.mot} › citation de ${voix} introuvable dans sa source : « ${absents.join(" […] ")} »`);
      }
    }
  }

  console.log(`✓ ${verifiees - problemes.length}/${verifiees} adresse(s) et citation(s) vérifiée(s) en ligne.`);
  if (problemes.length > 0) {
    console.log(`\nÀ corriger (${problemes.length}) :\n- ${problemes.join("\n- ")}`);
    process.exit(1);
  }
}
