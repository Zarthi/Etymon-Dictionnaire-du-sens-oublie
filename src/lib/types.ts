import type { z } from "zod";
import type { schemaCandidat, schemaFiche, schemaLectureTraditionnelle, schemaLigneComptes } from "./schema.ts";

/** Fiche telle qu'écrite dans `data/fiches/<initiale>/<préfixe>/<id>.yaml`. */
export type Fiche = z.infer<typeof schemaFiche>;

export type LectureTraditionnelle = z.infer<typeof schemaLectureTraditionnelle>;

/** Fiche identifiée par son `id` (nom du fichier sans extension). */
export type FicheIdentifiee = Fiche & { id: string };

/** Entrée de `index.json` : de quoi chercher et tirer un mot sans charger les fiches. */
export type EntreeIndex = Pick<FicheIdentifiee, "id" | "mot" | "statut">;

export type Candidat = z.infer<typeof schemaCandidat>;

export type LigneComptes = z.infer<typeof schemaLigneComptes>;
