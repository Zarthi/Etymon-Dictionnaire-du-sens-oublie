import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { corrigerTypographie, preparerFiche, versYaml } from "../lib/redaction.ts";
import { validerFiches } from "../lib/validation.ts";

const NBSP = " ";

/** Contenu rédigé par l'IA, sans nature (tirée du Littré), ni sources, ni statut. */
const brute = {
  mot: "religion",
  etymon: "religio",
  langue: "latin",
  sens: "attention scrupuleuse",
  explication: "Le mot ne désignait pas ce que l'on croit : il disait ce qui retient.",
  origine: {
    mode: "debattue",
    formes: [
      { forme: "relegere", langue: "latin", sens: "reprendre avec soin", selon: ["Cicéron"] },
      { forme: "religare", langue: "latin", sens: "relier" },
    ],
  },
  themes: ["religion"],
};
const options = { modele: "Claude Fable 5.1", natureLittre: "nom féminin" as const };

describe("corrigerTypographie", () => {
  it.each([
    ["Ainsi : oui ; non ? si !", `Ainsi${NBSP}: oui${NBSP}; non${NBSP}? si${NBSP}!`],
    ["Collé: ici", `Collé${NBSP}: ici`],
    ["Vraiment ?!", `Vraiment${NBSP}?!`],
    ['Un "mot" cité', `Un «${NBSP}mot${NBSP}» cité`],
    ["Un « mot » cité", `Un «${NBSP}mot${NBSP}» cité`],
    [`Déjà${NBSP}: juste`, `Déjà${NBSP}: juste`],
  ])("%s", (texte, attendu) => expect(corrigerTypographie(texte)).toBe(attendu));
});

describe("preparerFiche", () => {
  it("pose la nature du Littré, la rédaction IA et le statut a-verifier, sans valeurs par défaut", () => {
    const resultat = preparerFiche(brute, options);
    expect(resultat).toHaveProperty("fiche");
    const fiche = (resultat as { fiche: Record<string, unknown> }).fiche;
    expect(fiche).toMatchObject({ nature: ["nom féminin"], redaction: [{ par: "IA", detail: "Claude Fable 5.1" }], statut: "a-verifier" });
    for (const champ of ["incertain", "doublets", "famille", "sources", "historique", "lecturesTraditionnelles"]) {
      expect(fiche).not.toHaveProperty(champ);
    }
    expect(fiche.explication).toBe(`Le mot ne désignait pas ce que l'on croit${NBSP}: il disait ce qui retient.`);
  });
  it("garde la nature donnée, qui l'emporte sur celle du Littré", () => {
    const resultat = preparerFiche({ ...brute, nature: ["nom"] }, options);
    expect((resultat as { fiche: Record<string, unknown> }).fiche.nature).toEqual(["nom"]);
  });
  it("refuse les champs que les scripts écrivent", () => {
    expect(preparerFiche({ ...brute, sources: [], statut: "brouillon" }, options)).toEqual({
      erreurs: [expect.stringMatching(/^sources, statut : écrits par les scripts/)],
    });
  });
  it("exige la nature d'un mot absent du Littré", () => {
    expect(preparerFiche(brute, { modele: "Claude Fable 5.1" })).toEqual({ erreurs: ["nature : absente du Littré, à fournir"] });
  });
  it("rapporte les erreurs de structure", () => {
    const resultat = preparerFiche({ ...brute, langue: "klingon" }, options);
    expect(resultat).toEqual({ erreurs: [expect.stringMatching(/^langue : /)] });
  });
});

describe("versYaml", () => {
  it("écrit une fiche valide, relue à l'identique", () => {
    const { fiche } = preparerFiche({ ...brute, etymon: "*religio" }, options) as { fiche: Record<string, unknown> };
    const texte = versYaml(fiche);
    expect(texte).toContain("nature: [ nom féminin ]");
    expect(texte).toContain("selon: [ Cicéron ]");
    expect(texte).toContain('etymon: "*religio"');
    expect(texte).toMatch(/explication: >-?\n/);
    expect(parse(texte)).toEqual(fiche);
    expect(validerFiches([{ fichier: "r/re/religion.yaml", texte }]).erreurs).toEqual([]);
  });
});
