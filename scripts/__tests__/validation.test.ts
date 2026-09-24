import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import type { Auteur, Ouvrage } from "../../src/lib/types.ts";
import {
  cheminFiche,
  compterPhrases,
  referentiel,
  slug,
  validerAuteurs,
  validerCandidats,
  validerComptes,
  validerFiches,
  validerOuvrages,
  verifierTypographie,
  type Erreur,
} from "../lib/validation.ts";

const NBSP = String.fromCharCode(0xa0);
const FINE = String.fromCharCode(0x202f);

/** Auteurs et ouvrages que les fiches de test peuvent citer. */
const socle = { sources: [], redaction: [{ par: "IA" as const, detail: "test" }], statut: "a-verifier" as const, historique: [] };
const auteur = (id: string, nom: string, traditions?: Auteur["traditions"]): Auteur => ({ id, nom, description: "Test.", traditions, ...socle });
const ouvrage = (id: string, titre: string, champs: Partial<Ouvrage> = {}): Ouvrage => ({
  id,
  titre,
  licence: "domaine public",
  description: "Test.",
  ...socle,
  ...champs,
});
const REF = referentiel(
  [
    auteur("ciceron", "Cicéron"),
    auteur("lactance", "Lactance", ["chrétienne"]),
    auteur("augustin", "Augustin", ["chrétienne"]),
    auteur("eugen-bleuler", "Eugen Bleuler"),
    // Un auteur qui parle dans plusieurs traditions (comme Guénon) : chaque lecture précise la sienne.
    auteur("passeur", "Passeur", ["juive", "chrétienne"]),
  ],
  [
    ouvrage("littre", "Dictionnaire de la langue française", { abrege: "Littré", modeleEntree: "https://www.littre.org/definition/{entree}" }),
    ouvrage("gaffiot", "Dictionnaire latin-français", { abrege: "Gaffiot", modeleEntree: "https://gaffiot.fr/#{entree}" }),
    ouvrage("bailly", "Dictionnaire grec-français", { abrege: "Bailly", modeleEntree: "https://bailly.app/{grec}" }),
    ouvrage("papier", "Un livre sans adresse"),
    ouvrage("institutions-divines", "Institutions divines", { auteur: "lactance" }),
    ouvrage("la-cite-de-dieu", "La Cité de Dieu", { auteur: "augustin" }),
    ouvrage("traite", "Traité", { auteur: "passeur" }),
    ouvrage("recueil", "Recueil"),
    ouvrage("talmud", "Talmud", { traditions: ["juive"] }),
    ouvrage("ecriture", "Écriture", { traditions: ["juive", "chrétienne"] }),
  ],
);

/** Fiche conforme servant de base ; chaque test n'en modifie qu'un aspect. */
const ficheBase = {
  mot: "étonner",
  nature: ["verbe"],
  etymologie: [
    { forme: "*extonare", langue: "latin populaire", sens: "frapper du tonnerre" },
    { forme: "*(s)tenh₂-", langue: "indo-européen", sens: "retentir, gronder" },
  ],
  explication: "Le mot désignait un ébranlement violent, avant de s'affaiblir en simple surprise.\n",
  incertain: false,
  doublets: [],
  famille: ["tonner", "tonnerre", "détonation"],
  themes: ["émotions", "météo"],
  sources: [
    { ouvrage: "littre", entree: "étonner" },
    { ouvrage: "gaffiot", entree: "extono" },
  ],
  redaction: [{ par: "IA", detail: "Claude Opus 5.5" }],
  tradition: { lectures: [] },
  statut: "brouillon",
  historique: [],
};

/** Lecture traditionnelle conforme : citation et texte en ligne. */
const lectureBase = {
  texte: "Lecture.",
  citation: "hoc uinculo pietatis obstricti deo et religati sumus",
  // Pas d'auteur : Lactance se déduit des Institutions divines.
  sources: [{ ouvrage: "institutions-divines", entree: "IV, 28, 3", url: "https://la.wikisource.org/wiki/Divinae_institutiones/Liber_IV" }],
};

/** Origine débattue conforme, pour les lectures qui visent une hypothèse. */
const chaineDebattue = [
  { forme: "religio", langue: "latin", sens: "attention scrupuleuse" },
  {
    langue: "latin",
    alternatives: {
      mode: "debattue",
      formes: [
        { forme: "relegere", sens: "reprendre avec soin", selon: ["ciceron"] },
        { forme: "religare", sens: "relier", selon: ["lactance"] },
      ],
    },
  },
];

