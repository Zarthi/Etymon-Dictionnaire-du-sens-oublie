import { describe, expect, it } from "vitest";
import { choisie, deplacer } from "./selection.ts";

describe("deplacer", () => {
  it("descend et monte d'une option, en bouclant aux extrémités", () => {
    expect(deplacer(-1, "ArrowDown", 3)).toBe(0);
    expect(deplacer(0, "ArrowDown", 3)).toBe(1);
    expect(deplacer(2, "ArrowDown", 3)).toBe(0);
    expect(deplacer(-1, "ArrowUp", 3)).toBe(2);
    expect(deplacer(0, "ArrowUp", 3)).toBe(2);
    expect(deplacer(2, "ArrowUp", 3)).toBe(1);
  });
  it("désactive avec Échap, ignore les autres touches, et n'active rien dans une liste vide", () => {
    expect(deplacer(1, "Escape", 3)).toBe(-1);
    expect(deplacer(1, "a", 3)).toBe(1);
    expect(deplacer(1, "ArrowDown", 0)).toBe(-1);
  });
});

describe("choisie", () => {
  it("choisit l'option active, sinon la première", () => {
    expect(choisie(2, 3)).toBe(2);
    expect(choisie(-1, 3)).toBe(0);
    expect(choisie(5, 3)).toBe(0);
    expect(choisie(-1, 0)).toBe(-1);
  });
});
