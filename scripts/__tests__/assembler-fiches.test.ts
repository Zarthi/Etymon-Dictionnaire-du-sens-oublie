import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { FicheIdentifiee } from "../../src/lib/types.ts";
import { assembler } from "../assembler-fiches.ts";
import { validerDepot } from "../valider-fiches.ts";

const { fiches } = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));
const avec = (id: string, statut: FicheIdentifiee["statut"]): FicheIdentifiee => ({ ...fiches[0], id, mot: id, statut });

describe("assembler", () => {
  it("ne garde que les fiches validées", () => {
    const { index, lots } = assembler(fiches);
    expect(index).toEqual([{ id: "essai", mot: "essai" }]);
    expect([...lots.keys()]).toEqual(["es"]);
  });

  it("n'inclut jamais une fiche a-verifier, même avec les brouillons", () => {
    const entree = [avec("merci", "validee"), avec("ennui", "a-verifier")];
    expect(assembler(entree, { avecBrouillons: true }).index.map((e) => e.id)).toEqual(["merci"]);
  });

  it("ajoute les brouillons seulement sur demande (relecture en développement)", () => {
    const entree = [avec("merci", "validee"), avec("ennui", "brouillon")];
    expect(assembler(entree).index.map((e) => e.id)).toEqual(["merci"]);
    expect(assembler(entree, { avecBrouillons: true }).index.map((e) => e.id)).toEqual(["ennui", "merci"]);
    expect(assembler(entree, { avecBrouillons: true }).lots.get("en")?.[0].statut).toBe("brouillon");
  });

  it("produit un index léger (id et mot seulement), trié par id quel que soit l'ordre d'entrée", () => {
    const entree = [avec("zero", "validee"), avec("chiffre", "validee"), avec("ennui", "brouillon"), avec("chetif", "validee")];
    const attendu = [
      { id: "chetif", mot: "chetif" },
      { id: "chiffre", mot: "chiffre" },
      { id: "zero", mot: "zero" },
    ];
    expect(assembler(entree).index).toEqual(attendu);
    expect(assembler(entree.toReversed()).index).toEqual(attendu);
  });

  it("regroupe les fiches complètes par préfixe de deux lettres", () => {
    const { lots } = assembler([avec("chiffre", "validee"), avec("chetif", "validee"), avec("zero", "validee")]);
    expect(Object.fromEntries([...lots].map(([p, lot]) => [p, lot.map((f) => f.id)]))).toEqual({
      ch: ["chetif", "chiffre"],
      ze: ["zero"],
    });
    expect(lots.get("ze")?.[0]).toEqual(avec("zero", "validee"));
  });
});
