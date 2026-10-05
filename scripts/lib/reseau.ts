/** Délai maximal d'une requête : un serveur muet ne bloque pas un script. */
export const DELAI_MS = 30_000;

/**
 * Une page lue, ou la raison pour laquelle elle ne l'a pas été. Une page non lue n'est pas une
 * page où l'on n'a rien trouvé : l'appelant ne cherche que dans une page lue.
 */
export type Lecture = { lue: true; texte: string } | { lue: false; statut?: number; raison: string };

let prevenu = false;
/** Node n'utilise le proxy de l'environnement que sur demande (`--use-env-proxy`, ou NODE_USE_ENV_PROXY=1). */
function prevenirProxy() {
  const demande = process.execArgv.includes("--use-env-proxy") || process.env.NODE_USE_ENV_PROXY === "1";
  if (prevenu || demande || !(process.env.HTTPS_PROXY || process.env.https_proxy)) return;
  prevenu = true;
  console.warn("HTTPS_PROXY est défini : relancer avec NODE_USE_ENV_PROXY=1 pour que les requêtes passent par le proxy.");
}

/**
 * Lit une adresse (GET) : réponse 200 seulement ; toute autre réponse, une erreur réseau ou un délai
 * dépassé, est « non lue ». Le texte est de l'UTF-8, sauf si `encodage` dit autrement (un site ancien : « latin1 »).
 */
export async function lire(url: string, entetes?: Record<string, string>, encodage?: string): Promise<Lecture> {
  prevenirProxy();
  try {
    const reponse = await fetch(url, { signal: AbortSignal.timeout(DELAI_MS), ...(entetes ? { headers: entetes } : {}) });
    if (reponse.status !== 200) return { lue: false, statut: reponse.status, raison: `HTTP ${reponse.status}` };
    return { lue: true, texte: encodage ? new TextDecoder(encodage).decode(await reponse.arrayBuffer()) : await reponse.text() };
  } catch {
    return { lue: false, raison: "erreur réseau" };
  }
}

/** Texte lu, ou une erreur qui dit pourquoi la page ne l'a pas été. */
export async function lireOuErreur(url: string, entetes?: Record<string, string>): Promise<string> {
  const page = await lire(url, entetes);
  if (!page.lue) throw new Error(`${url} : ${page.raison}`);
  return page.texte;
}

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Réponses d'un serveur surchargé ou qui limite le débit : on réessaie après une pause. */
const A_REESSAYER = new Set([429, 503]);

/**
 * Comme `lire`, avec trois reprises (pause de `pause` ms, puis le double, le triple) quand le serveur
 * limite le débit (429) ou est surchargé (503). Une autre réponse ne se répète pas.
 */
export async function lireAvecRelance(url: string, entetes?: Record<string, string>, encodage?: string, pause = 15_000): Promise<Lecture> {
  let page = await lire(url, entetes, encodage);
  for (let essai = 1; essai < 4 && !page.lue && page.statut !== undefined && A_REESSAYER.has(page.statut); essai++) {
    await attendre(pause * essai);
    page = await lire(url, entetes, encodage);
  }
  return page;
}
