import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { FicheIdentifiee } from "../../src/lib/types.ts";
import { assembler } from "../assembler-fiches.ts";
import { validerDepot } from "../valider-fiches.ts";

const { fiches } = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));
const avec = (id: string, statut: FicheIdentifiee["statut"]): FicheIdentifiee => ({ ...fiches[0], id, mot: id, statut });

describe("assembler", () => {
  it("garde toutes les fiches, quel que soit leur statut", () => {
    const { index, lots } = assembler(fiches);
    expect(index).toEqual([
      { id: "epreuve", mot: "épreuve", statut: "brouillon" },
      { id: "essai", mot: "essai", statut: "validee" },
    ]);
    expect([...lots.keys()]).toEqual(["ep", "es"]);
  });

  it("transmet le statut, y compris a-verifier, pour que l'app le signale", () => {
    const entree = [avec("merci", "validee"), avec("ennui", "a-verifier")];
    expect(assembler(entree).index.map((e) => e.statut)).toEqual(["a-verifier", "validee"]);
    expect(assembler(entree).lots.get("en")?.[0].statut).toBe("a-verifier");
  });

  it("produit un index léger (id, mot, statut), trié par id quel que soit l'ordre d'entrée", () => {
    const entree = [avec("zero", "validee"), avec("chiffre", "validee"), avec("chetif", "brouillon")];
    const attendu = [
      { id: "chetif", mot: "chetif", statut: "brouillon" },
      { id: "chiffre", mot: "chiffre", statut: "validee" },
      { id: "zero", mot: "zero", statut: "validee" },
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
