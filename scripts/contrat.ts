import { readdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { z } from "zod";
import langues from "../data/langues.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import {
  LICENCES,
  NATURES,
  schemaAuteur,
  schemaEntreeAuteur,
  schemaEntreeOuvrage,
  schemaEntreeRedaction,
  schemaFiche,
  schemaOuvrage,
} from "../src/lib/schema.ts";
import { REDACTEURS } from "../src/lib/sources.ts";
import { cheminFiche } from "./lib/validation.ts";

/**
 * Contrat de données, généré à partir du schéma (src/lib/schema.ts) :
 * - docs/fiche.schema.json, auteur.schema.json, ouvrage.schema.json : schémas JSON, pour
 *   l'autocomplétion et la vérification dans VS Code ;
 * - docs/contrat-fiche.md : les trois types de fiches, lisibles ;
 * - docs/prompt-redaction.md : la consigne donnée à l'IA qui rédige un lot (npm run rediger),
 *   avec des fiches réelles du dépôt pour exemples.
 * Un test échoue si ces fichiers ne sont plus à jour : lancer `npm run contrat`.
 */
const docs = (nom: string) => fileURLToPath(new URL(`../docs/${nom}`, import.meta.url));
export const SCHEMAS_JSON = [
  { fichier: docs("fiche.schema.json"), schema: schemaFiche, titre: "Fiche d'Étymon" },
  { fichier: docs("auteur.schema.json"), schema: schemaAuteur, titre: "Auteur d'Étymon" },
  { fichier: docs("ouvrage.schema.json"), schema: schemaOuvrage, titre: "Ouvrage d'Étymon" },
];
export const FICHIER_CONTRAT = docs("contrat-fiche.md");
export const FICHIER_PROMPT = docs("prompt-redaction.md");
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
function contrat(schema: z.ZodType, titre: string): string[] {
  const sections: string[] = [];
  const principal = tableau(genererSchemaJson(schema, "") as Noeud, "", sections, titre);
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
  "Une forme reconstruite commence par `*` ; une valeur commençant par `*`, contenant `: `, ou une virgule dans `{ … }`, s'écrit entre guillemets.",
  "Pas de doublon : un doublet ou un renvoi se déclare sur une seule des deux fiches ; l'adresse d'une entrée se déduit du modèle d'adresse de l'ouvrage ; la translittération du grec se déduit de la forme ; ce qui se calcule (œuvres d'un auteur, mots qu'il a forgés) ne s'écrit pas.",
  "Un champ facultatif à sa valeur par défaut ne s'écrit pas (`incertain: false`, `tradition: false`, listes vides).",
  "Toute référence (auteur, ouvrage, doublet) vise une fiche existante ; un renvoi (`renvois`, `tradition.renvois`), une fiche ou un candidat à faire (l'app ne l'affiche qu'une fois la fiche écrite ; vers la tradition, une fois qu'elle a des lectures).",
  "`etymologie` : un maillon porte une forme, des éléments, ou les deux ; ou bien des alternatives. Le maillon du sens premier porte un sens (une composition, le sens littéral de ses éléments) ; au plus un maillon est `premier`.",
  "Translittération : seulement pour une écriture ni latine ni grecque (arabe, hébreu), et alors obligatoire.",
  "`selon` : seulement dans une origine débattue ; un ouvrage qui rapporte une hypothèse n'en est pas le tenant.",
  "Lecture traditionnelle : un auteur de la tradition (`tradition: true`), ses propres œuvres, une `hypothese` parmi les alternatives de la chaîne ; sa citation figure mot pour mot à l'adresse de la source (`npm run verifier:en-ligne`).",
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
    "Trois types de fiches, en YAML, avec le même socle éditorial (`sources`, `redaction`, `statut`, `historique`).",
    "Exemples : `data/fiches/r/re/religion.yaml`, `data/auteurs/augustin.yaml`, `data/ouvrages/littre.yaml`.",
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
    "## Listes fermées",
    "",
    `- \`nature\` : ${NATURES.join(", ")}.`,
    `- \`langue\` (data/langues.json) : ${langues.join(", ")}.`,
    `- \`themes\` (data/themes.json) : ${themes.join(", ")}.`,
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
  contenu.explication = contenu.explication.trim();
  return HORS_LITTRE.has(id) ? { mot: contenu.mot, nature, ...contenu } : contenu;
}

