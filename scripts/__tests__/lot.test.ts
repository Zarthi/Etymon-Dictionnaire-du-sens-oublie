import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { schemaEntreeRedaction } from "../../src/lib/schema.ts";
import { schemaReferences, schemaVerdict } from "../lib/atelier.ts";
import { clesGrecques, clesLatines, entreeBailly, entreePerseus, formesGrecques, formesLatines, radicalLatin, tronquer } from "../lib/formes.ts";
import { appliquerRemplacement, appliquerVerdict, composerSources, famille, rapportAReprendre, remarquesOuvertes, reporterDecisions, type DonneesSources } from "../lib/lot.ts";
import { chercherDans } from "../lib/corpus.ts";
import { lireAvecRelance } from "../lib/reseau.ts";
import { afterEach, vi } from "vitest";

const fixture = (nom: string) => JSON.parse(readFileSync(new URL(`./fixtures/lot/${nom}`, import.meta.url), "utf8"));

describe("formes latines relevées", () => {
  it("lit les formes après lat., lat. pop., b. lat., latin, sans étoile ni trait d'union", () => {
    expect(formesLatines("du lat. ex-tonare, ébranler ; Du lat. pop. *extonare, issu du lat. class. adtonare")).toEqual(["extonare", "adtonare"]);
    expect(formesLatines("du latin captivus, prisonnier ; bas-lat. captivare ; lat. médiév. algorismus")).toEqual(["captivus", "captivare", "algorismus"]);
  });
  it("saute une préposition latine et un mot français", () => {
    expect(formesLatines("lat. in odio esse, être un objet de haine")).toEqual(["odio"]);
    expect(formesLatines("Lat. et grec ; lat. proprement recueillir")).toEqual([]);
  });
  it("garde l'ordre, sans doublon, et ne prend pas le grec", () => {
    expect(formesLatines("lat. legere ; du lat. legere, grec λέγειν")).toEqual(["legere"]);
  });
});

describe("formes grecques relevées", () => {
  it("ramène l'accent grave à l'aigu et les lettres de forme aux lettres ordinaires", () => {
    expect(formesGrecques("Κριτιϰὸς, de ϰρίνειν, juger")).toEqual(["κριτικός", "κρίνειν"]);
  });
});

describe("entrées à essayer", () => {
  it("passe de l'infinitif et du cas régime à la forme de dictionnaire latine", () => {
    expect(clesLatines("legere")).toEqual(["legere", "lego", "legeo"]);
    expect(clesLatines("religionem")).toEqual(["religionem", "religio"]);
    expect(clesLatines("pacem")).toEqual(["pacem", "pax"]);
    expect(clesLatines("captivus")).toEqual(["captivus"]);
  });
  it("passe de l'infinitif grec à la première personne", () => {
    expect(clesGrecques("λέγειν")).toEqual(["λέγειν", "λέγω"]);
    expect(clesGrecques("φρήν")).toEqual(["φρήν"]);
  });
  it("tire du corpus un radical d'au moins quatre lettres", () => {
    expect(["religio", "captivus", "legere", "extonare", "pacem"].map(radicalLatin)).toEqual(["religi", "captiv", "lege", "exton", "pace"]);
  });
});

describe("pages réduites à l'entrée", () => {
  it("garde le texte de l'entrée de Perseus, sans le script ni les menus", () => {
    const html = `<head><title>x</title></head><div id="menu">Menu</div><div id="text_main"><script>addDocument('Perseus:x');</script><h1>lēgo</h1> <p>lĕgo, lēgi, to gather</p></div><div class="widget" id="entrylookup">Lookup</div>`;
    expect(entreePerseus(html)).toBe("lēgo lĕgo, lēgi, to gather");
    expect(entreePerseus("<html>Invalid query</html>")).toBeUndefined();
  });
  it("garde l'entrée du Bailly après le titre et les mots voisins collés", () => {
    const texte = "φρήν (phrēn) SignetsPréférencesÀ proposφρήνφρεωρύχοςφρήνφρητίαφρήν, gén. φρενός (ἡ) I primit. le diaphragme";
    expect(entreeBailly(texte)).toBe("φρήν, gén. φρενός (ἡ) I primit. le diaphragme");
    expect(entreeBailly("introuvable")).toBeUndefined();
  });
  it("tronque à la fin d'un mot", () => {
    expect(tronquer("un deux trois quatre", 12)).toBe("un deux…");
    expect(tronquer("court", 12)).toBe("court");
  });
});

