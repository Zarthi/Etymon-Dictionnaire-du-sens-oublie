import { texteBrut } from "./littre.ts";

/**
 * TLFi (non libre) : consultation seulement, un mot à la fois. Le portail du CNRTL charge ses
 * articles depuis une API JSON, que l'on interroge comme le fait la page : on n'en garde que la
 * nature, le plan des sens (avec leurs marques d'usage : « Vieilli », « Moderne ») et la rubrique
 * « Étymologie et historique », pour en tirer des faits, jamais la rédaction.
 */
export const urlApiTlfi = (mot: string) => `https://www.cnrtl.fr/api/word/${encodeURIComponent(mot)}/`;

export interface ReponseTlfi {
  header?: { full_pos?: string };
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
 * Plan des sens d'un article : chaque définition, précédée de son numéro et de ses marques d'usage.
 * Les exemples, les auteurs et les remarques ne sont pas gardés.
 */
export function planDesSens(article: string): string[] {
  const sens: string[] = [];
  let avant: string[] = [];
  for (const [, classe, contenu] of article.matchAll(/<(?:div|span) class=.(s-structure-num|s-usage-indicator|s-definition).[^>]*>([\s\S]*?)<\/(?:div|span)>/g)) {
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

export async function consulterTlfi(mot: string): Promise<Tlfi | undefined> {
  const reponse = await fetch(urlApiTlfi(mot)).catch(() => undefined);
  if (!reponse?.ok) return undefined;
  return lireTlfi((await reponse.json()) as ReponseTlfi);
}
