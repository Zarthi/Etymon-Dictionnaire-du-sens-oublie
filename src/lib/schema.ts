import { z } from "zod";
import langues from "../../data/langues.json" with { type: "json" };
import ouvrages from "../../data/sources.json" with { type: "json" };
import themes from "../../data/themes.json" with { type: "json" };

/** Date ISO AAAA-MM-JJ. */
const date = z.iso.date();

/** Référence vérifiable : l'entrée consultée, avec sa page ou son adresse en ligne. */
export const schemaSource = z
  .object({
    ouvrage: z.enum(ouvrages),
    entree: z.string().min(1),
    page: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
    url: z.url({ protocol: /^https$/ }).optional(),
  })
  .strict()
  .refine((s) => s.page !== undefined || s.url !== undefined, {
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
    sources: z.array(schemaSource).min(1),
    lectureTraditionnelle: z
      .object({ texte: z.string().trim().min(1), auteur: z.string().min(1), source: z.string().min(1) })
      .strict()
      .nullable(),
    statut: z.enum(["brouillon", "validee"]),
    historique: z.array(z.object({ date, note: z.string().min(1) }).strict()),
  })
  .strict();

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
