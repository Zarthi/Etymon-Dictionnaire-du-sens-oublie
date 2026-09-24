/**
 * Option active d'une liste de propositions pilotée au clavier depuis le champ de saisie
 * (motif « combobox » de WAI-ARIA : le focus reste dans le champ). -1 : aucune option active.
 * Fonction pure : le composant ne fait que lui passer la touche et appliquer le résultat.
 */
export function deplacer(actif: number, touche: string, taille: number): number {
  if (taille === 0) return -1;
  switch (touche) {
    case "ArrowDown":
      return actif + 1 >= taille ? 0 : actif + 1;
    case "ArrowUp":
      return actif <= 0 ? taille - 1 : actif - 1;
    case "Escape":
      return -1;
    default:
      return actif;
  }
}

/** Touches que la liste consomme ; Début et Fin restent au champ, pour déplacer le curseur. */
export const TOUCHES_LISTE = new Set(["ArrowDown", "ArrowUp", "Escape"]);

/** Option que choisit Entrée : l'active, sinon la première (le premier résultat est le meilleur). */
export function choisie(actif: number, taille: number): number {
  if (taille === 0) return -1;
  return actif >= 0 && actif < taille ? actif : 0;
}