function valider(surcharges: Record<string, unknown> = {}, fichier = "e/et/etonner.yaml") {
  return validerFiches([{ fichier, texte: stringify({ ...ficheBase, ...surcharges }) }], REF);
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
    ["Isidore de Séville", "isidore-de-seville"],
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
    expect(verifierTypographie(`Ainsi${NBSP}: oui${FINE}; vraiment${NBSP}?!`)).toEqual([]);
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

describe("validerFiches : fiches conformes", () => {
  it("renvoie la fiche avec son id, sans erreur", () => {
    const { fiches, erreurs } = valider();
    expect(erreurs).toEqual([]);
    expect(fiches[0]).toMatchObject({ id: "etonner", mot: "étonner" });
  });
  it("retire le saut de ligne final du bloc replié de l'explication", () => {
    expect(valider().fiches[0].explication?.endsWith(".")).toBe(true);
  });
  it("accepte une fiche sans ses champs facultatifs, et leur donne leur valeur par défaut", () => {
    const { incertain: _i, doublets: _d, famille: _f, tradition: _t, historique: _h, ...minimale } = ficheBase;
    const { fiches, erreurs } = validerFiches([{ fichier: "e/et/etonner.yaml", texte: stringify(minimale) }], REF);
    expect(erreurs).toEqual([]);
    expect(fiches[0]).toMatchObject({ incertain: false, doublets: [], famille: [], renvois: [], ecartees: [], tradition: { lectures: [], renvois: [] } });
  });
  it("accepte des lectures, des étymologies écartées et un historique daté", () => {
    const texte = stringify({
      ...ficheBase,
      etymologie: chaineDebattue,
      tradition: { lectures: [lectureBase, { ...structuredClone(lectureBase), texte: "Autre lecture.", hypothese: "religare" }] },
      ecartees: [
        { forme: "sine cera", sens: "sans cire", raison: "Une étymologie de fantaisie.", populaire: true },
        { forme: "per sonare", sens: "résonner à travers", selon: ["ciceron"] },
      ],
      historique: [{ date: "2026-09-23", note: "Corrigée suite à une Critique." }],
    });
    expect(validerFiches([{ fichier: "e/et/etonner.yaml", texte }], REF).erreurs).toEqual([]);
  });
  it("accepte une fiche a-verifier sans source", () => {
    expect(erreursDe({ statut: "a-verifier", sources: [] })).toEqual([]);
  });
  it("accepte la rédaction d'Étymon à côté de celle de l'IA", () => {
    expect(erreursDe({ redaction: [...ficheBase.redaction, { par: "Étymon", detail: "correction suite à une Critique" }] })).toEqual([]);
  });
  it("accepte une lecture avec rédaction propre", () => {
    const lecture = { ...lectureBase, redaction: [{ par: "Étymon", detail: "rédaction de Thibault" }] };
    expect(erreursDe({ tradition: { lectures: [lecture] } })).toEqual([]);
  });
  it("accepte une voie, une composition et un mot forgé (schizophrénie)", () => {
    const etymologie = [
      { forme: "Schizophrenie", langue: "allemand", forge: { par: ["eugen-bleuler"], date: 1911 } },
      {
        langue: "grec ancien",
        sens: "esprit fendu",
        elements: [
          { forme: "σχίζω", sens: "fendre" },
          { forme: "φρήν", sens: "diaphragme" },
        ],
      },
    ];
    expect(erreursDe({ etymologie })).toEqual([]);
    expect(valider({ etymologie }).fiches[0].etymologie[0].forge?.date).toBe("1911");
  });
  it("accepte une date approximative et une attribution incertaine", () => {
    const etymologie = [{ forme: "autrui", langue: "français", sens: "les autres", forge: { par: ["ciceron", "lactance"], date: "vers 1830" } }];
    expect(erreursDe({ etymologie })).toEqual([]);
  });
  it("accepte une forme et sa composition, un calque, un double sens voulu", () => {
    const etymologie = [
      { forme: "persona", langue: "latin", sens: "masque", modele: { forme: "πρόσωπον", langue: "grec ancien", sens: "visage", relation: "calque" } },
      { forme: "φιλοσοφία", langue: "grec ancien", sens: "amour de la sagesse", elements: [{ forme: "φίλος", sens: "ami" }, { forme: "σοφία", sens: "sagesse" }] },
      {
        langue: "grec ancien",
        alternatives: {
          mode: "jeu",
          formes: [
            { sens: "nulle part", elements: [{ forme: "οὐ", sens: "non" }, { forme: "τόπος", sens: "lieu" }] },
            { sens: "lieu du bonheur", elements: [{ forme: "εὖ", sens: "bien" }, { forme: "τόπος", sens: "lieu" }] },
          ],
        },
      },
    ];
    expect(erreursDe({ etymologie })).toEqual([]);
  });
  it("accepte une écriture arabe avec sa translittération, et un nom de personne ou un titre", () => {
    const etymologie = [
      { forme: "cifra", langue: "latin médiéval", sens: "zéro", personne: "ciceron" },
      { forme: "صفر", translitteration: "ṣifr", langue: "arabe", sens: "vide", ouvrage: "papier" },
    ];
    expect(erreursDe({ etymologie })).toEqual([]);
  });
  it("accepte une entrée du Bailly sans adresse, une adresse qui diffère, une page", () => {
    expect(
      erreursDe({
        sources: [
          { ouvrage: "bailly", entree: "κριτικός" },
          { ouvrage: "littre", entree: "critique", url: "https://www.littre.org/definition/critique.2" },
          { ouvrage: "papier", entree: "critique", page: 12 },
        ],
      }),
    ).toEqual([]);
  });
  it("accepte un suffixe numérique pour les homonymes", () => {
    expect(erreursDe({}, "e/et/etonner-2.yaml")).toEqual([]);
  });
});

describe("validerFiches : lecture YAML", () => {
  it("explique le piège de la forme reconstruite non mise entre guillemets", () => {
    const texte = stringify(ficheBase).replace('"*extonare"', "*extonare");
    const { erreurs } = validerFiches([{ fichier: "e/et/etonner.yaml", texte }], REF);
    expect(erreurs[0].regle).toMatch(/YAML illisible/);
    expect(erreurs[0].regle).toMatch(/entre guillemets/);
  });
  it("refuse « : » non protégé dans une valeur", () => {
    const texte = stringify(ficheBase).replace("sens: frapper du tonnerre", "sens: frapper: fort");
    expect(validerFiches([{ fichier: "e/et/etonner.yaml", texte }], REF).erreurs[0].regle).toMatch(/YAML illisible/);
  });
  it("refuse une clé en double", () => {
    const texte = stringify(ficheBase) + "mot: autre\n";
    expect(validerFiches([{ fichier: "e/et/etonner.yaml", texte }], REF).erreurs[0].regle).toMatch(/YAML illisible/);
  });
});

describe("validerFiches : structure", () => {
  it("signale un champ obligatoire manquant", () => {
    const { etymologie: _, ...sansChaine } = ficheBase;
    const { erreurs } = validerFiches([{ fichier: "e/et/etonner.yaml", texte: stringify(sansChaine) }], REF);
    expect(erreurs.map((e) => e.champ)).toEqual(["etymologie"]);
  });
  it("refuse un champ inconnu", () => {
    expect(erreursDe({ etymon: "extonare" })).toEqual([expect.stringMatching(/^\(racine\) : .*etymon/)]);
  });
  const maillon = (m: Record<string, unknown>) => ({ etymologie: [m] });
  const deux = [
    { forme: "a", sens: "b" },
    { forme: "c", sens: "d" },
  ];
  it.each([
    ["statut", { statut: "publiee" }],
    ["themes.0", { themes: ["inconnu"] }],
    ["etymologie", { etymologie: [] }],
    ["etymologie.0.langue", maillon({ forme: "x", langue: "klingon", sens: "y" })],
    ["etymologie.0.forme", maillon({ langue: "latin", sens: "y" })],
    ["etymologie.0.forme", maillon({ forme: "x", langue: "latin", alternatives: { mode: "debattue", formes: deux } })],
    ["etymologie.0.elements", maillon({ langue: "latin", elements: [{ forme: "x", sens: "y" }] })],
    ["etymologie.0.alternatives.mode", maillon({ langue: "latin", alternatives: { mode: "hypothese", formes: deux } })],
    ["etymologie.0.alternatives.formes", maillon({ langue: "latin", alternatives: { mode: "debattue", formes: [{ forme: "a", sens: "b" }] } })],
    ["etymologie.0.forge.date", maillon({ forme: "x", langue: "latin", sens: "y", forge: { par: ["ciceron"], date: "l'an 1911" } })],
    ["etymologie.0.forge.par", maillon({ forme: "x", langue: "latin", sens: "y", forge: { par: [], date: 1911 } })],
    ["etymologie.0.modele.relation", maillon({ forme: "x", langue: "latin", sens: "y", modele: { forme: "z", langue: "latin", relation: "emprunt" } })],
    ["sources.0.ouvrage", { sources: [{ ouvrage: "Wiktionnaire", entree: "étonner" }] }],
    ["sources.0.url", { sources: [{ ouvrage: "littre", entree: "étonner", url: "http://example.org/etonner" }] }],
    ["sources", { sources: [] }],
    ["sources", { sources: [], statut: "validee" }],
    ["redaction", { redaction: [] }],
    ["redaction.0.par", { redaction: [{ par: "Robot", detail: "x" }] }],
    ["incertain", { incertain: "non" }],
    ["historique.0.date", { historique: [{ date: "23/09/2026", note: "Correction." }] }],
    ["tradition.lectures.0.sources", { tradition: { lectures: [{ ...lectureBase, sources: [] }] } }],
    ["tradition.lectures.0.citation", { tradition: { lectures: [{ ...lectureBase, citation: undefined }] } }],
    ["tradition.lectures.0.sources.0.url", { tradition: { lectures: [{ ...lectureBase, sources: [{ ouvrage: "institutions-divines", entree: "IV" }] }] } }],
    ["tradition", { tradition: null }],
    ["nature.0", { nature: ["substantif"] }],
    ["renvois", { renvois: ["a", "b", "c", "d"] }],
    ["ecartees.0.sens", { ecartees: [{ forme: "sine cera" }] }],
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

describe("validerFiches : emplacement et identifiant", () => {
  it.each(["etonner.yaml", "e/etonner.yaml", "e/ep/etonner.yaml", "x/et/etonner.yaml", "e/et/x/etonner.yaml"])("refuse une fiche rangée dans %s", (fichier) => {
    expect(erreursDe({}, fichier)).toEqual(["(emplacement) : la fiche doit être rangée dans « e/et/etonner.yaml »"]);
  });
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
    const { erreurs } = validerFiches(
      [
        { fichier: "e/et/etonner.yaml", texte },
        { fichier: "e/et/etonner.yaml", texte },
      ],
      REF,
    );
    expect(erreurs).toEqual([{ fichier: "e/et/etonner.yaml", champ: "id", regle: "id « etonner » en double" }]);
  });
});

describe("validerFiches : chaîne étymologique", () => {
  it("refuse une translittération inutile ou manquante", () => {
    expect(erreursDe({ etymologie: [{ forme: "religio", translitteration: "religio", langue: "latin", sens: "y" }] })).toEqual([
      "etymologie.0.translitteration : inutile pour une forme en alphabet latin",
    ]);
    expect(erreursDe({ etymologie: [{ forme: "φρήν", translitteration: "phrên", langue: "grec ancien", sens: "y" }] })).toEqual([
      "etymologie.0.translitteration : inutile pour le grec : elle se déduit de la forme",
    ]);
    expect(erreursDe({ etymologie: [{ forme: "صفر", langue: "arabe", sens: "vide" }] })).toEqual([
      "etymologie.0.translitteration : obligatoire pour une écriture ni latine ni grecque",
    ]);
  });
  it("exige un sens premier, même pour une composition, et un seul maillon premier", () => {
    const regle = "etymologie : aucun maillon ne porte de sens (une composition porte le sens littéral de ses éléments : « esprit fendu »)";
    expect(erreursDe({ etymologie: [{ forme: "x", langue: "latin" }] })).toEqual([regle]);
    expect(erreursDe({ etymologie: [{ langue: "grec ancien", elements: [{ forme: "σχίζω", sens: "fendre" }, { forme: "φρήν", sens: "diaphragme" }] }] })).toEqual([regle]);
    const deuxPremiers = [
      { forme: "x", langue: "latin", sens: "a", premier: true },
      { forme: "y", langue: "latin", sens: "b", premier: true },
    ];
    expect(erreursDe({ etymologie: deuxPremiers })).toEqual(["etymologie : un seul maillon peut porter premier: true"]);
  });
  it("réserve les tenants aux origines débattues", () => {
    const etymologie = [
      { forme: "x", langue: "latin", sens: "y" },
      { langue: "latin", alternatives: { mode: "jeu", formes: [{ forme: "a", sens: "b", selon: ["ciceron"] }, { forme: "c", sens: "d" }] } },
    ];
    expect(erreursDe({ etymologie })).toEqual(["etymologie.1.alternatives.formes.0.selon : des tenants seulement pour une origine débattue (mode: debattue)"]);
  });
  it("refuse un nom de personne ou un titre sans forme", () => {
    const etymologie = [{ langue: "latin", sens: "e", elements: [{ forme: "a", sens: "b" }, { forme: "c", sens: "d" }], personne: "ciceron" }];
    expect(erreursDe({ etymologie })).toEqual(["etymologie.0 : personne ou ouvrage : seulement pour une forme (nom propre, titre)"]);
  });
});

describe("validerFiches : références", () => {
  const debattue = (selon: string[]) => [
    { forme: "x", langue: "latin", sens: "y" },
    { langue: "latin", alternatives: { mode: "debattue", formes: [{ forme: "a", sens: "b", selon }, { forme: "c", sens: "d" }] } },
  ];
  it.each([
    ["auteur", { etymologie: [{ forme: "x", langue: "latin", sens: "y", forge: { par: ["inconnu"], date: 1900 } }] }, "etymologie.0.forge.par.0 : auteur « inconnu » sans fiche (data/auteurs)"],
    ["ouvrage", { sources: [{ ouvrage: "wiktionnaire", entree: "x" }] }, "sources.0.ouvrage : ouvrage « wiktionnaire » sans fiche (data/ouvrages)"],
    ["tenant", { etymologie: debattue(["varron"]) }, "etymologie.1.alternatives.formes.0.selon.0 : auteur « varron » sans fiche (data/auteurs)"],
    ["personne", { etymologie: [{ forme: "x", langue: "latin", sens: "y", personne: "inconnu" }] }, "etymologie.0.personne : auteur « inconnu » sans fiche (data/auteurs)"],
  ])("refuse une référence (%s) sans fiche", (_, surcharges, attendu) => {
    expect(erreursDe(surcharges)).toEqual([attendu]);
  });
  it("refuse une adresse qui se déduit de l'entrée (doublon), Bailly compris", () => {
    expect(erreursDe({ sources: [{ ouvrage: "littre", entree: "étonner", url: "https://www.littre.org/definition/%C3%A9tonner" }] })).toEqual([
      "sources.0.url : adresse inutile : elle se déduit de l'entrée, la retirer",
    ]);
    expect(erreursDe({ sources: [{ ouvrage: "bailly", entree: "κριτικός", url: "https://bailly.app/kritikos" }] })).toEqual([
      "sources.0.url : adresse inutile : elle se déduit de l'entrée, la retirer",
    ]);
  });
  it("exige une page ou une adresse pour un ouvrage sans modèle d'adresse", () => {
    expect(erreursDe({ sources: [{ ouvrage: "papier", entree: "x" }] })).toEqual([
      "sources.0.url : indiquer une page ou une url (l'adresse de cet ouvrage ne se déduit pas de l'entrée)",
    ]);
  });
  it("déduit la voix de l'œuvre, et n'écrit l'auteur que pour une parole rapportée par une autre voix", () => {
    expect(erreursDe({ tradition: { lectures: [{ ...lectureBase, auteur: "lactance" }] } })).toEqual([
      "tradition.lectures.0.auteur : se déduit de l'œuvre : ne l'écrire que pour une parole rapportée par une autre voix",
    ]);
    // Une parole rapportée par une œuvre d'un autre (Varron chez Augustin) : ici Cicéron, hors tradition.
    const rapportee = { ...lectureBase, auteur: "ciceron", sources: [{ ...lectureBase.sources[0], ouvrage: "la-cite-de-dieu" }] };
    expect(erreursDe({ tradition: { lectures: [rapportee] } })).toEqual([
      "tradition.lectures.0.auteur : Cicéron n'est pas une voix de la tradition (traditions)",
    ]);
    expect(erreursDe({ tradition: { lectures: [{ ...rapportee, auteur: "augustin", sources: lectureBase.sources }] } })).toEqual([]);
  });
  it("refuse deux voix dans une même lecture", () => {
    const sources = [...lectureBase.sources, { ...lectureBase.sources[0], ouvrage: "la-cite-de-dieu" }];
    expect(erreursDe({ tradition: { lectures: [{ ...lectureBase, sources }] } })).toEqual([
      "tradition.lectures.0.sources : une lecture a une seule voix : des œuvres d'auteurs différents font deux lectures",
    ]);
  });
  it("déduit la tradition d'une voix qui n'en a qu'une, et l'exige d'un auteur qui en a plusieurs", () => {
    expect(erreursDe({ tradition: { lectures: [{ ...lectureBase, tradition: "chrétienne" }] } })).toEqual([
      "tradition.lectures.0.tradition : se déduit de la voix (chrétienne) : ne pas l'écrire",
    ]);
    const lecture = { ...lectureBase, sources: [{ ...lectureBase.sources[0], ouvrage: "traite" }] };
    expect(erreursDe({ tradition: { lectures: [lecture] } })).toEqual([
      "tradition.lectures.0.tradition : Passeur parle dans plusieurs traditions : préciser laquelle (juive, chrétienne)",
    ]);
    expect(erreursDe({ tradition: { lectures: [{ ...lecture, tradition: "juive" }] } })).toEqual([]);
  });
  it("accepte une œuvre collective qui rapporte une parole de sa tradition (Resh Lakish dans le Talmud)", () => {
    const lecture = { ...lectureBase, auteur: "lactance", sources: [{ ...lectureBase.sources[0], ouvrage: "recueil" }] };
    expect(erreursDe({ tradition: { lectures: [lecture] } })).toEqual([]);
    expect(erreursDe({ tradition: { lectures: [{ ...lecture, sources: [{ ...lecture.sources[0], ouvrage: "talmud" }] }] } })).toEqual([
      "tradition.lectures.0.auteur : Lactance ne parle pas dans la tradition de « Talmud » (juive)",
    ]);
  });
  it("laisse l'Écriture reçue en commun parler dans toutes ses traditions, sans en préciser une", () => {
    const lecture = { ...lectureBase, sources: [{ ...lectureBase.sources[0], ouvrage: "ecriture" }] };
    expect(erreursDe({ tradition: { lectures: [lecture] } })).toEqual([]);
  });
  it("refuse une lecture qui vise une hypothèse absente de la chaîne", () => {
    expect(erreursDe({ tradition: { lectures: [{ ...lectureBase, hypothese: "religare" }] } })).toEqual([
      "tradition.lectures.0.hypothese : « religare » n'est pas une hypothèse de la chaîne (alternatives)",
    ]);
  });
});

describe("validerFiches : mentions", () => {
  const ref = referentiel(
    [
      { ...auteur("thomas-more", "Thomas More"), cite: ["Thomas"] },
      { ...auteur("thomas-d-aquin", "Thomas d'Aquin", ["chrétienne"]), cite: ["Thomas"] },
    ],
    [],
  );
  const etymologie = [
    { forme: "x", langue: "latin", sens: "y" },
    { langue: "latin", alternatives: { mode: "debattue", formes: [{ forme: "a", sens: "b", selon: ["thomas-more"] }, { forme: "c", sens: "d", selon: ["thomas-d-aquin"] }] } },
  ];
  const erreurs = (explication: string) =>
    validerFiches([{ fichier: "e/et/etonner.yaml", texte: stringify({ ...ficheBase, sources: [], statut: "a-verifier", etymologie, explication }) }], ref).erreurs.map(
      (e) => `${e.champ} : ${e.regle}`,
    );
  it("refuse une forme qui, dans la fiche, désignerait deux auteurs", () => {
    expect(erreurs("Thomas le disait.")).toEqual(["(textes) : « Thomas » désigne plusieurs auteurs ou ouvrages cités par la fiche : écrire le nom complet"]);
  });
  it("accepte la forme ambiguë tant qu'elle n'est pas écrite, et le nom complet", () => {
    expect(erreurs("Thomas More le disait.")).toEqual([]);
  });
});

describe("validerFiches : doublets et renvois", () => {
  const fiche = (mot: string, champs: Record<string, unknown>) => ({
    fichier: cheminFiche(mot),
    texte: stringify({ ...ficheBase, mot, ...champs }),
  });
  it("refuse une fiche doublet ou renvoi d'elle-même, et un renvoi vers un doublet ou la famille", () => {
    expect(erreursDe({ doublets: ["etonner"] })).toContain("doublets : une fiche ne peut pas être son propre doublet");
    expect(erreursDe({ renvois: ["etonner"] })).toContain("renvois : une fiche ne peut pas renvoyer à elle-même");
    expect(erreursDe({ renvois: ["tonnerre"] })).toContain("renvois : « tonnerre » est un doublet ou de la famille : pas un renvoi");
  });
  it.each(["doublets", "renvois"])("%s : déclaré d'un seul côté, vers une fiche existante", (champ) => {
    expect(validerFiches([fiche("poison", { [champ]: ["potion"] }), fiche("potion", {})], REF).erreurs).toEqual([]);
    expect(validerFiches([fiche("poison", { [champ]: ["potion"] }), fiche("potion", { [champ]: ["poison"] })], REF).erreurs).toEqual([
      { fichier: "p/po/potion.yaml", champ, regle: "relation déjà déclarée dans « poison » : ne la déclarer que sur une des deux fiches" },
    ]);
  });
  it("doublet : vers une fiche existante seulement", () => {
    expect(validerFiches([fiche("poison", { doublets: ["potion"] })], REF, new Set(["potion"])).erreurs).toEqual([
      { fichier: "p/po/poison.yaml", champ: "doublets", regle: "fiche « potion » introuvable" },
    ]);
  });
  it.each(["renvois", "tradition.renvois"])("%s : vers une fiche ou un candidat à faire", (champ) => {
    const champs = champ === "renvois" ? { renvois: ["potion"] } : { tradition: { renvois: ["potion"] } };
    expect(validerFiches([fiche("poison", champs)], REF, new Set(["potion"])).erreurs).toEqual([]);
    expect(validerFiches([fiche("poison", champs)], REF).erreurs).toEqual([
      { fichier: "p/po/poison.yaml", champ, regle: "fiche « potion » introuvable, ni candidat à faire" },
    ]);
  });
  it("tradition.renvois : à sens unique, jamais vers soi-même", () => {
    const vers = (cible: string) => ({ tradition: { renvois: [cible] } });
    expect(validerFiches([fiche("poison", vers("potion")), fiche("potion", vers("poison"))], REF).erreurs).toEqual([]);
    expect(erreursDe(vers("etonner"))).toContain("tradition.renvois : une fiche ne peut pas renvoyer à elle-même");
  });
  it("ne signale pas comme introuvable un doublet présent mais invalide", () => {
    const { erreurs } = validerFiches([fiche("poison", { doublets: ["potion"] }), { fichier: "p/po/potion.yaml", texte: "mot: potion\n" }], REF);
    expect(erreurs.every((e) => e.fichier === "p/po/potion.yaml")).toBe(true);
  });
});

describe("validerFiches : mots sacrés", () => {
  const formes = [
    { forme: "manna", langue: "latin ecclésiastique" },
    { forme: "מָן", translitteration: "mān", langue: "hébreu" },
  ];
  const origine = { ...lectureBase, premier: true, sens: "qu'est-ce que c'est", sources: [{ ...lectureBase.sources[0], ouvrage: "ecriture" }] };
  const sacree = { sacre: ["juive", "chrétienne"], explication: undefined, etymologie: formes, tradition: { lectures: [origine] } };
  it("accepte un mot sacré : les formes seules, le sens du texte d'origine, pas d'explication", () => {
    expect(erreursDe(sacree)).toEqual([]);
  });
  it("accepte, sans texte d'origine qui l'explique, le sens du seul maillon de la langue sacrée", () => {
    const etymologie = [formes[0], { ...formes[1], sens: "louez Yah" }];
    expect(erreursDe({ ...sacree, etymologie, tradition: { lectures: [] } })).toEqual([]);
  });
  it("refuse toute partie profane d'un mot sacré", () => {
    expect(erreursDe({ ...sacree, explication: "Une explication." })).toEqual(["explication : un mot sacré n'a pas d'explication profane : la retirer"]);
    expect(erreursDe({ ...sacree, etymologie: [{ ...formes[0], sens: "manne" }, formes[1]] })).toEqual([
      "etymologie : mot sacré dont le texte d'origine donne le sens (lecture premier) : les maillons n'ont pas de sens",
    ]);
  });
  it("demande un sens à la lecture premier, et la réserve à un mot sacré reçu par toutes ses traditions", () => {
    expect(erreursDe({ ...sacree, tradition: { lectures: [{ ...origine, sens: undefined }] } })).toContain(
      "tradition.lectures.0.sens : la lecture premier donne le sens affiché en tête",
    );
    expect(erreursDe({ tradition: { lectures: [origine] } })).toContain("tradition.lectures.0.premier : seulement pour un mot sacré (sacre)");
    const talmud = { ...origine, sources: [{ ...origine.sources[0], ouvrage: "talmud" }] };
    expect(erreursDe({ ...sacree, tradition: { lectures: [talmud] } })).toEqual([
      "tradition.lectures.0.premier : le texte d'origine doit être reçu par toutes les traditions du mot (juive, chrétienne)",
    ]);
  });
  it("refuse une lecture hors des traditions où le mot est sacré", () => {
    expect(erreursDe({ ...sacree, sacre: ["juive"], tradition: { lectures: [origine, lectureBase] } })).toEqual([
      "tradition.lectures.1 : lecture hors des traditions où le mot est sacré (juive)",
    ]);
  });
});

describe("validerFiches : règles éditoriales", () => {
  it("écrit le Nom divin comme le texte l'écrit, jamais vocalisé", () => {
    for (const nom of ["Jéhovah", "Iehovah", "Yahvé", "Yahweh", "Jahvé"]) {
      expect(erreursDe({ explication: `Louez ${nom}.` })).toEqual([
        "explication : Nom divin vocalisé (Jéhovah, Yahvé) : l'écrire comme le texte (Yah, YHWH)",
      ]);
    }
    expect(erreursDe({ explication: "Louez Yah." })).toEqual([]);
  });
  it("refuse une explication de plus de 3 phrases, sans ponctuation finale, vide ou trop longue", () => {
    expect(erreursDe({ explication: "Un. Deux. Trois. Quatre." })).toEqual(["explication : 1 à 3 phrases terminées par une ponctuation (4 trouvée(s))"]);
    expect(erreursDe({ explication: "Sans point final" })).toEqual([expect.stringMatching(/0 trouvée/)]);
    expect(valider({ explication: "  \n" }).erreurs.map((e) => e.champ)).toEqual(["explication"]);
    expect(erreursDe({ explication: "é".repeat(300) + "." })).toEqual(["explication : 300 caractères maximum (301)"]);
  });
  it("refuse des guillemets dans un sens, où qu'il soit", () => {
    expect(erreursDe({ etymologie: [{ forme: "x", langue: "latin", sens: "« frapper »" }] })).toEqual([
      "etymologie.0.sens : sans guillemets : l'app les ajoute à l'affichage",
    ]);
  });
  it.each([
    ["explication", { explication: "Il faut noter ceci : rien." }],
    ["historique.0.note", { historique: [{ date: "2026-09-23", note: "Corrigée ; voir la source." }] }],
    ["tradition.lectures.0.texte", { tradition: { lectures: [{ ...lectureBase, texte: "Relier ?" }] } }],
    ["ecartees.0.raison", { ecartees: [{ forme: "sine cera", sens: "sans cire", raison: "C'est faux : aucune trace.", populaire: true }] }],
    [
      "etymologie.1.elements.0.sens",
      { etymologie: [{ forme: "x", langue: "latin", sens: "a" }, { langue: "latin", elements: [{ forme: "y", sens: "relier ?" }, { forme: "z", sens: "b" }] }] },
    ],
  ])("vérifie la typographie du champ %s", (champ, surcharges) => {
    expect(valider(surcharges).erreurs).toEqual([expect.objectContaining({ champ, regle: expect.stringMatching(/espace insécable/) })]);
  });
});

describe("validerAuteurs et validerOuvrages", () => {
  const fichierAuteur = (fichier: string, champs: Record<string, unknown>) => ({
    fichier,
    texte: stringify({ nom: "Augustin", description: "Évêque d'Hippone.", ...socle, ...champs }),
  });
  it("accepte un auteur conforme, sans tradition par défaut, dates exactes ou approximatives", () => {
    const { auteurs, erreurs } = validerAuteurs([fichierAuteur("augustin.yaml", { naissance: 354, mort: "vers 430" })]);
    expect(erreurs).toEqual([]);
    expect(auteurs[0]).toMatchObject({ id: "augustin", naissance: "354", mort: "vers 430" });
    expect(auteurs[0].traditions).toBeUndefined();
  });
  it.each([
    ["id", "augustin-d-hippone.yaml", {}],
    ["description", "augustin.yaml", { description: "x".repeat(201) }],
    ["cite.0", "augustin.yaml", { cite: [""] }],
    ["naissance", "augustin.yaml", { naissance: "autrefois" }],
    ["traditions.0", "augustin.yaml", { traditions: ["païenne"] }],
  ])("signale le champ %s d'un auteur", (champ, fichier, champs) => {
    expect(validerAuteurs([fichierAuteur(fichier, champs)]).erreurs.map((e) => e.champ)).toEqual([champ]);
  });
  const fichierOuvrage = (fichier: string, champs: Record<string, unknown>) => ({
    fichier,
    texte: stringify({ titre: "Dictionnaire de la langue française", abrege: "Littré", licence: "CC BY-SA", description: "Test.", ...socle, ...champs }),
  });
  it("accepte un ouvrage conforme, nommé par son abrégé", () => {
    expect(validerOuvrages([fichierOuvrage("littre.yaml", { modeleEntree: "https://www.littre.org/definition/{entree}" })], new Map()).erreurs).toEqual([]);
  });
  it.each([
    ["id", "dictionnaire.yaml", {}],
    ["auteur", "littre.yaml", { auteur: "emile-littre" }],
    ["modeleEntree", "littre.yaml", { modeleEntree: "https://www.littre.org/definition/" }],
    ["licence", "littre.yaml", { licence: "libre" }],
  ])("signale le champ %s d'un ouvrage", (champ, fichier, champs) => {
    expect(validerOuvrages([fichierOuvrage(fichier, champs)], new Map()).erreurs.map((e) => e.champ)).toEqual([champ]);
  });
  it("ne donne des traditions qu'à une œuvre sans auteur (une œuvre d'auteur les tient de lui)", () => {
    const auteurs = new Map([["emile-littre", auteur("emile-littre", "Émile Littré")]]);
    expect(validerOuvrages([fichierOuvrage("littre.yaml", { traditions: ["juive"] })], auteurs).erreurs).toEqual([]);
    expect(validerOuvrages([fichierOuvrage("littre.yaml", { auteur: "emile-littre", traditions: ["juive"] })], auteurs).erreurs.map((e) => e.regle)).toEqual([
      "se déduisent de l'auteur : seulement pour une œuvre sans auteur (Talmud, Écriture)",
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
  const regles = (resultat: ReturnType<typeof valider>) => resultat.erreurs.map((e) => `${e.fichier} › ${e.champ} : ${e.regle}`);

  it("accepte des listes conformes", () => {
    const { candidats, erreurs } = valider({
      "e.yaml": "- { mot: étonner, statut: a-faire }\n- { mot: ennui, statut: sans-source, raison: Aucune entrée. }\n",
      "c.yaml": "- { mot: chétif, statut: ecarte, raison: Hors critère. }\n",
    });
    expect(erreurs).toEqual([]);
    expect(candidats.map((c) => c.mot)).toEqual(["étonner", "ennui", "chétif"]);
  });
  it("exige une raison pour un mot sans source ou écarté", () => {
    expect(regles(valider({ "e.yaml": "- { mot: ennui, statut: ecarte }\n" }))).toEqual(["e.yaml › 0.raison : raison obligatoire pour un mot sans source ou écarté"]);
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
    expect(regles(valider({ "e.yaml": "- { mot: chétif, statut: a-faire }\n" }))).toEqual(["e.yaml › 0.mot : « chétif » doit être rangé dans « c.yaml »"]);
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
