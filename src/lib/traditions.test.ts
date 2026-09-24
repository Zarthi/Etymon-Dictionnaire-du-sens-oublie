import { describe, expect, it } from "vitest";
import { parTradition, traditionDe } from "./traditions.ts";
import type { LectureTraditionnelle } from "./types.ts";

const auteurs = new Map([
  ["augustin", { traditions: ["chrétienne"] }],
  ["passeur", { traditions: ["juive", "chrétienne"] }],
]);
const lecture = (auteur: string, tradition?: string) => ({ texte: "T.", citation: "C.", auteur, tradition, sources: [] }) as unknown as LectureTraditionnelle;

describe("traditionDe", () => {
  it("prend la tradition précisée, sinon l'unique tradition de l'auteur", () => {
    expect(traditionDe(lecture("augustin"), auteurs)).toBe("chrétienne");
    expect(traditionDe(lecture("passeur", "juive"), auteurs)).toBe("juive");
    expect(traditionDe(lecture("passeur"), auteurs)).toBeUndefined();
  });
});

describe("parTradition", () => {
  it("regroupe les lectures par tradition, dans l'ordre d'apparition", () => {
    const groupes = parTradition([lecture("passeur", "juive"), lecture("augustin"), lecture("passeur", "juive")], auteurs);
    expect(groupes.map((g) => [g.tradition, g.lectures.length])).toEqual([
      ["juive", 2],
      ["chrétienne", 1],
    ]);
  });
});
