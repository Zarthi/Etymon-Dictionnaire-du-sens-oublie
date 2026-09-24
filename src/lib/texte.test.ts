import { describe, expect, it } from "vitest";
import { analyser, erreursBalisage, idDe, texteVisible } from "./texte.ts";

const fiches = new Set(["hotel", "hopital", "ange", "ame", "religion", "hote", "porte-monnaie"]);
const existe = (id: string) => fiches.has(id);

/** Rendu compact : [lien], _italique_, texte tel quel. */
const rendu = (texte: string, exclu?: string) =>
  analyser(texte, existe, exclu)
    .map((s) => (s.type === "lien" ? `[${s.texte}→${s.cible}]` : s.type === "italique" ? `_${s.texte}_` : s.texte))
    .join("");

describe("analyser : italique", () => {
  it("laisse un texte sans balisage ni fiche intact", () => {
    expect(analyser("Un texte simple.")).toEqual([{ type: "texte", texte: "Un texte simple." }]);
  });
  it("reconnaît l'italique", () => {
    expect(analyser("Cicéron dit _relegere_.")).toEqual([
      { type: "texte", texte: "Cicéron dit " },
      { type: "italique", texte: "relegere" },
      { type: "texte", texte: "." },
    ]);
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
  it("ne lie rien dans l'italique", () => {
    expect(rendu("Le latin _hotel_ et l'hôtel.")).toBe("Le latin _hotel_ et l'[hôtel→hotel].");
  });
  it("reconnaît les mots composés à trait d'union", () => {
    expect(rendu("Un porte-monnaie.")).toBe("Un [porte-monnaie→porte-monnaie].");
  });
  it("ne lie pas un mot qui ne fait que contenir une fiche", () => {
    expect(rendu("Les hôteliers et l'animation.")).toBe("Les hôteliers et l'animation.");
  });
});

describe("idDe", () => {
  it.each([
    ["Hôtel", "hotel"],
    ["cœur", "coeur"],
    ["ex æquo", "ex-aequo"],
  ])("%s → %s", (mot, id) => expect(idDe(mot)).toBe(id));
});

describe("texteVisible", () => {
  it("retire le balisage de l'italique", () => {
    expect(texteVisible("Du latin _religio_, puis _relegere_.")).toBe("Du latin religio, puis relegere.");
  });
});

describe("erreursBalisage", () => {
  it("accepte un italique fermé, signale un « _ » isolé", () => {
    expect(erreursBalisage("_a_ et _b_")).toEqual([]);
    expect(erreursBalisage("_a")).toEqual(["italique mal fermé : « _ » isolé"]);
  });
});