const CONSIGNES = [
  "Principe : la justesse des noms, au service de la vérité. Étymon rend à chaque mot son nom juste, et s'écrit de même : chaque mot dans son sens propre, chaque phrase conforme à ce qui est et à ce que disent les sources, rien de plus. Pas de figure, pas de formule, pas d'effet. Relis chaque phrase avec une question : « que veux-tu dire exactement ? » ; si la réponse est plus claire que la phrase, écris la réponse.",
  "Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte, et tu lui signales ton doute.",
  "`etymologie` : la chaîne, du plus proche au plus lointain. Le premier maillon est la langue source directe (latin pour un mot hérité, italien pour un emprunt à l'italien) ; on ne remonte que si cela ajoute un sens ou si l'origine est débattue.",
  "Formes dans leur écriture d'origine (φρήν, صفر) ; translittération seulement pour l'arabe ou l'hébreu (celle du grec se déduit).",
  "`sens` seulement là où il apprend quelque chose : le sens premier, affiché seul en tête de fiche, est celui du maillon le plus lointain attesté qui en porte un. Une composition porte le sens littéral de ses éléments (schizophrénie : esprit fendu), et chaque élément le sien.",
  "`explication` : ce qui s'est perdu, affaibli ou retourné entre le sens premier et l'usage actuel. Elle n'explique pas une seconde fois le sens, affiché juste au-dessus ; mais mieux vaut redire le mot juste qu'un détour. Ton sobre, sans emphase ni jugement.",
  "Tout mot étranger cité dans un texte est une forme de la chaîne : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.",
  "`ecartees` : étymologies proposées puis écartées ; `populaire: true` pour une idée reçue (*sincère*, « sans cire »), jamais dans la chaîne.",
  "Liens entre mots, un seul endroit selon leur raison. Un lien qui s'explique en une phrase va dans l'explication : l'app lie tout mot qui a une fiche (Bleuler renommait la démence précoce). `renvois` (Voir aussi) : notions voisines du même ordre, sans racine commune (schizophrénie → délire, folie) ; trois au plus, souvent aucun. `tradition.renvois` (sous « Lectures traditionnelles » : voir obsession) : mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) ; deux au plus, rare. Un renvoi vise un mot important du dictionnaire, qu'il ait déjà sa fiche ou non.",
  "Auteurs et ouvrages sont cités par leur identifiant dans les champs (`selon`, `forge`, `personne`, `ouvrage`). S'il manque une fiche, ajoute-la au lot (`auteurs`, `ouvrages`), avec une description qui situe sans raconter et, dans `cite`, l'élément d'entrée de sa notice BnF (Bleuler, Comte).",
  "Dans un texte, nomme un auteur sous son nom usuel ou une de ses formes de citation (liste ci-dessous) : l'app en fait un lien, s'il est aussi cité dans un champ de la fiche.",
  "Tu rédiges de mémoire : n'invente ni tenant (`selon`), ni date (`forge`), ni forme reconstruite que tu ne connais pas avec certitude. En cas de doute sur la chaîne, `incertain: true`.",
  "Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` ni les lectures traditionnelles (`tradition.lectures`) : les scripts les posent (npm run rediger, npm run verifier), les lectures se rédigent à part, texte source sous les yeux.",
  "Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.",
];

/** Consigne de rédaction d'un lot, pour l'IA : règles, format d'entrée tiré du schéma, exemples réels. */
export function genererPrompt(): string {
  const auteurs = lireReferences("auteurs");
  const ouvrages = lireReferences("ouvrages");
  return [
    "# Rédiger un lot de fiches",
    "",
    "> Généré par `npm run contrat` à partir de `src/lib/schema.ts` et des fiches citées en exemple : ne pas modifier à la main.",
    "",
    "Tu rédiges des fiches d'Étymon, dictionnaire du sens premier des mots français. Une fiche se lit en dix secondes.",
    "",
    "## Règles",
    "",
    ...CONSIGNES.map((c) => `- ${c}`),
    "",
    "## Format",
    "",
    "Un fichier JSON : une liste de fiches, ou `{ \"fiches\": [...], \"auteurs\": [...], \"ouvrages\": [...] }` quand il faut créer des auteurs ou des ouvrages. Chaque fiche a les champs ci-dessous et eux seuls ; un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872).",
    "",
    "### Fiche d'un mot",
    "",
    ...contrat(schemaEntreeRedaction, "####"),
    "### Auteur",
    "",
    ...contrat(schemaEntreeAuteur, "####"),
    "### Ouvrage",
    "",
    ...contrat(schemaEntreeOuvrage, "####"),
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
    "## Ensuite",
    "",
    '1. `npm run rediger -- lot.json --modele "<ton modèle>"` : écrit les fiches en `a-verifier` et les retire des candidats.',
    "2. `npm run verifier` : confronte au Littré ; les fiches concordantes passent en `brouillon`, les autres et les contrôles sont à relire.",
    "3. `npm run valider`, puis un commit par lot.",
    "",
  ].join("\n");
}

if (import.meta.main) {
  for (const { fichier, schema, titre } of SCHEMAS_JSON) await writeFile(fichier, JSON.stringify(genererSchemaJson(schema, titre), null, 2) + "\n");
  await writeFile(FICHIER_CONTRAT, genererMarkdown());
  await writeFile(FICHIER_PROMPT, genererPrompt());
  console.log("✓ docs/*.schema.json, docs/contrat-fiche.md et docs/prompt-redaction.md régénérés");
}
