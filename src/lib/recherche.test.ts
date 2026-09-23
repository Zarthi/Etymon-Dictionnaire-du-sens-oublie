import { describe, expect, it } from "vitest";
import { chercher, distance, normaliser, preparer } from "./recherche.ts";

const index = preparer(
  ["étonner", "étonnement", "détonation", "ennui", "chétif", "chiffre", "cœur", "hôpital", "hôtel", "banqueroute"].map(
    (mot) => ({ id: mot, mot }),
  ),
);
const mots = (saisie: string, limite?: number) => chercher(index, saisie, limite).map((e) => e.mot);

describe("normaliser", () => {
  it.each([
    ["Étonner", "etonner"],
    ["  HÔPITAL ", "hopital"],
    ["cœur", "coeur"],
    ["ex   æquo", "ex aequo"],
    ["ça", "ca"],
  ])("%s → %s", (texte, attendu) => expect(normaliser(texte)).toBe(attendu));
});

describe("distance", () => {
  it.each([
    ["etonner", "etonner", 0],
    ["etoner", "etonner", 1],
    ["etonenr", "etonner", 2],
    ["kitten", "sitting", 3],
  ])("%s / %s → %i", (a, b, attendu) => expect(distance(a, b, 5)).toBe(attendu));
  it("s'arrête dès que le maximum est dépassé", () => {
    expect(distance("banqueroute", "ennui", 2)).toBe(3);
  });
});

describe("chercher", () => {
  it("ignore la casse et les accents", () => {
    expect(mots("HOTEL")[0]).toBe("hôtel");
    expect(mots("coeur")).toEqual(["cœur"]);
  });
  it("classe le mot exact, puis les débuts de mot, puis les mots contenant la saisie", () => {
    expect(mots("etonne")).toEqual(["étonner", "étonnement"]);
    expect(mots("ton")).toEqual(["étonner", "détonation", "étonnement"]);
    expect(mots("étonner")).toEqual(["étonner"]);
  });
  it("tolère une faute pour un mot moyen, deux pour un mot long", () => {
    expect(mots("etoner")).toEqual(["étonner"]);
    expect(mots("chetiff")).toEqual(["chétif"]);
    expect(mots("banquerote")).toEqual(["banqueroute"]);
    expect(mots("bankeroute")).toEqual(["banqueroute"]);
    expect(mots("enui")).toEqual(["ennui"]);
  });
  it("ne tolère pas trois fautes, ni aucune faute sur une saisie de moins de 4 lettres", () => {
    expect(mots("bankerroute")).toEqual([]);
    expect(mots("hpo")).toEqual([]);
  });
  it("renvoie une liste vide pour une saisie vide ou sans correspondance", () => {
    expect(mots("   ")).toEqual([]);
    expect(mots("zzzz")).toEqual([]);
  });
  it("limite le nombre de résultats", () => {
    expect(mots("e", 3)).toHaveLength(3);
  });
});
