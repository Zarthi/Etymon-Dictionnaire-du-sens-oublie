import { z } from "zod";
import langues from "../../data/langues.json" with { type: "json" };
import themes from "../../data/themes.json" with { type: "json" };
import traditions from "../../data/traditions.json" with { type: "json" };
import { REDACTEURS, REFLEXIONS } from "./sources.ts";

/**
 * Trois types de fiches : le mot, l'auteur, l'ouvrage. Elles partagent le même socle
 * éditorial (statut, rédaction, sources, historique). Les références entre fiches (auteurs,
 * ouvrages, doublets, renvois) sont des identifiants, vérifiés par scripts/lib/validation.ts.
 */

/** Identifiant d'une fiche : ASCII minuscule sans accent, mots séparés par des tirets. */
export const ID_VALIDE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const identifiant = (description: string) => z.string().regex(ID_VALIDE, "identifiant attendu (ascii-minuscule-sans-accent)").describe(description);

/** Date ISO AAAA-MM-JJ. */
const date = z.iso.date().describe("Date au format AAAA-MM-JJ.");

/**
 * Date historique, exacte ou approximative : 1911, « vers 1830 », « XIIe siècle »,
 * « 106 av. J.-C. », « vers 305-311 ».
 */
export const DATE_HISTORIQUE = /^(vers )?(\d{1,4}|[IVXL]+e siècle)( av\. J\.-C\.)?(-(vers )?\d{1,4}( av\. J\.-C\.)?)?$/;
const dateHistorique = z
  .union([z.number().int(), z.string().regex(DATE_HISTORIQUE, "date attendue : 1911, vers 1830, XIIe siècle, 106 av. J.-C.")])
  .transform(String)
  .describe("Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ».");

const page = z
  .union([z.number().int().positive(), z.string().min(1)])
  .optional()
  .describe("Page de l'édition papier consultée.");

/** Source : un ouvrage qui a sa fiche, et l'entrée consultée. L'adresse se déduit de l'entrée quand l'ouvrage a un modèle d'adresse. */
export const schemaSource = z
  .object({
    ouvrage: identifiant("Ouvrage consulté (identifiant d'une fiche de data/ouvrages)."),
    entree: z.string().min(1).describe("Entrée consultée (« étonner », « adtono », « φρήν »)."),
    page,
    url: z.url({ protocol: /^https$/ }).optional().describe("Adresse (https), seulement si elle ne se déduit pas de l'entrée."),
  })
  .strict()
  .describe("Ouvrage consulté.");

/** Source d'une lecture traditionnelle : l'œuvre, le passage précis et le texte en ligne. */
export const schemaSourceLecture = z
  .object({
    ouvrage: identifiant("Œuvre de l'auteur de la lecture (identifiant d'une fiche de data/ouvrages)."),
    entree: z.string().min(1).describe("Passage précis (« IV, 28, 3 »)."),
    page,
    url: z
      .url({ protocol: /^https$/ })
      .describe("Adresse (https) du texte original, du domaine public : npm run verifier:en-ligne y cherche la citation."),
  })
  .strict()
  .describe("Œuvre consultée pour une lecture traditionnelle.");

/** Qui a rédigé : le moteur d'IA (et son modèle) ou l'équipe d'Étymon (et la nature de sa contribution). */
export const schemaRedaction = z
  .object({
    par: z.enum(REDACTEURS).describe("IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique)."),
    detail: z.string().min(1).describe("Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution."),
    reflexion: z.enum(REFLEXIONS).optional().describe("Niveau de réflexion du modèle d'IA qui a rédigé (basse à maximale)."),
  })
  .strict()
  .refine((r) => r.par === "IA" || r.reflexion === undefined, { message: "réflexion : seulement pour une rédaction par IA", path: ["reflexion"] })
  .describe("Qui a rédigé. Ce n'est pas une source.");

