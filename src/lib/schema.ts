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
    entree: z.string().min(1).describe("Entrée consultée dans l'ouvrage (« étonner », « adtono », « φρήν »)."),
    page,
    url,
  })
  .strict()
  .refine((s) => s.page !== undefined || s.url !== undefined || urlDeduite(s.ouvrage, s.entree) !== undefined, {
    message: "indiquer une page ou une url (l'adresse de cet ouvrage ne se déduit pas de l'entrée)",
    path: ["url"],
  })
  .describe("Ouvrage consulté pour l'étymologie.");

/** Auteurs et leurs œuvres, en liste fermée : pas de variantes d'un même nom. */
const nomsAuteurs = auteurs.map((a) => a.nom);
/** Seuls les auteurs de la tradition signent une lecture traditionnelle ; les philologues soutiennent des hypothèses. */
const nomsTradition = auteurs.filter((a) => a.role === "tradition").map((a) => a.nom);
const oeuvres = auteurs.flatMap((a) => a.oeuvres);

/** Source d'une lecture traditionnelle : une œuvre de la liste, le passage précis et le texte en ligne. */
export const schemaSourceTraditionnelle = z
  .object({
    ouvrage: z.enum(oeuvres).describe("Œuvre de l'auteur (liste fermée : data/auteurs.json)."),
    entree: z.string().min(1).describe("Passage précis (ex. « IV, 28, 3 »)."),
    page,
    url: z
      .url({ protocol: /^https$/ })
      .describe("Adresse (https) du texte original, du domaine public : npm run verifier:en-ligne y cherche la citation."),
  })
  .strict()
  .describe("Œuvre consultée pour une lecture traditionnelle, passage précis et texte en ligne.");

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

export const schemaFormeOrigine = z
  .object({
    forme: z.string().min(1).describe("Forme d'origine ; reconstruite, elle commence par * et s'écrit entre guillemets."),
    graphie,
    langue: z.string().min(1).describe("Langue de cette forme (latin, grec ancien, arabe, indo-européen…)."),
    sens: z.string().min(1).describe("Sens de cette forme, sans guillemets."),
    selon: z
      .array(z.enum(nomsAuteurs))
      .optional()
      .describe(
        "Origine débattue seulement : qui a proposé ou défend cette hypothèse (data/auteurs.json). Un ouvrage qui la rapporte n'en est pas tenant : il figure dans sources.",
      ),
  })
  .strict()
  .describe("Une forme d'origine de l'étymon.");

/** Comment les formes d'origine se lisent : l'une après l'autre, ensemble, ou l'une ou l'autre. */
export const MODES_ORIGINE = ["filiation", "composition", "debattue"] as const;

export const schemaLectureTraditionnelle = z
  .object({
    texte: z
      .string()
      .trim()
      .min(1)
      .describe("Sens que la doctrine donne au mot, sans commencer par le nom de l'auteur ni répéter l'hypothèse étymologique."),
    citation: z
      .string()
      .trim()
      .min(1)
      .describe("Texte original de l'auteur, dans sa langue, tel qu'il figure à l'adresse de la source ([…] pour une coupe)."),
    auteur: z.enum(nomsTradition).describe("Auteur de la tradition (data/auteurs.json, rôle tradition)."),
    hypothese: z
      .string()
      .min(1)
      .optional()
      .describe("Forme d'origine (origine.formes) sur laquelle repose la lecture : le texte n'a pas à la répéter."),
    sources: z.array(schemaSourceTraditionnelle).min(1).describe("Œuvres de l'auteur consultées."),
    redaction: z
      .array(schemaRedaction)
      .min(1)
      .optional()
      .describe("Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche."),
  })
  .strict()
  .describe(
    "Sens donné au mot par une doctrine traditionnelle, distinct de l'étymologie. La tradition doit avoir lu le mot lui-même, pas la chose qu'il désigne aujourd'hui.",
  );

