/** « du latin », « de l'italien » : complément d'origine, avec élision devant voyelle ou h muet. */
export function origine(langue: string): string {
  return /^[aeiouyàâéèêh]/i.test(langue) ? `de l'${langue}` : `du ${langue}`;
}

/** Date ISO en toutes lettres : « 23 septembre 2026 ». */
export function dateLongue(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Préposition devant une forme : « de relegere », « d'adolescere » (élision devant voyelle ou h). */
export function de(forme: string): string {
  return /^[aeiouyàâéèêh]/i.test(forme.replace(/^\*/, "")) ? "d'" : "de ";
}

/** « sur le grec », « sur l'arabe » : la matière dont un mot a été forgé. */
export function sur(langue: string): string {
  return /^[aeiouyàâéèêh]/i.test(langue) ? `sur l'${langue}` : `sur le ${langue}`;
}
