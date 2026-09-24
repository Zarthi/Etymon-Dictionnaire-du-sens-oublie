import { readdirSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { z } from "zod";
import langues from "../data/langues.json" with { type: "json" };
import themes from "../data/themes.json" with { type: "json" };
import traditions from "../data/traditions.json" with { type: "json" };
import { LICENCES, NATURES, schemaAuteur, schemaEntreeRedaction, schemaFiche, schemaLectureTraditionnelle, schemaOuvrage } from "../src/lib/schema.ts";
import { REDACTEURS } from "../src/lib/sources.ts";
import {
  CHEMINS,
  DRAPEAUX,
  schemaDossier,
  schemaRetourDossier,
  schemaRetourLectures,
  schemaRetourRedaction,
  schemaRetourEcriture,
  schemaVerdict,
} from "./lib/atelier.ts";
import { cheminFiche } from "./lib/validation.ts";

/**
 * Contrat de données, généré à partir du schéma (src/lib/schema.ts) :
 * - docs/fiche.schema.json, auteur.schema.json, ouvrage.schema.json : schémas JSON, pour
 *   l'autocomplétion et la vérification dans VS Code ;
 * - docs/contrat-fiche.md : les trois types de fiches, lisibles ;
 * - docs/consignes/*.md : la consigne de chaque étape de la rédaction autonome (docs/methode.md),
 *   avec des fiches réelles du dépôt pour exemples ;
 * - le bloc des schémas de sortie de scripts/workflow-lot.js, tirés de scripts/lib/atelier.ts.
 * Un test échoue si ces fichiers ne sont plus à jour : lancer `npm run contrat`.
 */
const docs = (nom: string) => fileURLToPath(new URL(`../docs/${nom}`, import.meta.url));
export const SCHEMAS_JSON = [
  { fichier: docs("fiche.schema.json"), schema: schemaFiche, titre: "Fiche d'Étymon" },
  { fichier: docs("auteur.schema.json"), schema: schemaAuteur, titre: "Auteur d'Étymon" },
  { fichier: docs("ouvrage.schema.json"), schema: schemaOuvrage, titre: "Ouvrage d'Étymon" },
];
export const FICHIER_CONTRAT = docs("contrat-fiche.md");
export const FICHIER_WORKFLOW = fileURLToPath(new URL("./workflow-lot.js", import.meta.url));
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
  "Un champ facultatif à sa valeur par défaut ne s'écrit pas (`incertain: false`, listes vides).",
  "Toute référence (auteur, ouvrage, doublet) vise une fiche existante ; un renvoi (`renvois`, `tradition.renvois`), une fiche ou un candidat à faire (l'app ne l'affiche qu'une fois la fiche écrite ; vers la tradition, une fois qu'elle a des lectures).",
  "`etymologie` : un maillon porte une forme, des éléments, ou les deux ; ou bien des alternatives. Le maillon du sens premier porte un sens (une composition, le sens littéral de ses éléments) ; au plus un maillon est `premier`.",
  "Translittération : seulement pour une écriture ni latine ni grecque (arabe, hébreu), et alors obligatoire.",
  "`selon` : seulement dans une origine débattue ; un ouvrage qui rapporte une hypothèse n'en est pas le tenant.",
  "Lecture traditionnelle : sa voix se déduit de l'œuvre citée (son auteur, ou l'œuvre elle-même pour l'Écriture) ; `auteur` ne s'écrit que pour une parole rapportée par l'œuvre d'un autre (Resh Lakish dans le Talmud), de la tradition de l'œuvre si elle n'a pas d'auteur ; une seule voix par lecture ; `tradition` seulement si un auteur en a plusieurs (l'Écriture reçue en commun les garde toutes) ; une `hypothese` parmi les alternatives de la chaîne ; la citation figure mot pour mot à l'adresse de la source (`npm run verifier:en-ligne`).",
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
  "Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte, et tu lui signales ton doute.",
  "`etymologie` : la chaîne, du plus proche au plus lointain. Le premier maillon est la langue source directe (latin pour un mot hérité, italien pour un emprunt à l'italien) ; on ne remonte que si cela ajoute un sens ou si l'origine est débattue.",
  "Formes dans leur écriture d'origine (φρήν, صفر) ; translittération seulement pour l'arabe ou l'hébreu (celle du grec se déduit).",
  "`sens` seulement là où il apprend quelque chose : le sens premier, affiché seul en tête de fiche, est celui du maillon le plus lointain attesté qui en porte un. Une composition porte le sens littéral de ses éléments (schizophrénie : esprit fendu), et chaque élément le sien.",
  "`explication` : ce qui s'est perdu, affaibli ou retourné entre le sens premier et l'usage actuel. Elle n'explique pas une seconde fois le sens, affiché juste au-dessus ; mais mieux vaut redire le mot juste qu'un détour. Ton sobre, sans emphase ni jugement. Le sens ancien n'est pas le « vrai » sens du mot, ni l'usage actuel une erreur : l'explication dit ce qui a changé, l'histoire n'en juge pas.",
  "`themes` : le domaine où le mot s'emploie aujourd'hui, non celui de son sens premier (étonner : émotions, pas météo) ; un ou deux, affichés sur la fiche. Aucune liste fermée n'est exhaustive. Une langue qui manque est un fait : ajoute-la (`npm run liste -- langues \"<langue>\"`) et dis-le dans tes ajouts. Un thème qui manque ne s'ajoute pas pendant le lot : mets le plus proche, et propose le thème manquant dans tes ajouts, avec la raison ; il sera ajouté entre deux lots si d'autres mots le demandent.",
  "Tout mot étranger cité dans un texte est une forme de la chaîne : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.",
  "Un mot sacré par origine (né dans l'ordre sacré : manne, sabbat, alléluia) ne se rédige pas en lot : signale-le, il se rédige à part, texte d'origine sous les yeux. Un mot consacré (profane à l'origine : église, ange, baptême) se rédige comme les autres : son sens profane premier est justement ce que le dictionnaire révèle.",
  "Le Nom divin s'écrit comme le texte l'écrit (Yah, YHWH), jamais traduit (« Dieu ») ni vocalisé (« Jéhovah », « Yahvé »).",
  "`ecartees` : étymologies proposées puis écartées ; `populaire: true` pour une idée reçue (*sincère*, « sans cire »), jamais dans la chaîne.",
  "Liens entre mots, un seul endroit selon leur raison. Un lien qui s'explique en une phrase va dans l'explication : l'app lie tout mot qui a une fiche (Bleuler renommait la démence précoce). `renvois` (Voir aussi) : notions voisines du même ordre, sans racine commune (schizophrénie → délire, folie) ; trois au plus, souvent aucun. `tradition.renvois` (sous « Lectures traditionnelles » : voir obsession) : mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) ; deux au plus, rare. Un renvoi vise un mot important du dictionnaire, qu'il ait déjà sa fiche ou non.",
  "Auteurs et ouvrages sont cités par leur identifiant dans les champs (`selon`, `forge`, `personne`, `ouvrage`). S'il manque une fiche, choisis son identifiant (prénom et nom sans accent : eugen-bleuler ; abrégé ou titre : utopia) et rends-le dans tes références : l'étape du référentiel la crée d'après la notice BnF.",
  "Dans un texte, nomme un auteur sous son nom usuel ou une de ses formes de citation (liste ci-dessous) : l'app en fait un lien, s'il est aussi cité dans un champ de la fiche.",
  "Tu rédiges d'après le dossier (atelier/<id>/dossier.json) : la fiche n'affirme rien qui n'y soit (forme, langue, sens, date, auteur, tenant, histoire du mot). Si ta mémoire te dit qu'un fait manque ou qu'un fait du dossier est faux, ne l'écris pas : dis-le dans tes notes. Si le dossier signale un doute sur la chaîne, `incertain: true`.",
  "Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` ni les lectures traditionnelles (`tradition.lectures`) : les scripts posent les premiers (npm run rediger), les lectures se rédigent à part, texte source sous les yeux.",
  "Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.",
];

