import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { schemaDossier, schemaVerdict, sourcesDuDossier, squeletteDossier } from "../lib/atelier.ts";
import { annee, lireNotices } from "../lib/bnf.ts";
import { lireTlfi } from "../lib/tlfi.ts";
import { ajouter } from "../liste.ts";
import { passages } from "../texte.ts";
import { validerDepot } from "../valider-fiches.ts";

const fait = (ouvrage: string, entree: string) => ({ fait: `${ouvrage} ${entree}`, source: { ouvrage, entree } });

describe("dossier", () => {
  it("le squelette posé par npm run dossier n'est pas un dossier complet : ni chemin, ni fait", () => {
    const erreurs = schemaDossier.safeParse(squeletteDossier("ennui", [])).error?.issues.map((i) => i.path[0]);
    expect(erreurs).toEqual(["chemin", "faits"]);
  });
  it("les sources d'une fiche sont les entrées consultées du dossier, sans doublon, dans l'ordre", () => {
    const dossier = schemaDossier.parse({
      ...squeletteDossier("ennui", []),
      chemin: "ordinaire",
      faits: [fait("tlfi", "ennui"), fait("littre", "ennui"), fait("tlfi", "ennui"), fait("gaffiot", "odium")],
    });
    expect(sourcesDuDossier(dossier)).toEqual([
      { ouvrage: "tlfi", entree: "ennui" },
      { ouvrage: "littre", entree: "ennui" },
      { ouvrage: "gaffiot", entree: "odium" },
    ]);
  });
});

describe("verdict de la relecture", () => {
  it("une fiche à reprendre a au moins une remarque", () => {
    expect(schemaVerdict.safeParse({ decision: "a-reprendre", remarques: [] }).success).toBe(false);
    expect(schemaVerdict.safeParse({ decision: "accepte" }).success).toBe(true);
  });
});

describe("TLFi", () => {
  it("garde la nature et le texte brut de la rubrique étymologique, rien d'autre", () => {
    const reponse = {
      header: { full_pos: "verbe" },
      content: [
        { id: "wiktionnaire", content: ["<div>interdit</div>"] },
        { id: "etymology", content: ['<div class="s-etymology">Du lat. pop. *<span class="t-i">extonare</span></div>'] },
      ],
    };
    expect(lireTlfi(reponse)).toEqual({ nature: "verbe", etymologie: "Du lat. pop. *extonare" });
    expect(lireTlfi({ content: [{ id: "tlfi", content: [] }] })).toBeUndefined();
  });
});

describe("BnF", () => {
  it.each([
    ["18570430", "1857"],
    ["-01060103", "106 av. J.-C."],
    ["1516", "1516"],
    ["19..", undefined],
  ])("année de « %s »", (code, attendue) => expect(annee(code)).toBe(attendue));

  const zone = (tag: string, sousZones: Record<string, string>) =>
    `<mxc:datafield tag="${tag}" ind1=" " ind2=" ">${Object.entries(sousZones)
      .map(([c, v]) => `<mxc:subfield code="${c}">${v}</mxc:subfield>`)
      .join("")}</mxc:datafield>`;
  const notice = (cb: string, ...zones: string[]) => `<mxc:record format="UNIMARC" id="ark:/12148/${cb}" type="Authority">${zones.join("")}</mxc:record>`;

  it("lit une personne et une œuvre : forme d'entrée, dates, variantes", () => {
    const xml = [
      notice(
        "cb11885977m",
        zone("103", { a: "-01060103 -00431207" }),
        zone("200", { a: "Cicéron", f: "0106-0043 av. J.-C." }),
        zone("400", { a: "Tullius Cicero", b: "Marcus" }),
      ),
      notice("cb11938048d", zone("103", { a: " 1516 " }), zone("240", { a: "Thomas More", t: "Utopia" }), zone("440", { a: "Thomas More", t: "L'utopie" })),
    ].join("");
    expect(lireNotices(xml)).toEqual([
      { cb: "cb11885977m", type: "personne", entree: "Cicéron", naissance: "106 av. J.-C.", mort: "43 av. J.-C.", variantes: ["Tullius Cicero, Marcus"] },
      { cb: "cb11938048d", type: "oeuvre", entree: "Utopia", auteur: "Thomas More", date: "1516", variantes: ["L'utopie"] },
    ]);
  });
});

describe("npm run texte", () => {
  it("rend les passages autour du texte cherché, fusionnés s'ils se chevauchent", () => {
    const texte = `${"x".repeat(100)} religio ${"y".repeat(10)} Religio ${"z".repeat(100)} religio`;
    const trouves = passages(texte, "religio", 40);
    expect(trouves).toHaveLength(2);
    expect(trouves[0]).toContain("religio yyyyyyyyyy Religio");
  });
});

describe("essai de fiches avec le dépôt", () => {
  const depot = fileURLToPath(new URL("fixtures/depot-conforme", import.meta.url));
  it("une fiche d'essai est validée avec le dépôt sans être écrite", async () => {
    const essai = {
      fichier: "e/ex/exemple.yaml",
      texte:
        "mot: exemple\nnature: [ nom masculin ]\netymologie:\n  - forme: exemplum\n    langue: latin\n    sens: échantillon\nexplication: Un essai.\nrenvois: [ inconnu ]\nthemes: []\nredaction:\n  - par: IA\n    detail: essai\nstatut: a-verifier\n",
    };
    const { fiches, erreurs } = await validerDepot(depot, [essai]);
    expect(fiches.map((f) => f.id)).toContain("exemple");
    expect(erreurs.filter((e) => e.fichier.endsWith("exemple.yaml")).map((e) => e.champ)).toEqual(["renvois"]);
  });
});

describe("npm run liste", () => {
  it("ajoute une valeur à la fin, une seule fois", () => {
    expect(ajouter(["juive", "chrétienne"], "musulmane")).toEqual(["juive", "chrétienne", "musulmane"]);
    expect(ajouter(["juive", "chrétienne"], "juive")).toEqual(["juive", "chrétienne"]);
  });
});
