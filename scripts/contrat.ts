import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { z } from "zod";
import auteurs from "../data/auteurs.json" with { type: "json" };
import langues from "../data/langues.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import { NOMS_OUVRAGES } from "../src/lib/ouvrages.ts";
import { NATURES, schemaEntreeRedaction, schemaFiche } from "../src/lib/schema.ts";
import { REDACTEURS } from "../src/lib/sources.ts";
import { cheminFiche } from "./lib/validation.ts";

/**
 * Contrat de données de la fiche, généré à partir du schéma (src/lib/schema.ts) :
 * - docs/fiche.schema.json : schéma JSON, pour l'autocomplétion et la vérification dans VS Code ;
 * - docs/contrat-fiche.md : le même contrat, lisible ;
 * - docs/prompt-redaction.md : la consigne donnée à l'IA qui rédige un lot (npm run rediger),
 *   avec des fiches réelles du dépôt pour exemples.
 * Un test échoue si ces fichiers ne sont plus à jour : lancer `npm run contrat`.
 */
export const FICHIER_SCHEMA = fileURLToPath(new URL("../docs/fiche.schema.json", import.meta.url));
export const FICHIER_CONTRAT = fileURLToPath(new URL("../docs/contrat-fiche.md", import.meta.url));
export const FICHIER_PROMPT = fileURLToPath(new URL("../docs/prompt-redaction.md", import.meta.url));
const DOSSIER_FICHES = fileURLToPath(new URL("../data/fiches", import.meta.url));

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

export function genererSchemaJson(): Record<string, unknown> {
  const schema = z.toJSONSchema(schemaFiche, { target: "draft-7", unrepresentable: "any", io: "input" });
  return { ...schema, title: "Fiche d'Étymon" };
}

/** Type d'un champ, en français. */
function type(n: Noeud): string {
  if (n.anyOf) {
    const utiles = n.anyOf.filter((a) => a.type !== "null");
    const texte = utiles.map(type).join(" ou ");
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
            : "textes";
    return `liste${n.minItems ? " non vide" : ""} ${/^[aeiouy]/.test(element) ? "d'" : "de "}${element}`;
  }
  if (n.type === "object") return "objet (voir plus bas)";
  if (n.type === "boolean") return "`true` \\| `false`";
  if (n.type === "integer" || n.type === "number") return "nombre";
  if (n.format === "uri") return "adresse https";
  if (n.pattern?.includes("\\d{4}")) return "date AAAA-MM-JJ";
  return "texte";
}

/** Objets imbriqués (origine, sources…), à détailler dans leur propre tableau. */
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

const REGLES = [
  "Le fichier s'appelle `<id>.yaml`, où `id` est le mot sans accent, en minuscules, mots séparés par des tirets (`-2`, `-3` pour les homonymes), rangé dans `data/fiches/<initiale>/<deux premières lettres>/`.",
  "Un étymon reconstruit commence par `*` (c'est ce qui le dit reconstruit) ; une valeur commençant par `*` ou contenant `: ` s'écrit entre guillemets.",
  "Pas de doublon : un doublet ou un renvoi se déclare sur une seule des deux fiches (l'app l'affiche des deux côtés) ; l'adresse d'un ouvrage en ligne se déduit de l'entrée et ne s'écrit pas (Bailly : entrée en grec, adresse translittérée).",
  "Un champ facultatif à sa valeur par défaut ne s'écrit pas (`incertain: false`, listes vides, `mode: filiation`).",
  "`origine.formes[].selon` : seulement pour une origine débattue ; un ouvrage qui rapporte une hypothèse n'en est pas le tenant.",
  "`lecturesTraditionnelles[].hypothese` : une forme de `origine.formes`.",
  "`renvois` : fiches existantes, hors doublets et famille (une notion voisine, pas une racine commune).",
  "Les textes sont bruts, sans mise en forme : l'app met en italique l'étymon, les formes d'origine et la forme légendaire, et pose les liens vers les autres fiches.",
  "`explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus.",
  "Typographie française dans les sens, l'explication, la légende, les lectures et l'historique : guillemets « », espace insécable avant `:` `;` `?` `!` ; les sens s'écrivent sans guillemets.",
  "Une œuvre citée par une lecture traditionnelle appartient à l'auteur de la lecture ; sa citation figure mot pour mot à l'adresse de la source (`npm run verifier:en-ligne`).",
  "Hors statut `a-verifier`, `sources` contient au moins un ouvrage consulté.",
  "Aucun alias YAML, aucune clé en double, aucun champ inconnu.",
];

