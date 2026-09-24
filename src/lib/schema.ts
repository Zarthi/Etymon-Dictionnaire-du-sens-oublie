import { z } from "zod";
import auteurs from "../../data/auteurs.json" with { type: "json" };
import langues from "../../data/langues.json" with { type: "json" };
import ouvrages from "../../data/sources.json" with { type: "json" };
import themes from "../../data/themes.json" with { type: "json" };
import { REDACTEURS } from "./sources.ts";

/** Date ISO AAAA-MM-JJ. */
const date = z.iso.date();

const page = z.union([z.number().int().positive(), z.string().min(1)]).optional();
const url = z.url({ protocol: /^https$/ }).optional();

/**
 * Source de la lecture profane (étymologie historique) : ouvrage de la liste fermée,
 * entrée consultée, avec sa page ou son adresse en ligne.
 */
export const schemaSource = z
  .object({ ouvrage: z.enum(ouvrages), entree: z.string().min(1), page, url })
  .strict()
  .refine((s) => s.page !== undefined || s.url !== undefined, {
    message: "indiquer au moins une page ou une url",
    path: ["url"],
  });

/** Auteurs de la tradition et leurs œuvres, en liste fermée : pas de variantes d'un même nom. */
const nomsAuteurs = auteurs.map((a) => a.nom);
const oeuvres = auteurs.flatMap((a) => a.oeuvres);

/** Source d'une lecture traditionnelle : une œuvre de la liste, et le passage précis. */
export const schemaSourceTraditionnelle = z.object({ ouvrage: z.enum(oeuvres), entree: z.string().min(1), page, url }).strict();

/** Qui a rédigé : le moteur d'IA (et son modèle) ou l'équipe d'Étymon (et la nature de sa contribution). */
export const schemaRedaction = z.object({ par: z.enum(REDACTEURS), detail: z.string().min(1) }).strict();

/** Catégories grammaticales ; « nom » seul pour les noms épicènes (un, une adulte). */
export const NATURES = ["nom masculin", "nom féminin", "nom", "verbe", "adjectif", "adverbe", "interjection"] as const;

/** Écriture d'origine d'une forme en alphabet non latin (grec, arabe, hébreu…). */
const graphie = z.string().min(1).optional();

export const schemaLectureTraditionnelle = z
  .object({
    texte: z.string().trim().min(1),
    /** Texte original de l'auteur, dans sa langue (facultatif). */
    citation: z.string().trim().min(1).optional(),
    auteur: z.enum(nomsAuteurs),
    /** Œuvres consultées. Vide : lecture fondée sur la seule rédaction, signalée par `npm run etat`. */
    sources: z.array(schemaSourceTraditionnelle),
    /** Rédaction propre à cette lecture, si elle diffère de celle de la fiche. */
    redaction: z.array(schemaRedaction).min(1).optional(),
  })
  .strict();

export const schemaFiche = z
  .object({
    mot: z.string().min(1),
    nature: z.array(z.enum(NATURES)).min(1),
    etymon: z.string().min(1),
    graphie,
    reconstruit: z.boolean(),
    langue: z.enum(langues),
    sens: z.string().min(1),
    explication: z.string().trim().min(1),
    legende: z.string().trim().min(1).optional(),
    /** L'étymon lui-même est douteux (et non l'origine plus ancienne, voir `racine.incertain`). */
    incertain: z.boolean(),
    racine: z
      .object({
        forme: z.string().min(1),
        graphie,
        langue: z.string().min(1),
        sens: z.string().min(1),
        /** Origine de l'étymon débattue : la racine n'est qu'une hypothèse. */
        incertain: z.boolean().optional(),
      })
      .strict()
      .nullable()
      .optional(),
    doublets: z.array(z.string()),
    famille: z.array(z.string()),
    themes: z.array(z.enum(themes)),
    sources: z.array(schemaSource),
    redaction: z.array(schemaRedaction).min(1),
    lecturesTraditionnelles: z.array(schemaLectureTraditionnelle),
    statut: z.enum(["a-verifier", "brouillon", "validee"]),
    historique: z.array(z.object({ date, note: z.string().min(1) }).strict()),
  })
  .strict()
  // Lecture profane : hors a-verifier, au moins un ouvrage réellement consulté.
  .refine((f) => f.statut === "a-verifier" || f.sources.length > 0, {
    message: "au moins un ouvrage consulté (seules les fiches a-verifier en sont dispensées)",
    path: ["sources"],
  });

/** Mot envisagé pour le dictionnaire, tant qu'il n'a pas de fiche. */
export const schemaCandidat = z
  .object({
    mot: z.string().min(1),
    statut: z.enum(["a-faire", "sans-source", "ecarte"]),
    raison: z.string().min(1).optional(),
  })
  .strict()
  .refine((c) => c.statut === "a-faire" || c.raison !== undefined, {
    message: "raison obligatoire pour un mot sans source ou écarté",
    path: ["raison"],
  });

export const schemaCandidats = z.array(schemaCandidat);

export const schemaLigneComptes = z
  .object({
    date,
    type: z.enum(["don", "cout", "remuneration", "impot"]),
    categorie: z.string().min(1),
    libelle: z.string().min(1),
    montant: z.number().positive(),
    justificatif: z.string().min(1).nullable(),
  })
  .strict();

export const schemaComptes = z.array(schemaLigneComptes);
