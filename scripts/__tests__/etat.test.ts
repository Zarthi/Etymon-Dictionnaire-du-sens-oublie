import { describe, expect, it } from "vitest";
import type { Candidat, FicheIdentifiee } from "../../src/lib/types.ts";
import { listerBrouillons, prochainsCandidats, resumer } from "../etat.ts";

const fiche = (id: string, statut: FicheIdentifiee["statut"], incertain = false) =>
  ({ id, mot: id, statut, incertain }) as FicheIdentifiee;
const candidats: Candidat[] = [
  { mot: "ennui", statut: "a-faire" },
  { mot: "chétif", statut: "sans-source", raison: "Aucune entrée." },
  { mot: "étonner", statut: "a-faire" },
  { mot: "pizza", statut: "ecarte", raison: "Emprunt plat." },
  { mot: "merci", statut: "a-faire" },
];

describe("resumer", () => {
  it("compte fiches et candidats par statut", () => {
    const fiches = [fiche("a", "validee"), fiche("b", "brouillon", true), fiche("c", "brouillon")];
    expect(resumer(fiches, candidats)).toEqual({
      fiches: 3,
      validees: 1,
      brouillons: 2,
      incertaines: 1,
      candidatsAFaire: 3,
      candidatsSansSource: 1,
      candidatsEcartes: 1,
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
