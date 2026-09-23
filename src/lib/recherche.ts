import type { EntreeIndex } from "./types.ts";

/** Forme de comparaison : minuscules, sans accents, ligatures dédoublées, espaces réduits. */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .replaceAll("œ", "oe")
    .replaceAll("æ", "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Entrée d'index accompagnée de sa forme normalisée, calculée une seule fois. */
export interface EntreeRecherche {
  entree: EntreeIndex;
  cle: string;
}

export function preparer(index: EntreeIndex[]): EntreeRecherche[] {
  return index.map((entree) => ({ entree, cle: normaliser(entree.mot) }));
}

/** Nombre de fautes tolérées selon la longueur de la saisie. */
function tolerance(longueur: number): number {
  return longueur < 4 ? 0 : longueur < 8 ? 1 : 2;
}

/** Distance d'édition de Levenshtein, abandonnée dès qu'elle dépasse `maximum`. */
export function distance(a: string, b: string, maximum: number): number {
  if (Math.abs(a.length - b.length) > maximum) return maximum + 1;
  let precedente = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const courante = [i];
    let minimumLigne = i;
    for (let j = 1; j <= b.length; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      courante[j] = Math.min(precedente[j] + 1, courante[j - 1] + 1, precedente[j - 1] + cout);
      minimumLigne = Math.min(minimumLigne, courante[j]);
    }
    if (minimumLigne > maximum) return maximum + 1;
    precedente = courante;
  }
  return precedente[b.length];
}

/**
 * Mots correspondant à la saisie, du plus pertinent au moins pertinent :
 * mot exact, début de mot, mot contenant la saisie, puis mot à une ou deux fautes près.
 */
export function chercher(entrees: EntreeRecherche[], saisie: string, limite = 8): EntreeIndex[] {
  const requete = normaliser(saisie);
  if (requete === "") return [];
  const toleres = tolerance(requete.length);
  const trouves: { entree: EntreeIndex; rang: number; cle: string }[] = [];
  for (const { entree, cle } of entrees) {
    let rang: number;
    if (cle === requete) rang = 0;
    else if (cle.startsWith(requete)) rang = 1;
    else if (cle.includes(requete)) rang = 2;
    else if (toleres > 0 && distance(requete, cle, toleres) <= toleres) rang = 3;
    else continue;
    trouves.push({ entree, rang, cle });
  }
  return trouves
    .sort((a, b) => a.rang - b.rang || a.cle.length - b.cle.length || (a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0))
    .slice(0, limite)
    .map((t) => t.entree);
}
