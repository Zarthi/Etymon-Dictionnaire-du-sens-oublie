import { describe, expect, it } from "vitest";
import { estRedaction, signatureRedaction } from "./sources.ts";

const ia = { ouvrage: "IA", entree: "Claude Opus 5.5" };
const redaction = { ouvrage: "Étymon, rédaction", entree: "correction" };
const littre = { ouvrage: "Littré", entree: "religion" };

describe("estRedaction", () => {
  it("distingue les sources de rédaction des ouvrages", () => {
    expect(estRedaction(ia)).toBe(true);
    expect(estRedaction(redaction)).toBe(true);
    expect(estRedaction(littre)).toBe(false);
  });
});

describe("signatureRedaction", () => {
  it("ignore les ouvrages et l'ordre", () => {
    expect(signatureRedaction([littre, ia])).toBe(signatureRedaction([ia]));
    expect(signatureRedaction([ia, redaction])).toBe(signatureRedaction([redaction, littre, ia]));
  });
  it("distingue deux rédactions différentes", () => {
    expect(signatureRedaction([ia])).not.toBe(signatureRedaction([{ ouvrage: "IA", entree: "Claude Fable 5.1" }]));
    expect(signatureRedaction([ia])).not.toBe(signatureRedaction([ia, redaction]));
  });
  it("est vide sans source de rédaction", () => {
    expect(signatureRedaction([littre])).toBe("");
  });
});
