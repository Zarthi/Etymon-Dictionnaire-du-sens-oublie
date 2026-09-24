import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { corrigerTypographie, preparerAuteur, preparerFiche, versYaml } from "../lib/redaction.ts";
import { referentiel, validerFiches } from "../lib/validation.ts";

const NBSP = String.fromCharCode(0xa0);

/** Contenu rédigé par l'IA, sans nature (tirée du Littré), ni sources, ni statut. */
const brute = {
  mot: "religion",
  etymologie: [
    { forme: "religio", langue: "latin", sens: "attention scrupuleuse" },
    {
      langue: "latin",
      alternatives: {
        mode: "debattue",
        formes: [
          { forme: "relegere", sens: "reprendre avec soin" },
          { forme: "religare", sens: "relier" },
        ],
      },
    },
  ],
  explication: "Le mot ne désignait pas ce que l'on croit : il disait ce qui retient.",
  themes: ["religion"],
};
const options = { modele: "Claude Fable 5.1", natureLittre: "nom féminin" as const };
const ficheDe = (resultat: ReturnType<typeof preparerFiche>) => (resultat as { fiche: Record<string, unknown> }).fiche;

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
    const fiche = ficheDe(preparerFiche(brute, options));
    expect(Object.keys(fiche).slice(0, 3)).toEqual(["mot", "nature", "etymologie"]);
    expect(fiche).toMatchObject({ nature: ["nom féminin"], redaction: [{ par: "IA", detail: "Claude Fable 5.1" }], statut: "a-verifier" });
    for (const champ of ["incertain", "doublets", "famille", "renvois", "ecartees", "sources", "historique", "lecturesTraditionnelles"]) {
      expect(fiche).not.toHaveProperty(champ);
    }
    expect(fiche.explication).toBe(`Le mot ne désignait pas ce que l'on croit${NBSP}: il disait ce qui retient.`);
  });
  it("corrige la typographie des sens, où qu'ils soient dans la chaîne", () => {
    const avecQuestion = structuredClone(brute);
    avecQuestion.etymologie[1].alternatives!.formes[1].sens = "relier ?";
    const fiche = ficheDe(preparerFiche(avecQuestion, options)) as { etymologie: { alternatives?: { formes: { sens: string }[] } }[] };
    expect(fiche.etymologie[1].alternatives!.formes[1].sens).toBe(`relier${NBSP}?`);
  });
  it("garde la nature donnée, qui l'emporte sur celle du Littré", () => {
    expect(ficheDe(preparerFiche({ ...brute, nature: ["nom"] }, options)).nature).toEqual(["nom"]);
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
    expect(preparerFiche({ ...brute, themes: ["inconnu"] }, options)).toEqual({ erreurs: [expect.stringMatching(/^themes\.0 : /)] });
  });
});

describe("preparerAuteur", () => {
  it("pose le socle éditorial et retire tradition: false", () => {
    const resultat = preparerAuteur({ nom: "Eugen Bleuler", naissance: 1857, mort: 1939, description: "Psychiatre suisse." }, "Claude Fable 5.1");
    expect((resultat as { fiche: Record<string, unknown> }).fiche).toEqual({
      nom: "Eugen Bleuler",
      naissance: "1857",
      mort: "1939",
      description: "Psychiatre suisse.",
      redaction: [{ par: "IA", detail: "Claude Fable 5.1" }],
      statut: "a-verifier",
    });
  });
});

describe("versYaml", () => {
  it("écrit une fiche valide, relue à l'identique, au style des fiches", () => {
    const fiche = ficheDe(preparerFiche({ ...brute, etymologie: [{ ...brute.etymologie[0], forme: "*religio" }, brute.etymologie[1]] }, options));
    const texte = versYaml(fiche);
    expect(texte).toContain("nature: [ nom féminin ]");
    expect(texte).toContain('forme: "*religio"');
    expect(texte).toMatch(/explication: >-?\n/);
    expect(parse(texte)).toEqual(fiche);
    expect(validerFiches([{ fichier: "r/re/religion.yaml", texte }], referentiel([], [])).erreurs).toEqual([]);
  });
});