const ENTETE = "> Généré par `npm run contrat` : ne pas modifier à la main. Étape de la rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.";

/** Consigne de l'étape 2 : rédiger une fiche d'après son dossier. */
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
    "## Format",
    "",
    "Un fichier JSON, `atelier/<id>/fiche.json` : la fiche seule, avec les champs ci-dessous et eux seuls ; un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872 : le TLFi la donne).",
    "",
    ...contrat(schemaEntreeRedaction, "###"),
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
    "`npm run rediger -- atelier/<id>/fiche.json --essai` : valide la fiche avec le dépôt sans l'écrire. Corrige ce qui est « à corriger » ; ce qui est « à créer » (auteurs, ouvrages) va dans tes références.",
    "",
  ].join("\n");
}

/** Contrat d'un schéma d'atelier, sans le titre de premier niveau. */
const contratAtelier = (schema: z.ZodType) => contrat(schema, "###");

/** Consigne de l'étape 1 : le dossier de faits, et le tri. */
export function genererConsigneDossier(): string {
  return [
    "# Constituer le dossier d'un mot",
    "",
    ENTETE,
    "",
    "Tu rassembles les faits dont une autre IA tirera la fiche du mot ; tu ne rédiges pas la fiche. Le dossier se relit en quelques secondes.",
    "",
    "## Étapes",
    "",
    "1. `npm run dossier -- <mot>` : crée `atelier/<id>/dossier.json`, avec les entrées du Littré local, et affiche le Littré et l'étymologie du TLFi.",
    "2. Choisis le chemin et les drapeaux du mot (ci-dessous).",
    "3. Remonte la chaîne jusqu'au sens premier, sans aller plus loin qu'il ne faut (AGENTS.md §3.2) : pour chaque maillon, la forme, la langue et le sens, chacun avec l'ouvrage et l'entrée qui le donnent. Sens d'un étymon latin : Gaffiot (gaffiot.fr, dans le navigateur intégré), seulement si ni le Littré ni le TLFi ne le donnent ; grec : Bailly (`npm run texte -- bailly:φρήν`). Un mot voisin (« déverbal de ennuyer ») : `npm run dossier -- --consulter ennuyer`.",
    "4. Mot forgé : l'auteur, la date et l'ouvrage, tels que les sources les donnent. Origine débattue : chaque hypothèse, qui la défend, et qui la rapporte seulement. Étymologie populaire connue : ce qu'en disent les sources.",
    "5. Écris `chemin`, `drapeaux`, `faits`, `manques` et `notes` dans le fichier, puis `npm run dossier -- --verifier <mot>`.",
    "",
    "## Règles",
    "",
    "- Un fait est ce qu'une source dit, en une phrase à toi, avec l'ouvrage (identifiant de data/ouvrages : littre, tlfi, gaffiot, bailly…) et l'entrée consultée. Jamais de mémoire : ce que tu sais sans l'avoir lu va dans `notes`, comme une piste.",
    "- Du Littré (domaine public), tu peux recopier. Du TLFi (non libre), du Gaffiot et du Bailly (CC BY-NC-ND), les faits seuls, reformulés.",
    "- Jamais le Wiktionnaire (l'API du TLFi en contient une rubrique : l'ignorer), ni le Robert, ni Bloch et Wartburg, ni le FEW.",
    "- Une étymologie du Littré dépassée par le TLFi : les deux faits, avec leur source ; la rédaction suivra le plus récent.",
    "- Mot sacré (chemin `sacre`) : le texte d'origine, dans sa langue (Wikisource en hébreu : `npm run texte -- <adresse> --autour \"<mot>\"`), avec le livre, le chapitre et le verset où le mot paraît ou s'explique.",
    "- Drapeau `tradition` : un auteur traditionnel a lu le mot lui-même, ou son étymon (Isidore, Augustin, Lactance, le Talmud…), et non la chose qu'il désigne aujourd'hui ; donne dans `notes` l'œuvre et le passage si tu les connais : la passe des lectures les cherchera.",
    "- Pas plus de faits qu'il n'en faut pour la fiche : dix au plus.",
    "",
    "## Format de `atelier/<id>/dossier.json`",
    "",
    ...contratAtelier(schemaDossier),
    `Chemins : ${CHEMINS.join(", ")}. Drapeaux : ${DRAPEAUX.join(", ")}.`,
    "",
  ].join("\n");
}