/** Socle éditorial commun aux trois types de fiches. */
const socle = {
  sources: z
    .array(schemaSource)
    .default([])
    .describe("Ouvrages consultés ; au moins un hors statut a-verifier. Ajoutés par npm run verifier ou à la main, jamais de mémoire."),
  redaction: z.array(schemaRedaction).min(1).describe("Qui a rédigé ; affiché une fois, en pied de page. Écrit par npm run rediger."),
  statut: z
    .enum(["a-verifier", "brouillon", "validee"])
    .describe("a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault."),
  historique: z
    .array(z.object({ date, note: z.string().min(1).describe("Nature de la correction.") }).strict())
    .default([])
    .describe("Corrections successives (ex. suite à une Critique)."),
};
const CHAMPS_SOCLE = { sources: true, redaction: true, statut: true, historique: true } as const;

/** Hors a-verifier, au moins un ouvrage réellement consulté. */
const sourcee = (f: { statut: string; sources: unknown[] }) => f.statut === "a-verifier" || f.sources.length > 0;
const MESSAGE_SOURCE = { message: "au moins un ouvrage consulté (seules les fiches a-verifier en sont dispensées)", path: ["sources"] };

/** Catégories grammaticales ; « nom » seul pour les noms épicènes (un, une adulte). */
export const NATURES = ["nom masculin", "nom féminin", "nom", "nom propre", "verbe", "adjectif", "adverbe", "interjection"] as const;

const langue = z.enum(langues).describe("Langue (liste fermée : data/langues.json).");
const tradition = z.enum(traditions).describe("Tradition (liste fermée : data/traditions.json).");
const forme = z
  .string()
  .min(1)
  .describe("Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par * et s'écrit entre guillemets.");
const translitteration = z
  .string()
  .min(1)
  .optional()
  .describe("Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit.");
const sens = z.string().min(1).describe("Sens, sans guillemets (l'app les ajoute).");

/** Élément d'une composition : σχίζω « fendre ». */
export const schemaElement = z
  .object({
    forme,
    translitteration,
    langue: langue.optional().describe("Langue de l'élément, si elle diffère de celle du maillon."),
    sens,
  })
  .strict()
  .describe("Élément d'une forme composée.");

/** Hypothèse ou sens voulu d'une alternative : une forme, ou une composition. */
export const schemaAlternative = z
  .object({
    forme: forme.optional(),
    translitteration,
    langue: langue.optional().describe("Langue, si elle diffère de celle du maillon."),
    sens,
    elements: z.array(schemaElement).min(2).optional().describe("Composition de cette forme."),
    selon: z
      .array(identifiant("Auteur (data/auteurs)."))
      .optional()
      .describe("Origine débattue : qui a proposé ou défend cette hypothèse (identifiants d'auteurs). Un ouvrage qui la rapporte n'en est pas tenant."),
  })
  .strict()
  .refine((a) => a.forme !== undefined || a.elements !== undefined, { message: "une forme ou des éléments", path: ["forme"] })
  .describe("Une hypothèse (origine débattue) ou un sens voulu (double sens).");

export const MODES_ALTERNATIVE = ["debattue", "jeu"] as const;

