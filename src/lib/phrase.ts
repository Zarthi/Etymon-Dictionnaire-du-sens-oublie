import type { Grammaire, Libelles, Messages } from "../i18n/index.ts";
import { indexPremier, translitterationDe } from "./etymologie.ts";
import type { Element, Maillon } from "./types.ts";

/**
 * La chaîne étymologique mise en phrase (pattern Builder) : une suite de segments, que le composant
 * affiche sans rien composer lui-même. Les mots de liaison viennent de la langue de l'application
 * (grammaire, libellés, messages) : une autre langue change la phrase, pas ce code.
 *
 * « De l'allemand Schizophrenie, forgé par Eugen Bleuler (1911), dans Dementia praecox, sur le grec
 * σχίζω, « fendre », et φρήν, « diaphragme ». »
 */
export type Segment =
  | { type: "texte"; texte: string }
  | { type: "forme"; forme: string; translitteration?: string; personne?: string; ouvrage?: string }
  | { type: "auteur"; id: string }
  | { type: "ouvrage"; id: string };

export interface Langue {
  grammaire: Grammaire;
  libelles: Libelles;
  messages: Messages;
}

/** Une hypothèse d'une origine débattue, ou un sens voulu : son énoncé, et ses tenants à part. */
export interface Hypothese {
  segments: Segment[];
  selon: string[];
}

const texte = (t: string): Segment => ({ type: "texte", texte: t });
/** « de » ou « d' » devant une forme, selon sa lecture en alphabet latin (φρήν se lit phrēn). */
const prep = (g: Grammaire, f: { forme: string; translitteration?: string }) => g.de(translitterationDe(f) ?? f.forme);
const forme = (f: { forme: string; translitteration?: string }): Segment => ({
  type: "forme",
  forme: f.forme,
  ...(f.translitteration ? { translitteration: f.translitteration } : {}),
});

/** Des noms d'auteurs liés : « Comte ou Andrieux », « Cicéron, Varron ». */
function noms(ids: string[], liaison: string): Segment[] {
  return ids.flatMap((id, i) => [...(i > 0 ? [texte(i === ids.length - 1 ? liaison : ", ")] : []), { type: "auteur" as const, id }]);
}

/**
 * Éléments d'une composition. `apresLangue` : la langue vient d'être dite (« du grec σχίζω et φρήν »),
 * sinon « de » devant chacun.
 */
function elements(liste: Element[], langueMaillon: string, apresLangue: boolean, { grammaire: g, libelles: l }: Langue): Segment[] {
  return liste.flatMap((e, i) => [
    ...(i > 0 ? [texte(i === liste.length - 1 ? ", et " : ", ")] : []),
    ...(e.langue && e.langue !== langueMaillon ? [texte(`${g.origine(l.langue(e.langue))} `)] : !apresLangue ? [texte(prep(g, e))] : []),
    forme(e),
    texte(`, ${g.citer(e.sens)}`),
  ]);
}

/** La phrase de la chaîne, du plus proche au plus lointain, sans les alternatives ; vide s'il n'y a qu'elles. */
export function phraseChaine(etymologie: Maillon[], langue: Langue): Segment[] {
  const { grammaire: g, libelles: l, messages: m } = langue;
  const premier = etymologie[indexPremier(etymologie)];
  const chaine = etymologie.filter((x) => !x.alternatives);

  /** Ce qui introduit un maillon : sa langue, ou « de » dans la même langue ; « sur » la matière d'un mot forgé. */
  function introduction(i: number): Segment {
    const x = chaine[i];
    if (i === 0) return texte(x.langue === "français" && !x.forme ? m.chaine.compose : `${g.majuscule(g.origine(l.langue(x.langue)))} `);
    const avant = chaine[i - 1];
    if (avant.forge && !avant.elements) return texte(`, ${g.sur(l.langue(x.langue))} `);
    // Après une composition sans forme (altruisme), le maillon suivant remonte l'un des éléments, pas la phrase qui précède.
    if (avant.elements && !avant.forme) return texte(`${m.chaine.plusHaut}${g.origine(l.langue(x.langue))} `);
    if (x.langue === avant.langue && x.forme) return texte(`, ${prep(g, { forme: x.forme, translitteration: x.translitteration })}`);
    return texte(`, ${g.origine(l.langue(x.langue))} `);
  }

  function maillon(x: Maillon, francais: boolean): Segment[] {
    const segments: Segment[] = [];
    if (x.forme) {
      segments.push({ ...forme({ forme: x.forme, translitteration: x.translitteration }), ...(x.personne ? { personne: x.personne } : x.ouvrage ? { ouvrage: x.ouvrage } : {}) } as Segment);
      if (x.sens && x !== premier) segments.push(texte(`, ${g.citer(x.sens)}`));
      if (x.elements) segments.push(texte(m.chaine.composeDe), ...elements(x.elements, x.langue, false, langue));
    } else if (x.elements) segments.push(...elements(x.elements, x.langue, !francais, langue));
    if (x.forge) {
      segments.push(texte(m.chaine.forgePar), ...noms(x.forge.par, " ou "), texte(` (${x.forge.date})`));
      if (x.forge.ouvrage) segments.push(texte(m.chaine.dans), { type: "ouvrage", id: x.forge.ouvrage });
    }
    if (x.modele) {
      const calque = x.modele.relation === "calque";
      segments.push(texte(calque ? m.chaine.calque : m.chaine.surLeModele));
      segments.push(texte(calque || x.modele.langue !== x.langue ? `${g.origine(l.langue(x.modele.langue))} ` : prep(g, x.modele)));
      segments.push(forme(x.modele));
      if (x.modele.sens) segments.push(texte(`, ${g.citer(x.modele.sens)}`));
    }
    return segments;
  }

  if (chaine.length === 0) return [];
  return [...chaine.flatMap((x, i) => [introduction(i), ...maillon(x, i === 0 && x.langue === "français" && !x.forme)]), texte(".")];
}

/**
 * Les alternatives d'un maillon, une par ligne : une forme composée donne d'abord son sens, puis ses
 * parties après deux-points ; le tout d'abord, les parties ensuite.
 */
export function hypotheses(x: Maillon, langue: Langue): { titre: string; lignes: Hypothese[] } {
  const { grammaire: g, libelles: l, messages: m } = langue;
  const { mode, formes } = x.alternatives!;
  return {
    titre: mode === "debattue" ? m.chaine.debattue : m.chaine.jeu,
    lignes: formes.map((a) => {
      const langueA = a.langue ?? x.langue;
      const segments: Segment[] = a.forme
        ? [
            texte(a.langue && a.langue !== x.langue ? `${g.majuscule(g.origine(l.langue(a.langue)))} ` : g.majuscule(prep(g, { forme: a.forme, translitteration: a.translitteration }))),
            forme({ forme: a.forme, translitteration: a.translitteration }),
            texte(`, ${g.citer(a.sens)}`),
            ...(a.elements ? [texte(`${g.deuxPoints} `), ...elements(a.elements, langueA, true, langue)] : []),
          ]
        : [texte(`${g.citer(g.majuscule(a.sens))}, `), ...elements(a.elements ?? [], langueA, false, langue)];
      return { segments, selon: a.selon ?? [] };
    }),
  };
}

/** Le texte seul d'une suite de segments (tests, titres) : les noms et titres résolus par l'appelant. */
export function enTexte(segments: Segment[], nom: (s: Extract<Segment, { type: "auteur" | "ouvrage" }>) => string = (s) => s.id): string {
  return segments.map((s) => (s.type === "texte" ? s.texte : s.type === "forme" ? s.forme : nom(s))).join("");
}
