import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import {
  cheminFiche,
  compterPhrases,
  slug,
  validerCandidats,
  validerComptes,
  validerFiches,
  verifierTypographie,
  type Erreur,
} from "../lib/validation.ts";

const NBSP = " ";

/** Fiche conforme servant de base ; chaque test n'en modifie qu'un aspect. */
const ficheBase = {
  mot: "étonner",
  etymon: "*extonare",
  reconstruit: true,
  langue: "latin populaire",
  sens: "frapper du tonnerre",
  explication: "Le mot désignait un ébranlement violent, avant de s'affaiblir en simple surprise.\n",
  incertain: false,
  racine: { forme: "*(s)tenh₂-", langue: "indo-européen", sens: "retentir, gronder" },
  doublets: [],
  famille: ["tonner", "tonnerre", "détonation"],
  themes: ["émotions", "météo"],
  sources: [
    { ouvrage: "Littré", entree: "étonner", url: "https://example.org/littre/etonner" },
    { ouvrage: "Gaffiot", entree: "extono", page: 1 },
  ],
  lectureTraditionnelle: null,
  statut: "brouillon",
  historique: [],
};

function valider(surcharges: Record<string, unknown> = {}, fichier = "e/et/etonner.yaml") {
  return validerFiches([{ fichier, texte: stringify({ ...ficheBase, ...surcharges }) }]);
}

/** Erreurs sous la forme « champ : règle », plus lisibles dans les assertions. */
function erreursDe(surcharges: Record<string, unknown> = {}, fichier?: string): string[] {
  return valider(surcharges, fichier).erreurs.map((e: Erreur) => `${e.champ} : ${e.regle}`);
}

describe("slug", () => {
  it.each([
    ["étonner", "etonner"],
    ["Chétif", "chetif"],
    ["cœur", "coeur"],
    ["ex æquo", "ex-aequo"],
    ["porte-monnaie", "porte-monnaie"],
    ["aujourd'hui", "aujourd-hui"],
  ])("%s → %s", (mot, attendu) => expect(slug(mot)).toBe(attendu));
});

describe("compterPhrases", () => {
  it.each([
    ["Une phrase.", 1],
    ["Une. Deux ! Trois ?", 3],
    ["Points de suspension… puis fin.", 2],
    ["Sans ponctuation finale", 0],
    ["Un nombre 3.5 ne coupe pas.", 1],
  ])("%s → %i", (texte, attendu) => expect(compterPhrases(texte)).toBe(attendu));
});

describe("verifierTypographie", () => {
  it("accepte l'espace insécable et l'espace fine insécable", () => {
    expect(verifierTypographie(`Ainsi${NBSP}: oui ; vraiment${NBSP}?!`)).toEqual([]);
  });
  it("refuse une espace ordinaire ou absente avant : ; ? !", () => {
    expect(verifierTypographie("Ainsi : oui; non ? si!")).toEqual([
      "espace insécable requise avant « : »",
      "espace insécable requise avant « ; »",
      "espace insécable requise avant « ? »",
      "espace insécable requise avant « ! »",
    ]);
  });
  it("refuse les guillemets droits et anglais", () => {
    expect(verifierTypographie('Un "mot"')).toEqual(["guillemets droits ou anglais interdits : utiliser « »"]);
    expect(verifierTypographie("Un “mot”")).toHaveLength(1);
  });
  it("signale une même règle une seule fois", () => {
    expect(verifierTypographie("a: b: c:")).toHaveLength(1);
  });
});

describe("validerFiches : fiche conforme", () => {
  it("renvoie la fiche avec son id, sans erreur", () => {
    const { fiches, erreurs } = valider();
    expect(erreurs).toEqual([]);
    expect(fiches).toHaveLength(1);
    expect(fiches[0]).toMatchObject({ id: "etonner", mot: "étonner", etymon: "*extonare" });
  });
  it("retire le saut de ligne final du bloc replié de l'explication", () => {
    expect(valider().fiches[0].explication.endsWith(".")).toBe(true);
  });
  it("accepte une racine absente, une lecture traditionnelle complète et un historique daté", () => {
    const { racine: _, ...sansRacine } = ficheBase;
    const texte = stringify({
      ...sansRacine,
      lectureTraditionnelle: { texte: "Lecture sourcée.", auteur: "Lactance", source: "Institutions divines, IV, 28" },
      historique: [{ date: "2026-09-23", note: "Corrigée suite à une Critique." }],
    });
    expect(validerFiches([{ fichier: "e/et/etonner.yaml", texte }]).erreurs).toEqual([]);
  });
  it("accepte une fiche a-verifier sans source (rédigée de mémoire)", () => {
    expect(erreursDe({ statut: "a-verifier", sources: [] })).toEqual([]);
  });
  it("accepte un suffixe numérique pour les homonymes", () => {
    expect(erreursDe({}, "e/et/etonner-2.yaml")).toEqual([]);
  });
});