/** Un maillon de la chaîne étymologique. */
export const schemaMaillon = z
  .object({
    forme: forme.optional(),
    translitteration,
    langue,
    sens: sens.optional().describe("Sens de ce maillon, seulement s'il apprend quelque chose (pas pour l'allemand Schizophrenie, ni le latin Satanas)."),
    elements: z.array(schemaElement).min(2).optional().describe("Composition : les éléments dont la forme est faite (φίλος + σοφία)."),
    alternatives: z
      .object({
        mode: z
          .enum(MODES_ALTERNATIVE)
          .describe("debattue : hypothèses concurrentes, la plus suivie en premier ; jeu : double sens voulu par l'auteur (utopie)."),
        formes: z.array(schemaAlternative).min(2).describe("Les hypothèses, ou les sens voulus."),
      })
      .strict()
      .optional()
      .describe("Plusieurs origines : débattues, ou voulues ensemble."),
    forge: z
      .object({
        par: z.array(identifiant("Auteur (data/auteurs).")).min(1).describe("Qui a forgé le mot ; plusieurs : attribution incertaine (« Comte ou Andrieux »)."),
        date: dateHistorique,
        ouvrage: identifiant("Ouvrage où le mot est forgé (data/ouvrages).").optional(),
      })
      .strict()
      .optional()
      .describe("Mot forgé par un auteur connu : qui, quand, où."),
    modele: z
      .object({
        forme,
        translitteration,
        langue,
        sens: sens.optional(),
        relation: z.enum(["calque", "analogie"]).describe("calque : traduction élément par élément ; analogie : formé sur le modèle d'un autre mot."),
      })
      .strict()
      .optional()
      .describe("Mot sur le modèle duquel celui-ci a été fait (persona, calque de πρόσωπον ; altruisme, sur le modèle d'égoïsme)."),
    personne: identifiant("Auteur dont la forme est le nom (al-Khwârizmî → algorithme).").optional(),
    ouvrage: identifiant("Ouvrage dont la forme est le titre (al-jabr → algèbre).").optional(),
    premier: z.literal(true).optional().describe("Porte le sens premier affiché en tête (par défaut : le plus lointain maillon attesté qui porte un sens)."),
  })
  .strict()
  .refine((m) => (m.alternatives === undefined) === (m.forme !== undefined || m.elements !== undefined), {
    message: "une forme, des éléments, ou des alternatives (pas les deux)",
    path: ["forme"],
  })
  .describe("Un maillon de la chaîne étymologique.");

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
    auteur: identifiant(
      "Celui dont la parole est rapportée, seulement s'il n'est pas l'auteur de l'œuvre citée (Resh Lakish dans le Talmud, Varron chez Augustin) : sinon la voix se déduit de l'œuvre, ou est l'œuvre elle-même (l'Écriture).",
    ).optional(),
    tradition: tradition
      .optional()
      .describe(
        "Tradition dans laquelle parle le passage ; seulement si sa voix en a plusieurs (Guénon). L'Écriture reçue en commun (Bible hébraïque) garde toutes les siennes.",
      ),
    premier: z
      .literal(true)
      .optional()
      .describe("Mot sacré : lecture du texte d'origine, qui donne le sens affiché en tête de fiche (Exode 16, 15 pour manne)."),
    sens: sens.optional().describe("Sens que le texte d'origine donne au mot ; seulement pour la lecture premier."),
    hypothese: z.string().min(1).optional().describe("Forme d'une alternative de la chaîne sur laquelle repose la lecture : le texte n'a pas à la répéter."),
    sources: z.array(schemaSourceLecture).min(1).describe("Passages cités, d'une même voix : œuvres de l'auteur, œuvre collective qui rapporte sa parole, ou Écriture."),
    redaction: z.array(schemaRedaction).min(1).optional().describe("Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche."),
  })
  .strict()
  .describe(
    "Sens donné au mot par une doctrine traditionnelle, distinct de l'étymologie. La tradition doit avoir lu le mot lui-même, pas la chose qu'il désigne aujourd'hui.",
  );

/**
 * La tradition sur un mot, en une seule rubrique : les lectures qu'elle en a faites, ou, pour un
 * mot qu'elle n'a pas lu (schizophrénie), les mots où elle parle de ce dont il traite (obsession).
 */
const objetTradition = z
  .object({
    lectures: z
      .array(schemaLectureTraditionnelle)
      .default([])
      .describe("Lectures traditionnelles, rédigées dans une passe à part, texte source sous les yeux (souvent aucune)."),
    renvois: z
      .array(identifiant("Fiche."))
      .max(2)
      .default([])
      .describe(
        "Mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) : fiche ou candidat à faire, deux au plus ; affichés une fois leur fiche pourvue de lectures.",
      ),
  })
  .strict();

