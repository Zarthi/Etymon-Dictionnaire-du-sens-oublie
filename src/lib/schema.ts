import { z } from "zod";
import langues from "../../data/langues.json" with { type: "json" };
import ouvrages from "../../data/sources.json" with { type: "json" };
import themes from "../../data/themes.json" with { type: "json" };

/** Date ISO AAAA-MM-JJ. */
const date = z.iso.date();

/** Ouvrage désignant le moteur d'IA qui a rédigé la fiche ; `entree` en donne le modèle. */
export const IA = "IA";

/**
 * Source d'une fiche : l'entrée consultée, avec sa page ou son adresse en ligne.
 * L'IA fait exception : elle n'a ni page ni adresse, seulement le nom du modèle.
 */
export const schemaSource = z
  .object({
    ouvrage: z.enum(ouvrages),
    entree: z.string().min(1),
    page: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
    url: z.url({ protocol: /^https$/ }).optional(),
  })
  .strict()
  .refine((s) => s.ouvrage === IA || s.page !== undefined || s.url !== undefined, {
    message: "indiquer au moins une page ou une url",
    path: ["url"],
  });

export const schemaFiche = z
  .object({
    mot: z.string().min(1),
    etymon: z.string().min(1),
    reconstruit: z.boolean(),
    langue: z.enum(langues),
    sens: z.string().min(1),
    explication: z.string().trim().min(1),
    incertain: z.boolean(),
    racine: z
      .object({ forme: z.string().min(1), langue: z.string().min(1), sens: z.string().min(1) })
      .strict()
      .nullable()
      .optional(),
    doublets: z.array(z.string()),
    famille: z.array(z.string()),
    themes: z.array(z.enum(themes)),
    sources: z.array(schemaSource),
    lectureTraditionnelle: z
      .object({ texte: z.string().trim().min(1), auteur: z.string().min(1), source: z.string().min(1) })
      .strict()
      .nullable(),
    statut: z.enum(["a-verifier", "brouillon", "validee"]),
    historique: z.array(z.object({ date, note: z.string().min(1) }).strict()),
  })
  .strict()
  // Hors a-verifier, une fiche doit citer au moins un ouvrage réellement consulté, en plus de l'IA.
  .refine((f) => f.statut === "a-verifier" || f.sources.some((s) => s.ouvrage !== IA), {
    message: "au moins un ouvrage consulté en plus de l'IA (seules les fiches a-verifier en sont dispensées)",
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
