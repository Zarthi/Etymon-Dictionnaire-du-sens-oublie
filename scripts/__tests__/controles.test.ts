import { describe, expect, it } from "vitest";
import type { Auteur, Fiche } from "../../src/lib/types.ts";
import { controler } from "../lib/controles.ts";
import { indexer } from "../lib/littre.ts";

const index = indexer([
  { terme: "religion", nature: "s. f.", etymologie: "du lat. religionem, entre relegere, recueillir, et religare, relier." },
  { terme: "religieux", nature: "adj.", etymologie: "Lat. religiosus." },
  { terme: "irréligion", nature: "s. f.", etymologie: "" },
]);

const debattue = (formes: string[]) => ({
  langue: "latin" as const,
  alternatives: { mode: "debattue" as const, formes: formes.map((forme) => ({ forme, sens: "x" })) },
});

const fiche = (surcharges: Partial<Fiche> = {}) =>
  ({
    mot: "religion",
    nature: ["nom féminin"],
    etymologie: [{ forme: "religio", langue: "latin", sens: "attention scrupuleuse" }, debattue(["relegere", "religare"])],
    explication: "Le mot ne désignait pas ce que l'on croit.",
    famille: ["religieux", "irréligion"],
    ecartees: [],
    tradition: { lectures: [], renvois: [] },
    ...surcharges,
  }) as Fiche;

describe("controler", () => {
  it("ne signale rien d'une fiche d'accord avec le Littré", () => {
    expect(controler(fiche(), index)).toEqual([]);
  });
  it("signale une nature que le Littré ne donne pas", () => {
    expect(controler(fiche({ nature: ["nom masculin"] }), index)).toEqual(["nature : le Littré donne nom féminin"]);
  });
  it("signale un mot de la famille absent du Littré", () => {
    expect(controler(fiche({ famille: ["religieux", "religiosophie"] }), index)).toEqual(["famille absente du Littré : religiosophie"]);
  });
  it("signale une forme plus lointaine que l'étymologie du Littré ne cite pas", () => {
    const etymologie = [{ forme: "religio", langue: "latin" as const, sens: "attention" }, debattue(["religere", "religare"])];
    expect(controler(fiche({ etymologie }), index)).toEqual(["formes d'origine non citées par le Littré : religere"]);
  });
  it("ne contrôle ni nature ni formes d'un mot absent du Littré", () => {
    expect(controler(fiche({ mot: "schizophrénie", famille: [] }), index)).toEqual([]);
  });
  it("signale un auteur nommé dans un texte sans que la fiche le cite", () => {
    const auteurs = [{ id: "emile-littre", nom: "Émile Littré", cite: ["Littré"] }, { id: "ciceron", nom: "Cicéron" }] as Auteur[];
    expect(controler(fiche({ explication: "Littré le rapporte." }), index, auteurs)).toEqual(["auteur nommé sans référence : Émile Littré"]);
    expect(controler(fiche({ explication: "Cicéron le rapporte." }), index, auteurs)).toEqual(["auteur nommé sans référence : Cicéron"]);
  });
});
