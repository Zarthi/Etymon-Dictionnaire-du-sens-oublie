import type { z } from "zod";
import type { schemaCandidat, schemaFiche, schemaLigneComptes } from "./schema.ts";

/** Fiche telle qu'écrite dans `data/fiches/<initiale>/<préfixe>/<id>.yaml`. */
export type Fiche = z.infer<typeof schemaFiche>;

/** Fiche identifiée par son `id` (nom du fichier sans extension). */
export type FicheIdentifiee = Fiche & { id: string };

/** Entrée de `index.json` : de quoi chercher et tirer un mot sans charger les fiches. */
export type EntreeIndex = Pick<FicheIdentifiee, "id" | "mot">;

export type Candidat = z.infer<typeof schemaCandidat>;

export type LigneComptes = z.infer<typeof schemaLigneComptes>;
