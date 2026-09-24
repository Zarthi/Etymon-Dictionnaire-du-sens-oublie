import type { z } from "zod";
import type {
  schemaAlternative,
  schemaAuteur,
  schemaCandidat,
  schemaElement,
  schemaFiche,
  schemaLectureTraditionnelle,
  schemaLigneComptes,
  schemaMaillon,
  schemaOuvrage,
} from "./schema.ts";

/** Fiche d'un mot, telle qu'écrite dans `data/fiches/<initiale>/<préfixe>/<id>.yaml`. */
export type Fiche = z.infer<typeof schemaFiche>;

export type Maillon = z.infer<typeof schemaMaillon>;
export type Element = z.infer<typeof schemaElement>;
export type Alternative = z.infer<typeof schemaAlternative>;
export type LectureTraditionnelle = z.infer<typeof schemaLectureTraditionnelle>;

/** Fiche identifiée par son `id` (nom du fichier sans extension). */
export type FicheIdentifiee = Fiche & { id: string };

/** Fiches d'un auteur (`data/auteurs/<id>.yaml`) et d'un ouvrage (`data/ouvrages/<id>.yaml`). */
export type Auteur = z.infer<typeof schemaAuteur> & { id: string };
export type Ouvrage = z.infer<typeof schemaOuvrage> & { id: string };

/** Auteurs et ouvrages, par identifiant : de quoi résoudre les références d'une fiche. */
export interface Referentiel {
  auteurs: Map<string, Auteur>;
  ouvrages: Map<string, Ouvrage>;
}

/** Mention d'une fiche de mot sur la page d'un auteur ou d'un ouvrage. */
export interface MotCite {
  id: string;
  mot: string;
}

/** Auteur tel que l'app le reçoit : sa fiche, et ce qui se calcule (jamais écrit). */
export type AuteurAssemble = Auteur & {
  oeuvres: string[];
  forges: MotCite[];
  hypotheses: MotCite[];
  lectures: MotCite[];
  /** Mots issus de son nom (algorithme, d'al-Khwârizmî). */
  issus: MotCite[];
};

/** Ouvrage tel que l'app le reçoit : sa fiche, et les mots qu'il éclaire, qu'on y a forgés ou qui viennent de son titre. */
export type OuvrageAssemble = Ouvrage & {
  lectures: MotCite[];
  forges: MotCite[];
  /** Mots issus de son titre (algèbre, d'al-jabr). */
  issus: MotCite[];
};

/** Entrée de `index.json` : de quoi chercher et tirer un mot sans charger les fiches. */
export type EntreeIndex = Pick<FicheIdentifiee, "id" | "mot" | "statut">;

export type Candidat = z.infer<typeof schemaCandidat>;

export type LigneComptes = z.infer<typeof schemaLigneComptes>;
