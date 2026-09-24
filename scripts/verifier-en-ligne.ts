import { urlDe } from "../src/lib/ouvrages.ts";
import { slug } from "./lib/validation.ts";
import { morceauxAbsents, pageIntrouvable, texteDePage } from "./lib/en-ligne.ts";
import { arreterSiErreurs, validerDepot } from "./valider-fiches.ts";

/**
 * Vérifications qui demandent le réseau, pour les fiches demandées (toutes par défaut) :
 * - chaque entrée d'un ouvrage dont l'adresse se déduit d'une translittération (Bailly) existe,
 *   et toute adresse donnée explicitement répond, comme le texte en ligne de chaque ouvrage ;
 * - chaque citation d'une lecture traditionnelle figure mot pour mot dans le texte à l'adresse
 *   de sa source (u/v, i/j, accents et ponctuation confondus).
 * Usage : npm run verifier:en-ligne [-- <mot>…]
 */
const pages = new Map<string, Promise<{ ok: boolean; html: string }>>();
function charger(url: string) {
  if (!pages.has(url)) {
    pages.set(
      url,
      fetch(url)
        .then(async (r) => ({ ok: r.ok, html: await r.text() }))
        .catch(() => ({ ok: false, html: "" })),
    );
  }
  return pages.get(url)!;
}

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
      if (!(await charger(ouvrage.texte)).ok) problemes.push(`ouvrage ${ouvrage.id} › texte : adresse introuvable (${ouvrage.texte})`);
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
      if (!page.ok || pageIntrouvable(page.html)) problemes.push(`${fiche.mot} › ${source.ouvrage} « ${source.entree} » : adresse introuvable (${url})`);
    }
    for (const lecture of fiche.tradition.lectures) {
      const textes = await Promise.all(lecture.sources.map((s) => charger(s.url)));
      verifiees++;
      const absents = morceauxAbsents(lecture.citation, textes.map((t) => texteDePage(t.html)).join(" "));
      if (absents.length > 0) {
        problemes.push(`${fiche.mot} › citation de ${lecture.auteur} introuvable dans sa source : « ${absents.join(" […] ")} »`);
      }
    }
  }

  console.log(`✓ ${verifiees - problemes.length}/${verifiees} adresse(s) et citation(s) vérifiée(s) en ligne.`);
  if (problemes.length > 0) {
    console.log(`\nÀ corriger (${problemes.length}) :\n- ${problemes.join("\n- ")}`);
    process.exit(1);
  }
}
