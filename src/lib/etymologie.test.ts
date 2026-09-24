import { describe, expect, it } from "vitest";
import { enAlphabetLatin, formesItaliques, indexPremier, sensPremier, translitterationDe } from "./etymologie.ts";
import type { Maillon } from "./types.ts";

const m = (champs: Partial<Maillon>): Maillon => ({ langue: "latin", ...champs }) as Maillon;

describe("indexPremier", () => {
  it("prend le maillon le plus lointain attesté qui porte un sens", () => {
    // Satan : latin et grec sans sens, l'hébreu porte le sens premier.
    expect(indexPremier([m({ forme: "Satanas" }), m({ forme: "Σατανᾶς" }), m({ forme: "שָׂטָן", sens: "adversaire" })])).toBe(2);
    // Chiffre : le latin médiéval a un sens, l'arabe aussi, plus lointain.
    expect(indexPremier([m({ forme: "cifra", sens: "zéro" }), m({ forme: "صفر", sens: "vide" })])).toBe(1);
  });
  it("compte une composition sans forme comme porteuse de sens", () => {
    const schizophrenie = [m({ forme: "Schizophrenie" }), m({ elements: [{ forme: "σχίζω", sens: "fendre" }, { forme: "φρήν", sens: "diaphragme" }] })];
    expect(indexPremier(schizophrenie)).toBe(1);
  });
  it("ignore les alternatives et les formes reconstruites, sauf à défaut", () => {
    const religion = [m({ forme: "religio", sens: "scrupule" }), m({ alternatives: { mode: "debattue", formes: [{ forme: "a", sens: "b" }, { forme: "c", sens: "d" }] } })];
    expect(indexPremier(religion)).toBe(0);
    expect(indexPremier([m({ forme: "*extonare", sens: "frapper du tonnerre" })])).toBe(0);
    expect(indexPremier([m({ forme: "extonare", sens: "a" }), m({ forme: "*(s)tenh₂-", sens: "b" })])).toBe(0);
  });
  it("obéit à premier: true", () => {
    expect(indexPremier([m({ forme: "a", sens: "x", premier: true }), m({ forme: "b", sens: "y" })])).toBe(0);
  });
});

describe("sensPremier", () => {
  it("donne le sens du maillon, ou ceux de ses éléments", () => {
    expect(sensPremier([m({ forme: "religio", sens: "scrupule" })])).toBe("scrupule");
    expect(sensPremier([m({ elements: [{ forme: "σχίζω", sens: "fendre" }, { forme: "φρήν", sens: "diaphragme" }] })])).toBe("fendre, diaphragme");
  });
});

describe("translittération et italique", () => {
  it("déduit la translittération du grec, garde celle donnée, n'en donne aucune au latin", () => {
    expect(translitterationDe({ forme: "φρήν" })).toBe("phrēn");
    expect(translitterationDe({ forme: "صفر", translitteration: "ṣifr" })).toBe("ṣifr");
    expect(translitterationDe({ forme: "religio" })).toBeUndefined();
  });
  it("reconnaît l'alphabet latin, formes reconstruites et diacritiques compris", () => {
    expect(enAlphabetLatin("*extonare")).toBe(true);
    expect(enAlphabetLatin("ṣifr")).toBe(true);
    expect(enAlphabetLatin("per sonare")).toBe(true);
    expect(enAlphabetLatin("φρήν")).toBe(false);
  });
  it("rassemble toutes les formes de la chaîne et des étymologies écartées, avec leurs translittérations", () => {
    const formes = formesItaliques({
      etymologie: [
        m({ forme: "Schizophrenie" }),
        m({ elements: [{ forme: "σχίζω", sens: "fendre" }, { forme: "φρήν", sens: "diaphragme" }] }),
      ],
      ecartees: [{ forme: "sine cera", sens: "sans cire" }],
    });
    expect(formes).toEqual(["Schizophrenie", "σχίζω", "schizō", "φρήν", "phrēn", "sine cera"]);
  });
});
