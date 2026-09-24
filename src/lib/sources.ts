/** Moteur d'IA qui a rédigé : `entree` en donne le modèle. */
export const IA = "IA";

/** Contribution humaine (Thibault, ou un lecteur via Critique) : `entree` la décrit. */
export const REDACTION = "Étymon, rédaction";

/** Sources sans page ni adresse : elles disent qui a rédigé, pas quel ouvrage a été consulté. */
export const SOURCES_DE_REDACTION: string[] = [IA, REDACTION];
