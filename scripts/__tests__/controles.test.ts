import { describe, expect, it } from "vitest";
import type { Fiche } from "../../src/lib/types.ts";
import { controler, repriseDuSens } from "../lib/controles.ts";
import { indexer } from "../lib/littre.ts";

const index = indexer([
  { terme: "religion", nature: "s. f.", etymologie: "du lat. religionem, entre relegere, recueillir, et religare, relier." },
  { terme: "religieux", nature: "adj.", etymologie: "Lat. religiosus." },
  { terme: "irréligion", nature: "s. f.", etymologie: "" },
]);

const fiche = (surcharges: Partial<Fiche> = {}) =>
  ({
    mot: "religion",
    nature: ["nom féminin"],
    etymon: "religio",
    sens: "attention scrupuleuse",
    explication: "Le mot ne désignait pas ce que l'on croit.",
    origine: {
      mode: "debattue",
      formes: [
        { forme: "relegere", langue: "latin", sens: "reprendre" },
        { forme: "religare", langue: "latin", sens: "relier" },
      ],
    },
    famille: ["religieux", "irréligion"],
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
  it("signale une forme d'origine que l'étymologie du Littré ne cite pas", () => {
    const origine = { mode: "debattue" as const, formes: [{ forme: "religere", langue: "latin", sens: "choisir" }, { forme: "religare", langue: "latin", sens: "relier" }] };
    expect(controler(fiche({ origine }), index)).toEqual(["formes d'origine non citées par le Littré : religere"]);
  });
  it("ne contrôle ni nature ni formes d'un mot absent du Littré", () => {
    expect(controler(fiche({ mot: "schizophrénie", famille: [] }), index)).toEqual([]);
  });
});

describe("repriseDuSens", () => {
  it("relève les mots pleins du sens repris par l'explication, hors mots vides et mot lui-même", () => {
    expect(repriseDuSens("frapper du tonnerre", "Étonner, c'était frapper comme la foudre.")).toEqual(["frapper"]);
    expect(repriseDuSens("celui qui marche devant", "Celui qui marche devant les autres.")).toEqual(["marche"]);
    expect(repriseDuSens("argent, métal blanc", "L'argent était d'abord un métal.", "argent")).toEqual(["metal"]);
    expect(repriseDuSens("relier", "Le mot ne disait pas ce lien.")).toEqual([]);
  });
});