describe("validerFiches : lecture YAML", () => {
  it("explique le piège de l'étymon reconstruit non mis entre guillemets", () => {
    const texte = stringify(ficheBase).replace('"*extonare"', "*extonare");
    const { erreurs } = validerFiches([{ fichier: "e/et/etonner.yaml", texte }]);
    expect(erreurs.length).toBeGreaterThan(0);
    expect(erreurs[0].regle).toMatch(/YAML illisible/);
    expect(erreurs[0].regle).toMatch(/entre guillemets/);
  });
  it("refuse « : » non protégé dans une valeur", () => {
    const texte = stringify(ficheBase).replace("sens: frapper du tonnerre", "sens: frapper: fort");
    expect(validerFiches([{ fichier: "e/et/etonner.yaml", texte }]).erreurs[0].regle).toMatch(/YAML illisible/);
  });
  it("refuse une clé en double", () => {
    const texte = stringify(ficheBase) + "mot: autre\n";
    expect(validerFiches([{ fichier: "e/et/etonner.yaml", texte }]).erreurs[0].regle).toMatch(/YAML illisible/);
  });
});

describe("validerFiches : structure", () => {
  it("signale un champ obligatoire manquant", () => {
    const { sens: _, ...sansSens } = ficheBase;
    const { erreurs } = validerFiches([{ fichier: "e/et/etonner.yaml", texte: stringify(sansSens) }]);
    expect(erreurs.map((e) => e.champ)).toEqual(["sens"]);
  });
  it("refuse un champ inconnu", () => {
    expect(erreursDe({ auteur: "moi" })).toEqual([expect.stringMatching(/^\(racine\) : .*auteur/)]);
  });
  it.each([
    ["statut", { statut: "publiee" }],
    ["langue", { langue: "klingon" }],
    ["themes.0", { themes: ["inconnu"] }],
    ["sources.0.ouvrage", { sources: [{ ouvrage: "Wiktionnaire", entree: "étonner", page: 1 }] }],
    ["sources.0.url", { sources: [{ ouvrage: "Littré", entree: "étonner" }] }],
    ["sources.0.url", { sources: [{ ouvrage: "Littré", entree: "étonner", url: "http://example.org/etonner" }] }],
    ["sources.0.url", { sources: [{ ouvrage: "Littré", entree: "étonner", url: "pas une url" }] }],
    ["sources.0", { sources: ["Littré"] }],
    ["sources", { sources: [] }],
    ["sources", { sources: [], statut: "validee" }],
    ["incertain", { incertain: "non" }],
    ["reconstruit", { reconstruit: "oui" }],
    ["historique.0.date", { historique: [{ date: "23/09/2026", note: "Correction." }] }],
    ["lectureTraditionnelle.source", { lectureTraditionnelle: { texte: "Lecture.", auteur: "Augustin" } }],
    ["racine.sens", { racine: { forme: "*x", langue: "indo-européen" } }],
  ])("signale le champ %s", (champ, surcharges) => {
    expect(valider(surcharges).erreurs.map((e) => e.champ)).toEqual([champ]);
  });
});

describe("cheminFiche", () => {
  it.each([
    ["etonner", "e/et/etonner.yaml"],
    ["zero", "z/ze/zero.yaml"],
    ["a", "a/a/a.yaml"],
  ])("%s → %s", (id, attendu) => expect(cheminFiche(id)).toBe(attendu));
});

describe("validerFiches : emplacement", () => {
  it.each(["etonner.yaml", "e/etonner.yaml", "e/ep/etonner.yaml", "x/et/etonner.yaml", "e/et/x/etonner.yaml"])(
    "refuse une fiche rangée dans %s",
    (fichier) => {
      expect(erreursDe({}, fichier)).toEqual(["(emplacement) : la fiche doit être rangée dans « e/et/etonner.yaml »"]);
    },
  );
});

