import { normaliser } from "./recherche.ts";

/**
 * Textes de fiche (explication, légende, lectures traditionnelles) : du texte brut, sans aucune
 * mise en forme. L'app y met en italique les formes étrangères que la fiche connaît (étymon,
 * formes d'origine, forme légendaire) et fait des liens vers les mots qui ont une fiche.
 */
export type Segment =
  | { type: "texte"; texte: string }
  | { type: "italique"; texte: string }
  | { type: "lien"; texte: string; cible: string };

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

const echapper = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Motif des formes à mettre en italique, mots entiers, sans tenir compte de la casse ;
 * les plus longues d'abord, pour que « in odio » passe avant « odio ».
 */
function motifFormes(formes: string[]): RegExp | undefined {
  const propres = [...new Set(formes.map((f) => f.replace(/^\*/, "").trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  if (propres.length === 0) return undefined;
  return new RegExp(`(?<![\\p{L}\\p{M}])(?:${propres.map(echapper).join("|")})(?![\\p{L}\\p{M}])`, "giu");
}

/**
 * Découpe un texte en segments.
 * - Italique : chaque occurrence d'une des `formes` de la fiche.
 * - Liens, pour rester lisible : première occurrence seulement, jamais vers la fiche en cours
 *   (`exclu`), jamais dans l'italique.
 */
export function analyser(
  texte: string,
  existe: (id: string) => boolean = () => false,
  exclu?: string,
  formes: string[] = [],
): Segment[] {
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

  const motif = motifFormes(formes);
  let position = 0;
  for (const m of motif ? texte.matchAll(motif) : []) {
    if (m.index > position) ajouterTexte(texte.slice(position, m.index));
    segments.push({ type: "italique", texte: m[0] });
    position = m.index + m[0].length;
  }
  if (position < texte.length) ajouterTexte(texte.slice(position));
  return segments;
}
