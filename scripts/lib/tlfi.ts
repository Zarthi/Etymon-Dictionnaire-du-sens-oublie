import { texteBrut } from "./littre.ts";

/**
 * TLFi (non libre) : consultation seulement, un mot à la fois. Le portail du CNRTL charge ses
 * articles depuis une API JSON, que l'on interroge comme le fait la page : on n'en garde que la
 * rubrique « Étymologie et historique » et la nature, pour en tirer des faits, jamais la rédaction.
 */
export const urlApiTlfi = (mot: string) => `https://www.cnrtl.fr/api/word/${encodeURIComponent(mot)}/`;

export interface ReponseTlfi {
  header?: { full_pos?: string };
  content?: { id: string; content: unknown }[];
}

/** Nature et étymologie d'une réponse de l'API ; rien si le TLFi n'a pas d'étymologie pour ce mot. */
export function lireTlfi(reponse: ReponseTlfi): { nature?: string; etymologie: string } | undefined {
  const rubrique = reponse.content?.find((c) => c.id === "etymology")?.content;
  if (!Array.isArray(rubrique) || rubrique.length === 0) return undefined;
  const etymologie = rubrique.map((r) => texteBrut(String(r))).join(" ¶ ");
  return { ...(reponse.header?.full_pos ? { nature: reponse.header.full_pos } : {}), etymologie };
}

export async function consulterTlfi(mot: string): Promise<{ nature?: string; etymologie: string } | undefined> {
  const reponse = await fetch(urlApiTlfi(mot)).catch(() => undefined);
  if (!reponse?.ok) return undefined;
  return lireTlfi((await reponse.json()) as ReponseTlfi);
}
