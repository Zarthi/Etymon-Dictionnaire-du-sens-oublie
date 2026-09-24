/** Qui peut rédiger une fiche ou une lecture : le moteur d'IA, ou l'équipe d'Étymon (Thibault, un lecteur via Critique). */
export const REDACTEURS = ["IA", "Étymon"] as const;
export type Redacteur = (typeof REDACTEURS)[number];

export interface Redaction {
  par: Redacteur;
  /** Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution (« correction suite à une Critique »). */
  detail: string;
}

/**
 * Signature d'une rédaction, indépendante de l'ordre : deux parties rédigées de la même
 * façon ont la même signature.
 */
export function signatureRedaction(redaction: Redaction[]): string {
  return redaction
    .map((r) => `${r.par} : ${r.detail}`)
    .sort()
    .join(" | ");
}
