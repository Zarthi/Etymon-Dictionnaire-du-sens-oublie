import { describe, expect, it } from "vitest";
import { formesAmbigues, mentionsDe, nomme, referencesDe } from "./mentions.ts";
import type { Fiche } from "./types.ts";

const auteurs = new Map([
  ["eugen-bleuler", { nom: "Eugen Bleuler", cite: ["Bleuler"] }],
  ["ciceron", { nom: "Cicéron" }],
  ["lactance", { nom: "Lactance" }],
  ["thomas-more", { nom: "Thomas More", cite: ["More"] }],
]);
const ouvrages = new Map([
  ["utopia", { titre: "L'Utopie", abrege: "Utopia" }],
  ["institutions-divines", { titre: "Institutions divines", titreOriginal: "Divinae institutiones" }],
  ["littre", { titre: "Dictionnaire de la langue française", abrege: "Littré" }],
]);

const fiche = (champs: Partial<Fiche>) => ({ etymologie: [], ecartees: [], tradition: { lectures: [], renvois: [] }, ...champs }) as unknown as Fiche;

describe("referencesDe", () => {
  it("rassemble les auteurs et ouvrages que la fiche cite, jamais les dictionnaires des sources", () => {
    const f = fiche({
      etymologie: [
        { forme: "Utopia", langue: "latin humaniste", sens: "x", forge: { par: ["thomas-more"], date: "1516", ouvrage: "utopia" } },
        { langue: "latin", alternatives: { mode: "debattue", formes: [{ forme: "a", sens: "b", selon: ["ciceron"] }, { forme: "c", sens: "d" }] } },
      ],
      tradition: { lectures: [{ texte: "T.", citation: "C.", auteur: "lactance", sources: [{ ouvrage: "institutions-divines", entree: "I", url: "https://example.org" }] }], renvois: [] },
      sources: [{ ouvrage: "littre", entree: "utopie" }],
    } as Partial<Fiche>);
    expect(referencesDe(f)).toEqual({ auteurs: ["thomas-more", "ciceron", "lactance"], ouvrages: ["utopia", "institutions-divines"] });
  });
});

describe("mentionsDe", () => {
  it("donne le nom usuel, les formes de citation, le titre, l'abrégé et le titre d'origine", () => {
    const f = fiche({ etymologie: [{ forme: "Utopia", langue: "latin humaniste", sens: "x", forge: { par: ["thomas-more"], date: "1516", ouvrage: "utopia" } }] } as Partial<Fiche>);
    expect(mentionsDe(f, auteurs, ouvrages)).toEqual([
      { forme: "Thomas More", lien: "#/auteur/thomas-more" },
      { forme: "More", lien: "#/auteur/thomas-more" },
      { forme: "L'Utopie", lien: "#/ouvrage/utopia" },
      { forme: "Utopia", lien: "#/ouvrage/utopia" },
    ]);
  });
  it("ne propose rien d'un auteur que la fiche ne cite pas", () => {
    expect(mentionsDe(fiche({}), auteurs, ouvrages)).toEqual([]);
  });
});

describe("formesAmbigues", () => {
  it("relève une forme qui désigne deux pages", () => {
    const mentions = [
      { forme: "Thomas", lien: "#/auteur/thomas-more" },
      { forme: "Thomas", lien: "#/auteur/thomas-d-aquin" },
      { forme: "Bleuler", lien: "#/auteur/eugen-bleuler" },
    ];
    expect(formesAmbigues(mentions)).toEqual(["Thomas"]);
  });
});

describe("nomme", () => {
  it("cherche la forme telle quelle, en mots entiers", () => {
    expect(nomme("Bleuler désignait la discordance.", "Bleuler")).toBe(true);
    expect(nomme("les bleulériens", "Bleuler")).toBe(false);
    expect(nomme("le comte de Paris", "Comte")).toBe(false);
    expect(nomme("selon Comte, l'altruisme", "Comte")).toBe(true);
    expect(nomme("l'œuvre de More.", "More")).toBe(true);
  });
});
