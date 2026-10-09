import { readdirSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { z } from "zod";
import langues from "../data/langues.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import traditions from "../data/traditions.json" with { type: "json" };
import { LICENCES, NATURES, schemaAuteur, schemaEntreeRedaction, schemaFiche, schemaLectureTraditionnelle, schemaOuvrage, schemaRacine } from "../src/lib/schema.ts";
import { REDACTEURS } from "../src/lib/sources.ts";
import { CHEMINS, DRAPEAUX, schemaDossier, schemaReferences, schemaVerdict } from "./lib/atelier.ts";
import { CORPUS } from "./lib/corpus.ts";
import { cheminFiche } from "./lib/validation.ts";

/**
 * Contrat de données, généré à partir du schéma (src/lib/schema.ts) :
 * - docs/fiche.schema.json, auteur.schema.json, ouvrage.schema.json : schémas JSON, pour
 *   l'autocomplétion et la vérification dans VS Code ;
 * - docs/contrat-fiche.md : les trois types de fiches, lisibles ;
 * - docs/consignes/*.md : les consignes de la rédaction autonome (docs/methode.md), celles du
 *   rédacteur, du relecteur et de chaque étape, avec des fiches réelles du dépôt pour exemples.
 * Un test échoue si ces fichiers ne sont plus à jour : lancer `npm run contrat`.
 */
const docs = (nom: string) => fileURLToPath(new URL(`../docs/${nom}`, import.meta.url));
export const SCHEMAS_JSON = [
  { fichier: docs("fiche.schema.json"), schema: schemaFiche, titre: "Fiche d'Étymon" },
  { fichier: docs("auteur.schema.json"), schema: schemaAuteur, titre: "Auteur d'Étymon" },
  { fichier: docs("ouvrage.schema.json"), schema: schemaOuvrage, titre: "Ouvrage d'Étymon" },
  { fichier: docs("racine.schema.json"), schema: schemaRacine, titre: "Racine d'Étymon" },
];
export const FICHIER_CONTRAT = docs("contrat-fiche.md");
const DATA = fileURLToPath(new URL("../data", import.meta.url));

type Noeud = {
  type?: string;
  description?: string;
  enum?: string[];
  anyOf?: Noeud[];
  items?: Noeud;
  properties?: Record<string, Noeud>;
  required?: string[];
  minItems?: number;
  format?: string;
  pattern?: string;
};

export function genererSchemaJson(schema: z.ZodType, titre: string): Record<string, unknown> {
  return { ...z.toJSONSchema(schema, { target: "draft-7", unrepresentable: "any", io: "input" }), title: titre };
}

/** Type d'un champ, en français. */
function type(n: Noeud): string {
  if (n.anyOf) {
    const utiles = n.anyOf.filter((a) => a.type !== "null");
    const texte = [...new Set(utiles.map(type))].join(" ou ");
    return utiles.length < n.anyOf.length ? `${texte} ou null` : texte;
  }
  if (n.enum) return n.enum.length <= 8 ? n.enum.map((v) => `\`${v}\``).join(" \\| ") : "liste fermée (voir plus bas)";
  if (n.type === "array") {
    const items = n.items ?? {};
    const element =
      items.type === "object"
        ? "objets (voir plus bas)"
        : items.enum && items.enum.length > 8
          ? "valeurs d'une liste fermée (voir plus bas)"
          : items.enum
            ? type(items)
            : items.pattern
              ? "identifiants"
              : "textes";
    return `liste${n.minItems ? " non vide" : ""} ${/^[aeiouy]/.test(element) ? "d'" : "de "}${element}`;
  }
  if (n.type === "object") return "objet (voir plus bas)";
  // Une valeur de n'importe quel type JSON (le remplacement d'un verdict).
  if (n.type === undefined) return "JSON";
  if (n.type === "boolean") return "`true` \\| `false`";
  if (n.type === "integer" || n.type === "number") return "nombre";
  if (n.format === "uri") return "adresse https";
  if (n.pattern?.includes("\\d{4}-")) return "date AAAA-MM-JJ";
  if (n.pattern?.includes("siècle")) return "date historique";
  if (n.pattern?.startsWith("^[a-z0-9]")) return "identifiant";
  return "texte";
}

/** Objets imbriqués (etymologie, sources…), à détailler dans leur propre tableau. */
function objetDe(n: Noeud): Noeud | undefined {
  if (n.type === "object" && n.properties) return n;
  if (n.anyOf) return n.anyOf.map(objetDe).find(Boolean);
  if (n.type === "array" && n.items) return objetDe(n.items);
  return undefined;
}

function tableau(n: Noeud, chemin: string, sections: string[], titre = "###"): string {
  const lignes = ["| Champ | Type | Obligatoire | Description |", "|---|---|---|---|"];
  for (const [nom, champ] of Object.entries(n.properties ?? {})) {
    const obligatoire = n.required?.includes(nom) ? "oui" : "non";
    // Échapper ce que Markdown prendrait pour de la mise en forme : | des tableaux, _…_ et *.
    const description = (champ.description ?? "")
      .replaceAll("|", "\\|")
      .replaceAll("_…_", "`_…_`")
      .replace(/\*(?=[ .])/g, "`*`");
    lignes.push(`| \`${nom}\` | ${type(champ)} | ${obligatoire} | ${description} |`);
    const objet = objetDe(champ);
    if (objet) {
      // La section du parent est réservée avant celles de ses objets imbriqués : ordre de lecture naturel.
      const sousChemin = `${chemin}${nom}${champ.type === "array" ? "[]" : ""}`;
      const place = sections.push("") - 1;
      sections[place] = `${titre} \`${sousChemin}\`\n\n${tableau(objet, `${sousChemin}.`, sections, titre)}`;
    }
  }
  return lignes.join("\n");
}

/** Tableau principal d'un schéma, suivi de ceux de ses objets imbriqués. */
function contrat(schema: z.ZodType, titre: string, retirer?: (json: Noeud) => void): string[] {
  const sections: string[] = [];
  const json = genererSchemaJson(schema, "") as Noeud;
  retirer?.(json);
  const principal = tableau(json, "", sections, titre);
  return [principal, "", ...sections.flatMap((s) => [s, ""])];
}

/** Fiches d'un dossier de data/ (auteurs, ouvrages), lues telles quelles. */
function lireReferences(dossier: string): { id: string; [cle: string]: unknown }[] {
  return readdirSync(join(DATA, dossier))
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .map((f) => ({ id: f.replace(/\.yaml$/, ""), ...parse(readFileSync(join(DATA, dossier, f), "utf8")) }));
}

const REGLES = [
  "Le fichier d'un mot s'appelle `<id>.yaml`, où `id` est le mot sans accent, en minuscules, mots séparés par des tirets (`-2`, `-3` pour les homonymes, dans l'ordre du Littré), rangé dans `data/fiches/<initiale>/<deux premières lettres>/`. Un auteur : `data/auteurs/<nom>.yaml` ; un ouvrage : `data/ouvrages/<abrégé ou titre>.yaml`.",
  "Le fichier d'une racine s'appelle `<id>.yaml`, rangé à plat dans `data/racines/` : l'`id` est la forme latine sans accent, ou la translittération du grec (`religio`, `phren` pour φρήν). Sa `langue` est le latin et ses variantes, ou le grec ancien.",
  "Les mots issus d'une racine se calculent (fiches dont un maillon porte la même forme, à la translittération près, dans la même famille de langue) : ils ne s'écrivent pas dans la fiche de la racine.",
  "Une forme reconstruite commence par `*` ; une valeur commençant par `*`, contenant `: `, ou une virgule dans `{ … }`, s'écrit entre guillemets.",
  "Pas de doublon : un doublet ou un renvoi se déclare sur une seule des deux fiches ; l'adresse d'une entrée se déduit du modèle d'adresse de l'ouvrage ; la translittération du grec se déduit de la forme ; ce qui se calcule (œuvres d'un auteur, mots qu'il a forgés) ne s'écrit pas.",
  "Un champ facultatif à sa valeur par défaut ne s'écrit pas (`incertain: false`, listes vides).",
  "Toute référence (auteur, ouvrage, doublet) vise une fiche existante ; un renvoi (`renvois`, `tradition.renvois`), une fiche ou un candidat à faire (l'app ne l'affiche qu'une fois la fiche écrite ; vers la tradition, une fois qu'elle a des lectures).",
  "`etymologie` : un maillon porte une forme, des éléments, ou les deux ; ou bien des alternatives. Le maillon du sens premier porte un sens (une composition, le sens littéral de ses éléments) ; au plus un maillon est `premier`.",
  "Translittération : seulement pour une écriture ni latine ni grecque (arabe, hébreu), et alors obligatoire.",
  "`selon` : seulement dans une origine débattue ; chaque tenant est un auteur ou un ouvrage existant (un dictionnaire sans auteur unique, Lewis & Short, peut être tenant) ; un ouvrage qui ne fait que rapporter une hypothèse n'en est pas le tenant.",
  "`croisement` : seulement pour un maillon qui a une forme ; mêmes règles que les formes d'un maillon (langue de la liste fermée, translittération seulement pour une écriture ni latine ni grecque, sens sans guillemets).",
  "Lecture traditionnelle : sa voix se déduit de l'œuvre citée (son auteur, ou l'œuvre elle-même pour l'Écriture) ; `auteur` ne s'écrit que pour une parole rapportée par l'œuvre d'un autre (Rabban Gamliel dans la Michna), de la tradition de l'œuvre si elle n'a pas d'auteur ; une seule voix par lecture ; `tradition` seulement si un auteur en a plusieurs (l'Écriture reçue en commun les garde toutes) ; une `hypothese` parmi les alternatives de la chaîne ; la citation figure mot pour mot à l'adresse de la source (`npm run verifier:en-ligne`).",
  "Une œuvre ne porte `traditions` que si elle n'a pas d'auteur (Talmud, Écriture) ; une traduction de l'Écriture (Vulgate, Septante) est une œuvre sans auteur, le traducteur allant dans `edition` ou `description`.",
  "Mot sacré (`sacre`) : pas d'explication ; les maillons n'ont pas de sens, sauf, si aucune lecture n'est `premier`, celui de la langue sacrée ; la lecture `premier` (le texte d'origine, avec son `sens`) est reçue par toutes les traditions du mot, les autres lectures parlent dans l'une d'elles.",
  "Le Nom divin s'écrit comme le texte l'écrit (Yah, YHWH), jamais vocalisé (« Jéhovah », « Yahvé »).",
  "`renvois` : ni doublet, ni mot de la famille (une notion voisine, pas une racine commune). `tradition.renvois` : à sens unique, affiché du seul côté de la fiche qui le déclare.",
  "Les textes sont bruts, sans mise en forme : l'app met en italique les formes de la chaîne et pose les liens (mots qui ont une fiche ; auteurs et ouvrages cités par la fiche, sous leur nom, une forme de `cite`, leur titre ou leur abrégé). Une forme qui désignerait deux pages dans une même fiche est refusée : écrire le nom complet.",
  "`explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus ; `description` : 200 caractères au plus.",
  "Typographie française dans les sens et les textes : guillemets « », espace insécable avant `:` `;` `?` `!` ; les sens s'écrivent sans guillemets.",
  "Hors statut `a-verifier`, `sources` contient au moins un ouvrage consulté.",
  "Aucun alias YAML, aucune clé en double, aucun champ inconnu.",
];

export function genererMarkdown(): string {
  return [
    "# Contrat de données : les fiches",
    "",
    "> Généré par `npm run contrat` à partir de `src/lib/schema.ts` : ne pas modifier à la main.",
    "> Les mêmes contrats existent en schémas JSON (`docs/*.schema.json`), utilisés par VS Code",
    "> pour l'autocomplétion et la vérification des fiches pendant la saisie.",
    "",
    "Quatre types de fiches, en YAML, avec le même socle éditorial (`sources`, `redaction`, `statut`, `historique`).",
    "Exemples : `data/fiches/r/re/religion.yaml`, `data/auteurs/augustin.yaml`, `data/ouvrages/littre.yaml`, `data/racines/religio.yaml`.",
    "",
    "## Fiche d'un mot (`data/fiches`)",
    "",
    ...contrat(schemaFiche, "###"),
    "## Fiche d'un auteur (`data/auteurs`)",
    "",
    ...contrat(schemaAuteur, "###"),
    "## Fiche d'un ouvrage (`data/ouvrages`)",
    "",
    ...contrat(schemaOuvrage, "###"),
    "## Racine grecque ou latine (`data/racines`)",
    "",
    ...contrat(schemaRacine, "###"),
    "## Listes fermées",
    "",
    `- \`nature\` : ${NATURES.join(", ")}.`,
    `- \`langue\` (data/langues.json) : ${langues.join(", ")}.`,
    `- \`themes\` (data/themes.json) : ${themes.join(", ")}.`,
    `- \`traditions\` (data/traditions.json) : ${traditions.join(", ")}.`,
    `- \`licence\` : ${LICENCES.join(", ")}.`,
    `- \`redaction[].par\` : ${REDACTEURS.join(", ")}.`,
    "",
    "## Règles vérifiées en plus de la structure (`npm run valider`)",
    "",
    ...REGLES.map((r) => `- ${r}`),
    "",
  ].join("\n");
}

/**
 * Fiches réelles montrées en exemple à l'IA : simple, filiation (arabe translittéré), filiation et composition,
 * mot forgé, origine débattue, nom de personne et étymologie écartée.
 */
const EXEMPLES = ["etonner", "chiffre", "philosophie", "schizophrenie", "religion", "algorithme"];
/** Mots dont la nature n'est pas dans le Littré : l'exemple la garde. */
const HORS_LITTRE = new Set(["schizophrenie"]);

/** Contenu d'une fiche tel que l'IA l'écrit : ni socle éditorial, ni lectures, ni valeurs par défaut. */
function contenuDe(id: string): Record<string, unknown> {
  const fiche = parse(readFileSync(join(DATA, "fiches", cheminFiche(id)), "utf8"));
  const { sources: _s, redaction: _r, statut: _t, historique: _h, nature, ...contenu } = fiche;
  // Les lectures s'écrivent à part : l'exemple ne garde de la tradition que ses renvois.
  if (contenu.tradition) {
    const { lectures: _l, ...reste } = contenu.tradition;
    if (Object.keys(reste).length > 0) contenu.tradition = reste;
    else delete contenu.tradition;
  }
  if (contenu.explication) contenu.explication = contenu.explication.trim();
  return HORS_LITTRE.has(id) ? { mot: contenu.mot, nature, ...contenu } : contenu;
}

const CONSIGNES = [
  "Principe : la justesse des noms, au service de la vérité. Étymon rend à chaque mot son nom juste, et s'écrit de même : chaque mot dans son sens propre, chaque phrase conforme à ce qui est et à ce que disent les sources, rien de plus. Pas de figure, pas de formule, pas d'effet. Relis chaque phrase avec une question : « que veux-tu dire exactement ? » ; si la réponse est plus claire que la phrase, écris la réponse.",
  "Tu rédiges d'après le dossier (`atelier/<id>/dossier.json`, tiré de `atelier/<id>/sources.md`) : la fiche n'affirme rien qui n'y soit (forme, langue, sens, date, auteur, tenant, histoire du mot, usage d'aujourd'hui). Si un fait te manque, va le chercher et ajoute-le au dossier avec sa source ; ce que tu sais sans l'avoir lu ne s'écrit pas. Si le dossier doute de la chaîne, `incertain: true`.",
  "Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte ; note ton doute dans `atelier/signalements.md`.",
  "`etymologie` : la chaîne, du plus proche au plus lointain, maillon par maillon comme le dossier la donne (un déverbal passe par son verbe : travail, de travailler). Le premier maillon est la langue source directe (latin pour un mot hérité, italien pour un emprunt à l'italien) ; on ne remonte que si cela ajoute un sens ou si l'origine est débattue. Un dernier maillon sans sens (le mot de base latin, credere, lex, regere) se retire : la chaîne s'arrête au maillon qui apprend quelque chose.",
  "Formes dans leur écriture d'origine (φρήν, صفر) ; translittération seulement pour l'arabe ou l'hébreu (celle du grec se déduit).",
  "`sens` seulement là où il apprend quelque chose : le sens premier, affiché seul en tête de fiche, est celui du maillon le plus lointain attesté qui en porte un. Chaque sens vient du dossier.",
  "Découper une forme composée, du tout vers les parties : la forme garde son sens attesté (jamais déduit des parties), puis ses `elements`, chacun avec son sens ; seulement si les parties parlent encore (re-legere, oui ; śāṭān, non). Une hypothèse d'une origine débattue se découpe de même (relegere : re-, « de nouveau », et legere, « recueillir »). Un même élément peut avoir deux sens selon le composé (re- : « de nouveau » dans relegere, « en arrière » dans religare) : chacun vient de l'entrée de son composé.",
  "`croisement` d'un maillon : les formes avec lesquelles la sienne s'est croisée (chétif : captivus croisé avec le gaulois *cactos ; algorithme : algorisme croisé avec ἀριθμός), seulement si une source le dit ; jamais une hypothèse tirée de la ressemblance des formes.",
  "`explication` : ce qui s'est perdu, affaibli ou retourné entre le sens premier et l'usage d'aujourd'hui (le fait `usage` du dossier). Elle n'explique pas une seconde fois le sens, affiché juste au-dessus ; mais mieux vaut redire le mot juste qu'un détour. Ton sobre, sans emphase ni jugement. Le sens ancien n'est pas le « vrai » sens du mot, ni l'usage actuel une erreur : l'explication dit ce qui a changé, l'histoire n'en juge pas.",
  "`themes` : le domaine où le mot s'emploie aujourd'hui, non celui de son sens premier (étonner : émotions, pas météo) ; un ou deux, affichés sur la fiche. Aucune liste fermée n'est exhaustive. Une langue qui manque est un fait : ajoute-la (`npm run liste -- langues \"<langue>\"`) et note-le dans `atelier/signalements.md`. Un thème qui manque ne s'ajoute pas pendant le lot : mets le plus proche, et propose le thème manquant dans `atelier/signalements.md`, avec la raison.",
  "Tout mot étranger cité dans un texte est une forme de la chaîne : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.",
  "Un mot sacré par origine (né dans l'ordre sacré : manne, sabbat, alléluia) ne se rédige pas dans le lot : signale-le dans `atelier/signalements.md`, il se rédige à part, texte d'origine sous les yeux. Un mot consacré (profane à l'origine : église, ange, baptême) se rédige comme les autres : son sens profane premier est justement ce que le dictionnaire révèle.",
  "Le Nom divin s'écrit comme le texte l'écrit (Yah, YHWH), jamais traduit (« Dieu ») ni vocalisé (« Jéhovah », « Yahvé »).",
  "Une composition : si la forme composée est attestée, elle porte son sens attesté, puis chaque élément le sien ; si le mot est forgé sur des éléments sans forme composée avant lui (schizophrénie), le sens premier est le sens littéral des éléments (esprit fendu), que l'app affiche comme tel (« littéralement »), jamais comme le sens d'une forme qui n'a pas existé.",
  "`ecartees` : étymologies proposées puis écartées ; `populaire: true` pour une idée reçue (*sincère*, « sans cire »), jamais dans la chaîne.",
  "Liens entre mots, un seul endroit selon leur raison. Un lien qui s'explique en une phrase va dans l'explication : l'app lie tout mot qui a une fiche (Bleuler renommait la démence précoce) ; un mot nommé dans l'explication n'est donc pas aussi un renvoi. `renvois` (Voir aussi) : notions voisines du même ordre que l'usage d'aujourd'hui, sans racine commune (schizophrénie → délire, folie) ; trois au plus, souvent aucun. `tradition.renvois` (sous « Lectures traditionnelles » : voir obsession) : mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) ; deux au plus, rare. Un renvoi vise un mot important du dictionnaire, qu'il ait déjà sa fiche ou non.",
  "Auteurs et ouvrages sont cités par leur identifiant dans les champs (`selon`, qui accepte aussi un ouvrage sans auteur unique comme tenant, `forge`, `personne`, `ouvrage`). S'il manque une fiche, choisis son identifiant (prénom et nom sans accent : eugen-bleuler ; abrégé ou titre : utopia) : tu la listes dans `atelier/references.json` (docs/consignes/references.md) ; elle se crée d'après sa notice BnF à la clôture du lot.",
  "Dans un texte, nomme un auteur sous son nom usuel ou une de ses formes de citation (liste ci-dessous) : l'app en fait un lien, s'il est aussi cité dans un champ de la fiche.",
  "Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` : les scripts les posent. Les lectures traditionnelles (`tradition.lectures`) s'écrivent dans le même fichier, mais dans une étape à part, texte source sous les yeux (docs/consignes/lectures.md).",
  "Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.",
];

/** Fautes relevées par la relecture critique au premier pilote (docs/journal-methode.md), et ce qu'il fallait écrire. */
const FAUTES = [
  ["La chose prend la place du mot", "« Le salaire est devenu la faveur. »", "« Le mot qui nommait le salaire a pris le sens de faveur. »"],
  ["Formule d'effet (chiasme)", "« L'ardeur est restée, le dieu n'y est plus. »", "Dire le fait : ce que le mot désignait, ce qu'il désigne aujourd'hui, selon le dossier."],
  ["Absolu que le dossier ne dit pas", "« Seul le travail du maréchal garde l'idée de contrainte. »", "Aucun « seul », « toujours », « jamais », « ne… plus que » sans un fait du dossier qui le dise."],
  ["Usage actuel de mémoire", "« Il nomme aujourd'hui moins la science que la cause. »", "L'usage d'aujourd'hui vient du fait `usage` du dossier, et de lui seul."],
  ["Chronologie inventée", "« Botanique d'abord, puis tous les êtres vivants, puis les sociétés. »", "N'ordonner dans le temps que des sens que le dossier date."],
  ["Mot d'une autre époque", "« Chez Homère, l'ange est quiconque porte une nouvelle. »", "« Chez Homère, ἄγγελος désigne… » : la forme de l'époque dont on parle."],
  ["Mot juste contourné", "Sens affiché « en haine », puis « l'aversion que disait la locution ».", "Redire « haine » : le mot juste, pas un voisin plus faible."],
  ["Premier sens mal placé", "« Le mot nomma d'abord la partie de la philosophie qui traite de l'âme » (attesté en 1690, alors que le premier emploi date de 1588).", "« D'abord » seulement pour la première attestation du dossier."],
];

const ENTETE = "> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.";

/** Consigne de rédaction d'une fiche d'après son dossier. */
export function genererPrompt(): string {
  const auteurs = lireReferences("auteurs");
  const ouvrages = lireReferences("ouvrages");
  return [
    "# Rédiger une fiche d'après son dossier",
    "",
    ENTETE,
    "",
    "Tu rédiges une fiche d'Étymon, dictionnaire du sens premier des mots français, d'après le dossier de faits du mot (`atelier/<id>/dossier.json`). Une fiche se lit en dix secondes.",
    "",
    "## Règles",
    "",
    ...CONSIGNES.map((c) => `- ${c}`),
    "",
    "## Fautes à ne pas refaire",
    "",
    "Relevées par la relecture critique au premier pilote :",
    "",
    "| Faute | Écrit | À écrire |",
    "|---|---|---|",
    ...FAUTES.map(([faute, ecrit, juste]) => `| ${faute} | ${ecrit} | ${juste} |`),
    "",
    "## Format",
    "",
    "Un fichier JSON, `atelier/<id>/fiche.json` : la fiche seule, avec les champs ci-dessous et eux seuls ; un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872 : le TLFi la donne).",
    "",
    // Les lectures s'écrivent dans une étape à part, avec leur propre format (docs/consignes/lectures.md).
    ...contrat(schemaEntreeRedaction, "###", (json) => delete json.properties?.tradition?.properties?.lectures),
    "### Listes fermées",
    "",
    `- \`nature\` : ${NATURES.join(", ")}.`,
    `- \`langue\` : ${langues.join(", ")}.`,
    `- \`themes\` : ${themes.join(", ")}.`,
    `- Auteurs existants (identifiant : nom, formes de citation) : ${auteurs.map((a) => `${a.id} (${[a.nom, ...((a.cite as string[] | undefined) ?? [])].join(", ")})`).join(" ; ")}.`,
    `- Ouvrages existants : ${ouvrages.map((o) => `${o.id} (${o.titre})`).join(", ")}.`,
    "",
    "## Exemples",
    "",
    "Fiches du dépôt (simple ; filiation ; filiation et composition ; mot forgé ; origine débattue ; nom de personne et étymologie écartée) :",
    "",
    "```json",
    // Une fiche par ligne : lisible, et moins de jetons qu'un JSON indenté.
    "[",
    EXEMPLES.map((id) => `  ${JSON.stringify(contenuDe(id))}`).join(",\n"),
    "]",
    "```",
    "",
    "## Contrôle",
    "",
    "`npm run rediger -- atelier/<id>/fiche.json --essai` : valide la fiche avec le dépôt sans l'écrire. Corrige ce qui est « à corriger » ; ce qui est « à créer » (auteurs, ouvrages) se crée d'après la BnF avant l'écriture.",
    "",
  ].join("\n");
}

/** Contrat d'un schéma d'atelier, sans le titre de premier niveau. */
const contratAtelier = (schema: z.ZodType) => contrat(schema, "###");

/** Procédure du rédacteur : un seul agent, tout le lot, tout dans atelier/ ; un script, un relecteur et un vérificateur passent après lui. */
export function genererConsigneRedacteur(): string {
  return [
    "# Rédiger un lot",
    "",
    ENTETE,
    "",
    "Tu reçois une liste de mots, dont `npm run lot -- sources` a déjà rassemblé les sources (`atelier/<id>/sources.md`). Tu travailles seul, mot après mot, et tu gardes le lot en tête : familles, doublets et renvois entre ses mots. **Tout s'écrit dans `atelier/` : tu ne touches ni `data/` ni `docs/`**, et tu ne commites pas (une langue ou une tradition qui manque est la seule exception : `npm run liste`, voir plus bas). Après toi, un relecteur qui n'a pas écrit relit, `npm run lot -- reprendre` applique ses remplacements, un vérificateur contrôle ce qui a changé, puis `npm run lot -- clore` écrit les fiches.",
    "",
    "## Passe 1 : dossiers, fiches et lectures",
    "",
    "Pour chaque mot, dans l'ordre de la liste :",
    "",
    "1. Le dossier (`docs/consignes/dossier.md`), d'après `atelier/<id>/sources.md` : tu n'en refais aucune consultation, sauf pour ce qu'il signale (⚠, « Aucune entrée ») ou ce qu'il ne couvre pas. Un mot sacré (chemin `sacre`) s'arrête là : il se rédige à part ; signale-le.",
    "2. La fiche, d'après le dossier (`docs/consignes/redaction.md`), dans `atelier/<id>/fiche.json`, puis `npm run rediger -- atelier/<id>/fiche.json --essai`.",
    "3. Les lectures traditionnelles (`docs/consignes/lectures.md`), dans `tradition.lectures` du même `fiche.json`, texte source sous les yeux : une étape à part, après la fiche, pour chaque mot au drapeau `tradition` ou dont le corpus a donné un passage ★.",
    "4. Les auteurs et ouvrages que l'essai dit « à créer » : une entrée dans `atelier/references.json` (`docs/consignes/references.md`), commune au lot.",
    "",
    "Si une fiche demande un fait que le dossier n'a pas, va le chercher et ajoute-le au dossier avec sa source, avant de l'écrire. Puis rends une ligne d'état : les mots traités, ceux mis à part. Rien d'autre : le reste est dans les fichiers.",
    "",
    "## Reprise",
    "",
    "Si on te reprend après la relecture, lis seulement `atelier/a-reprendre.md` : les remarques que le script n'a pas pu régler seul. Corrige `fiche.json` (la proposition du relecteur, telle quelle quand elle est juste ; sinon autrement, ou pas du tout, et dis pourquoi dans `atelier/signalements.md`), puis relance l'essai. Ne reformule pas ce que le relecteur n'a pas relevé. Rends une ligne d'état.",
    "",
    "## Signalements (`atelier/signalements.md`)",
    "",
    "Une ligne par point, avec le mot : doute sur le critère d'entrée ; langue ou tradition ajoutée, thème proposé ; ce que le modèle de données ne permet pas de dire ; source inaccessible ; remarque du relecteur que tu n'as pas suivie, et pourquoi. Thibault et l'affinage entre deux lots s'en servent.",
    "",
    "## Décisions (`atelier/decisions.md`)",
    "",
    "Un point qui attendrait Thibault ne t'arrête pas : décide, applique, et note la décision et sa raison dans `atelier/decisions.md`, une ligne de tableau par décision : `| sujet | décision | raison | à relire |`. `npm run lot -- clore` les reporte en tête de `docs/decisions.md`, sous une section datée. Restent à Thibault seul : `validee`, écarter un mot, changer un principe d'AGENTS.md.",
    "",
    "## Langue ou tradition qui manque",
    "",
    '`npm run liste -- langues "<langue>"` ou `traditions` : la seule commande qui écrit dans `data/` (et régénère le contrat) pendant un lot, parce que l\'essai refuse une valeur hors liste. Note-la dans `atelier/signalements.md` : l\'orchestrateur la commite avec le lot.',
    "",
  ].join("\n");
}

/** Consigne du dossier de faits d'un mot, et de son tri. */
export function genererConsigneDossier(): string {
  return [
    "# Constituer le dossier d'un mot",
    "",
    ENTETE,
    "",
    "Tu rassembles les faits dont la fiche du mot sera tirée : elle n'affirmera rien qui n'y soit. Le dossier se relit en quelques secondes.",
    "",
    "## Étapes",
    "",
    "1. Lis `atelier/<id>/sources.md`, que `npm run lot -- sources` a écrit : le Littré, du TLFi le plan des sens et la rubrique « Étymologie et historique », le début des entrées du Lewis & Short (latin) et du Bailly (grec) pour les formes relevées dans ces étymologies, et la recherche de leurs radicaux dans le corpus de réflexe. Le squelette `atelier/<id>/dossier.json` est posé. Un ⚠ ou « Aucune entrée » n'est pas une absence : consulte alors la source toi-même (`npm run dossier -- --consulter <mot voisin>`, `npm run texte -- bailly:<forme grecque>`, ou l'entrée entière d'un étymon) ; de même pour une forme que `sources.md` n'a pas relevée.",
    "2. Choisis le chemin et les drapeaux du mot (ci-dessous).",
    "3. `usage` : ce que le mot désigne aujourd'hui, d'après le plan des sens du TLFi : les sens sans marque d'ancienneté, ou marqués « Moderne » ; pas un sens « Vieilli », « vx » ou « Littér. », qui n'est plus l'usage courant.",
    "4. Les étapes du sens en français, datées, d'après la rubrique « Étymologie et historique » du TLFi : première attestation et changements de sens.",
    "5. La chaîne jusqu'au sens premier, sans aller plus loin qu'il ne faut (AGENTS.md §3.2) : pour chaque maillon, la forme et la langue ; et, pour chaque maillon qui portera un sens, ce sens avec sa source. Le sens d'un étymon (et non du mot français) se prend au Littré ou au TLFi s'ils le glosent ; sinon, pour le latin, au Lewis & Short (début de l'entrée dans `sources.md`) ou au Georges (1913), domaine public, ou au Gaffiot (gaffiot.fr, dans le navigateur intégré, jamais par script) ; au Bailly pour le grec : ils sont alors obligatoires. Un mot voisin (« déverbal de ennuyer ») est un maillon : consulte-le aussi (`npm run dossier -- --consulter ennuyer` ; si l'API n'a rien, cnrtl.fr/etymologie/<mot> dans le navigateur intégré).",
    "6. Mot forgé : l'auteur, la date et l'ouvrage, tels que les sources les donnent. Origine débattue : chaque hypothèse, qui la défend, et qui la rapporte seulement. Doublet ou famille que les sources signalent (voy. CAPTIF) : un fait.",
    "7. Écris `chemin`, `drapeaux`, `usage`, `faits`, `manques` et `notes` dans le fichier, puis `npm run dossier -- --verifier <mot>`.",
    "",
    "## Règles",
    "",
    "- Un fait est ce qu'une source dit, en une phrase à toi, avec l'ouvrage (identifiant de data/ouvrages : littre, tlfi, gaffiot, bailly…) et l'entrée consultée. Jamais de mémoire : ce que tu sais sans l'avoir lu va dans `notes`, comme une piste.",
    "- Du Littré, du Lewis & Short et du Georges (domaine public), tu peux recopier. Du TLFi (non libre), du Gaffiot et du Bailly (CC BY-NC-ND), les faits seuls, reformulés.",
    "- Jamais le Wiktionnaire (l'API du TLFi en contient une rubrique : l'ignorer), ni le Robert, ni Bloch et Wartburg, ni le FEW.",
    "- Deux sources en désaccord (le Littré dépassé par le TLFi, deux étymons proposés) : les deux faits, chacun avec sa source ; la fiche suivra le plus récent, ou présentera l'origine comme débattue.",
    "- Un « probablement » de la source reste un « probablement » dans le fait.",
    '- Mot sacré (chemin `sacre`) : le texte d\'origine, dans sa langue (Wikisource en hébreu : `npm run texte -- <adresse> --autour "<mot>"`), avec le livre, le chapitre et le verset où le mot paraît ou s\'explique.',
    "- Drapeau `tradition` : un auteur traditionnel a lu le mot lui-même, ou son étymon (Isidore, Augustin, Lactance, le Talmud…), et non la chose qu'il désigne aujourd'hui ; donne dans `notes` l'œuvre et le passage si tu les connais.",
    "- Pas plus de faits qu'il n'en faut pour la fiche : douze au plus.",
    "",
    "## Format de `atelier/<id>/dossier.json`",
    "",
    ...contratAtelier(schemaDossier),
    `Chemins : ${CHEMINS.join(", ")}. Drapeaux : ${DRAPEAUX.join(", ")}.`,
    "",
  ].join("\n");
}

/** Consigne du relecteur : un agent qui n'a pas écrit, en deux passes. */
export function genererConsigneRelecture(): string {
  return [
    "# Relire un lot",
    "",
    ENTETE,
    "",
    "Tu relis des fiches qu'un autre agent a rédigées ; tu ne les réécris pas. Pour chaque mot, lis `atelier/<id>/dossier.json` et `atelier/<id>/fiche.json`, et l'étymologie brute du mot (`npm run dossier -- --consulter <mot>`) pour vérifier le dossier ; le dossier tient lieu des autres sources. Si `atelier/<id>/sources.md` existe, il tient lieu de l'étymologie brute : confronte-y le dossier sans refaire les consultations. Écris ton verdict dans `atelier/<id>/verdict.json`, puis `npm run dossier -- --verifier <mot>` le contrôle.",
    "",
    "## Trois critères, et rien d'autre",
    "",
    "1. **dossier** : chaque affirmation de la fiche (forme, langue, sens, date, auteur, tenant, ce que l'explication dit de l'histoire du mot et de son usage d'aujourd'hui) est dans le dossier ; et la chaîne suit le dossier maillon par maillon. Le dossier lui-même est fidèle à ses sources : confronte-le à l'étymologie brute (`npm run dossier -- --consulter <mot>` affiche le Littré et le TLFi) ; une infidélité du dossier (fait absent, déformé ou mal daté) est une remarque « dossier ».",
    "2. **justesse** : chaque phrase répond à « que veux-tu dire exactement ? » (AGENTS.md §3) ; chaque mot dans son sens propre, sans figure, sans effet, sans jargon ; l'explication dit ce qui s'est perdu, affaibli ou retourné, sans redire le sens affiché au-dessus.",
    "3. **regle** : les règles que les scripts ne voient pas : le sens premier au bon maillon ; la règle d'arrêt ; étymologie et tradition distinctes ; aucune étymologie populaire dans la chaîne ; `renvois` vers des notions du même ordre, sans racine commune, et pas un mot déjà nommé dans l'explication ; `tradition.renvois` seulement vers un mot que la tradition a lu ; `incertain` quand le dossier doute de la chaîne ; des `themes` qui disent le domaine où le mot s'emploie aujourd'hui ; aucune phrase qui fasse du sens ancien le « vrai » sens du mot ; une composition découpée du tout vers les parties, le sens du tout pris dans le dossier et non déduit des parties.",
    "",
    "Ne relève ni ce que les scripts vérifient (typographie, longueurs, identifiants, listes fermées), ni une préférence de style : seulement ce qui rend la fiche fausse, obscure ou contraire aux règles. `accepte` : aucune remarque. `a-reprendre` : les remarques qui obligent à changer la fiche. Quand tu sais exactement ce qu'il faut écrire, donne un `remplacement` : `npm run lot -- reprendre` l'applique à `fiche.json` sans agent ; sans `remplacement`, la remarque va au rédacteur, qui adopte ta `proposition` quand elle est juste.",
    "",
    "Un `remplacement` est `{ champ, valeur }` : `champ` est un chemin dans `atelier/<id>/fiche.json`, séparé par des points, un rang pour un élément de liste (`explication`, `etymologie.1.sens`, `tradition.lectures.0.texte`, `renvois`) ; `valeur` est le JSON exact à y mettre, texte entre guillemets, liste ou objet ; `null` retire le champ ou l'élément de liste. Les remplacements s'appliquent dans l'ordre : après un `null` sur un élément de liste, les rangs suivants se décalent. Ne donne que le texte tel qu'il doit paraître, tiré du dossier ; la typographie est posée par le script.",
    "",
    "## Seconde passe : le vérificateur",
    "",
    "Après `npm run lot -- reprendre`, un autre agent (le vérificateur) ne relit que ce qui a changé, dans `atelier/<id>/fiche.json` :",
    "",
    "- chaque remarque `appliquee` de `verdict.json` : ce que le remplacement a changé n'affirme rien hors du dossier, et répond à la remarque ;",
    "- les lectures traditionnelles (`tradition.lectures`) : le texte ne dit rien de plus que sa citation ; la voix est la bonne ; la citation vient d'un texte original. Les scripts vérifient la citation mot pour mot (`npm run verifier:en-ligne`, à la clôture) : n'y revenir que si le passage cité ne dit pas ce que le texte lui fait dire ;",
    "- pour un mot au drapeau `tradition`, le `corpus` du dossier : chaque œuvre du corpus de réflexe a été consultée (`npm run dossier -- --verifier <mot>` dit celles qui manquent) ; un passage ★ de `sources.md` écarté l'a été avec raison.",
    "",
    "Ne rouvre pas ce que le premier relecteur avait accepté. Réécris `atelier/<id>/verdict.json` : `accepte` si tout est réglé ; sinon `a-reprendre`, avec seulement les remarques restées ouvertes (les remarques `appliquee` n'y figurent plus), chacune avec son `remplacement` quand tu sais la phrase. Une remarque ouverte à ce stade ne relance pas de boucle : le rédacteur la règle si elle est simple, sinon la fiche reste dans l'atelier.",
    "",
    "## Verdict",
    "",
    ...contratAtelier(schemaVerdict),
  ].join("\n");
}

/** Consigne des fiches d'auteurs et d'ouvrages, d'après la BnF. */
export function genererConsigneReferences(): string {
  return [
    "# Créer les fiches d'auteurs et d'ouvrages",
    "",
    ENTETE,
    "",
    "Pour chaque auteur ou ouvrage cité par une fiche du lot et qui n'a pas encore la sienne (`npm run rediger -- atelier/<id>/fiche.json --essai` les dit « à créer »), tu choisis sa notice BnF et tu l'ajoutes à `atelier/references.json`, commun au lot. `npm run lot -- clore` crée les fiches, d'après la notice, avant d'écrire celles des mots.",
    "",
    "1. Si `data/auteurs/<id>.yaml` (ou `data/ouvrages/<id>.yaml`) existe, rien à faire.",
    '2. Cherche sa notice : `npm run bnf -- auteur "<nom> <année de naissance sur quatre chiffres>"` (`Augustin 0354`, `Bleuler 1857`) ; `npm run bnf -- ouvrage "<auteur> <titre>"`. Choisis la notice qui répond à ce que dit le dossier (dates, note) ; plusieurs recherches se lancent dans une même commande.',
    "3. Ajoute-la à `atelier/references.json` : `id` (prénom et nom sans accent ; abrégé ou titre pour un ouvrage), `cb` (l'identifiant de la notice), `description`, et `nom` si le nom usuel n'est pas « prénom nom » (Augustin, Cicéron), `nomComplet` s'il diffère (Aurelius Augustinus), `traditions` seulement pour un auteur qui parle dans une tradition (une tradition absente de la liste : `npm run liste -- traditions \"<tradition>\"` d'abord). Un ouvrage : `titre` français, `licence`, `description`, `auteur` (l'identifiant de l'auteur, d'une fiche existante ou listée au même fichier), `abrege`, `titreOriginal`, `texte` (adresse en ligne libre).",
    "",
    "## Règles",
    "",
    "- Dates et forme d'entrée viennent de la notice : le script les pose, tu ne les écris pas.",
    "- Description : 200 caractères au plus ; ce qui situe (époque, domaine, œuvre), pas une biographie, pas de jugement.",
    `- Licence d'un ouvrage : ${LICENCES.join(", ")} ; domaine public si l'auteur est mort depuis plus de soixante-dix ans.`,
    "- Sans notice qui réponde : la fiche du mot ne s'écrit pas ; signale-le dans `atelier/signalements.md`. Jamais de fiche d'auteur écrite à la main.",
    "",
    "## Format de `atelier/references.json`",
    "",
    ...contratAtelier(schemaReferences),
  ].join("\n");
}

/** Lectures d'une fiche du dépôt, telles qu'elles sont écrites, pour exemple. */
function lecturesDe(id: string, rang: number): Record<string, unknown> {
  return parse(readFileSync(join(DATA, "fiches", cheminFiche(id)), "utf8")).tradition.lectures[rang];
}

/** Consigne des lectures traditionnelles, texte source sous les yeux. */
export function genererConsigneLectures(): string {
  return [
    "# Chercher les lectures traditionnelles d'un mot",
    "",
    ENTETE,
    "",
    "Tu ajoutes à la fiche d'un mot (`tradition.lectures` de `atelier/<id>/fiche.json`) les lectures qu'une tradition a faites du mot lui-même, texte source sous les yeux (AGENTS.md §4.7), après avoir écrit le reste de la fiche. Aucune lecture vaut mieux qu'une lecture approximative : la tradition parle par ses textes, jamais par ta paraphrase.",
    "",
    "## Étapes",
    "",
    "1. Le corpus de réflexe, toujours : `atelier/<id>/sources.md` donne déjà la recherche du radical de chaque forme latine relevée dans les huit œuvres ; pour une autre forme (en hébreu, les consonnes : שטן ; un radical que le script n'a pas tiré), `npm run corpus -- chercher <radical de l'étymon>` (misericord, religi). Les passages marqués ★ expliquent un mot : ce sont eux qui peuvent faire une lecture. Note dans `corpus` du dossier (`atelier/<id>/dossier.json`) ce que tu as cherché dans chaque œuvre et ce que tu y as trouvé, même rien : `{ \"oeuvre\": \"cite-de-dieu\", \"cherche\": \"angel\", \"trouve\": \"X, 25\" }`. `npm run dossier -- --verifier <mot>` dit les œuvres qui manquent.",
    "2. Puis au-delà, toujours aussi : le corpus est un plancher, jamais une limite. Tout autre auteur traditionnel qui a lu le mot se cherche (Augustin, Lactance, Thomas d'Aquin, le Talmud, les Pères, Guénon…), d'après les `notes` du dossier et ce que tu sais ; mais on ne cite que ce qu'on a lu. L'auteur doit avoir lu le mot, ou une forme de sa chaîne, pas la chose qu'il désigne aujourd'hui. Un auteur qui lit une forme voisine absente de la chaîne (servus pour servitude, sapiens pour sagesse) n'entre pas : note-le au `corpus` et, si un autre mot a cette forme dans sa chaîne, garde la piste pour lui.",
    '3. Trouve le passage dans un texte original en ligne, du domaine public (Wikisource en latin, en grec, en hébreu ; thelatinlibrary.com ; archive.org), et lis-le tel quel : `npm run texte -- <adresse> --autour "<mot>"`. Jamais un outil qui résume la page pour une citation.',
    "4. Écris la lecture dans `tradition.lectures` : la citation copiée de la page, mot pour mot, `[…]` pour une coupe ; le texte, ce que le passage dit du mot, en une ou deux phrases, sans commencer par le nom de l'auteur, sans répéter l'hypothèse, sans rien ajouter à la citation.",
    "   Le texte peut nommer le mot que l'auteur lit, tel que sa citation l'écrit (l'app le met en italique).",
    "5. L'œuvre et son auteur doivent avoir leur fiche : s'ils n'en ont pas (`npm run rediger -- atelier/<id>/fiche.json --essai` les dit « à créer »), ajoute-les à `atelier/references.json` (docs/consignes/references.md) : l'auteur avec ses `traditions`, l'œuvre avec l'adresse de son `texte`.",
    "6. Relis chaque citation dans sa page (`npm run texte -- <adresse> --autour \"<mot>\"`) : elle y figure mot pour mot. `npm run verifier:en-ligne` la vérifiera à la clôture du lot, sur la fiche écrite : une citation introuvable y est une erreur.",
    "",
    "## Le corpus de réflexe",
    "",
    "Des œuvres qui lisent les mots eux-mêmes, où l'on peut chercher un mot, et dont le texte original est en ligne, du domaine public (`npm run corpus -- telecharger`, une fois) :",
    "",
    ...CORPUS.map((o) => `- ${o.titre} (tradition ${o.tradition}, ${o.langue}) : ${o.role}.`),
    "",
    "Consulter n'oblige pas à trouver : la plupart des mots n'y ont rien, et c'est bien. Une lecture n'entre que si l'auteur lit le mot et dit quelque chose qui diffère de l'histoire du mot ou la complète.",
    "",
    "## Règles",
    "",
    "- Une seule voix par lecture. Elle se déduit de l'œuvre citée : son auteur, ou l'œuvre elle-même pour l'Écriture. `auteur` ne s'écrit que pour une parole rapportée par l'œuvre d'un autre (Rabban Gamliel dans la Michna).",
    "- `tradition` seulement si la voix parle dans plusieurs traditions ; `hypothese` quand la lecture repose sur l'une des alternatives de la chaîne.",
    "- Le Nom divin s'écrit comme le texte l'écrit, jamais traduit (« Dieu ») ni vocalisé (« Jéhovah », « Yahvé ») ; une citation garde le texte tel quel. Dans le texte d'une lecture, « le Seigneur » est admis : c'est le substitut traditionnel, juif et chrétien, qui évite de prononcer le Nom, non une traduction.",
    "- Rien trouvé dans un texte en ligne : pas de lecture ; note la piste dans `atelier/signalements.md`.",
    '- Une voix qui parle dans une tradition absente de la liste : ajoute la tradition (`npm run liste -- traditions "<tradition>"`) et note-le dans `atelier/signalements.md` ; une tradition de trop se retire à la relecture plus aisément qu\'une tradition manquante ne s\'ajoute après coup.',
    "",
    "## Format",
    "",
    ...contrat(schemaLectureTraditionnelle, "###"),
    "## Exemples",
    "",
    "Lectures du dépôt, telles qu'on les écrit dans `fiche.json` (Lactance sur *religion* ; Rabban Gamliel, parole rapportée par la Michna, sur *Pâque*) :",
    "",
    "```json",
    JSON.stringify(lecturesDe("religion", 0)),
    JSON.stringify(lecturesDe("paque", 2)),
    "```",
    "",
  ].join("\n");
}

/** Consignes de la rédaction autonome, dans docs/consignes/ : la procédure du rédacteur, celle du relecteur, et chaque étape. */
export const CONSIGNES_ETAPES = [
  { fichier: docs("consignes/redacteur.md"), generer: genererConsigneRedacteur },
  { fichier: docs("consignes/dossier.md"), generer: genererConsigneDossier },
  { fichier: docs("consignes/redaction.md"), generer: genererPrompt },
  { fichier: docs("consignes/references.md"), generer: genererConsigneReferences },
  { fichier: docs("consignes/lectures.md"), generer: genererConsigneLectures },
  { fichier: docs("consignes/relecture.md"), generer: genererConsigneRelecture },
];

if (import.meta.main) {
  for (const { fichier, schema, titre } of SCHEMAS_JSON) await writeFile(fichier, JSON.stringify(genererSchemaJson(schema, titre), null, 2) + "\n");
  await writeFile(FICHIER_CONTRAT, genererMarkdown());
  await mkdir(docs("consignes"), { recursive: true });
  for (const { fichier, generer } of CONSIGNES_ETAPES) await writeFile(fichier, generer());
  console.log("✓ docs/*.schema.json, docs/contrat-fiche.md et docs/consignes/*.md régénérés");
}
