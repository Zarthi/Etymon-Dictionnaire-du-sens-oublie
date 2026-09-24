import ouvrages from "../../data/sources.json" with { type: "json" };

/** Ouvrages consultables pour l'étymologie, et le modèle d'adresse de leurs entrées en ligne. */
const modeles = new Map<string, string | undefined>(ouvrages.map((o: { nom: string; url?: string }) => [o.nom, o.url]));

export const NOMS_OUVRAGES: string[] = ouvrages.map((o) => o.nom);

/** Adresse d'une entrée, déduite de l'ouvrage et de l'entrée (« Littré », « étonner »). */
export function urlDeduite(ouvrage: string, entree: string): string | undefined {
  return modeles.get(ouvrage)?.replace("{entree}", encodeURIComponent(entree));
}

/** Adresse d'une source : celle donnée explicitement, sinon celle déduite de l'entrée. */
export function urlDe(source: { ouvrage: string; entree: string; url?: string }): string | undefined {
  return source.url ?? urlDeduite(source.ouvrage, source.entree);
}
