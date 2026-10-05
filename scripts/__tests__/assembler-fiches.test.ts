import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { FicheIdentifiee } from "../../src/lib/types.ts";
import { assembler, assemblerReferences } from "../assembler-fiches.ts";
import { validerDepot } from "../valider-fiches.ts";

const { fiches } = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));
const avec = (id: string, statut: FicheIdentifiee["statut"]): FicheIdentifiee => ({ ...fiches[0], id, mot: id, statut });

describe("assembler", () => {
  it("garde toutes les fiches, quel que soit leur statut", () => {
    const { index, lots } = assembler(fiches);
    expect(index).toEqual([
      { id: "croisee", mot: "croisée", statut: "brouillon" },
      { id: "epreuve", mot: "épreuve", statut: "brouillon" },
      { id: "essai", mot: "essai", statut: "validee" },
      { id: "sacree", mot: "sacrée", statut: "brouillon", sacre: true },
    ]);
    expect([...lots.keys()]).toEqual(["cr", "ep", "es", "sa"]);
  });

  it("transmet le statut, y compris a-verifier, pour que l'app le signale", () => {
    const entree = [avec("merci", "validee"), avec("ennui", "a-verifier")];
    expect(assembler(entree).index.map((e) => e.statut)).toEqual(["a-verifier", "validee"]);
    expect(assembler(entree).lots.get("en")?.[0].statut).toBe("a-verifier");
  });

  it("transmet `sacre: true` dans l'index, et rien pour un mot profane", () => {
    const manne = { ...avec("manne", "brouillon"), sacre: ["juive", "chrétienne"] } as FicheIdentifiee;
    const { index } = assembler([manne, avec("ennui", "brouillon")]);
    expect(index).toEqual([
      { id: "ennui", mot: "ennui", statut: "brouillon" },
      { id: "manne", mot: "manne", statut: "brouillon", sacre: true },
    ]);
  });

  it("produit un index léger (id, mot, statut), trié par id quel que soit l'ordre d'entrée", () => {
    const entree = [avec("zero", "validee"), avec("chiffre", "validee"), avec("chetif", "brouillon")];
    const attendu = [
      { id: "chetif", mot: "chetif", statut: "brouillon" },
      { id: "chiffre", mot: "chiffre", statut: "validee" },
      { id: "zero", mot: "zero", statut: "validee" },
    ];
    expect(assembler(entree).index).toEqual(attendu);
    expect(assembler(entree.toReversed()).index).toEqual(attendu);
  });

  it("rend les doublets symétriques : déclarés sur une fiche, présents sur les deux", () => {
    const hopital = { ...avec("hopital", "validee"), doublets: ["hotel"] };
    const hotel = { ...avec("hotel", "validee"), doublets: [] };
    const { lots } = assembler([hopital, hotel]);
    expect(lots.get("ho")?.map((f) => [f.id, f.doublets])).toEqual([
      ["hopital", ["hotel"]],
      ["hotel", ["hopital"]],
    ]);
  });

  it("rend les renvois symétriques", () => {
    const schizophrenie = { ...avec("schizophrenie", "brouillon"), renvois: ["obsession"] };
    const obsession = { ...avec("obsession", "brouillon"), renvois: [] };
    const { lots } = assembler([schizophrenie, obsession]);
    expect(lots.get("ob")?.[0].renvois).toEqual(["schizophrenie"]);
    expect(lots.get("sc")?.[0].renvois).toEqual(["obsession"]);
  });

  it("ne transmet que les renvois vers des fiches écrites, et vers la tradition, que vers une fiche qui a des lectures", () => {
    const lecture = { texte: "T.", citation: "C.", auteur: "augustin", sources: [{ ouvrage: "la-cite-de-dieu", entree: "X", url: "https://example.org" }] };
    const schizophrenie = { ...avec("schizophrenie", "brouillon"), renvois: ["delire", "obsession"], tradition: { lectures: [], renvois: ["obsession", "demon"] } };
    const obsession = { ...avec("obsession", "brouillon"), renvois: [], tradition: { lectures: [], renvois: [] } };
    const sans = assembler([schizophrenie, obsession]).lots.get("sc")?.[0];
    expect(sans).toMatchObject({ renvois: ["obsession"], tradition: { renvois: [] } });
    const avecLecture = assembler([schizophrenie, { ...obsession, tradition: { lectures: [lecture], renvois: [] } }]).lots.get("sc")?.[0];
    expect(avecLecture?.tradition.renvois).toEqual(["obsession"]);
  });

  it("regroupe les fiches complètes par préfixe de deux lettres", () => {
    const { lots } = assembler([avec("chiffre", "validee"), avec("chetif", "validee"), avec("zero", "validee")]);
    expect(Object.fromEntries([...lots].map(([p, lot]) => [p, lot.map((f) => f.id)]))).toEqual({
      ch: ["chetif", "chiffre"],
      ze: ["zero"],
    });
    expect(lots.get("ze")?.[0]).toEqual(avec("zero", "validee"));
  });
});

describe("assemblerReferences : tenants", () => {
  it("attribue l'hypothèse à l'auteur ou à l'ouvrage tenant, jamais à l'autre", async () => {
    const depot = await validerDepot(fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url)));
    const { auteurs, ouvrages } = assemblerReferences(depot.fiches, depot.auteurs, depot.ouvrages);
    const mot = { id: "croisee", mot: "croisée" };
    expect(ouvrages.find((o) => o.id === "gaffiot")?.hypotheses).toEqual([mot]);
    expect(ouvrages.find((o) => o.id === "tlfi")?.hypotheses).toEqual([]);
    expect(auteurs.find((a) => a.id === "lactance")?.hypotheses).toEqual([mot]);
  });
});
