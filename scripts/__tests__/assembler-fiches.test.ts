import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assembler } from "../assembler-fiches.ts";
import { validerDepot } from "../valider-fiches.ts";
import type { FicheIdentifiee } from "../../src/lib/types.ts";

const { fiches } = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));
const avec = (id: string, statut: FicheIdentifiee["statut"]): FicheIdentifiee => ({ ...fiches[0], id, statut });

describe("assembler", () => {
  it("ne garde que les fiches validées", () => {
    expect(assembler(fiches).map((f) => f.id)).toEqual(["essai"]);
  });

  it("trie par id, indépendamment de l'ordre d'entrée", () => {
    const entree = [avec("zero", "validee"), avec("chiffre", "validee"), avec("ennui", "brouillon"), avec("merci", "validee")];
    expect(assembler(entree).map((f) => f.id)).toEqual(["chiffre", "merci", "zero"]);
    expect(assembler(entree.toReversed()).map((f) => f.id)).toEqual(["chiffre", "merci", "zero"]);
  });

  it("conserve le contenu complet de la fiche", () => {
    expect(assembler(fiches)[0]).toEqual(fiches.find((f) => f.id === "essai"));
  });
});
