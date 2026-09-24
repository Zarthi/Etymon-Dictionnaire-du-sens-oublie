/** Préférences mémorisées sur l'appareil. */
export interface Parametres {
  /** Lectures traditionnelles dépliées d'emblée ; sinon, repliées sous leur intitulé. */
  deplierLectures: boolean;
}

export const PARAMETRES_PAR_DEFAUT: Parametres = { deplierLectures: false };

const CLE = "etymon.parametres";

type Stockage = Pick<Storage, "getItem" | "setItem">;

/** Stockage local s'il est accessible (il peut être absent ou bloqué : navigation privée, aperçu…). */
function stockageLocal(): Stockage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

export function lireParametres(stockage = stockageLocal()): Parametres {
  try {
    const brut = JSON.parse(stockage?.getItem(CLE) ?? "{}");
    return { deplierLectures: brut?.deplierLectures === true };
  } catch {
    return { ...PARAMETRES_PAR_DEFAUT };
  }
}

/** Enregistre les paramètres ; renvoie false si l'appareil ne permet pas de les mémoriser. */
export function ecrireParametres(parametres: Parametres, stockage = stockageLocal()): boolean {
  try {
    if (!stockage) return false;
    stockage.setItem(CLE, JSON.stringify(parametres));
    return true;
  } catch {
    return false;
  }
}
