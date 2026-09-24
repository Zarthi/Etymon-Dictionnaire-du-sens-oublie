import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FICHIER_CONTRAT, FICHIER_SCHEMA, genererMarkdown, genererSchemaJson } from "../contrat.ts";

describe("contrat de données", () => {
  it("docs/fiche.schema.json est à jour (sinon : npm run contrat)", () => {
    expect(JSON.parse(readFileSync(FICHIER_SCHEMA, "utf8"))).toEqual(genererSchemaJson());
  });
  it("docs/contrat-fiche.md est à jour (sinon : npm run contrat)", () => {
    expect(readFileSync(FICHIER_CONTRAT, "utf8")).toBe(genererMarkdown());
  });
  it("décrit chaque champ de la fiche", () => {
    const contrat = genererMarkdown();
    for (const champ of ["mot", "nature", "etymon", "racine", "sources", "redaction", "lecturesTraditionnelles", "statut"]) {
      expect(contrat).toContain(`| \`${champ}\` |`);
    }
    expect(contrat).toContain("### `lecturesTraditionnelles[].sources[]`");
  });
});