describe("corpus de réflexe", () => {
  it("ne rend pas les menus de Wikisource, qui contiennent « Legere » sans lire", () => {
    const texte = "Nexus addere Opus Legere Recensere Instrumenta Tools. Litterae dictae quasi legiterae, quod iter legentibus praestent.";
    expect(chercherDans(texte, "leg").map((p) => p.passage)).toEqual(["Litterae dictae quasi legiterae, quod iter legentibus praestent."]);
  });
});

describe("famille dans l'index du Littré", () => {
  const entree = (terme: string, etymologie = "", nature?: string) => ({ terme, etymologie, ...(nature ? { nature } : {}) });
  const index = {
    etonnant: [entree("étonnant", "Participe présent d'étonner.", "adj.")],
    etonnement: [entree("étonnement", "Étonner, et le suffixe ment.", "s. m.")],
    tonner: [entree("tonner", "Lat. tonare.")],
    relire: [entree("relire", "Re… et lire.", "v. a.")],
    dialecte: [entree("dialecte", "Διάλεκτος, de διαλέγεσθαι, discourir, dont l'origine est le verbe lire ou legere, avec un long développement sur l'emploi de ce mot chez les auteurs.")],
  };
  it("garde les entrées qui partagent le début du mot", () => {
    expect(famille(index, "étonner")).toEqual(["étonnant (adj.)", "étonnement (s. m.)"]);
  });
  it("garde les dérivés dont l'étymologie courte nomme le mot, non un rapprochement long", () => {
    expect(famille(index, "lire")).toEqual(["relire (v. a.)"]);
  });
});

describe("sources.md", () => {
  const donnees: DonneesSources = {
    mot: "lire",
    littre: [{ terme: "lire", nature: "v. a.", etymologie: "du lat. legere" }],
    famille: ["relire (v. a.)"],
    tlfi: { graphie: "lire", tlfi: { nature: "verbe", sens: ["A. [Vieilli] Choisir."], etymologie: "Du lat. legere." }, autres: ["nom"] },
    latins: [{ forme: "legere", entrees: [{ cle: "lego1", url: "https://p/lego1", texte: "lēgo, to send" }] }, { forme: "cactivus", entrees: [], essayees: ["cactivus", "cactivus1"] }],
    grecs: [{ forme: "λέγειν", entrees: [], injoignable: "HTTP 503" }],
    corpus: [{ forme: "legere", radical: "lege", resultats: [{ oeuvre: "Isidore", tradition: "chrétienne", total: 9, expliquent: 2, lignes: ["  ★ livre I · dictae quasi\n    https://u"] }] }],
  };
  it("rend chaque source avec son adresse, dans l'ordre : Littré, TLFi, étymons, corpus", () => {
    const md = composerSources(donnees);
    const rangs = ["## Littré", "## TLFi", "## Étymons latins", "## Étymons grecs", "## Corpus de réflexe"].map((t) => md.indexOf(t));
    expect(rangs).toEqual([...rangs].sort((a, b) => a - b));
    expect(rangs.every((r) => r >= 0)).toBe(true);
    for (const attendu of ["https://www.littre.org/definition/lire", "[Vieilli] Choisir.", "https://www.cnrtl.fr/api/word/lire/nom/", "### legere → lego1", "Aucune entrée (clés essayées : cactivus, cactivus1)", "radical « lege »", "★ livre I"]) {
      expect(md).toContain(attendu);
    }
  });
  it("signale une page non lue comme telle, jamais comme une absence", () => {
    expect(composerSources(donnees)).toContain("⚠ injoignable (HTTP 503)");
    const sansTlfi = composerSources({ ...donnees, tlfi: { graphie: "lire", injoignable: "HTTP 429" }, corpus: "absent" });
    expect(sansTlfi).toContain("⚠ injoignable (HTTP 429)");
    expect(sansTlfi).toContain("⚠ corpus non téléchargé");
  });
});

