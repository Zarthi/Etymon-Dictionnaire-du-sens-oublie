import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import auteurs from "../data/auteurs.json" with { type: "json" };
import langues from "../data/langues.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import { NOMS_OUVRAGES } from "../src/lib/ouvrages.ts";
import { NATURES, schemaFiche } from "../src/lib/schema.ts";
import { REDACTEURS } from "../src/lib/sources.ts";

/**
 * Contrat de données de la fiche, généré à partir du schéma (src/lib/schema.ts) :
 * - docs/fiche.schema.json : schéma JSON, pour l'autocomplétion et la vérification dans VS Code ;
 * - docs/contrat-fiche.md : le même contrat, lisible.
 * Un test échoue si ces fichiers ne sont plus à jour : lancer `npm run contrat`.
 */
export const FICHIER_SCHEMA = fileURLToPath(new URL("../docs/fiche.schema.json", import.meta.url));
export const FICHIER_CONTRAT = fileURLToPath(new URL("../docs/contrat-fiche.md", import.meta.url));

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

function tableau(n: Noeud, chemin: string, sections: string[]): string {
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
      sections[place] = `### \`${sousChemin}\`\n\n${tableau(objet, `${sousChemin}.`, sections)}`;
    }
  }
  return lignes.join("\n");
}

const REGLES = [
  "Le fichier s'appelle `<id>.yaml`, où `id` est le mot sans accent, en minuscules, mots séparés par des tirets (`-2`, `-3` pour les homonymes), rangé dans `data/fiches/<initiale>/<deux premières lettres>/`.",
  "Un étymon reconstruit commence par `*` (c'est ce qui le dit reconstruit) ; une valeur commençant par `*` ou contenant `: ` s'écrit entre guillemets.",
  "Pas de doublon : un doublet se déclare sur une seule des deux fiches (l'app l'affiche des deux côtés) ; l'adresse d'un ouvrage en ligne se déduit de l'entrée et ne s'écrit pas.",
  "Les textes sont bruts, sans mise en forme : l'app met en italique l'étymon, les formes d'origine et la forme légendaire, et pose les liens vers les autres fiches.",
  "`explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus.",
  "Typographie française dans les sens, l'explication, la légende, les lectures et l'historique : guillemets « », espace insécable avant `:` `;` `?` `!` ; les sens s'écrivent sans guillemets.",
  "Une œuvre citée par une lecture traditionnelle appartient à l'auteur de la lecture.",
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
    `- \`sources[].ouvrage\` (data/sources.json) : ${NOMS_OUVRAGES.join(", ")} ; \`origine.hypotheses[].selon\` : ces ouvrages ou les auteurs ci-dessous.`,
    `- \`redaction[].par\` : ${REDACTEURS.join(", ")}.`,
    `- Lectures traditionnelles, \`auteur\` et œuvres (data/auteurs.json) :`,
    ...auteurs.map((a) => `  - ${a.nom} : ${a.oeuvres.map((o) => `*${o}*`).join(", ")}.`),
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

if (import.meta.main) {
  await writeFile(FICHIER_SCHEMA, JSON.stringify(genererSchemaJson(), null, 2) + "\n");
  await writeFile(FICHIER_CONTRAT, genererMarkdown());
  console.log("✓ docs/fiche.schema.json et docs/contrat-fiche.md régénérés");
}
