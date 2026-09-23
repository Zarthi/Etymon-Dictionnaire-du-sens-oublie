import { describe, expect, it } from "vitest";
import { concorde, douteux, extraireEntrees, indexer, texteBrut, urlLittre, verdict } from "../lib/littre.ts";

/** Extrait au format XMLittré : entrée normale, homonyme, entrée sans étymologie, supplément. */
const XML = `<?xml version="1.0" encoding="utf-8"?>
<xmlittre lettre="E">
<entree terme="ÉTONNER">
<entete><nature>v. a.</nature></entete>
<corps><variante num="1">Ébranler.</variante></corps>
<rubrique nom="HISTORIQUE">XIe s. estoner</rubrique>
<rubrique nom="ÉTYMOLOGIE">
Wallon, <i>estener</i> ; du lat. <i lang="la">ex-tonare</i>, ébranler comme par un coup de tonnerre, d'après Diez &amp; autres.
</rubrique>
</entree>
<entree terme="ENNUI" sens="1">
<corps><variante>Tourment.</variante></corps>
<rubrique nom="ÉTYMOLOGIE">Mot d'origine douteuse ; Diez propose le latin <i>in odio</i>.</rubrique>
</entree>
<entree terme="ENNUI" sens="2">
<corps><variante>Autre sens.</variante></corps>
<rubrique nom="ÉTYMOLOGIE">Voy. le précédent.</rubrique>
</entree>
<entree terme="EN">
<corps><variante>Préposition.</variante></corps>
</entree>
<entree terme="MERCI" supplement="1">
<corps></corps>
<rubrique nom="ÉTYMOLOGIE">Du lat. <i>mercedem</i>, récompense.</rubrique>
</entree>
</xmlittre>`;

describe("texteBrut", () => {
  it("retire les balises, décode les entités et réduit les blancs", () => {
    expect(texteBrut("du lat. <i lang='la'>ex-tonare</i>\n  &amp; &#233;&#x3b1; &lt;x&gt;")).toBe("du lat. ex-tonare & éα <x>");
  });
});

describe("extraireEntrees", () => {
  const entrees = extraireEntrees(XML);
  it("garde les entrées pourvues d'une étymologie, vedette en minuscules", () => {
    expect(entrees.map((e) => e.terme)).toEqual(["étonner", "ennui", "ennui", "merci"]);
  });
  it("extrait seulement la rubrique ÉTYMOLOGIE, en texte brut", () => {
    expect(entrees[0].etymologie).toBe(
      "Wallon, estener ; du lat. ex-tonare, ébranler comme par un coup de tonnerre, d'après Diez & autres.",
    );
  });
});

describe("indexer", () => {
  it("regroupe les homonymes sous la forme normalisée", () => {
    const index = indexer(extraireEntrees(XML));
    expect(Object.keys(index)).toEqual(["etonner", "ennui", "merci"]);
    expect(index.ennui).toHaveLength(2);
  });
});

describe("urlLittre", () => {
  it("encode la vedette", () => {
    expect(urlLittre("étonner")).toBe("https://www.littre.org/definition/%C3%A9tonner");
  });
});

describe("concorde", () => {
  it.each([
    ["*extonare", "du lat. ex-tonare, ébranler"],
    ["merces", "du lat. mercedem, récompense"],
    ["potio", "Lat. potionem"],
    ["in odio", "le latin in odio"],
    ["religio", "du lat. religionem"],
    ["ṣifr", "de l'arabe sifr, vide"],
    ["zero", "ital. zero"],
  ])("reconnaît %s dans « %s »", (etymon, etymologie) => expect(concorde(etymon, etymologie)).toBe(true));

  it.each([
    ["criticus", "Κριτιϰὸς, de ϰρίνειν, juger"],
    ["captivus", "du lat. noxa, tort"],
    ["os", "du lat. os"],
  ])("ne reconnaît pas %s dans « %s »", (etymon, etymologie) => expect(concorde(etymon, etymologie)).toBe(false));
});

describe("douteux", () => {
  it("repère un doute exprimé par le Littré", () => {
    expect(douteux("Mot d'origine douteuse")).toBe(true);
    expect(douteux("Étymologie incertaine")).toBe(true);
    expect(douteux("Du lat. mercedem")).toBe(false);
  });
});

describe("verdict", () => {
  const index = indexer(extraireEntrees(XML));
  it("concorde quand un homonyme au moins cite l'étymon, sans doute exprimé", () => {
    expect(verdict("*extonare", index.etonner)).toMatchObject({ resultat: "concorde", entree: { terme: "étonner" } });
    expect(verdict("merces", index.merci).resultat).toBe("concorde");
  });
  it("signale un doute même quand l'étymon est cité", () => {
    expect(verdict("in odio", index.ennui).resultat).toBe("doute");
  });
  it("signale une discordance ou une absence", () => {
    expect(verdict("noxa", index.etonner).resultat).toBe("discordance");
    expect(verdict("potio", undefined).resultat).toBe("absent");
    expect(verdict("potio", []).resultat).toBe("absent");
  });
});
