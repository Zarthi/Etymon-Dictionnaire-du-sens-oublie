import { z } from "zod";
import langues from "../../data/langues.json" with { type: "json" };
import sources from "../../data/sources.json" with { type: "json" };
import themes from "../../data/themes.json" with { type: "json" };

/** Date ISO AAAA-MM-JJ. */
const date = z.iso.date();

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
    sources: z.array(z.enum(sources)).min(1),
    lectureTraditionnelle: z
      .object({ texte: z.string().trim().min(1), auteur: z.string().min(1), source: z.string().min(1) })
      .strict()
      .nullable(),
    statut: z.enum(["brouillon", "validee"]),
    historique: z.array(z.object({ date, note: z.string().min(1) }).strict()),
  })
  .strict();

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
