/** Qui peut rédiger une fiche ou une lecture : le moteur d'IA, ou l'équipe d'Étymon (Thibault, un lecteur via Critique). */
export const REDACTEURS = ["IA", "Étymon"] as const;
export type Redacteur = (typeof REDACTEURS)[number];

/** Niveau de réflexion du modèle d'IA qui a rédigé (effort : low, medium, high, xhigh, max). */
export const REFLEXIONS = ["basse", "moyenne", "élevée", "très élevée", "maximale"] as const;
export type Reflexion = (typeof REFLEXIONS)[number];

export interface Redaction {
  par: Redacteur;
  /** Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution (« correction suite à une Critique »). */
  detail: string;
  /** Niveau de réflexion du modèle, pour une rédaction par IA. */
  reflexion?: Reflexion;
}

/**
 * Signature d'une rédaction, indépendante de l'ordre : deux parties rédigées de la même
 * façon ont la même signature. Une clé de comparaison, jamais affichée.
 */
export function signatureRedaction(redaction: Redaction[]): string {
  return redaction
    .map((r) => [r.par, r.detail, r.reflexion ?? ""].join("\u0000"))
    .sort()
    .join(" | ");
}
