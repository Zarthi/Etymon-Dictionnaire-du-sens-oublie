import { z } from "zod";
import auteurs from "../../data/auteurs.json" with { type: "json" };
import langues from "../../data/langues.json" with { type: "json" };
import themes from "../../data/themes.json" with { type: "json" };
import { NOMS_OUVRAGES, urlDeduite } from "./ouvrages.ts";
import { REDACTEURS } from "./sources.ts";

/** Date ISO AAAA-MM-JJ. */
const date = z.iso.date().describe("Date au format AAAA-MM-JJ.");

const page = z
  .union([z.number().int().positive(), z.string().min(1)])
  .optional()
  .describe("Page de l'édition papier consultée.");
const url = z
  .url({ protocol: /^https$/ })
  .optional()
  .describe("Adresse (https) de l'entrée, seulement si elle ne se déduit pas de l'entrée.");

/**
 * Source de la lecture profane (étymologie historique) : ouvrage de la liste fermée et
 * entrée consultée. L'adresse se déduit de l'entrée pour les ouvrages en ligne.
 */
export const schemaSource = z
  .object({
    ouvrage: z.enum(NOMS_OUVRAGES).describe("Ouvrage consulté (liste fermée : data/sources.json)."),
    entree: z.string().min(1).describe("Entrée consultée dans l'ouvrage (ex. « étonner », « adtono »)."),
    page,
    url,
  })
  .strict()
  .refine((s) => s.page !== undefined || s.url !== undefined || urlDeduite(s.ouvrage, s.entree) !== undefined, {
    message: "indiquer une page ou une url (l'adresse de cet ouvrage ne se déduit pas de l'entrée)",
    path: ["url"],
  })
  .describe("Ouvrage consulté pour l'étymologie.");

/** Auteurs de la tradition et leurs œuvres, en liste fermée : pas de variantes d'un même nom. */
const nomsAuteurs = auteurs.map((a) => a.nom);
const oeuvres = auteurs.flatMap((a) => a.oeuvres);

/** Source d'une lecture traditionnelle : une œuvre de la liste, et le passage précis. */
export const schemaSourceTraditionnelle = z
  .object({
    ouvrage: z.enum(oeuvres).describe("Œuvre de l'auteur (liste fermée : data/auteurs.json)."),
    entree: z.string().min(1).describe("Passage précis (ex. « IV, 28, 3 »)."),
    page,
    url,
  })
  .strict()
  .describe("Œuvre consultée pour une lecture traditionnelle, et passage précis.");

/** Qui a rédigé : le moteur d'IA (et son modèle) ou l'équipe d'Étymon (et la nature de sa contribution). */
export const schemaRedaction = z
  .object({
    par: z.enum(REDACTEURS).describe("IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique)."),
    detail: z.string().min(1).describe("Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution."),
  })
  .strict()
  .describe("Qui a rédigé. Ce n'est pas une source.");

/** Catégories grammaticales ; « nom » seul pour les noms épicènes (un, une adulte). */
export const NATURES = ["nom masculin", "nom féminin", "nom", "verbe", "adjectif", "adverbe", "interjection"] as const;

/** Écriture d'origine d'une forme en alphabet non latin (grec, arabe, hébreu…). */
const graphie = z
  .string()
  .min(1)
  .optional()
  .describe("Écriture d'origine si l'alphabet n'est pas latin (ἀνάλυσις, صفر) ; la forme en garde la translittération.");

/** Qui soutient une hypothèse : un auteur de la tradition ou un ouvrage consulté. */
const tenants = [...nomsAuteurs, ...NOMS_OUVRAGES];

export const schemaHypothese = z
  .object({
    forme: z.string().min(1).describe("Forme d'origine proposée."),
    graphie,
    langue: z.string().min(1).describe("Langue de cette forme (latin, grec ancien, arabe, indo-européen…)."),
    sens: z.string().min(1).describe("Sens de cette forme, sans guillemets."),
    selon: z
      .array(z.enum(tenants))
      .optional()
      .describe("Qui soutient cette hypothèse : auteurs (data/auteurs.json) ou ouvrages (data/sources.json)."),
  })
  .strict()
  .describe("Une forme d'origine proposée pour l'étymon.");

