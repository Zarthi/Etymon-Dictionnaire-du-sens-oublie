import { describe, expect, it } from "vitest";
import type { Candidat, FicheIdentifiee, LectureTraditionnelle } from "../../src/lib/types.ts";
import { lecturesIASeule, listerBrouillons, prochainsCandidats, resumer } from "../etat.ts";

const fiche = (id: string, statut: FicheIdentifiee["statut"], incertain = false, lectures: LectureTraditionnelle[] = []) =>
  ({ id, mot: id, statut, incertain, lecturesTraditionnelles: lectures }) as FicheIdentifiee;
const lecture = (auteur: string, ...ouvrages: string[]): LectureTraditionnelle => ({
  texte: "Lecture.",
  auteur,
  sources: ouvrages.map((ouvrage) => ({ ouvrage, entree: ouvrage === "IA" ? "Claude Opus 5.5" : "I, 1" })),
});
const candidats: Candidat[] = [
  { mot: "ennui", statut: "a-faire" },
  { mot: "chétif", statut: "sans-source", raison: "Aucune entrée." },
  { mot: "étonner", statut: "a-faire" },
  { mot: "pizza", statut: "ecarte", raison: "Emprunt plat." },
  { mot: "merci", statut: "a-faire" },
];

describe("resumer", () => {
  it("compte fiches, candidats et lectures traditionnelles", () => {
    const fiches = [
      fiche("a", "validee", false, [lecture("Lactance", "Institutions divines", "IA"), lecture("Isidore", "IA")]),
      fiche("b", "brouillon", true),
      fiche("c", "brouillon"),
      fiche("d", "a-verifier"),
    ];
    expect(resumer(fiches, candidats)).toEqual({
      fiches: 4,
      validees: 1,
      brouillons: 2,
      aVerifier: 1,
      incertaines: 1,
      candidatsAFaire: 3,
      candidatsSansSource: 1,
      candidatsEcartes: 1,
      lectures: 2,
      lecturesIASeule: 1,
    });
  });
});

describe("lecturesIASeule", () => {
  it("signale les lectures dont l'IA est la seule source, pas celles qui citent une œuvre ou la rédaction", () => {
    const fiches = [
      fiche("religion", "brouillon", false, [
        lecture("Lactance", "Institutions divines", "IA"),
        lecture("Guénon", "IA"),
        lecture("Étymon", "Étymon, rédaction"),
      ]),
    ];
    expect(lecturesIASeule(fiches)).toEqual([
      { mot: "religion", auteur: "Guénon", chemin: "data/fiches/r/re/religion.yaml" },
    ]);
  });
});

describe("prochainsCandidats", () => {
  it("donne les n premiers mots à faire, dans l'ordre des listes", () => {
    expect(prochainsCandidats(candidats, 2)).toEqual(["ennui", "étonner"]);
    expect(prochainsCandidats(candidats, 10)).toEqual(["ennui", "étonner", "merci"]);
  });
});

describe("listerBrouillons", () => {
  it("liste les brouillons triés par id, avec leur emplacement et leur incertitude", () => {
    const fiches = [fiche("zero", "brouillon"), fiche("merci", "validee"), fiche("chiffre", "brouillon", true)];
    expect(listerBrouillons(fiches)).toEqual([
      { mot: "chiffre", chemin: "data/fiches/c/ch/chiffre.yaml", incertain: true },
      { mot: "zero", chemin: "data/fiches/z/ze/zero.yaml", incertain: false },
    ]);
  });
});
