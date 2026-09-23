import { describe, expect, it } from "vitest";
import { ecrireParametres, lireParametres, PARAMETRES_PAR_DEFAUT } from "./stockage.ts";

function stockageMemoire(initial: Record<string, string> = {}) {
  const donnees = new Map(Object.entries(initial));
  return {
    getItem: (cle: string) => donnees.get(cle) ?? null,
    setItem: (cle: string, valeur: string) => void donnees.set(cle, valeur),
  };
}

const stockageBloque = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("paramètres", () => {
  it("désactive la lecture traditionnelle par défaut", () => {
    expect(PARAMETRES_PAR_DEFAUT.lectureTraditionnelle).toBe(false);
    expect(lireParametres(stockageMemoire())).toEqual({ lectureTraditionnelle: false });
  });
  it("mémorise et relit les paramètres", () => {
    const stockage = stockageMemoire();
    expect(ecrireParametres({ lectureTraditionnelle: true }, stockage)).toBe(true);
    expect(lireParametres(stockage)).toEqual({ lectureTraditionnelle: true });
  });
  it("revient aux valeurs par défaut sur une donnée corrompue ou d'un autre type", () => {
    expect(lireParametres(stockageMemoire({ "etymon.parametres": "{pas du json" }))).toEqual(PARAMETRES_PAR_DEFAUT);
    expect(lireParametres(stockageMemoire({ "etymon.parametres": '{"lectureTraditionnelle":"oui"}' }))).toEqual(
      PARAMETRES_PAR_DEFAUT,
    );
    expect(lireParametres(stockageMemoire({ "etymon.parametres": "null" }))).toEqual(PARAMETRES_PAR_DEFAUT);
  });
  it("fonctionne sans stockage ou avec un stockage bloqué", () => {
    expect(lireParametres(stockageBloque)).toEqual(PARAMETRES_PAR_DEFAUT);
    expect(ecrireParametres({ lectureTraditionnelle: true }, stockageBloque)).toBe(false);
    expect(lireParametres(undefined)).toEqual(PARAMETRES_PAR_DEFAUT);
    expect(ecrireParametres({ lectureTraditionnelle: true }, undefined)).toBe(false);
  });
});
