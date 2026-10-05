/**
 * Formes d'origine relevées dans le texte d'une étymologie (Littré, TLFi), et ce qu'il faut en tirer
 * pour consulter les dictionnaires des étymons : clés d'entrée à essayer, texte réduit à l'entrée.
 * L'extraction est approchée : un texte d'étymologie n'est pas structuré, et un oubli ou un faux
 * positif se corrige en lisant `sources.md`, jamais en le supposant absent.
 */

/** Mots français qui suivent « lat. » sans être une forme latine, et qualificatifs du latin. */
const PAS_UNE_FORME = new Set([
  "et", "ou", "de", "du", "des", "le", "la", "les", "un", "une", "qui", "que", "dans", "pour", "par", "sur", "avec", "sans", "proprement", "puis", "meme",
  "sens", "signifie", "signifiant", "mot", "verbe", "nom", "adjectif", "participe", "part", "est", "sont", "etait", "origine", "derive", "voy", "voir", "cf",
  "class", "pop", "tardif", "au", "aux", "en", "on", "il", "ce", "se", "si", "son", "sa", "ses", "ainsi", "mais", "comme", "dit", "dont", "mod", "lat", "latin",
]);

/** Prépositions et préfixes latins : « lat. in odio esse » se cherche à odium, non à in. */
const PETITS_MOTS = new Set(["in", "ex", "de", "ad", "cum", "per", "pro", "sub", "super", "re", "con", "ab", "a", "e", "ante", "inter", "ob"]);

const sansAccents = (texte: string) => texte.normalize("NFD").replace(/\p{M}/gu, "");

/**
 * Formes latines citées après « lat. », « lat. pop. », « b. lat. », « latin »… : une par marque, sans
 * étoile ni trait d'union (« ex-tonare » donne extonare), en minuscules, sans doublon. Une forme
 * reconstruite (*extonare) est gardée : elle se cherche dans le corpus, non dans un dictionnaire.
 */
export function formesLatines(texte: string): string[] {
  const marque =
    /(?<!\p{L})(?:(?:bas|b)\.?[\s-]?)?lat(?:\.|in(?!\p{L}))(?:\s+(?:pop|populaire|vulg|vulgaire|médiév|médiéval|chrét|chrétien|class|classique|tardif|scol|jurid|eccl|ecclés|savant|archaïque)(?!\p{L})\.?)?\s+\*?(\p{L}[\p{L}-]*)(?:\s+(\p{L}[\p{L}-]*))?/giu;
  const formes: string[] = [];
  for (const [, premier, second] of texte.matchAll(marque)) {
    const brut = PETITS_MOTS.has(sansAccents(premier).toLowerCase()) && second ? second : premier;
    const forme = sansAccents(brut).toLowerCase().replaceAll("-", "");
    if (forme.length >= 3 && /^[a-z]+$/.test(forme) && !PAS_UNE_FORME.has(forme) && !formes.includes(forme)) formes.push(forme);
  }
  return formes;
}

const VARIANTES_GREC: Record<string, string> = { ϰ: "κ", ϐ: "β", ϑ: "θ", ϱ: "ρ", ϖ: "π", ϲ: "σ" };

/**
 * Mots grecs d'un texte, en minuscules, au graphisme des dictionnaires : l'accent grave du Littré
 * (κριτικὸς) devient l'accent aigu du Bailly (κριτικός), les lettres de forme (ϰ) les lettres ordinaires.
 */
export function formesGrecques(texte: string): string[] {
  const formes: string[] = [];
  for (const [mot] of texte.normalize("NFC").matchAll(/[\p{Script=Greek}]{2,}/gu)) {
    const forme = [...mot.toLowerCase()]
      .map((c) => VARIANTES_GREC[c] ?? c)
      .join("")
      .normalize("NFD")
      .replace(/̀/g, "́")
      .normalize("NFC");
    if (!formes.includes(forme)) formes.push(forme);
  }
  return formes;
}

