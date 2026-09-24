import { describe, expect, it } from "vitest";
import { chercher, concorde, douteux, extraireEntrees, indexer, natureDepuisLittre, texteBrut, urlLittre, verdict } from "../lib/littre.ts";

/** Extrait au format XMLittré : entrée normale, homonyme, entrée sans étymologie, supplément. */
const XML = `<?xml version="1.0" encoding="utf-8"?>
<xmlittre lettre="E">
<entree terme="ABSOLU, UE">
<corps><variante>Sans lien.</variante></corps>
<rubrique nom="ÉTYMOLOGIE">Lat. absolutus, de absolvere, délier.</rubrique>
</entree>
<entree terme="ANCÊTRES">
<corps><variante>Aïeux.</variante></corps>
<rubrique nom="ÉTYMOLOGIE">Lat. antecessor, celui qui marche devant.</rubrique>
</entree>
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
  it("garde toutes les entrées, vedette en minuscules, étymologie vide si absente", () => {
    expect(entrees.map((e) => e.terme)).toEqual(["absolu", "ancêtres", "étonner", "ennui", "ennui", "en", "merci"]);
    expect(entrees[5].etymologie).toBe("");
  });
  it("extrait la nature grammaticale de l'en-tête", () => {
    expect(entrees[2].nature).toBe("v. a.");
    expect(entrees[0].nature).toBeUndefined();
  });
  it("extrait seulement la rubrique ÉTYMOLOGIE, en texte brut", () => {
    expect(entrees[2].etymologie).toBe(
      "Wallon, estener ; du lat. ex-tonare, ébranler comme par un coup de tonnerre, d'après Diez & autres.",
    );
  });
});

describe("indexer", () => {
  it("regroupe les homonymes sous la forme normalisée", () => {
    const index = indexer(extraireEntrees(XML));
    expect(Object.keys(index)).toEqual(["absolu", "ancetres", "etonner", "ennui", "en", "merci"]);
    expect(index.ennui).toHaveLength(2);
  });
});

describe("natureDepuisLittre", () => {
  it.each([
    ["s. f.", "nom féminin"],
    ["S. m.", "nom masculin"],
    ["s. m. et f.", "nom"],
    ["s. f. pl.", "nom féminin"],
    ["v. a.", "verbe"],
    ["v. réfl.", "verbe"],
    ["adj.", "adjectif"],
    ["adv.", "adverbe"],
    ["part. passé", undefined],
    [undefined, undefined],
  ])("%s → %s", (nature, attendu) => expect(natureDepuisLittre(nature)).toBe(attendu));
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
    ["análysis", "Ἀνάλυσις, de ἀναλύω, résoudre"],
    ["anarkhía", "Ἀναρχία, de ἀν privatif, et ἀρχὴ"],
    ["apátheia", "Ἀπάθεια, de ἀ privatif, et de πάθος"],
    ["kritikós", "Κριτιϰὸς, de ϰρίνειν, juger"],
  ])("reconnaît %s dans « %s »", (etymon, etymologie) => expect(concorde(etymon, etymologie)).toBe(true));

  it.each([
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

describe("chercher", () => {
  const index = indexer(extraireEntrees(XML));
  it("trouve un mot par sa forme normalisée, au singulier comme au pluriel", () => {
    expect(chercher(index, "Étonner")?.[0].terme).toBe("étonner");
    expect(chercher(index, "ancêtre")?.[0].terme).toBe("ancêtres");
    expect(chercher(index, "absolus")?.[0].terme).toBe("absolu");
    expect(chercher(index, "potion")).toBeUndefined();
  });
});

describe("verdict", () => {
  const index = indexer(extraireEntrees(XML));
  it("concorde quand un homonyme au moins cite l'étymon, sans doute exprimé", () => {
    expect(verdict(["*extonare"], index.etonner)).toMatchObject({ resultat: "concorde", entree: { terme: "étonner" } });
    expect(verdict(["merces"], index.merci).resultat).toBe("concorde");
  });
  it("accepte la concordance par la racine quand l'étymon direct n'est pas cité", () => {
    const critique = [{ terme: "critique", etymologie: "Κριτιϰὸς, de ϰρίνειν" }];
    expect(verdict(["criticus", "kritikós"], critique).resultat).toBe("concorde");
    expect(verdict(["criticus"], critique).resultat).toBe("discordance");
  });
  it("signale un doute même quand l'étymon est cité", () => {
    expect(verdict(["in odio"], index.ennui).resultat).toBe("doute");
  });
  it("signale une discordance ou une absence", () => {
    expect(verdict(["noxa"], index.etonner).resultat).toBe("discordance");
    expect(verdict(["potio"], undefined).resultat).toBe("absent");
    expect(verdict(["potio"], []).resultat).toBe("absent");
    expect(verdict(["potio"], index.en).resultat).toBe("absent");
  });
});
