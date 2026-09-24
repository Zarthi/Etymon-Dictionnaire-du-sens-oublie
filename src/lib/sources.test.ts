import { describe, expect, it } from "vitest";
import { signatureRedaction, type Redaction } from "./sources.ts";

const opus: Redaction = { par: "IA", detail: "Claude Opus 5.5" };
const fable: Redaction = { par: "IA", detail: "Claude Fable 5.1" };
const correction: Redaction = { par: "Étymon", detail: "correction suite à une Critique" };

describe("signatureRedaction", () => {
  it("ne dépend pas de l'ordre", () => {
    expect(signatureRedaction([opus, correction])).toBe(signatureRedaction([correction, opus]));
  });
  it("distingue deux rédactions différentes", () => {
    expect(signatureRedaction([opus])).not.toBe(signatureRedaction([fable]));
    expect(signatureRedaction([opus])).not.toBe(signatureRedaction([opus, correction]));
  });
});
