import { texteBrut } from "./littre.ts";

/** Texte lisible d'une page HTML : scripts et styles retirés, balises ôtées, entités décodées. */
export function texteDePage(html: string): string {
  return texteBrut(html.replace(/<(script|style)[^>]*>[^]*?<\/\1>/gi, " "));
}

/**
 * Forme de comparaison d'un texte latin ou grec : minuscules, sans accents ni ponctuation,
 * u/v et i/j confondus (les éditions varient : « uinculo » / « vinculo »).
 */
export function normaliserCitation(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/v/g, "u")
    .replace(/j/g, "i")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Morceaux d'une citation, coupée par « […] », « … » ou « — » : chacun doit figurer tel quel dans la source. */
export function morceaux(citation: string): string[] {
  return citation
    .split(/\[…\]|\[\.\.\.\]|…|—/)
    .map(normaliserCitation)
    .filter((m) => m !== "");
}

/** Morceaux de la citation introuvables dans le texte de la source (aucun : la citation est vérifiée). */
export function morceauxAbsents(citation: string, texteSource: string): string[] {
  const source = normaliserCitation(texteSource);
  return morceaux(citation).filter((m) => !source.includes(m));
}

/** Page d'entrée absente de bailly.app : le site répond 200 avec ce titre. */
export function pageIntrouvable(html: string): boolean {
  return /<title>[^<]*introuvable/i.test(html);
}
