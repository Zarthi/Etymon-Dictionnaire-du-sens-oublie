import { describe, expect, it } from "vitest";
import * as langue from "../i18n/index.ts";
import { enTexte, hypotheses, phraseChaine } from "./phrase.ts";
import type { Maillon } from "./types.ts";

const NBSP = String.fromCharCode(0xa0);
const q = (sens: string) => `«${NBSP}${sens}${NBSP}»`;
const NOMS: Record<string, string> = {
  "eugen-bleuler": "Eugen Bleuler",
  "dementia-praecox": "Dementia praecox",
  "auguste-comte": "Auguste Comte",
  "francois-andrieux": "François Andrieux",
  ciceron: "Cicéron",
};
const phrase = (etymologie: Maillon[]) => enTexte(phraseChaine(etymologie, langue), (s) => NOMS[s.id] ?? s.id);

describe("la phrase de la chaîne", () => {
  it("mot forgé sur une composition : la langue de la matière, puis les éléments sans « de »", () => {
    const schizophrenie: Maillon[] = [
      { forme: "Schizophrenie", langue: "allemand", forge: { par: ["eugen-bleuler"], date: "1911", ouvrage: "dementia-praecox" } },
      { langue: "grec ancien", sens: "esprit fendu", elements: [{ forme: "σχίζω", sens: "fendre" }, { forme: "φρήν", sens: "diaphragme" }] },
    ];
    expect(phrase(schizophrenie)).toBe(
      `De l'allemand Schizophrenie, forgé par Eugen Bleuler (1911), dans Dementia praecox, sur le grec ancien σχίζω, ${q("fendre")}, et φρήν, ${q("diaphragme")}.`,
    );
  });

  it("mot composé en français, attribution incertaine, modèle, puis « plus haut » l'un des éléments", () => {
    const altruisme: Maillon[] = [
      {
        langue: "français",
        elements: [{ forme: "autrui", sens: "les autres" }, { forme: "-isme", sens: "doctrine, penchant" }],
        forge: { par: ["auguste-comte", "francois-andrieux"], date: "vers 1830" },
        modele: { forme: "égoïsme", langue: "français", relation: "analogie" },
      },
      { forme: "alter", langue: "latin", sens: "l'autre, de deux" },
    ];
    expect(phrase(altruisme)).toBe(
      `Composé d'autrui, ${q("les autres")}, et de -isme, ${q("doctrine, penchant")}, forgé par Auguste Comte ou François Andrieux (vers 1830), sur le modèle d'égoïsme${NBSP}; plus haut, du latin alter.`,
    );
  });

  it("filiation : chaque langue introduite, le sens premier seul non répété", () => {
    const chiffre: Maillon[] = [
      { forme: "cifra", langue: "latin médiéval", sens: "zéro" },
      { forme: "صفر", translitteration: "ṣifr", langue: "arabe", sens: "vide" },
    ];
    expect(phrase(chiffre)).toBe(`Du latin médiéval cifra, ${q("zéro")}, de l'arabe صفر.`);
  });

  it("sens premier forcé plus haut dans la chaîne : c'est lui qui n'est pas répété", () => {
    const personne: Maillon[] = [
      { forme: "persona", langue: "latin", sens: "masque de l'acteur", premier: true },
      { forme: "φersu", langue: "étrusque", sens: "personnage masqué" },
    ];
    expect(phrase(personne)).toBe(`Du latin persona, de l'étrusque φersu, ${q("personnage masqué")}.`);
  });
});

describe("les hypothèses", () => {
  const religion: Maillon[] = [
    { forme: "religio", langue: "latin", sens: "attention scrupuleuse, scrupule" },
    {
      langue: "latin",
      alternatives: {
        mode: "debattue",
        formes: [
          { forme: "relegere", sens: "reprendre avec soin", elements: [{ forme: "re-", sens: "de nouveau" }, { forme: "legere", sens: "recueillir" }], selon: ["ciceron"] },
          { forme: "religare", sens: "attacher", selon: ["lactance"] },
        ],
      },
    },
  ];

  it("la chaîne s'arrête avant les alternatives", () => {
    expect(phrase(religion)).toBe("Du latin religio.");
  });

  it("une par ligne, le tout d'abord puis ses parties après deux-points, les tenants à part", () => {
    const { titre, lignes } = hypotheses(religion[1], langue);
    expect(titre).toBe("Origine débattue");
    expect(lignes.map((l) => enTexte(l.segments))).toEqual([
      `De relegere, ${q("reprendre avec soin")}${NBSP}: re-, ${q("de nouveau")}, et legere, ${q("recueillir")}`,
      `De religare, ${q("attacher")}`,
    ]);
    expect(lignes.map((l) => l.selon)).toEqual([["ciceron"], ["lactance"]]);
  });

  it("un double sens voulu sans forme : le sens d'abord, puis sa composition", () => {
    const utopie: Maillon = {
      langue: "grec ancien",
      alternatives: {
        mode: "jeu",
        formes: [
          { sens: "nulle part", elements: [{ forme: "οὐ", sens: "non" }, { forme: "τόπος", sens: "lieu" }] },
          { sens: "lieu du bonheur", elements: [{ forme: "εὖ", sens: "bien" }, { forme: "τόπος", sens: "lieu" }] },
        ],
      },
    };
    const { titre, lignes } = hypotheses(utopie, langue);
    expect(titre).toBe("Double sens voulu");
    expect(enTexte(lignes[0].segments)).toBe(`${q("Nulle part")}, d'οὐ, ${q("non")}, et de τόπος, ${q("lieu")}`);
  });
});