describe("validerFiches : cohérence", () => {
  it.each(["e/et/étonner.yaml", "e/et/Etonner.yaml", "e/et/etonner_2.yaml"])("refuse l'id non ASCII minuscule %s", (fichier) => {
    expect(erreursDe({}, fichier)).toEqual([expect.stringMatching(/^id : .*ASCII/)]);
  });
  it("refuse un id sans rapport avec le mot", () => {
    expect(erreursDe({}, "e/et/etonne.yaml")).toEqual(["id : le nom de fichier doit correspondre au mot : « etonner.yaml »"]);
  });
  it("refuse une autre extension que .yaml", () => {
    expect(erreursDe({}, "e/et/etonner.yml")).toEqual(["(fichier) : extension attendue : .yaml"]);
  });
  it("refuse un id en double", () => {
    const texte = stringify(ficheBase);
    const { erreurs } = validerFiches([
      { fichier: "e/et/etonner.yaml", texte },
      { fichier: "e/et/etonner.yaml", texte },
    ]);
    expect(erreurs).toEqual([{ fichier: "e/et/etonner.yaml", champ: "id", regle: "id « etonner » en double" }]);
  });
  it.each([
    [{ reconstruit: false }],
    [{ etymon: "extonare" }],
  ])("exige reconstruit ⇔ étymon avec astérisque (%o)", (surcharges) => {
    expect(erreursDe(surcharges)).toEqual([expect.stringMatching(/^reconstruit : /)]);
  });
  it("refuse une fiche doublet d'elle-même", () => {
    expect(erreursDe({ doublets: ["etonner"] })).toContain("doublets : une fiche ne peut pas être son propre doublet");
  });

  const fiche = (mot: string, doublets: string[]) => ({
    fichier: cheminFiche(mot),
    texte: stringify({ ...ficheBase, mot, etymon: "potio", reconstruit: false, doublets }),
  });
  it("accepte des doublets réciproques", () => {
    expect(validerFiches([fiche("poison", ["potion"]), fiche("potion", ["poison"])]).erreurs).toEqual([]);
  });
  it("signale un doublet introuvable", () => {
    expect(validerFiches([fiche("poison", ["potion"])]).erreurs).toEqual([
      { fichier: "p/po/poison.yaml", champ: "doublets", regle: "fiche « potion » introuvable" },
    ]);
  });
  it("signale un doublet non réciproque", () => {
    expect(validerFiches([fiche("poison", ["potion"]), fiche("potion", [])]).erreurs).toEqual([
      { fichier: "p/po/poison.yaml", champ: "doublets", regle: "relation non réciproque : « potion » ne cite pas « poison »" },
    ]);
  });
  it("ne signale pas comme introuvable un doublet présent mais invalide", () => {
    const invalide = { fichier: "p/po/potion.yaml", texte: "mot: potion\n" };
    const { erreurs } = validerFiches([fiche("poison", ["potion"]), invalide]);
    expect(erreurs.every((e) => e.fichier === "p/po/potion.yaml")).toBe(true);
  });
});

describe("validerFiches : règles éditoriales", () => {
  it("refuse une explication de plus de 3 phrases", () => {
    expect(erreursDe({ explication: "Un. Deux. Trois. Quatre." })).toEqual([
      "explication : 1 à 3 phrases terminées par une ponctuation (4 trouvée(s))",
    ]);
  });
  it("refuse une explication sans ponctuation finale", () => {
    expect(erreursDe({ explication: "Sans point final" })).toEqual([expect.stringMatching(/0 trouvée/)]);
  });
  it("refuse une explication vide", () => {
    expect(valider({ explication: "  \n" }).erreurs.map((e) => e.champ)).toEqual(["explication"]);
  });
  it("refuse une explication de plus de 300 caractères", () => {
    expect(erreursDe({ explication: "é".repeat(300) + "." })).toEqual(["explication : 300 caractères maximum (301)"]);
  });
  it("refuse des guillemets dans le sens", () => {
    expect(erreursDe({ sens: "« frapper du tonnerre »" })).toEqual([
      "sens : sans guillemets : l'app les ajoute à l'affichage",
    ]);
  });
  it.each([
    ["explication", { explication: "Il faut noter ceci : rien." }],
    ["historique.0.note", { historique: [{ date: "2026-09-23", note: "Corrigée ; voir la source." }] }],
    [
      "lectureTraditionnelle.texte",
      { lectureTraditionnelle: { texte: "Relier ?", auteur: "Lactance", source: "Institutions divines, IV, 28" } },
    ],
  ])("vérifie la typographie du champ %s", (champ, surcharges) => {
    expect(valider(surcharges).erreurs).toEqual([
      expect.objectContaining({ champ, regle: expect.stringMatching(/espace insécable/) }),
    ]);
  });
});

