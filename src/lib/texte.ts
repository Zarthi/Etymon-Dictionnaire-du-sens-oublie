import { normaliser } from "./recherche.ts";

/**
 * Textes de fiche (explication, légende, lectures traditionnelles) : `_relegere_` s'affiche
 * en italique ; les mots qui ont une fiche deviennent des liens, automatiquement.
 */
export type Segment =
  | { type: "texte"; texte: string }
  | { type: "italique"; texte: string }
  | { type: "lien"; texte: string; cible: string };

const ITALIQUE = /_([^_]+)_/g;
/** Un mot : lettres, éventuellement reliées par des traits d'union (l'apostrophe sépare : « l'âme »). */
const MOT = /\p{L}+(?:-\p{L}+)*/gu;

/** Identifiant de fiche d'un mot : même règle que les noms de fichiers. */
export function idDe(mot: string): string {
  return normaliser(mot)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Fiche visée par un mot du texte : le mot lui-même, ou son singulier (« anges » → « ange »). */
function ficheDe(mot: string, existe: (id: string) => boolean): string | undefined {
  const id = idDe(mot);
  const singulier = id.replace(/[sx]$/, "");
  if (existe(id)) return id;
  if (singulier !== id && existe(singulier)) return singulier;
  return undefined;
}

/**
 * Découpe un texte en segments. Liens automatiques, pour rester lisible :
 * première occurrence seulement, jamais vers la fiche en cours (`exclu`), jamais dans l'italique.
 */
export function analyser(texte: string, existe: (id: string) => boolean = () => false, exclu?: string): Segment[] {
  const segments: Segment[] = [];
  const lies = new Set<string>(exclu ? [exclu] : []);

  const ajouterTexte = (morceau: string) => {
    let position = 0;
    for (const m of morceau.matchAll(MOT)) {
      const cible = ficheDe(m[0], existe);
      if (!cible || lies.has(cible)) continue;
      lies.add(cible);
      if (m.index > position) segments.push({ type: "texte", texte: morceau.slice(position, m.index) });
      segments.push({ type: "lien", texte: m[0], cible });
      position = m.index + m[0].length;
    }
    if (position < morceau.length) segments.push({ type: "texte", texte: morceau.slice(position) });
  };

  let position = 0;
  for (const m of texte.matchAll(ITALIQUE)) {
    if (m.index > position) ajouterTexte(texte.slice(position, m.index));
    segments.push({ type: "italique", texte: m[1] });
    position = m.index + m[0].length;
  }
  if (position < texte.length) ajouterTexte(texte.slice(position));
  return segments;
}

/** Texte tel que le lecteur le voit, sans balisage (pour compter les caractères). */
export function texteVisible(texte: string): string {
  return texte.replace(ITALIQUE, "$1");
}

/** Anomalies de balisage : italique resté ouvert. */
export function erreursBalisage(texte: string): string[] {
  return texte.replace(ITALIQUE, "").includes("_") ? ["italique mal fermé : « _ » isolé"] : [];
}
