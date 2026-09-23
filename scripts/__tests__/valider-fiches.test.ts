import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { formaterErreur, validerDepot } from "../valider-fiches.ts";

const fixture = (nom: string) => fileURLToPath(new URL(`fixtures/${nom}`, import.meta.url));

describe("validerDepot", () => {
  it("valide un dépôt conforme (fiches et comptes)", async () => {
    const { fiches, comptes, erreurs } = await validerDepot(fixture("depot-conforme"));
    expect(erreurs).toEqual([]);
    expect(fiches.map((f) => f.id)).toEqual(["epreuve", "essai"]);
    expect(comptes).toHaveLength(1);
  });

  it("rapporte chaque faute d'un dépôt fautif avec fichier et champ", async () => {
    const { erreurs } = await validerDepot(fixture("depot-fautif"));
    const lignes = erreurs.map(formaterErreur);
    const attendues = [
      /^depot-fautif\/fiches\/alias\.yaml › ligne 3 : YAML illisible.*entre guillemets/,
      /^depot-fautif\/fiches\/langue\.yaml › langue : /,
      /^depot-fautif\/fiches\/langue\.yaml › sources\.0 : /,
      /^depot-fautif\/fiches\/doublet\.yaml › sens : sans guillemets/,
      /^depot-fautif\/fiches\/doublet\.yaml › explication : guillemets droits/,
      /^depot-fautif\/fiches\/doublet\.yaml › explication : espace insécable requise avant « : »/,
      /^depot-fautif\/fiches\/doublet\.yaml › doublets : fiche « absent » introuvable/,
      /^depot-fautif\/comptes\.json › 0\.date : /,
      /^depot-fautif\/comptes\.json › 0\.montant : /,
    ];
    for (const motif of attendues) expect(lignes).toContainEqual(expect.stringMatching(motif));
    expect(lignes).toHaveLength(attendues.length);
  });

  it("les données réelles du dépôt sont conformes", async () => {
    expect((await validerDepot()).erreurs.map(formaterErreur)).toEqual([]);
  });
});