describe("validerComptes", () => {
  const ligne = { date: "2026-10-01", type: "cout", categorie: "domaine", libelle: "Nom de domaine", montant: 12, justificatif: null };
  const valider = (valeur: unknown) => validerComptes({ fichier: "comptes.json", texte: JSON.stringify(valeur) });

  it("accepte des comptes vides ou conformes", () => {
    expect(valider([]).erreurs).toEqual([]);
    expect(valider([ligne, { ...ligne, type: "don", justificatif: "recu-2026-10.pdf" }]).comptes).toHaveLength(2);
  });
  it.each([
    ["0.montant", { montant: -5 }],
    ["0.montant", { montant: 0 }],
    ["0.type", { type: "cadeau" }],
    ["0.date", { date: "2026-02-30" }],
    ["0", { remarque: "champ inconnu" }],
  ])("signale le champ %s", (champ, surcharges) => {
    expect(valider([{ ...ligne, ...surcharges }]).erreurs.map((e) => e.champ)).toEqual([champ]);
  });
  it("signale un JSON illisible", () => {
    expect(validerComptes({ fichier: "comptes.json", texte: "[{" }).erreurs[0].regle).toMatch(/JSON illisible/);
  });
});

describe("validerCandidats", () => {
  const valider = (fichiers: Record<string, string>, idsFiches: string[] = []) =>
    validerCandidats(
      Object.entries(fichiers).map(([fichier, texte]) => ({ fichier, texte })),
      new Set(idsFiches),
    );
  const regles = (resultat: ReturnType<typeof valider>) =>
    resultat.erreurs.map((e) => `${e.fichier} › ${e.champ} : ${e.regle}`);

  it("accepte des listes conformes", () => {
    const { candidats, erreurs } = valider({
      "e.yaml": "- { mot: étonner, statut: a-faire }\n- { mot: ennui, statut: sans-source, raison: Aucune entrée. }\n",
      "c.yaml": "- { mot: chétif, statut: ecarte, raison: Hors critère. }\n",
    });
    expect(erreurs).toEqual([]);
    expect(candidats.map((c) => c.mot)).toEqual(["étonner", "ennui", "chétif"]);
  });
  it("exige une raison pour un mot sans source ou écarté", () => {
    expect(regles(valider({ "e.yaml": "- { mot: ennui, statut: ecarte }\n" }))).toEqual([
      "e.yaml › 0.raison : raison obligatoire pour un mot sans source ou écarté",
    ]);
  });
  it("refuse un statut inconnu", () => {
    expect(valider({ "e.yaml": "- { mot: ennui, statut: fait }\n" }).erreurs.map((e) => e.champ)).toEqual(["0.statut"]);
  });
  it("refuse une liste qui n'en est pas une", () => {
    expect(valider({ "e.yaml": "mot: ennui\n" }).erreurs.map((e) => e.champ)).toEqual(["(racine)"]);
  });
  it.each(["E.yaml", "ab.yaml", "e.yml", "é.yaml"])("refuse le nom de liste %s", (fichier) => {
    expect(valider({ [fichier]: "[]\n" }).erreurs.map((e) => e.champ)).toEqual(["(fichier)"]);
  });
  it("range chaque mot dans la liste de son initiale sans accent", () => {
    expect(valider({ "e.yaml": "- { mot: étonner, statut: a-faire }\n" }).erreurs).toEqual([]);
    expect(regles(valider({ "e.yaml": "- { mot: chétif, statut: a-faire }\n" }))).toEqual([
      "e.yaml › 0.mot : « chétif » doit être rangé dans « c.yaml »",
    ]);
  });
  it("refuse un candidat qui a déjà une fiche", () => {
    expect(regles(valider({ "e.yaml": "- { mot: étonner, statut: a-faire }\n" }, ["etonner"]))).toEqual([
      "e.yaml › 0.mot : « étonner » a déjà une fiche : le retirer des candidats",
    ]);
  });
  it("refuse un candidat en double, même dans une autre casse", () => {
    expect(regles(valider({ "e.yaml": "- { mot: ennui, statut: a-faire }\n- { mot: Ennui, statut: a-faire }\n" }))).toEqual([
      "e.yaml › 1.mot : « Ennui » figure déjà dans e.yaml",
    ]);
  });
  it("signale un alias YAML", () => {
    expect(valider({ "e.yaml": "- { mot: *ennui, statut: a-faire }\n" }).erreurs[0].regle).toMatch(/alias/);
  });
});