export const schemaLectureTraditionnelle = z
  .object({
    texte: z
      .string()
      .trim()
      .min(1)
      .describe("Le sens doctrinal, sans commencer par le nom de l'auteur ni répéter l'hypothèse étymologique."),
    citation: z.string().trim().min(1).optional().describe("Texte original de l'auteur, dans sa langue."),
    auteur: z.enum(nomsAuteurs).describe("Auteur de la tradition (liste fermée : data/auteurs.json)."),
    sources: z
      .array(schemaSourceTraditionnelle)
      .describe("Œuvres de l'auteur consultées. Vide : la lecture repose sur sa seule rédaction (signalé par npm run etat si c'est l'IA)."),
    redaction: z
      .array(schemaRedaction)
      .min(1)
      .optional()
      .describe("Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche."),
  })
  .strict()
  .describe("Sens donné au mot par une doctrine traditionnelle, distinct de l'étymologie.");

export const schemaFiche = z
  .object({
    mot: z.string().min(1).describe("Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent)."),
    nature: z.array(z.enum(NATURES)).min(1).describe("Catégorie(s) grammaticale(s) ; « nom » pour les épicènes."),
    etymon: z
      .string()
      .min(1)
      .describe("Forme source, dans la langue source directe ; reconstruite, elle commence par * et s'écrit entre guillemets."),
    graphie,
    langue: z.enum(langues).describe("Langue source directe de l'étymon (liste fermée : data/langues.json)."),
    sens: z.string().min(1).describe("Sens de l'étymon, sans guillemets (l'app les ajoute)."),
    explication: z
      .string()
      .trim()
      .min(1)
      .describe(
        "1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens. Texte brut : l'étymon et les formes d'origine y sont mis en italique par l'app.",
      ),
    legende: z
      .object({
        forme: z.string().min(1).describe("Forme alléguée à tort (ex. « sine cera »)."),
        sens: z.string().min(1).describe("Sens de cette forme, sans guillemets (ex. « sans cire »)."),
        explication: z.string().trim().min(1).optional().describe("Pourquoi c'est une légende, en une phrase."),
      })
      .strict()
      .optional()
      .describe("Étymologie populaire démentie."),
    incertain: z.boolean().describe("L'étymon lui-même est douteux (une origine débattue relève de origine.debattue)."),
    origine: z
      .object({
        debattue: z.boolean().optional().describe("Plusieurs hypothèses, aucune établie."),
        hypotheses: z.array(schemaHypothese).min(1).describe("Une ou plusieurs formes d'origine."),
      })
      .strict()
      .optional()
      .describe("D'où vient l'étymon, ou ancêtre plus ancien qui ajoute du sens."),
    doublets: z
      .array(z.string())
      .describe("Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches."),
    famille: z.array(z.string()).describe("Mots français apparentés."),
    themes: z.array(z.enum(themes)).describe("Thèmes (liste fermée : data/themes.json)."),
    sources: z.array(schemaSource).describe("Ouvrages consultés pour l'étymologie ; au moins un hors statut a-verifier."),
    redaction: z.array(schemaRedaction).min(1).describe("Qui a rédigé la fiche ; affiché une fois, en pied de fiche."),
    lecturesTraditionnelles: z.array(schemaLectureTraditionnelle).describe("Lectures traditionnelles, une par tradition (souvent aucune)."),
    statut: z
      .enum(["a-verifier", "brouillon", "validee"])
      .describe("a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault."),
    historique: z
      .array(z.object({ date, note: z.string().min(1).describe("Nature de la correction.") }).strict())
      .describe("Corrections successives (ex. suite à une Critique)."),
  })
  .strict()
  // Lecture profane : hors a-verifier, au moins un ouvrage réellement consulté.
  .refine((f) => f.statut === "a-verifier" || f.sources.length > 0, {
    message: "au moins un ouvrage consulté (seules les fiches a-verifier en sont dispensées)",
    path: ["sources"],
  })
  .describe("Fiche d'Étymon : un mot, son étymon, ce que le sens premier révèle.");

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
