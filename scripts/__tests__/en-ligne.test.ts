import { describe, expect, it } from "vitest";
import { morceaux, morceauxAbsents, normaliserCitation, pageIntrouvable, texteDePage } from "../lib/en-ligne.ts";

const PAGE = `<html><head><title>Liber IV</title><style>p { color: red }</style><script>var hoc = 1;</script></head>
<body><p>Hoc vinculo pietatis obstricti Deo et religati sumus; unde ipsa religio nomen accepit,
non ut Cicero interpretatus est, a relegendo.</p></body></html>`;

describe("texteDePage", () => {
  it("garde le texte, sans scripts ni styles", () => {
    const texte = texteDePage(PAGE);
    expect(texte).toContain("Hoc vinculo pietatis");
    expect(texte).not.toContain("color");
    expect(texte).not.toContain("var hoc");
  });
});

describe("normaliserCitation", () => {
  it("confond u/v et i/j, ignore casse, accents et ponctuation", () => {
    expect(normaliserCitation("Hoc uinculo, pietatis; Iesus")).toBe(normaliserCitation("hoc vinculo pietatis — jesus"));
    expect(normaliserCitation("ἀνάλυσις")).toBe("αναλυσις");
  });
});

describe("morceaux", () => {
  it("coupe la citation à chaque « […] », « … » ou « — »", () => {
    expect(morceaux("hoc uinculo […] religio nomen — a relegendo…")).toEqual(["hoc uinculo", "religio nomen", "a relegendo"]);
  });
});

describe("morceauxAbsents", () => {
  it("retrouve une citation fidèle malgré les variantes d'édition", () => {
    const citation = "hoc uinculo pietatis obstricti deo et religati sumus: unde ipsa religio nomen accepit, non ut Cicero interpretatus est a relegendo";
    expect(morceauxAbsents(citation, texteDePage(PAGE))).toEqual([]);
  });
  it("recolle un mot coupé en fin de ligne par la numérisation", () => {
    const ocr = "la  tourmente  et  l'obsède  au  de- \nhors ,  à  peu  près";
    expect(morceauxAbsents("la tourmente et l'obsède au dehors", ocr)).toEqual([]);
    expect(morceauxAbsents("une chose peu-à-peu", "une chose peu-à-peu")).toEqual([]);
  });
  it("signale le morceau inventé", () => {
    expect(morceauxAbsents("hoc uinculo pietatis […] religio uera libertas", texteDePage(PAGE))).toEqual(["religio uera libertas"]);
  });
});

describe("pageIntrouvable", () => {
  it("reconnaît la page d'entrée absente de bailly.app", () => {
    expect(pageIntrouvable("<title>Page introuvable — Bailly.app</title>")).toBe(true);
    expect(pageIntrouvable("<title>φρήν (phrēn) — Bailly.app</title>")).toBe(false);
  });
});
