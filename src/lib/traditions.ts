import type { LectureTraditionnelle } from "./types.ts";

type AuteurTraditions = { traditions?: string[] };

/**
 * Tradition dans laquelle parle une lecture : celle qu'elle précise, sinon l'unique tradition de
 * son auteur (elle ne s'écrit que si l'auteur en a plusieurs, comme Guénon).
 */
export function traditionDe(lecture: LectureTraditionnelle, auteurs: Map<string, AuteurTraditions>): string | undefined {
  const siennes = auteurs.get(lecture.auteur)?.traditions ?? [];
  return lecture.tradition ?? (siennes.length === 1 ? siennes[0] : undefined);
}

/** Lectures regroupées par tradition, dans l'ordre où chaque tradition apparaît : on ne les mêle jamais. */
export function parTradition(
  lectures: LectureTraditionnelle[],
  auteurs: Map<string, AuteurTraditions>,
): { tradition: string; lectures: LectureTraditionnelle[] }[] {
  const groupes = new Map<string, LectureTraditionnelle[]>();
  for (const lecture of lectures) {
    const tradition = traditionDe(lecture, auteurs) ?? "";
    groupes.set(tradition, [...(groupes.get(tradition) ?? []), lecture]);
  }
  return [...groupes].map(([tradition, lectures]) => ({ tradition, lectures }));
}
