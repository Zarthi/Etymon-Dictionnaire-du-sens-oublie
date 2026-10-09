import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exporter, VERSION_EXPORT } from "../exporter.ts";
import { validerDepot } from "../valider-fiches.ts";

const depot = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));

describe("export", () => {
  it("porte la version du format et les listes fermées", () => {
    const { version, langues, themes } = exporter(depot.fiches, depot.ouvrages);
    expect(version).toBe(VERSION_EXPORT);
    expect(langues).toContain("latin");
    expect(langues).toContain("grec ancien");
    expect(themes.length).toBeGreaterThan(0);
  });

  it("trie les fiches et les ouvrages par identifiant, quel que soit l'ordre d'entrée", () => {
    const attendu = exporter(depot.fiches, depot.ouvrages);
    const inverse = exporter(depot.fiches.toReversed(), depot.ouvrages.toReversed());
    expect(inverse.fiches.map((f) => f.id)).toEqual(attendu.fiches.map((f) => f.id));
    expect(inverse.ouvrages.map((o) => o.id)).toEqual(attendu.ouvrages.map((o) => o.id));
    expect(attendu.fiches.map((f) => f.id)).toEqual([...attendu.fiches.map((f) => f.id)].sort());
  });

  it("garde le statut de chaque fiche : le consommateur choisit ce qu'il publie", () => {
    const { fiches } = exporter(depot.fiches, depot.ouvrages);
    expect(fiches.every((f) => ["a-verifier", "brouillon", "validee"].includes(f.statut))).toBe(true);
  });
});
