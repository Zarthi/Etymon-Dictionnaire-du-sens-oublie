import { lienAuteur, lienOuvrage } from "./liens.ts";
import { voixDe } from "./traditions.ts";
import type { Fiche } from "./types.ts";

/**
 * Noms d'auteurs et titres d'ouvrages reconnus dans les textes d'une fiche, pour en faire des
 * liens. On ne cherche que ce que la fiche cite déjà (tenants, créateurs, noms et titres de la
 * chaîne, étymologies écartées, lectures) : jamais les dictionnaires des sources, simples
 * outils, ni un nom qui n'a rien à voir avec la fiche.
 */
export interface Mention {
  /** Forme telle qu'elle apparaît dans le texte : « Bleuler », « Eugen Bleuler », « L'Utopie ». */
  forme: string;
  /** Page visée : `#/auteur/<id>` ou `#/ouvrage/<id>`. */
  lien: string;
}

type AuteurCite = { nom: string; cite?: string[] };
type OuvrageCite = { titre: string; abrege?: string; titreOriginal?: string; auteur?: string };

/**
 * Auteurs et ouvrages que la fiche cite, par identifiant. La voix d'une lecture se déduit de son
 * œuvre (voixDe) : il faut donc les fiches des ouvrages.
 */
export function referencesDe(
  fiche: Pick<Fiche, "etymologie" | "ecartees" | "tradition">,
  ouvragesCites: Map<string, { auteur?: string }>,
): { auteurs: string[]; ouvrages: string[] } {
  const auteurs = new Set<string>();
  const ouvrages = new Set<string>();
  for (const m of fiche.etymologie) {
    for (const a of m.alternatives?.formes ?? []) a.selon?.forEach((id) => auteurs.add(id));
    m.forge?.par.forEach((id) => auteurs.add(id));
    if (m.forge?.ouvrage) ouvrages.add(m.forge.ouvrage);
    if (m.personne) auteurs.add(m.personne);
    if (m.ouvrage) ouvrages.add(m.ouvrage);
  }
  for (const e of fiche.ecartees) e.selon?.forEach((id) => auteurs.add(id));
  for (const l of fiche.tradition.lectures) {
    const voix = voixDe(l, ouvragesCites);
    if (voix.auteur !== undefined) auteurs.add(voix.auteur);
    l.sources.forEach((s) => ouvrages.add(s.ouvrage));
  }
  return { auteurs: [...auteurs], ouvrages: [...ouvrages] };
}

/** Formes sous lesquelles un auteur ou un ouvrage peut être cité : nom usuel et formes courtes ; titre, abrégé, titre d'origine. */
export const formesAuteur = (a: AuteurCite) => [a.nom, ...(a.cite ?? [])];
export const formesOuvrage = (o: OuvrageCite) => [o.titre, o.abrege, o.titreOriginal].filter((f): f is string => Boolean(f));

/** Mentions reconnaissables dans les textes de la fiche. */
export function mentionsDe(
  fiche: Pick<Fiche, "etymologie" | "ecartees" | "tradition">,
  auteurs: Map<string, AuteurCite>,
  ouvrages: Map<string, OuvrageCite>,
): Mention[] {
  const refs = referencesDe(fiche, ouvrages);
  return [
    ...refs.auteurs.flatMap((id) => {
      const a = auteurs.get(id);
      return a ? formesAuteur(a).map((forme) => ({ forme, lien: lienAuteur(id) })) : [];
    }),
    ...refs.ouvrages.flatMap((id) => {
      const o = ouvrages.get(id);
      return o ? formesOuvrage(o).map((forme) => ({ forme, lien: lienOuvrage(id) })) : [];
    }),
  ];
}

/** Le texte contient-il la forme, écrite telle quelle (casse comprise), en mots entiers ? */
export function nomme(texte: string, forme: string): boolean {
  const echappee = forme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{M}])${echappee}(?![\\p{L}\\p{M}])`, "u").test(texte);
}

/** Textes d'une fiche où l'app reconnaît les mentions : explication, étymologies écartées, lectures. */
export function textesDe(fiche: Pick<Fiche, "explication" | "ecartees" | "tradition">): string {
  return [fiche.explication ?? "", ...fiche.ecartees.map((e) => e.raison ?? ""), ...fiche.tradition.lectures.map((l) => l.texte)].join("\n");
}

/** Formes qui, dans une même fiche, désignent deux pages différentes : il faut alors écrire le nom complet. */
export function formesAmbigues(mentions: Mention[]): string[] {
  const liens = new Map<string, Set<string>>();
  for (const m of mentions) liens.set(m.forme, (liens.get(m.forme) ?? new Set()).add(m.lien));
  return [...liens].filter(([, l]) => l.size > 1).map(([forme]) => forme);
}
