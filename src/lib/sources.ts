/** Moteur d'IA qui a rédigé : `entree` en donne le modèle. */
export const IA = "IA";

/** Contribution humaine (Thibault, ou un lecteur via Critique) : `entree` la décrit. */
export const REDACTION = "Étymon, rédaction";

/** Sources sans page ni adresse : elles disent qui a rédigé, pas quel ouvrage a été consulté. */
export const SOURCES_DE_REDACTION: string[] = [IA, REDACTION];

type SourceMinimale = { ouvrage: string; entree: string };

export function estRedaction(source: SourceMinimale): boolean {
  return SOURCES_DE_REDACTION.includes(source.ouvrage);
}

/**
 * Signature de la rédaction d'une liste de sources, indépendante de l'ordre :
 * deux parties rédigées de la même façon ont la même signature.
 */
export function signatureRedaction(sources: SourceMinimale[]): string {
  return sources
    .filter(estRedaction)
    .map((s) => `${s.ouvrage} : ${s.entree}`)
    .sort()
    .join(" | ");
}