describe("remplacement dans une fiche", () => {
  const fiche = { mot: "x", renvois: ["a", "b", "c"], tradition: { lectures: [{ texte: "t0" }, { texte: "t1" }] }, explication: "e" };
  it("remplace un champ, un élément de liste, un champ imbriqué, sans modifier la fiche donnée", () => {
    const apres = appliquerRemplacement(appliquerRemplacement(fiche, "explication", "nouvelle"), "tradition.lectures.1.texte", "t1 bis") as typeof fiche;
    expect(apres.explication).toBe("nouvelle");
    expect(apres.tradition.lectures[1].texte).toBe("t1 bis");
    expect(fiche.explication).toBe("e");
  });
  it("retire avec null : un élément de liste (les suivants se décalent), un champ", () => {
    expect((appliquerRemplacement(fiche, "renvois.1", null) as typeof fiche).renvois).toEqual(["a", "c"]);
    expect("explication" in (appliquerRemplacement(fiche, "explication", null) as object)).toBe(false);
  });
  it("ajoute à la fin d'une liste avec le rang qui suit le dernier, et crée un champ", () => {
    expect((appliquerRemplacement(fiche, "renvois.3", "d") as typeof fiche).renvois).toEqual(["a", "b", "c", "d"]);
    expect((appliquerRemplacement(fiche, "incertain", true) as Record<string, unknown>).incertain).toBe(true);
  });
  it("refuse un chemin qui ne mène nulle part ou qui vise le prototype", () => {
    expect(() => appliquerRemplacement(fiche, "tradition.lectures.5.texte", "x")).toThrow("rang inexistant");
    expect(() => appliquerRemplacement(fiche, "absent.champ", "x")).toThrow("champ inexistant");
    expect(() => appliquerRemplacement(fiche, "renvois.7", null)).toThrow("rang inexistant");
    expect(() => appliquerRemplacement(fiche, "__proto__.x", 1)).toThrow("chemin invalide");
  });
});

describe("reprendre : un verdict factice appliqué à une fiche factice", () => {
  const verdict = schemaVerdict.parse(fixture("verdict.json"));
  const resultat = appliquerVerdict(fixture("fiche.json"), verdict);
  const fiche = resultat.fiche as ReturnType<typeof fixture>;

  it("applique les remplacements dans l'ordre et marque les remarques réglées", () => {
    expect(fiche.explication).toContain("désigne aujourd'hui");
    expect(fiche.renvois).toEqual(["surprise"]);
    expect(fiche.tradition.lectures[1].texte).toBe("Ce que le passage dit du mot.");
    expect(resultat.verdict.remarques.map((r) => r.statut)).toEqual(["appliquee", "appliquee", "appliquee", undefined, undefined, "appliquee"]);
  });
  it("ne réapplique pas une remarque déjà réglée", () => {
    expect(fiche.explication).not.toContain("réappliqué");
  });
  it("laisse au rédacteur une remarque sans remplacement et un remplacement au chemin faux, avec la raison", () => {
    expect(resultat.restantes.map((r) => [r.champ, r.raison])).toEqual([
      ["etymologie.0.sens", "sans remplacement"],
      ["themes", "rang inexistant : « 3 »"],
    ]);
  });
  it("donne une fiche qui reste valide pour le schéma de rédaction", () => {
    expect(schemaEntreeRedaction.safeParse(fixture("fiche.json")).success).toBe(true);
    expect(schemaEntreeRedaction.safeParse(resultat.fiche).error?.issues ?? []).toEqual([]);
  });
  it("recompte les remarques ouvertes : seules les deux restantes", () => {
    expect(remarquesOuvertes(resultat.verdict)).toHaveLength(2);
    expect(remarquesOuvertes(verdict)).toHaveLength(5);
  });
  it("écrit un rapport par mot, avec les remarques et les erreurs d'essai", () => {
    const rapport = rapportAReprendre([{ mot: "étonner", restantes: resultat.restantes, essai: ["etonner.yaml › explication : trop longue"] }]);
    expect(rapport).toContain("## étonner");
    expect(rapport).toContain("[dossier] `etymologie.0.sens` : le sens n'est pas dans le dossier. (sans remplacement)");
    expect(rapport).toContain("  - etonner.yaml › explication : trop longue");
  });
  it("le schéma du verdict refuse un remplacement sans valeur et accepte null", () => {
    const remarque = { critere: "regle", champ: "x", probleme: "p" };
    expect(schemaVerdict.safeParse({ decision: "a-reprendre", remarques: [{ ...remarque, remplacement: { champ: "x" } }] }).success).toBe(false);
    expect(schemaVerdict.safeParse({ decision: "a-reprendre", remarques: [{ ...remarque, remplacement: { champ: "x", valeur: null } }] }).success).toBe(true);
    expect(schemaVerdict.safeParse({ decision: "a-reprendre", remarques: [{ ...remarque, statut: "refusee" }] }).success).toBe(false);
  });
});

