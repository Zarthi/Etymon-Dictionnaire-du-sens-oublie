import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CONSIGNES_ETAPES,
  FICHIER_CONTRAT,
  genererMarkdown,
  genererPrompt,
  genererSchemaJson,
  SCHEMAS_JSON,
} from "../contrat.ts";

const nom = (fichier: string) => fichier.split(/[\\/]/).slice(-2).join("/");

describe("contrat de données", () => {
  it.each(SCHEMAS_JSON.map((s) => [s.fichier.split(/[\\/]/).pop(), s]))("docs/%s est à jour (sinon : npm run contrat)", (_, { fichier, schema, titre }) => {
    expect(JSON.parse(readFileSync(fichier, "utf8"))).toEqual(genererSchemaJson(schema, titre));
  });
  it("docs/contrat-fiche.md est à jour (sinon : npm run contrat)", () => {
    expect(readFileSync(FICHIER_CONTRAT, "utf8")).toBe(genererMarkdown());
  });
  it.each(CONSIGNES_ETAPES.map((c) => [nom(c.fichier), c]))("docs/%s est à jour (sinon : npm run contrat)", (_, { fichier, generer }) => {
    expect(readFileSync(fichier, "utf8")).toBe(generer());
  });
  it("décrit les trois types de fiches", () => {
    const contrat = genererMarkdown();
    for (const champ of ["mot", "etymologie", "explication", "sources", "redaction", "statut", "nom", "tradition", "titre", "licence"]) {
      expect(contrat).toContain(`| \`${champ}\` |`);
    }
    expect(contrat).toContain("### `etymologie[].alternatives`");
    expect(contrat).toContain("### `tradition.lectures[].sources[]`");
  });
  it("ne demande au rédacteur que le contenu de la fiche : ni sources, ni statut, ni rédaction, ni lectures", () => {
    const prompt = genererPrompt();
    for (const champ of ["mot", "etymologie", "explication", "ecartees"]) expect(prompt).toContain(`| \`${champ}\` |`);
    for (const champ of ["sources", "statut", "redaction", "lectures", "historique"]) expect(prompt).not.toContain(`| \`${champ}\` |`);
  });
  it("fait rédiger d'après le dossier, jamais de mémoire", () => {
    expect(genererPrompt()).toContain("d'après le dossier");
    expect(genererPrompt()).not.toContain("Tu rédiges de mémoire");
  });
});
