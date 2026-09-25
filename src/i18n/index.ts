import * as fr from "./fr.ts";

/**
 * Langue de l'application : le seul endroit où elle se choisit. Toute l'interface lit ses textes
 * dans `messages`, compose ses phrases avec `grammaire`, et nomme les valeurs des listes fermées
 * avec `libelles`. Une autre langue fournirait un module de même forme que `fr.ts`.
 */
export type Messages = typeof fr.messages;
export type { Grammaire, Libelles } from "./types.ts";

export const { messages, grammaire, libelles } = fr;
