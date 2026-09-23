import { isAlias, LineCounter, parseDocument, visit } from "yaml";
import { z } from "zod";
import { schemaComptes, schemaFiche } from "../../src/lib/schema.ts";
import type { Fiche, FicheIdentifiee, LigneComptes } from "../../src/lib/types.ts";

z.config(z.locales.fr());

/** Une règle enfreinte : où, sur quel champ, laquelle. */
export interface Erreur {
  fichier: string;
  champ: string;
  regle: string;
}

/** Contenu brut d'un fichier, désigné par son chemin d'affichage. */
export interface FichierSource {
  fichier: string;
  texte: string;
}

const RAPPEL_YAML =
  'Rappel : une valeur commençant par « * » ou contenant « : » doit être entre guillemets (ex. etymon: "*extonare").';

const LONGUEUR_MAX_EXPLICATION = 300;
const PHRASES_MAX_EXPLICATION = 3;
const ESPACES_INSECABLES = [" ", " "];

/** Forme ASCII minuscule sans accent d'un mot, mots séparés par des tirets. */
export function slug(mot: string): string {
  return mot
    .toLowerCase()
    .replaceAll("œ", "oe")
    .replaceAll("æ", "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Nombre de phrases : ponctuations finales suivies d'un blanc ou de la fin du texte. */
export function compterPhrases(texte: string): number {
  return texte.match(/[.!?…]+(?=\s|$)/g)?.length ?? 0;
}

/** Règles typographiques françaises enfreintes par un texte. */
export function verifierTypographie(texte: string): string[] {
  const regles: string[] = [];
  if (/["“”]/.test(texte)) regles.push("guillemets droits ou anglais interdits : utiliser « »");
  const signesFautifs = new Set<string>();
  for (const { 0: signe, index } of texte.matchAll(/[:;?!]/g)) {
    const precedent = texte[index - 1] ?? "";
    if (!ESPACES_INSECABLES.includes(precedent) && !"?!".includes(precedent)) signesFautifs.add(signe);
  }
  for (const signe of signesFautifs) regles.push(`espace insécable requise avant « ${signe} »`);
  return regles;
}

function erreursZod(fichier: string, erreur: z.ZodError): Erreur[] {
  return erreur.issues.map((issue) => ({
    fichier,
    champ: issue.path.join(".") || "(racine)",
    regle: issue.message,
  }));
}

function lireYaml(fichier: string, texte: string): { valeur: unknown } | { erreurs: Erreur[] } {
  const lignes = new LineCounter();
  const document = parseDocument(texte, { uniqueKeys: true, lineCounter: lignes });
  const erreurs: Erreur[] = document.errors.map((e) => ({
    fichier,
    champ: e.linePos ? `ligne ${e.linePos[0].line}` : "(yaml)",
    regle: `YAML illisible : ${e.message.split("\n")[0]} ${RAPPEL_YAML}`,
  }));
  // Un alias (« *nom ») n'a pas sa place dans une fiche : c'est presque toujours un étymon reconstruit sans guillemets.
  visit(document, (_, noeud) => {
    if (!isAlias(noeud)) return;
    const champ = noeud.range ? `ligne ${lignes.linePos(noeud.range[0]).line}` : "(yaml)";
    erreurs.push({ fichier, champ, regle: `YAML illisible : alias « *${noeud.source} » interdit. ${RAPPEL_YAML}` });
  });
  return erreurs.length > 0 ? { erreurs } : { valeur: document.toJS() };
}

/** Règles propres à une fiche isolée (identifiant, cohérence interne, rédaction). */
function verifierFiche(fichier: string, id: string, fiche: Fiche): Erreur[] {
  const erreurs: Erreur[] = [];
  const ajouter = (champ: string, regle: string) => erreurs.push({ fichier, champ, regle });

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    ajouter("id", "le nom de fichier doit être en ASCII minuscule sans accent (mots séparés par des tirets)");
  } else if (id !== slug(fiche.mot) && !new RegExp(`^${slug(fiche.mot)}-\\d+$`).test(id)) {
    ajouter("id", `le nom de fichier doit correspondre au mot : « ${slug(fiche.mot)}.yaml »`);
  }

  if (fiche.reconstruit !== fiche.etymon.startsWith("*")) {
    ajouter("reconstruit", "doit valoir true si et seulement si l'étymon commence par « * »");
  }

  if (fiche.doublets.includes(id)) ajouter("doublets", "une fiche ne peut pas être son propre doublet");

  const phrases = compterPhrases(fiche.explication);
  if (phrases < 1 || phrases > PHRASES_MAX_EXPLICATION) {
    ajouter("explication", `1 à ${PHRASES_MAX_EXPLICATION} phrases terminées par une ponctuation (${phrases} trouvée(s))`);
  }
  const longueur = [...fiche.explication].length;
  if (longueur > LONGUEUR_MAX_EXPLICATION) {
    ajouter("explication", `${LONGUEUR_MAX_EXPLICATION} caractères maximum (${longueur})`);
  }

  if (/[«»"“”]/.test(fiche.sens)) ajouter("sens", "sans guillemets : l'app les ajoute à l'affichage");

  const textes: [string, string][] = [
    ["sens", fiche.sens],
    ["explication", fiche.explication],
    ...fiche.historique.map((h, i): [string, string] => [`historique.${i}.note`, h.note]),
  ];
  if (fiche.lectureTraditionnelle) textes.push(["lectureTraditionnelle.texte", fiche.lectureTraditionnelle.texte]);
  for (const [champ, texte] of textes) {
    for (const regle of verifierTypographie(texte)) ajouter(champ, regle);
  }

  return erreurs;
}

/** Règles entre fiches : doublets existants et réciproques. */
function verifierDoublets(fiches: FicheIdentifiee[], idsPresents: Set<string>, fichierDe: Map<string, string>): Erreur[] {
  const erreurs: Erreur[] = [];
  const parId = new Map(fiches.map((f) => [f.id, f]));
  for (const fiche of fiches) {
    for (const doublet of fiche.doublets) {
      const fichier = fichierDe.get(fiche.id)!;
      if (!idsPresents.has(doublet)) {
        erreurs.push({ fichier, champ: "doublets", regle: `fiche « ${doublet} » introuvable` });
      } else if (parId.get(doublet)?.doublets.includes(fiche.id) === false) {
        erreurs.push({ fichier, champ: "doublets", regle: `relation non réciproque : « ${doublet} » ne cite pas « ${fiche.id} »` });
      }
    }
  }
  return erreurs;
}

/**
 * Valide un ensemble de fiches YAML.
 * `fiches` contient les fiches structurellement conformes ; le lot n'est utilisable que si `erreurs` est vide.
 */
export function validerFiches(sources: FichierSource[]): { fiches: FicheIdentifiee[]; erreurs: Erreur[] } {
  const erreurs: Erreur[] = [];
  const fiches: FicheIdentifiee[] = [];
  const idsPresents = new Set<string>();
  const fichierDe = new Map<string, string>();

  for (const { fichier, texte } of sources) {
    const id = /([^/\\]+)\.yaml$/.exec(fichier)?.[1];
    if (id === undefined) {
      erreurs.push({ fichier, champ: "(fichier)", regle: "extension attendue : .yaml" });
      continue;
    }
    if (idsPresents.has(id)) {
      erreurs.push({ fichier, champ: "id", regle: `id « ${id} » en double` });
      continue;
    }
    idsPresents.add(id);
    fichierDe.set(id, fichier);

    const lecture = lireYaml(fichier, texte);
    if ("erreurs" in lecture) {
      erreurs.push(...lecture.erreurs);
      continue;
    }
    const resultat = schemaFiche.safeParse(lecture.valeur);
    if (!resultat.success) {
      erreurs.push(...erreursZod(fichier, resultat.error));
      continue;
    }
    erreurs.push(...verifierFiche(fichier, id, resultat.data));
    fiches.push({ id, ...resultat.data });
  }

  erreurs.push(...verifierDoublets(fiches, idsPresents, fichierDe));
  return { fiches, erreurs };
}

/** Valide le fichier des comptes (JSON). */
export function validerComptes({ fichier, texte }: FichierSource): { comptes: LigneComptes[]; erreurs: Erreur[] } {
  let valeur: unknown;
  try {
    valeur = JSON.parse(texte);
  } catch (e) {
    return { comptes: [], erreurs: [{ fichier, champ: "(json)", regle: `JSON illisible : ${(e as Error).message}` }] };
  }
  const resultat = schemaComptes.safeParse(valeur);
  if (!resultat.success) return { comptes: [], erreurs: erreursZod(fichier, resultat.error) };
  return { comptes: resultat.data, erreurs: [] };
}
