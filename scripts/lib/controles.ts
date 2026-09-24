import { formesDuMaillon, sensPremier, translitterationDe } from "../../src/lib/etymologie.ts";
import { formesAuteur, nomme, referencesDe, textesDe } from "../../src/lib/mentions.ts";
import { normaliser } from "../../src/lib/recherche.ts";
import type { Auteur, Fiche } from "../../src/lib/types.ts";
import { chercher, concorde, natureDepuisLittre, type IndexLittre } from "./littre.ts";

/**
 * Contrôles automatiques d'une fiche contre le Littré local, sans coût ni jugement :
 * ils signalent ce qu'une rédaction de mémoire invente le plus souvent. Un signalement
 * n'est pas une erreur (le Littré ignore les mots d'après 1872) : il appelle une relecture.
 */
export function controler(fiche: Fiche, index: IndexLittre, auteurs: Auteur[] = []): string[] {
  const signalements: string[] = [];
  const entrees = chercher(index, fiche.mot) ?? [];

  // Nature grammaticale : celle du Littré doit figurer dans la fiche.
  const naturesLittre = new Set(entrees.map((e) => natureDepuisLittre(e.nature)).filter(Boolean));
  if (naturesLittre.size > 0 && !fiche.nature.some((n) => naturesLittre.has(n))) {
    signalements.push(`nature : le Littré donne ${[...naturesLittre].join(", ")}`);
  }

  // Famille : des mots français, donc présents dans le Littré (sauf mots récents).
  const absents = fiche.famille.filter((mot) => !chercher(index, mot)?.length);
  if (absents.length > 0) signalements.push(`famille absente du Littré : ${absents.join(", ")}`);

  // Formes plus lointaines que la langue source : citées par l'étymologie du Littré quand elle en parle.
  const etymologie = entrees.map((e) => e.etymologie).join(" ");
  if (etymologie !== "") {
    const inconnues = fiche.etymologie
      .slice(1)
      .flatMap(formesDuMaillon)
      .filter((f) => !concorde(f.forme, etymologie) && !concorde(translitterationDe(f) ?? "", etymologie));
    if (inconnues.length > 0) signalements.push(`formes d'origine non citées par le Littré : ${inconnues.map((f) => f.forme).join(", ")}`);
  }

  // Un auteur nommé dans un texte sans que la fiche le cite : référence oubliée, ou mention fortuite.
  const cites = new Set(referencesDe(fiche).auteurs);
  const textes = textesDe(fiche);
  const nommes = auteurs.filter((a) => !cites.has(a.id) && formesAuteur(a).some((f) => nomme(textes, f)));
  if (nommes.length > 0) signalements.push(`auteur nommé sans référence : ${nommes.map((a) => a.nom).join(", ")}`);

  const reprises = repriseDuSens(sensPremier(fiche.etymologie), fiche.explication, fiche.mot);
  if (reprises.length > 0) signalements.push(`explication qui reprend le sens : ${reprises.join(", ")}`);

  return signalements;
}

/** Mots trop courants pour signaler une redite. */
const MOTS_VIDES = new Set(["celui", "celle", "ceux", "comme", "cette", "chose", "choses", "faire", "rendre", "mettre", "tenir", "prendre", "aller", "autre", "autres", "avant", "apres", "devant", "entre", "etre", "avoir", "quelque", "quelqu"]);

/** Mots pleins (5 lettres et plus) du sens que l'explication reprend, hors le mot lui-même : elle ne doit pas le répéter. */
export function repriseDuSens(sens: string, explication: string, mot = ""): string[] {
  const exclus = new Set([...MOTS_VIDES, normaliser(mot)]);
  const mots = (texte: string) => normaliser(texte).split(/[^a-z]+/).filter((m) => m.length >= 5 && !exclus.has(m));
  const dansExplication = new Set(mots(explication));
  return [...new Set(mots(sens))].filter((m) => dansExplication.has(m));
}