describe("report des décisions", () => {
  const journal = "# Journal\n\nIntro.\n\nRelecture : `à relire`.\n\n## 2026-10-04 — Ancien\n\n| a | b |\n";
  it("pose la section datée avant la plus récente, avec l'en-tête du tableau pour des lignes de tableau", () => {
    const apres = reporterDecisions(journal, "| *lire* | choix | raison | à relire |\n| *élire* | choix | raison | à relire |\n", "2026-10-06", ["lire", "élire"]);
    expect(apres.indexOf("## 2026-10-06 — Lot : lire, élire")).toBeLessThan(apres.indexOf("## 2026-10-04"));
    expect(apres).toContain("| Sujet | Décision | Raison | Relecture |\n|---|---|---|---|\n| *lire* | choix | raison | à relire |\n| *élire*");
    expect(apres.startsWith("# Journal\n\nIntro.")).toBe(true);
  });
  it("reporte un texte libre tel quel, sans en-tête de tableau", () => {
    const apres = reporterDecisions(journal, "Choix : x, parce que y.", "2026-10-06", ["lire"]);
    expect(apres).toContain("## 2026-10-06 — Lot : lire\n\nChoix : x, parce que y.\n\n## 2026-10-04");
    expect(apres).not.toContain("| Sujet |");
  });
  it("ajoute la section à la fin d'un journal sans section", () => {
    expect(reporterDecisions("# Journal\n", "| a | b | c | d |", "2026-10-06", ["lire"])).toMatch(/^# Journal\n\n## 2026-10-06 — Lot : lire\n/);
  });
});

describe("références à créer", () => {
  it("décrit auteurs et ouvrages par leur notice BnF, et refuse un champ inconnu", () => {
    const valide = { auteurs: [{ id: "isidore", cb: "cb123", description: "Évêque de Séville." }], ouvrages: [{ id: "x", cb: "cb4", titre: "T", licence: "domaine public", description: "d" }] };
    expect(schemaReferences.safeParse(valide).success).toBe(true);
    expect(schemaReferences.parse({})).toEqual({ auteurs: [], ouvrages: [] });
    expect(schemaReferences.safeParse({ auteurs: [{ id: "a", description: "d" }] }).success).toBe(false);
    expect(schemaReferences.safeParse({ auteurs: [{ id: "a", cb: "c", description: "d", inconnu: 1 }] }).success).toBe(false);
  });
});

describe("lireAvecRelance", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("réessaie après un 429 ou un 503, puis rend la page lue", async () => {
    const statuts = [429, 503, 200];
    vi.stubGlobal("fetch", async () => new Response("ok", { status: statuts.shift() }));
    expect(await lireAvecRelance("https://exemple.org", undefined, undefined, 1)).toEqual({ lue: true, texte: "ok" });
    expect(statuts).toEqual([]);
  });
  it("rend l'échec après trois reprises, et ne répète pas une autre réponse", async () => {
    let appels = 0;
    vi.stubGlobal("fetch", async () => new Response("", { status: (appels++, 429) }));
    expect(await lireAvecRelance("https://exemple.org", undefined, undefined, 1)).toMatchObject({ lue: false, statut: 429 });
    expect(appels).toBe(4);
    appels = 0;
    vi.stubGlobal("fetch", async () => new Response("", { status: (appels++, 404) }));
    await lireAvecRelance("https://exemple.org", undefined, undefined, 1);
    expect(appels).toBe(1);
  });
});
