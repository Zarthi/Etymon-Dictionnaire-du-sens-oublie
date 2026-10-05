import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { schemaDossier, schemaVerdict, sourcesDuDossier, squeletteDossier } from "../lib/atelier.ts";
import { annee, datesAffichees, lireNotices, lireNoticesIntermarc, reponseEnErreur } from "../lib/bnf.ts";
import { graphieDuLittre } from "../lib/littre.ts";
import { lireTlfi, planDesSens, premierAvecEtymologie, type ReponseTlfi } from "../lib/tlfi.ts";
import { ajouter } from "../liste.ts";
import { passages } from "../texte.ts";
import { validerDepot } from "../valider-fiches.ts";

const fait = (ouvrage: string, entree: string) => ({ fait: `${ouvrage} ${entree}`, source: { ouvrage, entree } });

describe("dossier", () => {
  it("le squelette posé par npm run dossier n'est pas un dossier complet : ni chemin, ni usage, ni fait", () => {
    const erreurs = schemaDossier.safeParse(squeletteDossier("ennui", [])).error?.issues.map((i) => i.path[0]);
    expect(erreurs).toEqual(["chemin", "usage", "faits"]);
  });
  it("les sources d'une fiche sont les entrées consultées du dossier, sans doublon, dans l'ordre", () => {
    const dossier = schemaDossier.parse({
      ...squeletteDossier("ennui", []),
      chemin: "ordinaire",
      usage: fait("tlfi", "ennui"),
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
  it("garde la nature, le plan des sens et la rubrique étymologique, sans exemples ni wiktionnaire", () => {
    const reponse = {
      header: { full_pos: "verbe" },
      content: [
        {
          id: "tlfi",
          content: [
            '<div class="s-structure-num">A. —</div><span class="s-usage-indicator">Vieilli</span><div class="s-definition">Frapper de stupeur.</div><div class="s-example">exemple</div><div class="s-structure-num">B. —</div><div class="s-definition">Causer une vive surprise.</div>',
          ],
        },
        { id: "wiktionnaire", content: ["<div>interdit</div>"] },
        { id: "etymology", content: ['<div class="s-etymology">Du lat. pop. *<span class="t-i">extonare</span></div>'] },
      ],
    };
    expect(lireTlfi(reponse)).toEqual({
      nature: "verbe",
      sens: ["A. [Vieilli] Frapper de stupeur.", "B. Causer une vive surprise."],
      etymologie: "Du lat. pop. *extonare",
    });
    expect(lireTlfi({ content: [{ id: "tlfi", content: [] }] })).toBeUndefined();
  });
});

describe("TLFi : plan des sens", () => {
  it("garde la marque d'usage entière, balises imbriquées comprises (foi : « Vieilli ou dans des loc. »)", () => {
    const article =
      "<span class='s-structure-num'>A. —</span><span class='s-usage-condition'>[L'idée dominante est celle d'engagement]</span>" +
      "<span class='s-usage-indicator'><span class='t-i'>Vieilli </span>ou dans des <span class='t-i'>loc.</span></span>" +
      "<div role='list'><div><span class='s-structure-num'>1.</span> <span class='s-definition'>Assurance donnée de tenir un <span class='t-i'>engagement</span>.</span></div></div>";
    expect(planDesSens(article)).toEqual(["A. [Vieilli ou dans des loc.] 1. Assurance donnée de tenir un engagement."]);
  });
});

describe("TLFi : choix de la nature", () => {
  const avecEtymologie = (nature: string): ReponseTlfi => ({
    header: { full_pos: nature },
    content: [{ id: "etymology", content: ["<div>Du lat. amicus</div>"] }],
  });
  const adjectif: ReponseTlfi = { header: { full_pos: "adjectif", others: [{ pos: "nom" }] }, content: [] };

  it("essaie les autres natures quand la première n'a pas d'étymologie (ami, ennemi)", async () => {
    const demandees: (string | undefined)[] = [];
    const charger = async (nature?: string) => {
      demandees.push(nature);
      return { reponse: nature === "nom" ? avecEtymologie("nom") : adjectif };
    };
    expect(await premierAvecEtymologie(charger)).toMatchObject({ tlfi: { nature: "nom", etymologie: "Du lat. amicus" } });
    expect(demandees).toEqual([undefined, "nom"]);
  });
  it("ne demande rien de plus quand la première nature a son étymologie", async () => {
    let appels = 0;
    const charger = async () => (appels++, { reponse: avecEtymologie("verbe") });
    expect((await premierAvecEtymologie(charger)).tlfi?.nature).toBe("verbe");
    expect(appels).toBe(1);
  });
  describe("homographes (lire : monnaie ou verbe)", () => {
    const article = (pos: string, full: string, autres: string[]): ReponseTlfi => ({
      header: { pos, full_pos: full, others: autres.map((p) => ({ pos: p })) },
      content: [{ id: "etymology", content: [`<div>${full}</div>`] }],
    });
    const lire = (nature?: string) =>
      Promise.resolve({ reponse: nature === "verbe" ? article("verbe", "verbe", ["nom"]) : article("nom", "nom féminin", ["verbe"]) });
    it("préfère la nature attendue, et liste les autres articles", async () => {
      expect(await premierAvecEtymologie(lire, "verbe")).toMatchObject({ tlfi: { nature: "verbe" }, autres: ["nom"] });
    });
    it("reconnaît « nom féminin » dans l'article « nom »", async () => {
      expect(await premierAvecEtymologie(lire, "nom féminin")).toMatchObject({ tlfi: { nature: "nom féminin" }, autres: ["verbe"] });
    });
    it("sans nature attendue, garde l'ordre de l'API", async () => {
      expect(await premierAvecEtymologie(lire)).toMatchObject({ tlfi: { nature: "nom féminin" }, autres: ["verbe"] });
    });
    it("une nature attendue absente du portail laisse l'article par défaut", async () => {
      expect(await premierAvecEtymologie(lire, "adjectif")).toMatchObject({ tlfi: { nature: "nom féminin" } });
    });
  });
  describe("graphie du Littré", () => {
    const entree = (terme: string) => ({ terme, nature: "v. a.", etymologie: "" });
    it("rend la graphie accentuée d'un mot écrit sans accents", () => {
      expect(graphieDuLittre([entree("ÉLIRE")], "elire")).toBe("élire");
    });
    it("rien si le mot est déjà écrit comme le Littré, ou si l'entrée est un autre mot", () => {
      expect(graphieDuLittre([entree("élire")], "élire")).toBeUndefined();
      expect(graphieDuLittre([entree("elirer")], "elire")).toBeUndefined();
    });
  });
  it("rend un résultat vide si aucune nature n'a d'étymologie", async () => {
    expect(await premierAvecEtymologie(async () => ({ reponse: adjectif }))).toEqual({});
  });
  it("ne cherche rien dans une page non lue, et dit pourquoi", async () => {
    expect(await premierAvecEtymologie(async () => ({ injoignable: "HTTP 503" }))).toEqual({ injoignable: "HTTP 503" });
  });
});

describe("BnF", () => {
  it.each([
    ["18570430", "1857"],
    ["-01060103", "106 av. J.-C."],
    ["1516", "1516"],
    ["19..", undefined],
  ])("année de « %s »", (code, attendue) => expect(annee(code)).toBe(attendue));

  it.each([
    ["1857-1939", { naissance: "1857", mort: "1939" }],
    ["0106-0043 av. J.-C.", { naissance: "106 av. J.-C.", mort: "43 av. J.-C." }],
    ["0427?-0348? av. J.-C.", { naissance: "vers 427 av. J.-C.", mort: "vers 348 av. J.-C." }],
    ["0004 av. J.-C.?-0065", { naissance: "vers 4 av. J.-C.", mort: "65" }],
    ["1940-", { naissance: "1940" }],
    ["13..-14..", undefined],
  ])("dates affichées « %s »", (f, attendues) => expect(datesAffichees(f)).toEqual(attendues));

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
      notice("cb11920019p", zone("103", { a: "-0427" }), zone("200", { a: "Platon", f: "0427?-0348? av. J.-C." })),
      notice("cb11938048d", zone("103", { a: " 1516 " }), zone("240", { a: "Thomas More", t: "Utopia" }), zone("440", { a: "Thomas More", t: "L'utopie" })),
    ].join("");
    expect(lireNotices(xml)).toEqual([
      { cb: "cb11885977m", type: "personne", entree: "Cicéron", naissance: "106 av. J.-C.", mort: "43 av. J.-C.", variantes: ["Tullius Cicero, Marcus"] },
      { cb: "cb11920019p", type: "personne", entree: "Platon", naissance: "vers 427 av. J.-C.", mort: "vers 348 av. J.-C.", variantes: [] },
      { cb: "cb11938048d", type: "oeuvre", entree: "Utopia", auteur: "Thomas More", date: "1516", variantes: ["L'utopie"] },
    ]);
  });
});

describe("notice d'œuvre que le serveur ne rend pas en UNIMARC", () => {
  const diagnostic = `<srw:recordData>  <srw:diagnostics>    <sd:diagnostic><sd:uri>info:srw/diagnostic/1/131</sd:uri><sd:message>erreur de traitement</sd:message></sd:diagnostic>  </srw:diagnostics>      </srw:recordData>`;
  const champ = (tag: string, ...sous: [string, string][]) =>
    `<mxc:datafield tag="${tag}" ind1=" " ind2=" ">${sous.map(([c, v]) => `<mxc:subfield code="${c}">${v}</mxc:subfield>`).join("")}</mxc:datafield>`;
  const intermarc = `<mxc:record format="INTERMARC" id="ark:/12148/cb12134897m" type="Authority">${[
    champ("100", ["a", "Cicéron"], ["d", "0106-0043 av. J.-C."]),
    champ("145", ["a", "Les devoirs"]),
    champ("145", ["a", "De officiis"]),
    champ("445", ["a", "Traité des devoirs"]),
    champ("609", ["r", "oeu0"], ["d", "-00.. "]),
  ].join("")}</mxc:record>`;

  it("reconnaît le diagnostic du serveur : ce n'est pas une notice qui n'est pas une œuvre", () => {
    expect(reponseEnErreur(diagnostic)).toBe(true);
    expect(lireNotices(diagnostic)).toEqual([]);
    expect(reponseEnErreur("<srw:records></srw:records>")).toBe(false);
  });

  it("lit l'œuvre dans le format de repli : titre retenu en 145, titre original et 445 en variantes", () => {
    expect(lireNoticesIntermarc(intermarc)).toEqual([
      { cb: "cb12134897m", type: "oeuvre", entree: "Les devoirs", auteur: "Cicéron", variantes: ["De officiis", "Traité des devoirs"] },
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
        "mot: exemple\nnature: [ nom masculin ]\netymologie:\n  - forme: exemplum\n    langue: latin\n    sens: échantillon\nexplication: Un essai.\nrenvois: [ inconnu ]\nthemes: [ savoir ]\nredaction:\n  - par: IA\n    detail: essai\nstatut: a-verifier\n",
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
