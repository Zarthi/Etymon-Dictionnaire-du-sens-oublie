import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import type { Ouvrage } from "../../src/lib/types.ts";
import { idRacine, referentiel, validerRacines } from "../lib/validation.ts";

/** Ouvrages que les racines de test peuvent citer. */
const socle = { sources: [], redaction: [{ par: "IA" as const, detail: "test" }], statut: "a-verifier" as const, historique: [] };
const ouvrage = (id: string, titre: string, champs: Partial<Ouvrage> = {}): Ouvrage => ({
  id,
  titre,
  licence: "domaine public",
  description: "Test.",
  ...socle,
  ...champs,
});
const REF = referentiel(
  [],
  [
    ouvrage("littre", "Dictionnaire de la langue française", { abrege: "Littré", modeleEntree: "https://www.littre.org/definition/{entree}" }),
    ouvrage("bailly", "Dictionnaire grec-français", { abrege: "Bailly", modeleEntree: "https://bailly.app/{grec}" }),
    ouvrage("tlfi", "Trésor de la langue française informatisé", { abrege: "TLFi" }),
  ],
);

/** Racine conforme servant de base ; chaque test n'en modifie qu'un aspect. */
const racineBase = {
  forme: "religio",
  langue: "latin",
  sens: "attention scrupuleuse",
  sources: [{ ouvrage: "littre", entree: "religion" }],
  redaction: [{ par: "IA", detail: "test" }],
  statut: "brouillon",
  historique: [],
};

function valider(surcharges: Record<string, unknown> = {}, fichier = "religio.yaml") {
  return validerRacines([{ fichier, texte: stringify({ ...racineBase, ...surcharges }) }], REF);
}

/** Erreurs sous la forme « champ : règle », plus lisibles dans les assertions. */
const erreursDe = (surcharges: Record<string, unknown> = {}, fichier?: string) =>
  valider(surcharges, fichier).erreurs.map((e) => `${e.champ} : ${e.regle}`);

describe("idRacine", () => {
  it("prend la forme latine sans accent, ou la translittération du grec", () => {
    expect(idRacine({ forme: "religio" })).toBe("religio");
    expect(idRacine({ forme: "captivus" })).toBe("captivus");
    expect(idRacine({ forme: "φρήν" })).toBe("phren");
  });
});

describe("validerRacines", () => {
  it("accepte une racine latine valide, rangée à plat", () => {
    const { racines, erreurs } = valider();
    expect(erreurs).toEqual([]);
    expect(racines.map((r) => r.id)).toEqual(["religio"]);
  });

  it("accepte une racine grecque nommée par sa translittération", () => {
    const { erreurs } = valider({ forme: "φρήν", langue: "grec ancien", sens: "esprit", sources: [{ ouvrage: "bailly", entree: "φρήν" }] }, "phren.yaml");
    expect(erreurs).toEqual([]);
  });

  it("refuse un nom de fichier qui ne correspond pas à la racine", () => {
    expect(erreursDe({}, "phren.yaml")).toContain("id : le nom de fichier doit correspondre à la racine : « religio.yaml »");
  });

  it("refuse une langue hors du sous-ensemble latin / grec ancien", () => {
    expect(erreursDe({ langue: "arabe" }).some((e) => e.startsWith("langue :"))).toBe(true);
  });

  it("refuse une translittération pour une forme latine ou grecque", () => {
    expect(erreursDe({ translitteration: "religio" })).toContain("translitteration : inutile pour une forme en alphabet latin");
    expect(erreursDe({ forme: "φρήν", langue: "grec ancien", translitteration: "phren" }, "phren.yaml")).toContain(
      "translitteration : inutile pour le grec : elle se déduit de la forme",
    );
  });

  it("refuse un sens entre guillemets", () => {
    expect(erreursDe({ sens: "« attention scrupuleuse »" })).toContain("sens : sans guillemets : l'app les ajoute à l'affichage");
  });

  it("exige au moins une source hors a-verifier", () => {
    expect(erreursDe({ sources: [] }).some((e) => e.startsWith("sources :"))).toBe(true);
  });

  it("refuse une source dont l'ouvrage n'a pas de fiche", () => {
    expect(erreursDe({ sources: [{ ouvrage: "absent", entree: "x" }] })).toContain("sources.0.ouvrage : ouvrage « absent » sans fiche (data/ouvrages)");
  });
});