/** Consigne de l'étape 3 : la relecture critique. */
export function genererConsigneRelecture(): string {
  return [
    "# Relire une fiche d'après son dossier",
    "",
    ENTETE,
    "",
    "Tu relis une fiche qu'une autre IA a rédigée ; tu ne la réécris pas. Lis `atelier/<id>/dossier.json` et `atelier/<id>/fiche.json`, et rien d'autre : le dossier tient lieu des sources.",
    "",
    "## Trois critères, et rien d'autre",
    "",
    "1. **dossier** : chaque affirmation de la fiche (forme, langue, sens, date, auteur, tenant, ce que l'explication dit de l'histoire du mot) est dans le dossier.",
    "2. **justesse** : chaque phrase répond à « que veux-tu dire exactement ? » (AGENTS.md §3) ; chaque mot dans son sens propre, sans figure, sans effet, sans jargon ; l'explication dit ce qui s'est perdu, affaibli ou retourné, sans redire le sens affiché au-dessus.",
    "3. **regle** : les règles que les scripts ne voient pas : le sens premier au bon maillon ; la règle d'arrêt ; étymologie et tradition distinctes ; aucune étymologie populaire dans la chaîne ; `renvois` vers des notions du même ordre, sans racine commune ; `tradition.renvois` seulement vers un mot que la tradition a lu ; `incertain` quand le dossier doute de la chaîne ; des `themes` qui disent le domaine où le mot s'emploie aujourd'hui ; aucune phrase qui fasse du sens ancien le « vrai » sens du mot.",
    "",
    "Ne relève ni ce que les scripts vérifient (typographie, longueurs, identifiants, listes fermées), ni une préférence de style : seulement ce qui rend la fiche fausse, obscure ou contraire aux règles. `accepte` : aucune remarque. `a-reprendre` : les remarques qui obligent à changer la fiche, chacune avec ce qu'il faudrait écrire si tu le sais.",
    "",
    "## Verdict",
    "",
    ...contratAtelier(schemaVerdict),
  ].join("\n");
}

