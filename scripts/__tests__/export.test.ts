import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exporter, VERSION_EXPORT } from "../exporter.ts";
import { validerDepot } from "../valider-fiches.ts";

const depot = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));

describe("export", () => {
  it("porte la version du format et les listes fermées", () => {
    const { version, langues, themes } = exporter(depot.fiches, depot.ouvrages, depot.racines);
    expect(version).toBe(VERSION_EXPORT);
    expect(version).toBe(2);
    expect(langues).toContain("latin");
    expect(langues).toContain("grec ancien");
    expect(themes.length).toBeGreaterThan(0);
  });

  it("trie les fiches, les racines et les ouvrages par identifiant, quel que soit l'ordre d'entrée", () => {
    const attendu = exporter(depot.fiches, depot.ouvrages, depot.racines);
    const inverse = exporter(depot.fiches.toReversed(), depot.ouvrages.toReversed(), depot.racines.toReversed());
    expect(inverse.fiches.map((f) => f.id)).toEqual(attendu.fiches.map((f) => f.id));
    expect(inverse.racines.map((r) => r.id)).toEqual(attendu.racines.map((r) => r.id));
    expect(inverse.ouvrages.map((o) => o.id)).toEqual(attendu.ouvrages.map((o) => o.id));
    expect(attendu.fiches.map((f) => f.id)).toEqual([...attendu.fiches.map((f) => f.id)].sort());
    expect(attendu.racines.map((r) => r.id)).toEqual([...attendu.racines.map((r) => r.id)].sort());
  });

  it("exporte les racines grecques et latines, brutes", () => {
    const { racines } = exporter(depot.fiches, depot.ouvrages, depot.racines);
    expect(racines.map((r) => r.id)).toEqual(["probatio"]);
    expect(racines[0]).toMatchObject({ forme: "probatio", langue: "latin", sens: "preuve de test" });
  });

  it("garde le statut de chaque fiche : le consommateur choisit ce qu'il publie", () => {
    const { fiches } = exporter(depot.fiches, depot.ouvrages);
    expect(fiches.every((f) => ["a-verifier", "brouillon", "validee"].includes(f.statut))).toBe(true);
  });
});
