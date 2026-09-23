import { describe, expect, it } from "vitest";
import langues from "../../data/langues.json" with { type: "json" };
import { dateLongue, origine } from "./affichage.ts";

describe("origine", () => {
  it.each([
    ["latin", "du latin"],
    ["latin populaire", "du latin populaire"],
    ["grec ancien", "du grec ancien"],
    ["italien", "de l'italien"],
    ["arabe", "de l'arabe"],
    ["hébreu", "de l'hébreu"],
    ["ancien nordique", "de l'ancien nordique"],
  ])("%s → %s", (langue, attendu) => expect(origine(langue)).toBe(attendu));

  it("forme un complément correct pour chaque langue de la liste fermée", () => {
    for (const langue of langues) expect(origine(langue)).toMatch(/^(du |de l')/);
  });
});

describe("dateLongue", () => {
  it("écrit la date en toutes lettres, sans décalage de fuseau", () => {
    expect(dateLongue("2026-09-23")).toBe("23 septembre 2026");
    expect(dateLongue("2027-01-01")).toBe("1 janvier 2027");
  });
});
