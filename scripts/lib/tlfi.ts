import { texteBrut } from "./littre.ts";
import { lire } from "./reseau.ts";

/**
 * TLFi (non libre) : consultation seulement, un mot à la fois. Le portail du CNRTL charge ses
 * articles depuis une API JSON, que l'on interroge comme le fait la page : on n'en garde que la
 * nature, le plan des sens (avec leurs marques d'usage : « Vieilli », « Moderne ») et la rubrique
 * « Étymologie et historique », pour en tirer des faits, jamais la rédaction.
 */
export const urlApiTlfi = (mot: string, nature?: string) => `https://www.cnrtl.fr/api/word/${encodeURIComponent(mot)}/${nature ? `${encodeURIComponent(nature)}/` : ""}`;

export interface ReponseTlfi {
  /** `others` : les autres natures du même mot (« ami » adjectif a pour autre article « ami » nom). */
  header?: { pos?: string; full_pos?: string; others?: { pos: string }[] };
  content?: { id: string; content: unknown }[];
}

export interface Tlfi {
  nature?: string;
  /** Plan des sens : « A. [Vieilli] Abattement… », « B. [Moderne] 1. Sentiment de lassitude. » */
  sens: string[];
  etymologie: string;
}

/** Longueur gardée de chaque définition : de quoi reconnaître le sens, pas recopier l'article. */
const LONGUEUR_DEFINITION = 110;

/**
 * Éléments du plan (numéro, marque d'usage, définition) dans l'ordre de l'article, avec leur contenu
 * entier : une marque contient des balises (« <span>Vieilli </span>ou dans des <span>loc.</span> »),
 * que la première balise fermante ne doit pas couper. Un élément dans un autre n'est pas compté deux fois.
 */
function elementsDuPlan(article: string): { classe: string; contenu: string }[] {
  const elements: { classe: string; contenu: string }[] = [];
  let fin = 0;
  for (const ouverture of article.matchAll(/<(?:div|span) class=.(s-structure-num|s-usage-indicator|s-definition).[^>]*>/g)) {
    if (ouverture.index < fin) continue;
    const debut = ouverture.index + ouverture[0].length;
    let profondeur = 1;
    for (const balise of article.slice(debut).matchAll(/<(\/?)(?:div|span)\b[^>]*>/g)) {
      profondeur += balise[1] ? -1 : 1;
      if (profondeur === 0) {
        fin = debut + balise.index + balise[0].length;
        elements.push({ classe: ouverture[1], contenu: article.slice(debut, debut + balise.index) });
        break;
      }
    }
  }
  return elements;
}

/**
 * Plan des sens d'un article : chaque définition, précédée de son numéro et de ses marques d'usage.
 * Les exemples, les auteurs et les remarques ne sont pas gardés.
 */
export function planDesSens(article: string): string[] {
  const sens: string[] = [];
  let avant: string[] = [];
  for (const { classe, contenu } of elementsDuPlan(article)) {
    const texte = texteBrut(contenu).replace(/\s*—$/, "");
    if (classe === "s-structure-num") avant.push(texte);
    else if (classe === "s-usage-indicator") avant.push(`[${texte}]`);
    else {
      const definition = texte.length > LONGUEUR_DEFINITION ? `${texte.slice(0, LONGUEUR_DEFINITION)}…` : texte;
      sens.push([...avant, definition].join(" "));
      avant = [];
    }
  }
  return sens;
}

/** Nature, plan des sens et étymologie d'une réponse de l'API ; rien si le TLFi n'a pas d'étymologie pour ce mot. */
export function lireTlfi(reponse: ReponseTlfi): Tlfi | undefined {
  const rubrique = reponse.content?.find((c) => c.id === "etymology")?.content;
  if (!Array.isArray(rubrique) || rubrique.length === 0) return undefined;
  const etymologie = rubrique.map((r) => texteBrut(String(r))).join(" ¶ ");
  const article = reponse.content?.find((c) => c.id === "tlfi")?.content;
  const sens = Array.isArray(article) ? planDesSens(article.map(String).join(" ")) : [];
  const nature = reponse.header?.full_pos;
  return { ...(nature ? { nature } : {}), sens, etymologie };
}

/** Réponse JSON de l'API, ou la raison pour laquelle on ne l'a pas : page non lue, ou lue mais illisible. */
async function chargerReponse(mot: string, nature?: string): Promise<{ reponse: ReponseTlfi } | { injoignable: string }> {
  const page = await lire(urlApiTlfi(mot, nature));
  if (!page.lue) return { injoignable: page.raison };
  try {
    return { reponse: JSON.parse(page.texte) as ReponseTlfi };
  } catch {
    return { injoignable: "réponse illisible" };
  }
}

export type ResultatTlfi = {
  tlfi?: Tlfi;
  injoignable?: string;
  /** Natures des autres articles du portail pour ce mot (homographes), à aller lire si ce n'est pas le bon. */
  autres?: string[];
};

/** La nature attendue (« nom féminin ») est-elle celle d'un article du portail (« nom ») ? */
const convient = (attendue: string, pos: string | undefined) => pos !== undefined && (attendue === pos || attendue.startsWith(`${pos} `));

/**
 * L'article de la nature attendue (celle du Littré, quand on la connaît), sinon celui que l'API
 * rend par défaut ; puis, s'il n'a pas d'étymologie (l'API rend l'adjectif pour *ami* et *ennemi*,
 * dont l'étymologie est à l'article du nom), les autres natures annoncées. Avec l'article choisi,
 * la liste des natures des autres articles : *lire* nom (la monnaie) ou verbe.
 * Ne cherche que dans une réponse lue : sinon, la raison pour laquelle elle ne l'a pas été.
 */
export async function premierAvecEtymologie(
  charger: (nature?: string) => Promise<{ reponse: ReponseTlfi } | { injoignable: string }>,
  attendue?: string,
): Promise<ResultatTlfi> {
  const premiere = await charger();
  if ("injoignable" in premiere) return premiere;
  const posDefaut = premiere.reponse.header?.pos;
  const autresPos = (premiere.reponse.header?.others ?? []).map((o) => o.pos);
  const toutes = [posDefaut, ...autresPos];
  // Ordre d'essai : la nature attendue d'abord, puis la nature par défaut, puis les autres.
  const voulue = attendue && !convient(attendue, posDefaut) ? autresPos.find((p) => convient(attendue, p)) : undefined;
  const ordre = voulue ? [voulue, posDefaut, ...autresPos.filter((p) => p !== voulue)] : toutes;
  for (const pos of ordre) {
    let reponse: ReponseTlfi | undefined = premiere.reponse;
    if (pos !== posDefaut) {
      const autre = await charger(pos);
      reponse = "reponse" in autre ? autre.reponse : undefined;
    }
    const tlfi = reponse && lireTlfi(reponse);
    if (!tlfi) continue;
    const autres = toutes.filter((p): p is string => p !== undefined && p !== pos);
    return { tlfi, ...(autres.length ? { autres } : {}) };
  }
  return {};
}

export const consulterTlfi = (mot: string, attendue?: string) => premierAvecEtymologie((nature) => chargerReponse(mot, nature), attendue);
