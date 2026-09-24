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

/**
 * Formes étrangères qu'une fiche connaît, mises en italique par l'app dans ses textes :
 * l'étymon, les formes d'origine (et leurs écritures d'origine), la forme légendaire.
 */
export function formesItaliques(fiche: {
  etymon: string;
  graphie?: string;
  origine?: { formes: { forme: string; graphie?: string }[] };
  legende?: { forme: string };
}): string[] {
  return [
    fiche.etymon,
    fiche.graphie,
    ...(fiche.origine?.formes ?? []).flatMap((f) => [f.forme, f.graphie]),
    fiche.legende?.forme,
  ].filter((f): f is string => Boolean(f));
}