/** Champs de la fiche ; la règle entre champs s'ajoute dans schemaFiche. */
const objetFiche = z
  .object({
    mot: z.string().min(1).describe("Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent)."),
    nature: z.array(z.enum(NATURES)).min(1).describe("Catégorie(s) grammaticale(s) ; « nom » pour les épicènes."),
    etymon: z
      .string()
      .min(1)
      .describe("Forme source, dans la langue source directe ; reconstruite, elle commence par * et s'écrit entre guillemets."),
    graphie,
    langue: z.enum(langues).describe("Langue source directe de l'étymon (liste fermée : data/langues.json)."),
    forge: z
      .object({
        par: z.string().min(1).describe("Qui a forgé le mot (« Eugen Bleuler »)."),
        annee: z.number().int().min(1000).max(2100).describe("Année de la création, selon la source consultée."),
      })
      .strict()
      .optional()
      .describe("Mot savant forgé par un auteur connu : qui, et quand."),
    sens: z
      .string()
      .min(1)
      .describe(
        "Sens de l'étymon, sans guillemets (l'app les ajoute). Pour un mot forgé ou composé, le sens littéral de ses éléments ; l'intention de l'auteur va dans l'explication.",
      ),
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
    incertain: z
      .boolean()
      .default(false)
      .describe("L'étymon lui-même est douteux (une origine débattue relève de origine.mode). Faux si absent."),
    origine: z
      .object({
        mode: z
          .enum(MODES_ORIGINE)
          .default("filiation")
          .describe(
            "filiation (défaut) : l'étymon vient de ces formes, l'une de l'autre ; composition : il est formé de ces éléments ; debattue : plusieurs hypothèses, la plus suivie en premier.",
          ),
        formes: z.array(schemaFormeOrigine).min(1).describe("Formes d'origine, dans l'ordre de lecture."),
      })
      .strict()
      .refine((o) => o.mode === "filiation" || o.formes.length >= 2, {
        message: "une composition ou une origine débattue a au moins deux formes",
        path: ["formes"],
      })
      .optional()
      .describe("D'où vient l'étymon, ou ancêtre plus ancien qui ajoute du sens."),
    doublets: z
      .array(z.string())
      .default([])
      .describe("Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches."),
    famille: z.array(z.string()).default([]).describe("Mots français apparentés, de la même racine."),
    themes: z.array(z.enum(themes)).describe("Thèmes (liste fermée : data/themes.json)."),
    sources: z
      .array(schemaSource)
      .default([])
      .describe("Ouvrages consultés pour l'étymologie ; au moins un hors statut a-verifier. Ajoutés par npm run verifier ou à la main, jamais de mémoire."),
    redaction: z.array(schemaRedaction).min(1).describe("Qui a rédigé la fiche ; affiché une fois, en pied de fiche. Écrit par npm run rediger."),
    lecturesTraditionnelles: z
      .array(schemaLectureTraditionnelle)
      .default([])
      .describe("Lectures traditionnelles, rédigées dans une passe à part, texte source sous les yeux (souvent aucune)."),
    statut: z
      .enum(["a-verifier", "brouillon", "validee"])
      .describe("a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault."),
    historique: z
      .array(z.object({ date, note: z.string().min(1).describe("Nature de la correction.") }).strict())
      .default([])
      .describe("Corrections successives (ex. suite à une Critique)."),
  })
  .strict();

export const schemaFiche = objetFiche
  // Lecture profane : hors a-verifier, au moins un ouvrage réellement consulté.
  .refine((f) => f.statut === "a-verifier" || f.sources.length > 0, {
    message: "au moins un ouvrage consulté (seules les fiches a-verifier en sont dispensées)",
    path: ["sources"],
  })
  .describe("Fiche d'Étymon : un mot, son étymon, ce que le sens premier révèle.");

/**
 * Ce que l'IA écrit pour une fiche (npm run rediger) : le contenu seul. Le statut, la rédaction,
 * les sources (npm run verifier, ou à la main) et les lectures traditionnelles (passe à part)
 * sont écrits par les scripts ; la nature est tirée du Littré quand elle manque.
 */
export const schemaEntreeRedaction = objetFiche
  .omit({ sources: true, redaction: true, lecturesTraditionnelles: true, statut: true, historique: true })
  .extend({
    nature: objetFiche.shape.nature.optional().describe("Catégorie(s) grammaticale(s) ; tirée du Littré si absente."),
  })
  .strict()
  .describe("Contenu d'une fiche rédigée par l'IA.");

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
