import { translitterer } from "./grec.ts";

/**
 * Adresse d'une entrée, déduite du modèle d'adresse de l'ouvrage : `{entree}` est remplacé par
 * l'entrée, `{grec}` par sa translittération (Bailly : φρήν → bailly.app/phrēn).
 */
export function urlDeduite(modele: string | undefined, entree: string): string | undefined {
  return modele?.replace("{entree}", encodeURIComponent(entree)).replace("{grec}", encodeURIComponent(translitterer(entree)));
}

/** Adresse d'une source : celle donnée explicitement, sinon celle déduite de l'entrée. */
export function urlDe(source: { entree: string; url?: string }, modele: string | undefined): string | undefined {
  return source.url ?? urlDeduite(modele, source.entree);
}

/** Notice d'autorité d'un auteur sur data.bnf.fr, à partir de son identifiant (cb…). */
export function urlBnf(identifiant: string): string {
  return `https://data.bnf.fr/ark:/12148/${identifiant}`;
}