/** Consigne de l'étape 4 : les fiches d'auteurs et d'ouvrages, d'après la BnF. */
export function genererConsigneReferences(): string {
  return [
    "# Créer les fiches d'auteurs et d'ouvrages",
    "",
    ENTETE,
    "",
    "Tu reçois des références demandées par les fiches d'un lot (type, identifiant, indication). Pour chacune :",
    "",
    "1. Si `data/auteurs/<id>.yaml` (ou `data/ouvrages/<id>.yaml`) existe, rien à faire.",
    '2. Cherche sa notice : `npm run bnf -- auteur "<nom> <année de naissance sur quatre chiffres>"` (`Augustin 0354`, `Bleuler 1857`) ; `npm run bnf -- ouvrage "<auteur> <titre>"`. Choisis la notice qui répond à l\'indication (dates, note).',
    '3. Écris la fiche : `npm run bnf -- auteur --cb <cb> --id <id> --description "…" --modele "<ton modèle>"`, avec `--nom` si le nom usuel n\'est pas « prénom nom » (Augustin, Cicéron), `--nom-complet` s\'il diffère (Aurelius Augustinus), `--traditions` seulement pour un auteur qui parle dans une tradition (une tradition absente de la liste : `npm run liste -- traditions "<tradition>"` d\'abord). Un ouvrage : `npm run bnf -- ouvrage --cb <cb> --id <id> --titre "<titre français>" --licence "<licence>" --description "…" --modele "…"`, avec `--auteur <id>` (l\'auteur d\'abord), `--abrege`, `--titre-original`.',
    "",
    "## Règles",
    "",
    "- Dates et forme d'entrée viennent de la notice : le script les pose, tu ne les écris pas.",
    "- Description : 200 caractères au plus ; ce qui situe (époque, domaine, œuvre), pas une biographie, pas de jugement.",
    `- Licence d'un ouvrage : ${LICENCES.join(", ")} ; domaine public si l'auteur est mort depuis plus de soixante-dix ans.`,
    "- Sans notice qui réponde à l'indication : un échec, avec sa raison ; jamais de fiche écrite à la main.",
    "",
  ].join("\n");
}

/** Lectures d'une fiche du dépôt, telles qu'elles sont écrites, pour exemple. */
function lecturesDe(id: string, rang: number): Record<string, unknown> {
  return parse(readFileSync(join(DATA, "fiches", cheminFiche(id)), "utf8")).tradition.lectures[rang];
}

