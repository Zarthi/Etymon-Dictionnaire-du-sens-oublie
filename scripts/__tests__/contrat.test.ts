import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FICHIER_CONTRAT, FICHIER_PROMPT, FICHIER_SCHEMA, genererMarkdown, genererPrompt, genererSchemaJson } from "../contrat.ts";

describe("contrat de données", () => {
  it("docs/fiche.schema.json est à jour (sinon : npm run contrat)", () => {
    expect(JSON.parse(readFileSync(FICHIER_SCHEMA, "utf8"))).toEqual(genererSchemaJson());
  });
  it("docs/contrat-fiche.md est à jour (sinon : npm run contrat)", () => {
    expect(readFileSync(FICHIER_CONTRAT, "utf8")).toBe(genererMarkdown());
  });
  it("docs/prompt-redaction.md est à jour (sinon : npm run contrat)", () => {
    expect(readFileSync(FICHIER_PROMPT, "utf8")).toBe(genererPrompt());
  });
  it("ne demande à l'IA que le contenu : ni sources, ni statut, ni rédaction, ni lectures", () => {
    const prompt = genererPrompt();
    for (const champ of ["mot", "etymon", "sens", "explication", "origine", "forge"]) expect(prompt).toContain(`| \`${champ}\` |`);
    for (const champ of ["sources", "statut", "redaction", "lecturesTraditionnelles", "historique"]) expect(prompt).not.toContain(`| \`${champ}\` |`);
  });
  it("décrit chaque champ de la fiche", () => {
    const contrat = genererMarkdown();
    for (const champ of ["mot", "nature", "etymon", "origine", "sources", "redaction", "lecturesTraditionnelles", "statut"]) {
      expect(contrat).toContain(`| \`${champ}\` |`);
    }
    expect(contrat).toContain("### `lecturesTraditionnelles[].sources[]`");
  });
});