/** Champs de la fiche d'un mot ; les règles entre champs s'ajoutent dans schemaFiche. */
const objetFiche = z
  .object({
    mot: z.string().min(1).describe("Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent)."),
    nature: z.array(z.enum(NATURES)).min(1).describe("Catégorie(s) grammaticale(s) ; « nom » pour les épicènes."),
    etymologie: z
      .array(schemaMaillon)
      .min(1)
      .describe("Chaîne étymologique, du plus proche au plus lointain. La langue source directe ouvre la chaîne ; on ne remonte que si cela ajoute un sens."),
    explication: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe(
        "1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens premier. Texte brut : les formes de la fiche y sont mises en italique par l'app. Obligatoire, sauf pour un mot sacré, qui n'en a pas.",
      ),
    sacre: z
      .array(tradition)
      .min(1)
      .optional()
      .describe(
        "Mot sacré par origine (né dans l'ordre sacré : manne, sabbat), et les traditions où il l'est ; pas un mot consacré (église, ange, profanes à l'origine). Pas de partie profane : la chaîne ne garde que les formes, le sens en tête vient du texte d'origine (lecture premier) ou, s'il ne l'explique pas, du sens du mot dans sa langue.",
      ),
    ecartees: z
      .array(
        z
          .object({
            forme,
            translitteration,
            langue: langue.optional(),
            sens,
            selon: z.array(identifiant("Auteur (data/auteurs).")).optional().describe("Qui l'a proposée."),
            raison: z.string().trim().min(1).optional().describe("Pourquoi elle est écartée, en une phrase."),
            populaire: z.literal(true).optional().describe("Étymologie populaire (idée reçue : sine cera), et non savante (per-sonare)."),
          })
          .strict(),
      )
      .default([])
      .describe("Étymologies proposées puis écartées : idées reçues ou hypothèses savantes abandonnées."),
    incertain: z.boolean().default(false).describe("La chaîne elle-même est douteuse (une origine débattue relève des alternatives). Faux si absent."),
    doublets: z
      .array(identifiant("Fiche."))
      .default([])
      .describe("Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches."),
    famille: z.array(z.string()).default([]).describe("Mots français apparentés, de la même racine."),
    renvois: z
      .array(identifiant("Fiche."))
      .max(3)
      .default([])
      .describe(
        "Voir aussi : notions voisines du même ordre, sans racine commune (schizophrénie → délire) ; fiche ou candidat à faire, trois au plus, déclarés d'un seul côté.",
      ),
    themes: z.array(z.enum(themes)).describe("Thèmes (liste fermée : data/themes.json)."),
    tradition: objetTradition
      .prefault({})
      .describe("Ce que dit la tradition du mot : ses lectures, ou les mots où elle en parle. Une seule rubrique, « Lectures traditionnelles »."),
    ...socle,
  })
  .strict();

export const schemaFiche = objetFiche.refine(sourcee, MESSAGE_SOURCE).describe("Fiche d'un mot : son étymologie, ce que le sens premier révèle.");

/**
 * Ce que l'IA écrit pour une fiche (npm run rediger) : le contenu seul. Le socle éditorial et
 * les lectures traditionnelles (passe à part) sont écrits par les scripts ; la nature est tirée
 * du Littré quand elle manque.
 */
export const schemaEntreeRedaction = objetFiche
  // Un mot sacré ne se rédige pas de mémoire en lot : il se rédige à part, texte d'origine sous les yeux.
  .omit({ ...CHAMPS_SOCLE, sacre: true })
  .extend({
    nature: objetFiche.shape.nature.optional().describe("Catégorie(s) grammaticale(s) ; tirée du Littré si absente."),
    tradition: objetTradition.omit({ lectures: true }).strict().optional().describe("Les mots où la tradition parle de celui-ci ; les lectures s'écrivent à part."),
  })
  .strict()
  .describe("Contenu d'une fiche rédigée par l'IA.");

