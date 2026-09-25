import type { Grammaire, Libelles } from "../i18n/index.ts";
import type { LectureTraditionnelle } from "./types.ts";

type AuteurTraditions = { traditions?: string[] };
type OuvrageVoix = { auteur?: string; traditions?: string[] };

/**
 * Voix d'une lecture : celui dont la parole est rapportée (`auteur`, s'il n'est pas l'auteur de
 * l'œuvre), sinon l'auteur de l'œuvre citée ; sans auteur, c'est l'œuvre elle-même qui parle
 * (l'Écriture). Rien de ce qui se déduit n'est écrit.
 */
export function voixDe(lecture: LectureTraditionnelle, ouvrages: Map<string, OuvrageVoix>): { auteur?: string; ouvrage: string } {
  const ouvrage = lecture.sources[0].ouvrage;
  return { auteur: lecture.auteur ?? ouvrages.get(ouvrage)?.auteur, ouvrage };
}

/** Traditions de la voix d'une lecture : celles de son auteur, ou, sans auteur, celles de l'œuvre. */
export function traditionsDeLaVoix(
  lecture: LectureTraditionnelle,
  auteurs: Map<string, AuteurTraditions>,
  ouvrages: Map<string, OuvrageVoix>,
): string[] {
  const voix = voixDe(lecture, ouvrages);
  return (voix.auteur !== undefined ? auteurs.get(voix.auteur)?.traditions : ouvrages.get(voix.ouvrage)?.traditions) ?? [];
}

/**
 * Traditions dans lesquelles parle une lecture : celle qu'elle précise, sinon toutes celles de sa
 * voix (une seule pour un auteur, qui doit préciser s'il en a plusieurs ; plusieurs pour l'Écriture
 * reçue en commun).
 */
export function traditionsDe(
  lecture: LectureTraditionnelle,
  auteurs: Map<string, AuteurTraditions>,
  ouvrages: Map<string, OuvrageVoix>,
): string[] {
  return lecture.tradition !== undefined ? [lecture.tradition] : traditionsDeLaVoix(lecture, auteurs, ouvrages);
}

/**
 * Lectures regroupées par tradition, dans l'ordre où chaque groupe apparaît : on ne les mêle
 * jamais. Une Écriture reçue en commun forme son propre groupe (« juive et chrétienne »).
 */
export function parTradition(
  lectures: LectureTraditionnelle[],
  auteurs: Map<string, AuteurTraditions>,
  ouvrages: Map<string, OuvrageVoix>,
): { traditions: string[]; lectures: LectureTraditionnelle[] }[] {
  const groupes = new Map<string, { traditions: string[]; lectures: LectureTraditionnelle[] }>();
  for (const lecture of lectures) {
    const traditions = traditionsDe(lecture, auteurs, ouvrages);
    const cle = traditions.join("|");
    const groupe = groupes.get(cle) ?? { traditions, lectures: [] };
    groupe.lectures.push(lecture);
    groupes.set(cle, groupe);
  }
  return [...groupes.values()];
}

/** « juive », « juive et chrétienne », dans la langue de l'application. */
export function nommerTraditions(traditions: string[], { grammaire, libelles }: { grammaire: Grammaire; libelles: Libelles }): string {
  return grammaire.enumerer(traditions.map(libelles.tradition), "et");
}
