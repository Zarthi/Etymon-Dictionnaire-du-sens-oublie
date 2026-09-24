import { describe, expect, it } from "vitest";
import { dateDuJour, motAuHasard, motDuJour } from "./motDuJour.ts";

const index = Array.from({ length: 10 }, (_, i) => ({ id: `mot${i}`, mot: `mot${i}`, statut: "validee" as const }));

/** Dates consécutives à partir de `debut`, au format AAAA-MM-JJ. */
function jours(debut: string, nombre: number): string[] {
  const t = Date.parse(`${debut}T00:00:00Z`);
  return Array.from({ length: nombre }, (_, i) => new Date(t + i * 86_400_000).toISOString().slice(0, 10));
}

describe("dateDuJour", () => {
  it("donne la date de Paris, pas celle du fuseau de l'appareil", () => {
    expect(dateDuJour(new Date("2026-09-23T21:59:00Z"))).toBe("2026-09-23");
    expect(dateDuJour(new Date("2026-09-23T22:30:00Z"))).toBe("2026-09-24");
    expect(dateDuJour(new Date("2026-01-15T23:30:00Z"))).toBe("2026-01-16");
  });
});

describe("motDuJour", () => {
  it("est déterministe pour une date donnée", () => {
    expect(motDuJour(index, "2026-09-23")).toEqual(motDuJour([...index], "2026-09-23"));
  });
  it("présente chaque mot une fois avant de revenir au premier", () => {
    const tires = jours("2026-09-23", index.length).map((d) => motDuJour(index, d)?.id);
    expect(new Set(tires).size).toBe(index.length);
    expect(motDuJour(index, jours("2026-09-23", index.length + 1).at(-1)!)).toEqual(motDuJour(index, "2026-09-23"));
  });
  it("ne donne pas deux mots voisins deux jours de suite", () => {
    const [a, b] = jours("2026-09-23", 2).map((d) => index.findIndex((e) => e.id === motDuJour(index, d)?.id));
    expect(Math.abs(a - b)).toBeGreaterThan(1);
  });
  it("parcourt tout l'index quelle que soit sa taille", () => {
    for (const n of [1, 2, 3, 12, 97, 100]) {
      const liste = index.slice(0, 1).concat(Array.from({ length: n - 1 }, (_, i) => ({ id: `x${i}`, mot: `x${i}`, statut: "validee" as const })));
      expect(new Set(jours("2026-01-01", n).map((d) => motDuJour(liste, d)?.id)).size).toBe(n);
    }
  });
  it("se limite aux fiches validées s'il y en a, sinon puise dans toutes", () => {
    const melange = index.map((e, i) => ({ ...e, statut: i < 3 ? ("validee" as const) : ("a-verifier" as const) }));
    const tires = new Set(jours("2026-09-23", 30).map((d) => motDuJour(melange, d)?.id));
    expect(tires).toEqual(new Set(["mot0", "mot1", "mot2"]));
    const aucune = index.map((e) => ({ ...e, statut: "brouillon" as const }));
    expect(motDuJour(aucune, "2026-09-23")).toBeDefined();
  });
  it("ne renvoie rien pour un index vide", () => {
    expect(motDuJour([], "2026-09-23")).toBeUndefined();
  });
});

describe("motAuHasard", () => {
  it("tire un mot selon la valeur aléatoire", () => {
    expect(motAuHasard(index, undefined, () => 0)?.id).toBe("mot0");
    expect(motAuHasard(index, undefined, () => 0.999)?.id).toBe("mot9");
  });
  it("évite le mot affiché", () => {
    for (const r of [0, 0.3, 0.999]) expect(motAuHasard(index, "mot0", () => r)?.id).not.toBe("mot0");
  });
  it("renvoie le seul mot disponible, ou rien pour un index vide", () => {
    expect(motAuHasard(index.slice(0, 1), "mot0", () => 0.5)?.id).toBe("mot0");
    expect(motAuHasard([], undefined, () => 0.5)).toBeUndefined();
  });
});

describe("mots sacrés", () => {
  const sacres = [
    { id: "manne", mot: "manne", statut: "brouillon" as const, sacre: true as const },
    { id: "sabbat", mot: "sabbat", statut: "validee" as const, sacre: true as const },
  ];
  const profane = { id: "ennui", mot: "ennui", statut: "brouillon" as const };
  it("ne sont jamais tirés, ni au jour ni au hasard", () => {
    const melange = [...sacres, profane];
    for (const d of jours("2026-09-23", 10)) expect(motDuJour(melange, d)?.id).toBe("ennui");
    for (const r of [0, 0.5, 0.999]) expect(motAuHasard(melange, undefined, () => r)?.id).toBe("ennui");
  });
  it("ne laissent rien à tirer s'ils sont seuls", () => {
    expect(motDuJour(sacres, "2026-09-23")).toBeUndefined();
    expect(motAuHasard(sacres, undefined, () => 0.5)).toBeUndefined();
  });
});
