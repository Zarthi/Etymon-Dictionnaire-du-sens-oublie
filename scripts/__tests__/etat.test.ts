import { describe, expect, it } from "vitest";
import type { Redaction } from "../../src/lib/sources.ts";
import type { Candidat, FicheIdentifiee, LectureTraditionnelle } from "../../src/lib/types.ts";
import { listerBrouillons, prochainsCandidats, resumer } from "../etat.ts";

const IA: Redaction[] = [{ par: "IA", detail: "Claude Opus 5.5" }];

const fiche = (id: string, statut: FicheIdentifiee["statut"], incertain = false, lectures: LectureTraditionnelle[] = []) =>
  ({ id, mot: id, statut, incertain, redaction: IA, lecturesTraditionnelles: lectures }) as FicheIdentifiee;
/** Lecture citant les œuvres données. */
const lecture = (auteur: string, oeuvres: string[]) =>
  ({ texte: "Lecture.", citation: "Texte.", auteur, sources: oeuvres.map((ouvrage) => ({ ouvrage, entree: "I, 1", url: "https://example.org" })) }) as LectureTraditionnelle;

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
      fiche("a", "validee", false, [lecture("Lactance", ["Institutions divines"]), lecture("Isidore de Séville", ["Étymologies"])]),
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
    });
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
