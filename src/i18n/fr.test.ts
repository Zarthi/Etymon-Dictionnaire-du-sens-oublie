import { describe, expect, it } from "vitest";
import langues from "../../data/langues.json" with { type: "json" };
import { grammaire as g, libelles, messages } from "./fr.ts";

const NBSP = String.fromCharCode(0xa0);

describe("grammaire française", () => {
  it.each([
    ["latin", "du latin"],
    ["latin populaire", "du latin populaire"],
    ["grec ancien", "du grec ancien"],
    ["italien", "de l'italien"],
    ["arabe", "de l'arabe"],
    ["hébreu", "de l'hébreu"],
    ["ancien nordique", "de l'ancien nordique"],
  ])("origine : %s → %s", (langue, attendu) => expect(g.origine(langue)).toBe(attendu));

  it("forme un complément correct pour chaque langue de la liste fermée", () => {
    for (const langue of langues) expect(g.origine(langue)).toMatch(/^(du |de l')/);
  });

  it("élide devant une voyelle ou un h, même après l'astérisque d'une forme reconstruite", () => {
    expect([g.de("relegere"), g.de("adolescere"), g.de("*extonare"), g.sur("grec"), g.sur("arabe")]).toEqual(["de ", "d'", "d'", "sur le grec", "sur l'arabe"]);
  });

  it("écrit la date en toutes lettres, sans décalage de fuseau", () => {
    expect(g.dateLongue("2026-09-23")).toBe("23 septembre 2026");
    expect(g.dateLongue("2027-01-01")).toBe("1 janvier 2027");
  });

  it("pose la typographie française : guillemets, deux-points, énumérations", () => {
    expect(g.citer("esprit fendu")).toBe(`«${NBSP}esprit fendu${NBSP}»`);
    expect(g.guillemets.join("x")).toBe(g.citer("x"));
    expect(g.deuxPoints).toBe(`${NBSP}:`);
    expect(g.enumerer(["juive"], "et")).toBe("juive");
    expect(g.enumerer(["juive", "chrétienne"], "et")).toBe("juive et chrétienne");
    expect(g.enumerer(["a", "b", "c"], "ou")).toBe("a, b ou c");
  });
});

describe("messages et libellés", () => {
  it("en français, les identifiants des listes fermées sont leurs propres libellés", () => {
    expect([libelles.langue("grec ancien"), libelles.theme("esprit"), libelles.tradition("juive")]).toEqual(["grec ancien", "esprit", "juive"]);
  });
  it("accorde les messages au nombre", () => {
    expect([messages.fiche.lectures(1), messages.fiche.lectures(2)]).toEqual(["Lecture traditionnelle", "Lectures traditionnelles"]);
    expect(messages.statut.nonVerifiee("notice")).toBe("Notice non vérifiée");
  });
});
