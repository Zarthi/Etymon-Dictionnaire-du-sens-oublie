import { afterEach, describe, expect, it, vi } from "vitest";
import { lire, lireOuErreur } from "../lib/reseau.ts";

afterEach(() => vi.unstubAllGlobals());

describe("lire", () => {
  it("rend le texte d'une réponse 200", async () => {
    vi.stubGlobal("fetch", async () => new Response("bonjour", { status: 200 }));
    expect(await lire("https://exemple.org")).toEqual({ lue: true, texte: "bonjour" });
  });
  it("distingue une réponse HTTP autre que 200 d'une erreur réseau", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 404 }));
    expect(await lire("https://exemple.org")).toEqual({ lue: false, statut: 404, raison: "HTTP 404" });
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    expect(await lire("https://exemple.org")).toEqual({ lue: false, raison: "erreur réseau" });
  });
  it("borne la requête par un délai", async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal("fetch", async (_url: string, options?: RequestInit) => {
      signal = options?.signal ?? undefined;
      return new Response("", { status: 200 });
    });
    await lire("https://exemple.org");
    expect(signal).toBeInstanceOf(AbortSignal);
  });
  it("lireOuErreur nomme l'adresse et la raison", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 500 }));
    await expect(lireOuErreur("https://exemple.org/x")).rejects.toThrow("https://exemple.org/x : HTTP 500");
  });
});
