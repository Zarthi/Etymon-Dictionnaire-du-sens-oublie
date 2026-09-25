import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { schemaSource } from "../../src/lib/schema.ts";

/**
 * Artefacts de la rédaction autonome (docs/methode.md) : le dossier de faits d'un mot, la fiche
 * rédigée et le verdict de la relecture critique. Ils vivent dans `atelier/<id>/`, hors du dépôt :
 * seules les fiches écrites dans data/ sont publiques.
 */
export const DOSSIER_ATELIER = fileURLToPath(new URL("../../atelier", import.meta.url));
export const cheminDossier = (id: string) => join(DOSSIER_ATELIER, id, "dossier.json");
export const cheminVerdict = (id: string) => join(DOSSIER_ATELIER, id, "verdict.json");

/** Chemin d'un mot dans la chaîne de rédaction (un seul par mot). */
export const CHEMINS = ["ordinaire", "forge", "debattu", "recent", "sacre", "consacre"] as const;
/** Ce qui demande une suite particulière (plusieurs possibles). */
export const DRAPEAUX = ["tradition", "doute", "nom-propre"] as const;

const chemin = z
  .enum(CHEMINS)
  .describe(
    "ordinaire : héritage ou emprunt ; forge : forgé par un auteur connu ; debattu : plusieurs hypothèses et leurs tenants ; recent : absent du Littré (après 1872) ; sacre : né dans l'ordre sacré (manne, sabbat) ; consacre : profane à l'origine, pris dans l'ordre sacré (église, ange).",
  );
const drapeaux = z
  .array(z.enum(DRAPEAUX))
  .default([])
  .describe(
    "tradition : une tradition a lu le mot lui-même (lectures à chercher) ; doute : doute sur le critère du §3.3 (la fiche est rédigée quand même) ; nom-propre : la chaîne passe par un nom de personne ou un titre.",
  );

/** Un fait du dossier, avec l'ouvrage et l'entrée qui le donnent. */
export const schemaFait = z
  .object({
    fait: z
      .string()
      .min(1)
      .describe(
        "Un fait, en une phrase à toi : forme, langue, sens, date, auteur. Du Littré (domaine public), on peut recopier ; du TLFi, du Gaffiot, du Bailly, les faits seuls, jamais leur rédaction.",
      ),
    source: schemaSource,
  })
  .strict();

/** Entrée du Littré recopiée par le script (domaine public). */
const entreeLittre = z.object({ terme: z.string(), nature: z.string().optional(), etymologie: z.string() }).strict();

export const schemaDossier = z
  .object({
    mot: z.string().min(1),
    chemin,
    drapeaux,
    littre: z.array(entreeLittre).describe("Entrées du Littré local, posées par npm run dossier (vide : mot absent du Littré)."),
    usage: schemaFait.describe("L'usage d'aujourd'hui : ce que le mot désigne maintenant, avec sa source (la définition du TLFi)."),
    faits: z
      .array(schemaFait)
      .min(1)
      .describe(
        "Ce que disent les sources consultées : la chaîne et le sens de chaque maillon qui en porte un, les étapes datées du sens en français. La rédaction n'affirme rien qui n'y soit.",
      ),
    manques: z.array(z.string().min(1)).default([]).describe("Sources inaccessibles, questions restées sans réponse."),
    notes: z
      .array(z.string().min(1))
      .default([])
      .describe("Doute sur le §3.3 et sa raison ; piste pour les lectures traditionnelles (auteur, œuvre, passage) ; ce que le modèle ne permet pas de dire."),
  })
  .strict()
  .describe("Dossier de faits d'un mot (atelier/<id>/dossier.json).");

/** Dossier tel que npm run dossier le crée, avant que l'agent le complète. */
export const squeletteDossier = (mot: string, littre: z.infer<typeof entreeLittre>[]) => ({ mot, littre, faits: [], manques: [], notes: [] });

export type Dossier = z.infer<typeof schemaDossier>;

/**
 * Sources d'une fiche rédigée d'après son dossier : les entrées réellement consultées, sans doublon,
 * dans l'ordre du dossier.
 */
export function sourcesDuDossier(dossier: Dossier): z.infer<typeof schemaSource>[] {
  const vues = new Set<string>();
  return dossier.faits
    .map((f) => f.source)
    .filter((s) => {
      const cle = `${s.ouvrage}|${s.entree}`;
      if (vues.has(cle)) return false;
      vues.add(cle);
      return true;
    });
}

export const CRITERES = ["dossier", "justesse", "regle"] as const;

/** Verdict de la relecture critique (étape 3). */
export const schemaVerdict = z
  .object({
    decision: z.enum(["accepte", "a-reprendre"]).describe("a-reprendre : au moins une remarque qui oblige à changer la fiche."),
    remarques: z
      .array(
        z
          .object({
            critere: z
              .enum(CRITERES)
              .describe(
                "dossier : affirmation absente du dossier ; justesse : phrase qui ne répond pas à « que veux-tu dire exactement ? » ; regle : règle éditoriale que les scripts ne voient pas.",
              ),
            champ: z.string().min(1).describe("Champ visé (explication, etymologie.1.sens…)."),
            probleme: z.string().min(1),
            proposition: z.string().min(1).optional().describe("Ce qu'il faudrait écrire, si tu le sais."),
          })
          .strict(),
      )
      .default([]),
  })
  .strict()
  .refine((v) => v.decision === "accepte" || v.remarques.length > 0, { message: "une fiche à reprendre a au moins une remarque", path: ["remarques"] })
  .describe("Verdict de la relecture critique (atelier/<id>/verdict.json).");
