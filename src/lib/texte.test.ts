import { describe, expect, it } from "vitest";
import { analyser, idDe } from "./texte.ts";

const fiches = new Set(["hotel", "hopital", "ange", "ame", "religion", "hote", "porte-monnaie"]);
const existe = (id: string) => fiches.has(id);

/** Rendu compact : [lien→cible], /italique/, texte tel quel. */
const rendu = (texte: string, exclu?: string, formes: string[] = []) =>
  analyser(texte, existe, exclu, formes)
    .map((s) => (s.type === "lien" ? `[${s.texte}→${s.cible}]` : s.type === "italique" ? `/${s.texte}/` : s.texte))
    .join("");

describe("analyser : italique automatique des formes de la fiche", () => {
  it("laisse un texte sans forme ni fiche intact", () => {
    expect(analyser("Un texte simple.")).toEqual([{ type: "texte", texte: "Un texte simple." }]);
  });
  it("met en italique chaque occurrence des formes, sans tenir compte de la casse", () => {
    expect(rendu("La religio, puis Religio encore.", undefined, ["religio"])).toBe("La /religio/, puis /Religio/ encore.");
  });
  it("ne prend que des mots entiers", () => {
    expect(rendu("religiosité et religio", undefined, ["religio"])).toBe("religiosité et /religio/");
  });
  it("reconnaît les formes de plusieurs mots, les plus longues d'abord", () => {
    expect(rendu("être in odio, odio seul", undefined, ["odio", "in odio"])).toBe("être /in odio/, /odio/ seul");
  });
  it("ignore l'astérisque des formes reconstruites", () => {
    expect(rendu("du latin extonare", undefined, ["*extonare"])).toBe("du latin /extonare/");
  });
  it("reconnaît une écriture non latine", () => {
    expect(rendu("l'arabe صفر, vide", undefined, ["صفر"])).toBe("l'arabe /صفر/, vide");
  });
  it("ne pose pas de lien dans l'italique", () => {
    expect(rendu("Le latin hotel et l'hôtel.", undefined, ["hotel"])).toBe("Le latin /hotel/ et l'[hôtel→hotel].");
  });
});

describe("analyser : liens automatiques", () => {
  it("lie les mots qui ont une fiche, sans tenir compte des accents ni de la casse", () => {
    expect(rendu("L'Hôtel et l'hôpital.")).toBe("L'[Hôtel→hotel] et l'[hôpital→hopital].");
  });
  it("reconnaît le pluriel en s ou en x", () => {
    expect(rendu("Les anges et les hôtes.")).toBe("Les [anges→ange] et les [hôtes→hote].");
  });
  it("ne lie que la première occurrence", () => {
    expect(rendu("L'âme, l'âme, toujours l'âme.")).toBe("L'[âme→ame], l'âme, toujours l'âme.");
  });
  it("ne lie jamais la fiche en cours", () => {
    expect(rendu("La religion et l'âme.", "religion")).toBe("La religion et l'[âme→ame].");
  });
  it("reconnaît les mots composés à trait d'union", () => {
    expect(rendu("Un porte-monnaie.")).toBe("Un [porte-monnaie→porte-monnaie].");
  });
  it("ne lie pas un mot qui ne fait que contenir une fiche", () => {
    expect(rendu("Les hôteliers et l'animation.")).toBe("Les hôteliers et l'animation.");
  });
});

describe("analyser : mentions d'auteurs et d'ouvrages", () => {
  const mentions = [
    { forme: "Eugen Bleuler", lien: "#/auteur/eugen-bleuler" },
    { forme: "Bleuler", lien: "#/auteur/eugen-bleuler" },
    { forme: "Utopia", lien: "#/ouvrage/utopia" },
  ];
  const avecMentions = (texte: string, formes: string[] = []) =>
    analyser(texte, existe, undefined, formes, mentions)
      .map((s) => (s.type === "mention" ? `<${s.texte}→${s.lien}>` : s.type === "lien" ? `[${s.texte}→${s.cible}]` : s.type === "italique" ? `/${s.texte}/` : s.texte))
      .join("");
  it("relie le nom, la forme la plus longue d'abord, à la première occurrence seulement", () => {
    expect(avecMentions("Eugen Bleuler, puis Bleuler encore.")).toBe("<Eugen Bleuler→#/auteur/eugen-bleuler>, puis Bleuler encore.");
    expect(avecMentions("Bleuler désignait l'âme.")).toBe("<Bleuler→#/auteur/eugen-bleuler> désignait l'[âme→ame].");
  });
  it("respecte la casse et les mots entiers", () => {
    expect(avecMentions("les bleulériens et bleuler")).toBe("les bleulériens et bleuler");
  });
  it("laisse l'italique l'emporter sur une mention", () => {
    expect(avecMentions("le latin Utopia", ["Utopia"])).toBe("le latin /Utopia/");
  });
});

describe("idDe", () => {
  it.each([
    ["Hôtel", "hotel"],
    ["cœur", "coeur"],
    ["ex æquo", "ex-aequo"],
  ])("%s → %s", (mot, id) => expect(idDe(mot)).toBe(id));
});
