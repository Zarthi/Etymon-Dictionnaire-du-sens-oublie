import type { z } from "zod";
import type { schemaFiche, schemaLigneComptes } from "./schema.ts";

/** Fiche telle qu'écrite dans `data/fiches/<id>.yaml`. */
export type Fiche = z.infer<typeof schemaFiche>;

/** Fiche identifiée par son `id` (nom du fichier sans extension). */
export type FicheIdentifiee = Fiche & { id: string };

export type LigneComptes = z.infer<typeof schemaLigneComptes>;
