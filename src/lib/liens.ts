/** Adresses des pages de l'app : une fiche de mot, un auteur, un ouvrage. */
export const lienMot = (id: string) => `#/mot/${encodeURIComponent(id)}`;
export const lienAuteur = (id: string) => `#/auteur/${encodeURIComponent(id)}`;
export const lienOuvrage = (id: string) => `#/ouvrage/${encodeURIComponent(id)}`;
