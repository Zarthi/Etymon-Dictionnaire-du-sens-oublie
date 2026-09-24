import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FICHIER_CONTRAT, FICHIER_PROMPT, genererMarkdown, genererPrompt, genererSchemaJson, SCHEMAS_JSON } from "../contrat.ts";

describe("contrat de données", () => {
  it.each(SCHEMAS_JSON.map((s) => [s.fichier.split(/[\\/]/).pop(), s]))("docs/%s est à jour (sinon : npm run contrat)", (_, { fichier, schema, titre }) => {
    expect(JSON.parse(readFileSync(fichier, "utf8"))).toEqual(genererSchemaJson(schema, titre));
  });
  it("docs/contrat-fiche.md est à jour (sinon : npm run contrat)", () => {
    expect(readFileSync(FICHIER_CONTRAT, "utf8")).toBe(genererMarkdown());
  });
  it("docs/prompt-redaction.md est à jour (sinon : npm run contrat)", () => {
    expect(readFileSync(FICHIER_PROMPT, "utf8")).toBe(genererPrompt());
  });
  it("décrit les trois types de fiches", () => {
    const contrat = genererMarkdown();
    for (const champ of ["mot", "etymologie", "explication", "sources", "redaction", "statut", "nom", "tradition", "titre", "licence"]) {
      expect(contrat).toContain(`| \`${champ}\` |`);
    }
    expect(contrat).toContain("### `etymologie[].alternatives`");
    expect(contrat).toContain("### `tradition.lectures[].sources[]`");
  });
  it("ne demande à l'IA que le contenu : ni sources, ni statut, ni rédaction, ni lectures", () => {
    const prompt = genererPrompt();
    for (const champ of ["mot", "etymologie", "explication", "ecartees", "nom", "titre"]) expect(prompt).toContain(`| \`${champ}\` |`);
    for (const champ of ["sources", "statut", "redaction", "lectures", "historique"]) expect(prompt).not.toContain(`| \`${champ}\` |`);
  });
});
