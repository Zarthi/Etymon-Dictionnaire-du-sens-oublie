import { describe, expect, it } from "vitest";
import { chercherDans, CORPUS, numeralHebreu } from "../lib/corpus.ts";

describe("corpus de réflexe", () => {
  it.each([
    [1, "א"],
    [15, "טו"],
    [16, "טז"],
    [22, "כב"],
    [50, "נ"],
  ])("chapitre %i en numéral hébreu : %s", (n, attendu) => expect(numeralHebreu(n)).toBe(attendu));

  it("couvre les cinq livres de la Torah pour Rashi, et les vingt livres des Étymologies", () => {
    expect(CORPUS.find((o) => o.id === "rashi-torah")?.pages).toHaveLength(187);
    expect(CORPUS.find((o) => o.id === "somme-theologique")?.wikisource?.prefixe).toBe("Summa Theologiae/");
    expect(CORPUS.find((o) => o.id === "etymologies")?.pages?.at(-1)?.url).toMatch(/Liber_XX$/);
  });

  it("trouve le radical sans égard à la casse ni à u/v, et met d'abord les explications de mots", () => {
    const texte = "Deus misericors est. Et hinc appellata misericordia, quod miserum cor faciat. Nihil aliud.";
    expect(chercherDans(texte, "misericord")).toEqual([
      { passage: "Et hinc appellata misericordia, quod miserum cor faciat.", explique: true },
    ]);
    expect(chercherDans(texte, "MISERICOR").map((t) => t.explique)).toEqual([true, false]);
    expect(chercherDans("Religio uinculo dicta.", "vinculo")).toHaveLength(1);
  });

  it("ignore les voyelles hébraïques", () => {
    expect(chercherDans("וַיַּעֲמֹד הַשָּׂטָן לְשִׂטְנוֹ׃ ועוד", "שטן")).toHaveLength(1);
  });
});
