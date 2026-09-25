import { describe, expect, it } from "vitest";
import * as langue from "../i18n/index.ts";
import { nommerTraditions, parTradition, traditionsDe, voixDe } from "./traditions.ts";
import type { LectureTraditionnelle } from "./types.ts";

const auteurs = new Map([
  ["augustin", { traditions: ["chrétienne"] }],
  ["passeur", { traditions: ["juive", "chrétienne"] }],
  ["resh-lakish", { traditions: ["juive"] }],
]);
const ouvrages = new Map([
  ["cite-de-dieu", { auteur: "augustin" }],
  ["traite", { auteur: "passeur" }],
  ["talmud", { traditions: ["juive"] }],
  ["bible-hebraique", { traditions: ["juive", "chrétienne"] }],
]);
const lecture = (ouvrage: string, champs: Partial<LectureTraditionnelle> = {}) =>
  ({ texte: "T.", citation: "C.", sources: [{ ouvrage, entree: "1", url: "https://x.org" }], ...champs }) as LectureTraditionnelle;

describe("voixDe", () => {
  it("prend l'auteur rapporté, sinon l'auteur de l'œuvre, sinon l'œuvre seule", () => {
    expect(voixDe(lecture("talmud", { auteur: "resh-lakish" }), ouvrages)).toEqual({ auteur: "resh-lakish", ouvrage: "talmud" });
    expect(voixDe(lecture("cite-de-dieu"), ouvrages)).toEqual({ auteur: "augustin", ouvrage: "cite-de-dieu" });
    expect(voixDe(lecture("bible-hebraique"), ouvrages)).toEqual({ auteur: undefined, ouvrage: "bible-hebraique" });
  });
});

describe("traditionsDe", () => {
  it("prend la tradition précisée, sinon celles de la voix : auteur, ou œuvre sans auteur", () => {
    expect(traditionsDe(lecture("cite-de-dieu"), auteurs, ouvrages)).toEqual(["chrétienne"]);
    expect(traditionsDe(lecture("traite", { tradition: "juive" }), auteurs, ouvrages)).toEqual(["juive"]);
    expect(traditionsDe(lecture("bible-hebraique"), auteurs, ouvrages)).toEqual(["juive", "chrétienne"]);
  });
});

describe("parTradition", () => {
  it("regroupe les lectures par tradition, l'Écriture commune formant son propre groupe", () => {
    const groupes = parTradition([lecture("talmud", { auteur: "resh-lakish" }), lecture("cite-de-dieu"), lecture("bible-hebraique"), lecture("cite-de-dieu")], auteurs, ouvrages);
    expect(groupes.map((g) => [nommerTraditions(g.traditions, langue), g.lectures.length])).toEqual([
      ["juive", 1],
      ["chrétienne", 2],
      ["juive et chrétienne", 1],
    ]);
  });
});
