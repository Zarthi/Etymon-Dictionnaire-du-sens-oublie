import { describe, expect, it } from "vitest";
import { chercherDans, chercherParagraphes, CORPUS, numeralHebreu, pageSuivante, paragraphesThomas, repereDePage } from "../lib/corpus.ts";

describe("corpus de réflexe", () => {
  it.each([
    [1, "א"],
    [15, "טו"],
    [16, "טז"],
    [22, "כב"],
    [50, "נ"],
  ])("chapitre %i en numéral hébreu : %s", (n, attendu) => expect(numeralHebreu(n)).toBe(attendu));

  it("couvre les cinq livres de la Torah pour Rashi, et les vingt livres des Étymologies", () => {
    expect(CORPUS.find((o) => o.id === "rashi-torah")?.pages).toHaveLength(187);
    expect(CORPUS.find((o) => o.id === "somme-theologique")?.chaine).toBe("https://www.corpusthomisticum.org/sth1001.html");
    expect(CORPUS.find((o) => o.id === "etymologies")?.pages?.at(-1)?.url).toMatch(/Liber_XX$/);
  });

  it("trouve le radical sans égard à la casse ni à u/v, et met d'abord les explications de mots", () => {
    const texte = "Deus misericors est. Et hinc appellata misericordia, quod miserum cor faciat. Nihil aliud.";
    expect(chercherDans(texte, "misericord")).toEqual([
      { passage: "Et hinc appellata misericordia, quod miserum cor faciat.", explique: true },
    ]);
    expect(chercherDans(texte, "MISERICOR").map((t) => t.explique)).toEqual([true, false]);
    expect(chercherDans("Religio uinculo dicta.", "vinculo")).toHaveLength(1);
  });

  it("ignore les voyelles hébraïques", () => {
    expect(chercherDans("וַיַּעֲמֹד הַשָּׂטָן לְשִׂטְנוֹ׃ ועוד", "שטן")).toHaveLength(1);
  });

  describe("Somme théologique (Corpus Thomisticum)", () => {
    const html = `<HTML><HEAD><TITLE>Thomas de Aquino, Summa Theologiae, II&ordf;-IIae q. 1-16</TITLE></HEAD><BODY>
<A HREF="sth3000.html"><IMG SRC="icons/ageretro.gif" ALT="age retro"></A>
<A HREF="sth3017.html"><IMG SRC="icons/ageultra.gif" ALT="age ultra"></A>
<SCRIPT>document.write('<OPTION VALUE="#1">II&ordf;-IIae q. 8 pr.');</SCRIPT>
<DIV CLASS="D">Quaestio 8</DIV>
<P TITLE="II-II q. 8 a. 1 co."><A NAME="1"><SPAN CLASS="ref">[1] II&ordf;-IIae q. 8 a. 1 co. </SPAN></A>Respondeo dicendum quod <I>intelligere</I> dicitur quasi intus legere. Nihil aliud.</P>
<P TITLE="II-II q. 8 a. 2 ad 1"><A NAME="2"><SPAN CLASS="ref">[2] II&ordf;-IIae q. 8 a. 2 ad 1 </SPAN></A>Ad primum dicendum quod pax non est hic.</P></BODY></HTML>`;

    it("lit la page suivante et le repère de la page", () => {
      expect(pageSuivante(html)).toBe("https://www.corpusthomisticum.org/sth3017.html");
      expect(pageSuivante("<HTML>sans flèche</HTML>")).toBeUndefined();
      expect(repereDePage(html)).toBe("IIa-IIae q. 1-16");
    });

    it("repère chaque paragraphe par son article, sans le menu de la page", () => {
      expect(paragraphesThomas(html).split("\n")).toEqual([
        "[IIa-IIae q. 8 a. 1 co.] Respondeo dicendum quod intelligere dicitur quasi intus legere. Nihil aliud.",
        "[IIa-IIae q. 8 a. 2 ad 1] Ad primum dicendum quod pax non est hic.",
      ]);
    });

    it("cherche dans les paragraphes et rend le repère de l'article", () => {
      const texte = paragraphesThomas(html);
      expect(chercherParagraphes(texte, "intellig")).toEqual([
        { repere: "IIa-IIae q. 8 a. 1 co.", passage: "Respondeo dicendum quod intelligere dicitur quasi intus legere.", explique: true },
      ]);
      expect(chercherParagraphes(texte, "pax")[0].repere).toBe("IIa-IIae q. 8 a. 2 ad 1");
      expect(chercherParagraphes(texte, "q. 8")).toEqual([]);
    });
  });
});