/** Description d'un auteur ou d'un ouvrage : le situer, pas le raconter. */
const description = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .describe("Une ou deux phrases, 200 caractères au plus : ce qui le situe (époque, tradition, œuvre), pas une biographie.");

const objetAuteur = z
  .object({
    nom: z.string().min(1).describe("Forme usuelle du nom, affichée partout (Augustin, Eugen Bleuler) ; le nom du fichier en est la forme sans accent."),
    nomComplet: z.string().min(1).optional().describe("Forme complète ou d'origine (Aurelius Augustinus), si elle diffère."),
    naissance: dateHistorique.optional(),
    mort: dateHistorique.optional(),
    description,
    traditions: z
      .array(tradition)
      .min(1)
      .optional()
      .describe("Traditions dans lesquelles il parle ; un auteur qui en a signe des lectures traditionnelles. Plusieurs : chaque lecture précise la sienne."),
    cite: z
      .array(z.string().min(1))
      .optional()
      .describe(
        "Formes courtes sous lesquelles on le cite dans un texte (Bleuler, Comte, More) : l'élément d'entrée de la notice BnF, retenue ou variante. Le nom usuel est toujours reconnu.",
      ),
    ...socle,
  })
  .strict();

export const schemaAuteur = objetAuteur.refine(sourcee, MESSAGE_SOURCE).describe("Fiche d'un auteur.");

export const LICENCES = ["domaine public", "Licence ouverte", "CC BY-SA", "CC BY-NC-ND", "non libre"] as const;

const objetOuvrage = z
  .object({
    titre: z.string().min(1).describe("Titre en français (Institutions divines, Dictionnaire de la langue française)."),
    abrege: z
      .string()
      .min(1)
      .optional()
      .describe("Nom court sous lequel on le cite (Littré, Gaffiot) ; le nom du fichier en est la forme sans accent, ou celle du titre."),
    titreOriginal: z.string().min(1).optional().describe("Titre d'origine, s'il diffère (Divinae institutiones)."),
    auteur: identifiant("Auteur (data/auteurs) ; absent pour une œuvre collective (TLFi, Talmud) ou l'Écriture, traductions comprises (Vulgate).").optional(),
    traditions: z
      .array(tradition)
      .min(1)
      .optional()
      .describe("Traditions qui reçoivent une œuvre sans auteur (Talmud : juive ; Bible hébraïque : juive et chrétienne) ; une œuvre d'auteur tient les siennes de lui."),
    date: dateHistorique.optional(),
    edition: z.string().min(1).optional().describe("Édition réellement consultée (révision de Gérard Gréco, 2016)."),
    licence: z.enum(LICENCES).describe("Ce qu'Étymon a le droit d'en faire."),
    texte: z.url({ protocol: /^https$/ }).optional().describe("Adresse du texte, pour une œuvre de la tradition."),
    modeleEntree: z
      .string()
      .regex(/^https:\/\/.*\{(entree|grec)\}/, "adresse https contenant {entree} ou {grec}")
      .optional()
      .describe("Modèle d'adresse d'une entrée (dictionnaires) : {entree}, ou {grec} pour l'entrée translittérée."),
    description,
    ...socle,
  })
  .strict();

export const schemaOuvrage = objetOuvrage.refine(sourcee, MESSAGE_SOURCE).describe("Fiche d'un ouvrage.");

/** Contenu d'un auteur ou d'un ouvrage rédigé par l'IA (npm run rediger). */
export const schemaEntreeAuteur = objetAuteur.omit(CHAMPS_SOCLE).strict();
export const schemaEntreeOuvrage = objetOuvrage.omit(CHAMPS_SOCLE).strict();

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
