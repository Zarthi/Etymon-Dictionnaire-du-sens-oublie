import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { formaterErreur, validerDepot } from "../valider-fiches.ts";

const fixture = (nom: string) => fileURLToPath(new URL(`fixtures/${nom}`, import.meta.url));

describe("validerDepot", () => {
  it("valide un dépôt conforme (fiches rangées par préfixe, candidats, comptes)", async () => {
    const { fiches, candidats, comptes, erreurs } = await validerDepot(fixture("depot-conforme"));
    expect(erreurs).toEqual([]);
    expect(fiches.map((f) => f.id)).toEqual(["epreuve", "essai"]);
    expect(candidats.map((c) => c.mot)).toEqual(["exemple", "essorer"]);
    expect(comptes).toHaveLength(1);
  });

  it("rapporte chaque faute d'un dépôt fautif avec fichier et champ", async () => {
    const { erreurs } = await validerDepot(fixture("depot-fautif"));
    const attendues = [
      /^depot-fautif\/fiches\/a\/al\/alias\.yaml › ligne 4 : YAML illisible.*entre guillemets/,
      /^depot-fautif\/fiches\/d\/do\/doublet\.yaml › sens : sans guillemets/,
      /^depot-fautif\/fiches\/d\/do\/doublet\.yaml › explication : guillemets droits/,
      /^depot-fautif\/fiches\/d\/do\/doublet\.yaml › explication : espace insécable requise avant « : »/,
      /^depot-fautif\/fiches\/e\/et\/mal-range\.yaml › \(emplacement\) : .*« m\/ma\/mal-range\.yaml »/,
      /^depot-fautif\/fiches\/l\/la\/langue\.yaml › langue : /,
      /^depot-fautif\/fiches\/l\/la\/langue\.yaml › sources\.0\.ouvrage : /,
      /^depot-fautif\/fiches\/l\/la\/langue\.yaml › sources\.1\.url : indiquer une page ou une url/,
      /^depot-fautif\/fiches\/d\/do\/doublet\.yaml › doublets : fiche « absent » introuvable/,
      /^depot-fautif\/candidats\/Z\.yaml › \(fichier\) : /,
      /^depot-fautif\/candidats\/d\.yaml › 0\.raison : /,
      /^depot-fautif\/candidats\/m\.yaml › 0\.mot : « mal rangé » a déjà une fiche/,
      /^depot-fautif\/candidats\/m\.yaml › 1\.mot : « dans la mauvaise liste » doit être rangé dans « d\.yaml »/,
      /^depot-fautif\/candidats\/m\.yaml › 3\.mot : « marquer » figure déjà dans m\.yaml/,
      /^depot-fautif\/comptes\.json › 0\.date : /,
      /^depot-fautif\/comptes\.json › 0\.montant : /,
    ];
    const lignes = erreurs.map(formaterErreur);
    for (const motif of attendues) expect(lignes).toContainEqual(expect.stringMatching(motif));
    expect(lignes).toHaveLength(attendues.length);
  });

  it("les données réelles du dépôt sont conformes", async () => {
    expect((await validerDepot()).erreurs.map(formaterErreur)).toEqual([]);
  });
});