/** Consigne de l'étape 5 : les lectures traditionnelles, texte source sous les yeux. */
export function genererConsigneLectures(): string {
  return [
    "# Chercher les lectures traditionnelles d'un mot",
    "",
    ENTETE,
    "",
    "Tu ajoutes à la fiche d'un mot (`data/fiches/<initiale>/<préfixe>/<id>.yaml`) les lectures qu'une tradition a faites du mot lui-même, texte source sous les yeux (AGENTS.md §4.7). Aucune lecture vaut mieux qu'une lecture approximative.",
    "",
    "## Étapes",
    "",
    "1. Pistes : les `notes` du dossier (`atelier/<id>/dossier.json`), et ce que tu sais (Isidore, *Étymologies* ; Augustin ; Lactance ; Varron ; le Talmud ; les Pères…). L'auteur doit avoir lu le mot, ou son étymon, pas la chose qu'il désigne aujourd'hui.",
    '2. Trouve le passage dans un texte original en ligne, du domaine public (Wikisource en latin, en grec, en hébreu ; thelatinlibrary.com ; archive.org), et lis-le tel quel : `npm run texte -- <adresse> --autour "<mot>"`. Jamais un outil qui résume la page pour une citation.',
    "3. Écris la lecture dans `tradition.lectures` : la citation copiée de la page, mot pour mot, `[…]` pour une coupe ; le texte, ce que la doctrine tire du mot, en une ou deux phrases, sans commencer par le nom de l'auteur ni répéter l'hypothèse.",
    "4. L'œuvre et son auteur doivent avoir leur fiche (`npm run bnf`, docs/consignes/references.md) : l'auteur avec ses `traditions`, l'œuvre avec l'adresse de son `texte`.",
    "5. `npm run verifier:en-ligne -- <mot>`, puis `npm run valider`. Une citation introuvable est une erreur : corrige-la, ou retire la lecture.",
    "",
    "## Règles",
    "",
    "- Une seule voix par lecture. Elle se déduit de l'œuvre citée : son auteur, ou l'œuvre elle-même pour l'Écriture. `auteur` ne s'écrit que pour une parole rapportée par l'œuvre d'un autre (Resh Lakish dans le Talmud).",
    "- `tradition` seulement si la voix parle dans plusieurs traditions ; `hypothese` quand la lecture repose sur l'une des alternatives de la chaîne.",
    "- Le Nom divin s'écrit comme le texte l'écrit, jamais vocalisé (« Jéhovah », « Yahvé »).",
    "- Rien trouvé dans un texte en ligne : pas de lecture ; dis-le dans tes notes, avec la piste.",
    "- Une voix qui parle dans une tradition absente de la liste : ajoute la tradition (`npm run liste -- traditions \"<tradition>\"`) et dis-le dans tes ajouts ; une tradition de trop se retire à la relecture plus aisément qu'une tradition manquante ne s'ajoute après coup.",
    "",
    "## Format",
    "",
    ...contrat(schemaLectureTraditionnelle, "###"),
    "## Exemples",
    "",
    "Lectures du dépôt (Lactance sur *religion* ; Resh Lakish, parole rapportée par le Talmud, sur *Satan*) :",
    "",
    "```json",
    JSON.stringify(lecturesDe("religion", 0)),
    JSON.stringify(lecturesDe("satan", 0)),
    "```",
    "",
  ].join("\n");
}

/** Consignes par étape, dans docs/consignes/. */
export const CONSIGNES_ETAPES = [
  { fichier: docs("consignes/dossier.md"), generer: genererConsigneDossier },
  { fichier: docs("consignes/redaction.md"), generer: genererPrompt },
  { fichier: docs("consignes/relecture.md"), generer: genererConsigneRelecture },
  { fichier: docs("consignes/references.md"), generer: genererConsigneReferences },
  { fichier: docs("consignes/lectures.md"), generer: genererConsigneLectures },
];

/** Schémas de sortie des agents du workflow : le script de workflow n'a pas accès aux fichiers. */
const SCHEMAS_WORKFLOW = {
  dossier: schemaRetourDossier,
  redaction: schemaRetourRedaction,
  verdict: schemaVerdict,
  ecriture: schemaRetourEcriture,
  lectures: schemaRetourLectures,
};
const DEBUT_BLOC = "// <schemas> généré par npm run contrat (scripts/lib/atelier.ts) : ne pas modifier à la main";
const FIN_BLOC = "// </schemas>";

/** Le script de workflow, avec son bloc de schémas régénéré. */
export function genererWorkflow(actuel: string): string {
  const debut = actuel.indexOf(DEBUT_BLOC);
  const fin = actuel.indexOf(FIN_BLOC);
  if (debut === -1 || fin === -1) throw new Error(`scripts/workflow-lot.js : bloc « ${DEBUT_BLOC} » introuvable`);
  const schemas = Object.fromEntries(
    Object.entries(SCHEMAS_WORKFLOW).map(([nom, schema]) => {
      // io « output » : une liste qui a une valeur par défaut est exigée de l'agent, jamais absente.
      const { $schema: _s, ...json } = z.toJSONSchema(schema, { target: "draft-7", unrepresentable: "any", io: "output" }) as Record<string, unknown>;
      return [nom, json];
    }),
  );
  return `${actuel.slice(0, debut)}${DEBUT_BLOC}\nconst SCHEMAS = ${JSON.stringify(schemas)}\n${actuel.slice(fin)}`;
}

if (import.meta.main) {
  for (const { fichier, schema, titre } of SCHEMAS_JSON) await writeFile(fichier, JSON.stringify(genererSchemaJson(schema, titre), null, 2) + "\n");
  await writeFile(FICHIER_CONTRAT, genererMarkdown());
  await mkdir(docs("consignes"), { recursive: true });
  for (const { fichier, generer } of CONSIGNES_ETAPES) await writeFile(fichier, generer());
  await writeFile(FICHIER_WORKFLOW, genererWorkflow(readFileSync(FICHIER_WORKFLOW, "utf8")));
  console.log("✓ docs/*.schema.json, docs/contrat-fiche.md, docs/consignes/*.md et les schémas de scripts/workflow-lot.js régénérés");
}