/** Terminaisons latines du cas régime ou de l'infinitif et de l'entrée de dictionnaire qui leur répond (Lewis & Short : lego, religio, pax). */
const NOMINATIFS: [RegExp, string[]][] = [
  [/ionem$/, ["io"]],
  [/atem$/, ["as"]],
  [/cem$/, ["x"]],
  [/edem$/, ["es"]],
  [/[io]nem$/, ["o"]],
  [/are$/, ["o"]],
  [/ere$/, ["o", "eo"]],
  [/ire$/, ["io", "o"]],
  [/ari$/, ["or"]],
  [/eri$/, ["eor"]],
  [/iri$/, ["ior"]],
  [/um$/, ["us"]],
];

/** Entrées à essayer pour une forme latine : elle-même, puis sa forme de dictionnaire (legere, lego). */
export function clesLatines(forme: string): string[] {
  const variantes = NOMINATIFS.flatMap(([fin, remplacements]) => (fin.test(forme) ? remplacements.map((r) => forme.replace(fin, r)) : []));
  return [...new Set([forme, ...variantes])];
}

/** Entrées à essayer pour une forme grecque : elle-même, puis sa forme de dictionnaire (λέγειν, λέγω). */
export function clesGrecques(forme: string): string[] {
  const variantes = [forme.replace(/ειν$/, "ω"), forme.replace(/εῖν$/, "έω"), forme.replace(/άειν$/, "άω")];
  return [...new Set([forme, ...variantes])];
}

/** Numéros qu'une entrée du Lewis & Short peut porter quand le mot a des homographes (lego1, lego2). */
export const NUMEROS_PERSEUS = ["", "1", "2"];

/**
 * Radical latin pour chercher dans le corpus : la forme sans sa terminaison (religio : religi ;
 * captivus : captiv ; legere : lege, de quatre lettres au moins pour ne pas tout trouver).
 */
export function radicalLatin(forme: string): string {
  const racine = forme.replace(/(?:ionem|atem|are|ere|ire|ari|eri|iri|us|um|em|is|a|o|e|i)$/, "");
  return racine.length >= 4 ? racine : forme.slice(0, 4);
}

/** Texte lisible d'une entrée du Lewis & Short sur Perseus : de la balise du texte au pied de page, les noms de liens et le script retirés. */
export function entreePerseus(texteHtml: string): string | undefined {
  const debut = texteHtml.indexOf('<div id="text_main">');
  if (debut === -1) return undefined;
  const pied = texteHtml.indexOf('id="entrylookup"', debut);
  const corps = texteHtml.slice(debut, pied === -1 ? undefined : texteHtml.lastIndexOf("<", pied));
  const texte = corps
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/addDocument\([^)]*\)\s*;?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return texte === "" ? undefined : texte;
}

/**
 * Entrée d'une page du Bailly, d'après son texte : la page commence par le titre (« φρήν (phrēn) »),
 * des boutons, puis les mots voisins collés les uns aux autres, dont le dernier est la vedette de
 * l'entrée ; l'entrée suit.
 */
export function entreeBailly(texteDePage: string): string | undefined {
  const marque = "À propos";
  const i = texteDePage.indexOf(marque);
  if (i === -1) return undefined;
  const vedette = texteDePage.slice(0, i).split(/\s+/)[0];
  const reste = texteDePage.slice(i + marque.length).trimStart();
  const voisins = /^\S+/.exec(reste)?.[0] ?? "";
  const j = voisins.lastIndexOf(vedette);
  const entree = (j === -1 ? reste.slice(voisins.length) : reste.slice(j)).trim();
  return entree === "" ? undefined : entree;
}

/** Texte tronqué à `longueur` caractères, à la fin d'un mot. */
export function tronquer(texte: string, longueur: number): string {
  if (texte.length <= longueur) return texte;
  const coupe = texte.slice(0, longueur);
  return `${coupe.slice(0, Math.max(coupe.lastIndexOf(" "), longueur / 2))}…`;
}