export function genererMarkdown(): string {
  const schema = genererSchemaJson() as Noeud;
  const sections: string[] = [];
  const principal = tableau(schema, "", sections);
  const listes = [
    `- \`nature\` : ${NATURES.join(", ")}.`,
    `- \`langue\` (data/langues.json) : ${langues.join(", ")}.`,
    `- \`themes\` (data/themes.json) : ${themes.join(", ")}.`,
    `- \`sources[].ouvrage\` (data/sources.json) : ${NOMS_OUVRAGES.join(", ")}.`,
    `- \`redaction[].par\` : ${REDACTEURS.join(", ")}.`,
    `- Auteurs (data/auteurs.json) : tenants d'une hypothèse (\`origine.formes[].selon\`) ; ceux de la tradition signent aussi les lectures, avec leurs œuvres :`,
    ...auteurs.map((a) => `  - ${a.nom} (${a.role}) : ${a.oeuvres.map((o) => `*${o}*`).join(", ")}.`),
  ];
  return [
    "# Contrat de données : la fiche",
    "",
    "> Généré par `npm run contrat` à partir de `src/lib/schema.ts` : ne pas modifier à la main.",
    "> Le même contrat existe en schéma JSON (`docs/fiche.schema.json`), utilisé par VS Code",
    "> pour l'autocomplétion et la vérification des fiches pendant la saisie.",
    "",
    "Une fiche est un fichier YAML. Exemple complet : `data/fiches/r/re/religion.yaml`.",
    "",
    "## Champs",
    "",
    principal,
    "",
    ...sections.flatMap((s) => [s, ""]),
    "## Listes fermées",
    "",
    ...listes,
    "",
    "## Règles vérifiées en plus de la structure (`npm run valider`)",
    "",
    ...REGLES.map((r) => `- ${r}`),
    "",
  ].join("\n");
}

/** Fiches réelles montrées en exemple à l'IA : simple, filiation, composition et mot forgé, origine débattue. */
const EXEMPLES = ["etonner", "chiffre", "schizophrenie", "religion"];
/** Mots dont la nature n'est pas dans le Littré : l'exemple la garde. */
const HORS_LITTRE = new Set(["schizophrenie"]);

/** Contenu d'une fiche tel que l'IA l'écrit : ni statut, ni rédaction, ni sources, ni lectures, ni valeurs par défaut. */
function contenuDe(id: string): Record<string, unknown> {
  const fiche = parse(readFileSync(join(DOSSIER_FICHES, cheminFiche(id)), "utf8"));
  const { sources: _s, redaction: _r, lecturesTraditionnelles: _l, statut: _t, historique: _h, nature, ...contenu } = fiche;
  contenu.explication = contenu.explication.trim();
  return HORS_LITTRE.has(id) ? { mot: contenu.mot, nature, ...contenu } : contenu;
}

const CONSIGNES = [
  "Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte, et tu lui signales ton doute.",
  "Étymon : la forme de la langue source directe (latin pour un mot hérité du latin, italien pour un emprunt à l'italien). Ce qui est plus ancien va dans `origine`, seulement s'il ajoute un sens ou si l'origine est débattue.",
  "`sens` : le sens de l'étymon, pas celui du mot français. Pour un mot forgé ou composé, le sens littéral des éléments.",
  "`explication` : ce qui s'est perdu, affaibli ou retourné entre ce sens et l'usage actuel. Elle ne répète pas le sens, déjà affiché juste au-dessus. Ton sobre, sans emphase ni jugement.",
  "Tout mot étranger cité dans un texte est une forme de la fiche (étymon, `origine`, légende) : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.",
  "`renvois` : seulement vers une fiche existante dont la notion éclaire vraiment celle-ci sans racine commune (schizophrénie → obsession, où la tradition a lu la chose sous un autre mot) ; trois au plus, souvent aucun.",
  "Méfie-toi des étymologies populaires (*sincère*, « sans cire ») : elles vont dans `legende`, jamais dans l'étymon.",
  "Tu rédiges de mémoire : n'invente ni tenant (`selon`), ni date (`forge`), ni forme reconstruite que tu ne connais pas avec certitude. En cas de doute sur l'étymon, `incertain: true`.",
  "Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` ni les lectures traditionnelles : les scripts les posent (npm run rediger, npm run verifier), les lectures se rédigent à part, texte source sous les yeux.",
  "Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.",
];

/** Consigne de rédaction d'un lot, pour l'IA : règles, format d'entrée tiré du schéma, exemples réels. */
export function genererPrompt(): string {
  const schema = z.toJSONSchema(schemaEntreeRedaction, { target: "draft-7", unrepresentable: "any", io: "input" }) as Noeud;
  const sections: string[] = [];
  const principal = tableau(schema, "", sections, "####");
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
    "Un fichier JSON : une liste de fiches, chacune avec les champs ci-dessous et eux seuls. Un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872).",
    "",
    "### Champs",
    "",
    principal,
    "",
    ...sections.flatMap((s) => [s, ""]),
    "### Listes fermées",
    "",
    `- \`nature\` : ${NATURES.join(", ")}.`,
    `- \`langue\` : ${langues.join(", ")}.`,
    `- \`themes\` : ${themes.join(", ")}.`,
    `- \`origine.formes[].selon\` : ${auteurs.map((a) => a.nom).join(", ")}.`,
    "",
    "## Exemples",
    "",
    "Fiches du dépôt (simple, filiation, composition et mot forgé, origine débattue) :",
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
  await writeFile(FICHIER_SCHEMA, JSON.stringify(genererSchemaJson(), null, 2) + "\n");
  await writeFile(FICHIER_CONTRAT, genererMarkdown());
  await writeFile(FICHIER_PROMPT, genererPrompt());
  console.log("✓ docs/fiche.schema.json, docs/contrat-fiche.md et docs/prompt-redaction.md régénérés");
}
