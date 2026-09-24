import { isAlias, LineCounter, parseDocument, visit } from "yaml";
import { z } from "zod";
import { prefixe } from "../../src/lib/decoupage.ts";
import { enAlphabetLatin, enGrec, indexPremier } from "../../src/lib/etymologie.ts";
import { formesAmbigues, mentionsDe, textesDe } from "../../src/lib/mentions.ts";
import { urlDeduite } from "../../src/lib/ouvrages.ts";
import { ID_VALIDE, schemaAuteur, schemaCandidats, schemaComptes, schemaFiche, schemaOuvrage } from "../../src/lib/schema.ts";
import { analyser, idDe } from "../../src/lib/texte.ts";
import type { Auteur, Candidat, Fiche, FicheIdentifiee, LigneComptes, Ouvrage, Referentiel } from "../../src/lib/types.ts";

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
  'Rappel : une valeur commençant par « * » ou contenant « : » ou une virgule dans { … } doit être entre guillemets (ex. etymon: "*extonare").';

const LONGUEUR_MAX_EXPLICATION = 300;
const PHRASES_MAX_EXPLICATION = 3;
const ESPACES_INSECABLES = ["\u00a0", "\u202f"];

/** Emplacement d'une fiche de mot, relatif au dossier des fiches : `e/et/etonner.yaml`. */
export function cheminFiche(id: string): string {
  return `${id[0]}/${prefixe(id)}/${id}.yaml`;
}

/** Forme ASCII minuscule sans accent d'un mot, mots séparés par des tirets. */
export function slug(mot: string): string {
  return idDe(mot);
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
  // Un alias (« *nom ») n'a pas sa place dans une fiche : c'est presque toujours une forme reconstruite sans guillemets.
  visit(document, (_, noeud) => {
    if (!isAlias(noeud)) return;
    const champ = noeud.range ? `ligne ${lignes.linePos(noeud.range[0]).line}` : "(yaml)";
    erreurs.push({ fichier, champ, regle: `YAML illisible : alias « *${noeud.source} » interdit. ${RAPPEL_YAML}` });
  });
  return erreurs.length > 0 ? { erreurs } : { valeur: document.toJS() };
}

/** Lit un fichier YAML et le valide par un schéma ; l'identifiant est le nom du fichier. */
function lireEtValider<T>(
  { fichier, texte }: FichierSource,
  schema: z.ZodType<T>,
): { id: string; valeur: T; erreurs: Erreur[] } | { erreurs: Erreur[] } {
  const id = /([^/]+)\.yaml$/.exec(fichier)?.[1];
  if (id === undefined) return { erreurs: [{ fichier, champ: "(fichier)", regle: "extension attendue : .yaml" }] };
  const erreurs: Erreur[] = [];
  if (!ID_VALIDE.test(id)) {
    erreurs.push({ fichier, champ: "id", regle: "le nom de fichier doit être en ASCII minuscule sans accent (mots séparés par des tirets)" });
  }
  const lecture = lireYaml(fichier, texte);
  if ("erreurs" in lecture) return { erreurs: [...erreurs, ...lecture.erreurs] };
  const resultat = schema.safeParse(lecture.valeur);
  if (!resultat.success) return { erreurs: [...erreurs, ...erreursZod(fichier, resultat.error)] };
  return { id, valeur: resultat.data, erreurs };
}

/** Nom de fichier attendu d'une fiche d'auteur ou d'ouvrage, rangée à plat dans son dossier. */
function verifierNomPlat(fichier: string, id: string, attendu: string, ajouter: (champ: string, regle: string) => void) {
  if (id !== attendu && !new RegExp(`^${attendu}-\\d+$`).test(id)) ajouter("id", `le nom de fichier doit correspondre au nom : « ${attendu}.yaml »`);
  if (fichier !== `${id}.yaml`) ajouter("(emplacement)", `la fiche doit être rangée à plat : « ${id}.yaml »`);
}

/** Typographie des textes affichés d'une fiche, quel que soit son type. */
function verifierTextes(textes: [string, string | undefined][], ajouter: (champ: string, regle: string) => void) {
  for (const [champ, texte] of textes) {
    if (texte === undefined) continue;
    for (const regle of verifierTypographie(texte)) ajouter(champ, regle);
    // Le Nom divin s'écrit comme le texte l'écrit (Yah, YHWH) : ni traduit, ni vocalisé, à la manière tardive de
    // « Jéhovah » ou savante de « Yahvé », qui invitent à le prononcer (Exode 20, 7).
    if (/[JI][ée]hovah|[YJI]ahv[ée]|[YJI]ahw[ée]/i.test(texte)) ajouter(champ, "Nom divin vocalisé (Jéhovah, Yahvé) : l'écrire comme le texte (Yah, YHWH)");
  }
}

/** Valide les fiches d'auteurs (`data/auteurs/<id>.yaml`). */
export function validerAuteurs(sources: FichierSource[]): { auteurs: Auteur[]; erreurs: Erreur[] } {
  const erreurs: Erreur[] = [];
  const auteurs: Auteur[] = [];
  for (const source of sources) {
    const lu = lireEtValider(source, schemaAuteur);
    erreurs.push(...lu.erreurs);
    if (!("id" in lu)) continue;
    const ajouter = (champ: string, regle: string) => erreurs.push({ fichier: source.fichier, champ, regle });
    verifierNomPlat(source.fichier, lu.id, slug(lu.valeur.nom), ajouter);
    verifierTextes([["description", lu.valeur.description], ...lu.valeur.historique.map((h, i): [string, string] => [`historique.${i}.note`, h.note])], ajouter);
    auteurs.push({ id: lu.id, ...lu.valeur });
  }
  return { auteurs, erreurs };
}

/** Valide les fiches d'ouvrages (`data/ouvrages/<id>.yaml`) ; leur auteur doit avoir sa fiche. */
export function validerOuvrages(sources: FichierSource[], auteurs: Map<string, Auteur>): { ouvrages: Ouvrage[]; erreurs: Erreur[] } {
  const erreurs: Erreur[] = [];
  const ouvrages: Ouvrage[] = [];
  for (const source of sources) {
    const lu = lireEtValider(source, schemaOuvrage);
    erreurs.push(...lu.erreurs);
    if (!("id" in lu)) continue;
    const ajouter = (champ: string, regle: string) => erreurs.push({ fichier: source.fichier, champ, regle });
    verifierNomPlat(source.fichier, lu.id, slug(lu.valeur.abrege ?? lu.valeur.titre), ajouter);
    if (lu.valeur.auteur !== undefined && !auteurs.has(lu.valeur.auteur)) ajouter("auteur", `auteur « ${lu.valeur.auteur} » sans fiche (data/auteurs)`);
    // Une œuvre d'auteur tient ses traditions de lui : les écrire deux fois, c'est risquer qu'elles divergent.
    if (lu.valeur.auteur !== undefined && lu.valeur.traditions !== undefined) {
      ajouter("traditions", "se déduisent de l'auteur : seulement pour une œuvre sans auteur (Talmud, Écriture)");
    }
    verifierTextes([["description", lu.valeur.description], ...lu.valeur.historique.map((h, i): [string, string] => [`historique.${i}.note`, h.note])], ajouter);
    ouvrages.push({ id: lu.id, ...lu.valeur });
  }
  return { ouvrages, erreurs };
}

/** Sources d'une fiche : l'ouvrage a sa fiche, et l'adresse n'est écrite que si elle ne se déduit pas. */
function verifierSources(fiche: { sources: Fiche["sources"] }, ref: Referentiel, ajouter: (champ: string, regle: string) => void) {
  fiche.sources.forEach((s, i) => {
    const ouvrage = ref.ouvrages.get(s.ouvrage);
    if (!ouvrage) return ajouter(`sources.${i}.ouvrage`, `ouvrage « ${s.ouvrage} » sans fiche (data/ouvrages)`);
    const deduite = urlDeduite(ouvrage.modeleEntree, s.entree);
    if (s.url && s.url === deduite) ajouter(`sources.${i}.url`, "adresse inutile : elle se déduit de l'entrée, la retirer");
    if (!s.url && !deduite && s.page === undefined) ajouter(`sources.${i}.url`, "indiquer une page ou une url (l'adresse de cet ouvrage ne se déduit pas de l'entrée)");
  });
}

/** Règles propres à une fiche de mot (identifiant, chaîne, références, rédaction). */
function verifierFiche(fichier: string, id: string, fiche: Fiche, ref: Referentiel): Erreur[] {
  const erreurs: Erreur[] = [];
  const ajouter = (champ: string, regle: string) => erreurs.push({ fichier, champ, regle });
  const auteur = (champ: string, cible: string) => {
    if (!ref.auteurs.has(cible)) ajouter(champ, `auteur « ${cible} » sans fiche (data/auteurs)`);
  };
  const ouvrage = (champ: string, cible: string) => {
    if (!ref.ouvrages.has(cible)) ajouter(champ, `ouvrage « ${cible} » sans fiche (data/ouvrages)`);
  };

  if (ID_VALIDE.test(id) && id !== slug(fiche.mot) && !new RegExp(`^${slug(fiche.mot)}-\\d+$`).test(id)) {
    ajouter("id", `le nom de fichier doit correspondre au mot : « ${slug(fiche.mot)}.yaml »`);
  }

  if (fiche.doublets.includes(id)) ajouter("doublets", "une fiche ne peut pas être son propre doublet");
  if (fiche.renvois.includes(id)) ajouter("renvois", "une fiche ne peut pas renvoyer à elle-même");
  if (fiche.tradition.renvois.includes(id)) ajouter("tradition.renvois", "une fiche ne peut pas renvoyer à elle-même");
  // Un renvoi relie des notions sans racine commune : même étymon ou même famille, c'est un doublet ou la famille.
  const parente = new Set([...fiche.doublets, ...fiche.famille.map(slug)]);
  for (const renvoi of fiche.renvois.filter((r) => parente.has(r))) {
    ajouter("renvois", `« ${renvoi} » est un doublet ou de la famille : pas un renvoi`);
  }

  // Un mot sacré n'a pas de partie profane : ni explication, ni sens de chaîne, sauf celui de la
  // langue sacrée quand le texte d'origine n'explique pas le mot (alléluia).
  const lecturePremiere = fiche.tradition.lectures.filter((l) => l.premier);
  if (fiche.sacre !== undefined) {
    if (fiche.explication !== undefined) ajouter("explication", "un mot sacré n'a pas d'explication profane : la retirer");
    const avecSens = fiche.etymologie.filter((m) => m.sens !== undefined).length;
    if (lecturePremiere.length > 0 && avecSens > 0) {
      ajouter("etymologie", "mot sacré dont le texte d'origine donne le sens (lecture premier) : les maillons n'ont pas de sens");
    } else if (lecturePremiere.length === 0 && avecSens !== 1) {
      ajouter("etymologie", "mot sacré : le sens vient du texte d'origine (lecture premier), sinon d'un seul maillon, celui de la langue sacrée");
    }
  } else if (fiche.explication === undefined) {
    ajouter("explication", "obligatoire (seul un mot sacré n'en a pas)");
  } else {
    const phrases = compterPhrases(fiche.explication);
    if (phrases < 1 || phrases > PHRASES_MAX_EXPLICATION) {
      ajouter("explication", `1 à ${PHRASES_MAX_EXPLICATION} phrases terminées par une ponctuation (${phrases} trouvée(s))`);
    }
    const longueur = [...fiche.explication].length;
    if (longueur > LONGUEUR_MAX_EXPLICATION) {
      ajouter("explication", `${LONGUEUR_MAX_EXPLICATION} caractères maximum (${longueur})`);
    }
  }
  if (lecturePremiere.length > 1) ajouter("tradition.lectures", "une seule lecture premier : celle du texte d'origine");
  fiche.tradition.lectures.forEach((l, i) => {
    if (l.premier && fiche.sacre === undefined) ajouter(`tradition.lectures.${i}.premier`, "seulement pour un mot sacré (sacre)");
    if (l.premier && l.sens === undefined) ajouter(`tradition.lectures.${i}.sens`, "la lecture premier donne le sens affiché en tête");
    if (!l.premier && l.sens !== undefined) ajouter(`tradition.lectures.${i}.sens`, "seulement pour la lecture premier");
  });

  // La chaîne : un seul sens premier ; translittération seulement là où elle ne se déduit pas ; références.
  const sens: [string, string | undefined][] = fiche.tradition.lectures.map((l, i): [string, string | undefined] => [`tradition.lectures.${i}.sens`, l.sens]);
  const premiers = fiche.etymologie.filter((m) => m.premier).length;
  if (premiers > 1) ajouter("etymologie", "un seul maillon peut porter premier: true");
  const premier = fiche.etymologie[indexPremier(fiche.etymologie)];
  if (premier.sens === undefined && fiche.sacre === undefined) {
    ajouter("etymologie", "aucun maillon ne porte de sens (une composition porte le sens littéral de ses éléments : « esprit fendu »)");
  }
  const lire = (champ: string, f: { forme: string; translitteration?: string }) => {
    const latin = enAlphabetLatin(f.forme);
    if (f.translitteration && (latin || enGrec(f.forme))) {
      ajouter(`${champ}.translitteration`, latin ? "inutile pour une forme en alphabet latin" : "inutile pour le grec : elle se déduit de la forme");
    }
    if (!f.translitteration && !latin && !enGrec(f.forme)) ajouter(`${champ}.translitteration`, "obligatoire pour une écriture ni latine ni grecque");
  };
  fiche.etymologie.forEach((m, i) => {
    const c = `etymologie.${i}`;
    if (m.forme) lire(c, { forme: m.forme, translitteration: m.translitteration });
    sens.push([`${c}.sens`, m.sens]);
    m.elements?.forEach((e, j) => {
      lire(`${c}.elements.${j}`, e);
      sens.push([`${c}.elements.${j}.sens`, e.sens]);
    });
    m.alternatives?.formes.forEach((a, j) => {
      const ca = `${c}.alternatives.formes.${j}`;
      if (a.forme) lire(ca, { forme: a.forme, translitteration: a.translitteration });
      sens.push([`${ca}.sens`, a.sens]);
      a.elements?.forEach((e, k) => {
        lire(`${ca}.elements.${k}`, e);
        sens.push([`${ca}.elements.${k}.sens`, e.sens]);
      });
      if (a.selon && m.alternatives!.mode !== "debattue") ajouter(`${ca}.selon`, "des tenants seulement pour une origine débattue (mode: debattue)");
      a.selon?.forEach((s, k) => auteur(`${ca}.selon.${k}`, s));
    });
    if (m.modele) {
      lire(`${c}.modele`, m.modele);
      sens.push([`${c}.modele.sens`, m.modele.sens]);
    }
    m.forge?.par.forEach((p, k) => auteur(`${c}.forge.par.${k}`, p));
    if (m.forge?.ouvrage) ouvrage(`${c}.forge.ouvrage`, m.forge.ouvrage);
    if ((m.personne || m.ouvrage) && !m.forme) ajouter(c, "personne ou ouvrage : seulement pour une forme (nom propre, titre)");
    if (m.personne) auteur(`${c}.personne`, m.personne);
    if (m.ouvrage) ouvrage(`${c}.ouvrage`, m.ouvrage);
  });
  fiche.ecartees.forEach((e, i) => {
    lire(`ecartees.${i}`, e);
    sens.push([`ecartees.${i}.sens`, e.sens]);
    e.selon?.forEach((s, k) => auteur(`ecartees.${i}.selon.${k}`, s));
  });

  // Les sens sont affichés entre guillemets par l'app.
  for (const [champ, texte] of sens) {
    if (texte !== undefined && /[«»"“”]/.test(texte)) ajouter(champ, "sans guillemets : l'app les ajoute à l'affichage");
  }
  verifierTextes(
    [
      ...sens,
      ["explication", fiche.explication],
      ...fiche.ecartees.map((e, i): [string, string | undefined] => [`ecartees.${i}.raison`, e.raison]),
      ...fiche.historique.map((h, i): [string, string] => [`historique.${i}.note`, h.note]),
      ...fiche.tradition.lectures.map((l, i): [string, string] => [`tradition.lectures.${i}.texte`, l.texte]),
    ],
    ajouter,
  );

  verifierSources(fiche, ref, ajouter);

  // Mentions : une forme de nom ou de titre qui, dans cette fiche, désignerait deux pages. On lit
  // les textes comme l'app : « Thomas More » est reconnu en entier avant « Thomas ».
  const mentions = mentionsDe(fiche, ref.auteurs, ref.ouvrages);
  const ambigues = new Set(formesAmbigues(mentions));
  const lues = analyser(textesDe(fiche), undefined, undefined, [], mentions).filter((s) => s.type === "mention" && ambigues.has(s.texte));
  for (const forme of new Set(lues.map((s) => s.texte))) {
    ajouter("(textes)", `« ${forme} » désigne plusieurs auteurs ou ouvrages cités par la fiche : écrire le nom complet`);
  }

  // Lectures : une voix de la tradition, déduite de l'œuvre (auteur écrit seulement si la parole
  // rapportée n'est pas celle de l'auteur de l'œuvre), une seule voix par lecture, une tradition
  // précisée seulement si la voix en a plusieurs (sauf l'Écriture reçue en commun), une hypothèse
  // de la chaîne ; pour un mot sacré, des traditions où il l'est.
  const hypotheses = new Set(fiche.etymologie.flatMap((m) => (m.alternatives?.formes ?? []).map((a) => a.forme).filter(Boolean)));
  fiche.tradition.lectures.forEach((l, i) => {
    const c = `tradition.lectures.${i}`;
    const oeuvres = l.sources.map((s) => ref.ouvrages.get(s.ouvrage));
    l.sources.forEach((s, j) => {
      if (!oeuvres[j]) ajouter(`${c}.sources.${j}.ouvrage`, `ouvrage « ${s.ouvrage} » sans fiche (data/ouvrages)`);
    });
    if (oeuvres.some((o) => !o)) return;
    const auteursDesOeuvres = new Set(oeuvres.map((o) => o!.auteur));
    if (l.auteur === undefined && auteursDesOeuvres.size > 1) {
      return ajouter(`${c}.sources`, "une lecture a une seule voix : des œuvres d'auteurs différents font deux lectures");
    }
    if (l.auteur !== undefined && auteursDesOeuvres.has(l.auteur)) {
      ajouter(`${c}.auteur`, "se déduit de l'œuvre : ne l'écrire que pour une parole rapportée par une autre voix");
    }
    const voixAuteur = l.auteur ?? oeuvres[0]!.auteur;
    const auteur = voixAuteur !== undefined ? ref.auteurs.get(voixAuteur) : undefined;
    if (voixAuteur !== undefined && !auteur) return ajouter(`${c}.auteur`, `auteur « ${voixAuteur} » sans fiche (data/auteurs)`);
    const nomVoix = auteur?.nom ?? oeuvres[0]!.titre;
    const siennes = (auteur ? auteur.traditions : oeuvres[0]!.traditions) ?? [];
    if (siennes.length === 0) return ajouter(`${c}.auteur`, `${nomVoix} n'est pas une voix de la tradition (traditions)`);
    // Une parole rapportée dans une œuvre sans auteur (Resh Lakish dans le Talmud) est de la tradition de l'œuvre.
    const recueil = l.auteur !== undefined && oeuvres[0]!.auteur === undefined ? oeuvres[0]!.traditions : undefined;
    if (recueil && !siennes.some((t) => recueil.includes(t))) {
      ajouter(`${c}.auteur`, `${nomVoix} ne parle pas dans la tradition de « ${oeuvres[0]!.titre} » (${recueil.join(", ")})`);
    }
    if (l.tradition === undefined && siennes.length > 1 && auteur) {
      ajouter(`${c}.tradition`, `${nomVoix} parle dans plusieurs traditions : préciser laquelle (${siennes.join(", ")})`);
    } else if (l.tradition !== undefined && siennes.length === 1) {
      ajouter(`${c}.tradition`, `se déduit de la voix (${siennes[0]}) : ne pas l'écrire`);
    } else if (l.tradition !== undefined && !siennes.includes(l.tradition)) {
      ajouter(`${c}.tradition`, `${nomVoix} ne parle pas dans la tradition ${l.tradition}`);
    }
    const traditions = l.tradition !== undefined ? [l.tradition] : siennes;
    if (fiche.sacre !== undefined) {
      // Le texte d'origine est reçu par toutes les traditions où le mot est sacré ; une autre lecture parle dans l'une d'elles.
      if (l.premier && !fiche.sacre.every((t) => traditions.includes(t))) {
        ajouter(`${c}.premier`, `le texte d'origine doit être reçu par toutes les traditions du mot (${fiche.sacre.join(", ")})`);
      } else if (!l.premier && !traditions.some((t) => fiche.sacre!.includes(t))) {
        ajouter(`${c}`, `lecture hors des traditions où le mot est sacré (${fiche.sacre.join(", ")})`);
      }
    }
    if (l.hypothese !== undefined && !hypotheses.has(l.hypothese)) {
      ajouter(`${c}.hypothese`, `« ${l.hypothese} » n'est pas une hypothèse de la chaîne (alternatives)`);
    }
  });

  return erreurs;
}

/**
 * Règles entre fiches : un doublet vise une fiche existante ; un renvoi, une fiche ou un candidat
 * à faire (l'app ne l'affiche qu'une fois la fiche écrite). Une relation symétrique (doublet,
 * renvoi) n'est déclarée que sur l'une des deux fiches : l'app l'affiche dans les deux sens.
 */
function verifierRelations(
  champ: "doublets" | "renvois" | "tradition.renvois",
  fiches: FicheIdentifiee[],
  idsPresents: Set<string>,
  fichierDe: Map<string, string>,
  attendus: Set<string> = new Set(),
): Erreur[] {
  const erreurs: Erreur[] = [];
  const cibles = (f: FicheIdentifiee) => (champ === "tradition.renvois" ? f.tradition.renvois : f[champ]);
  const parId = new Map(fiches.map((f) => [f.id, f]));
  for (const fiche of fiches) {
    for (const cible of cibles(fiche)) {
      const fichier = fichierDe.get(fiche.id)!;
      if (!idsPresents.has(cible)) {
        if (!attendus.has(cible)) erreurs.push({ fichier, champ, regle: `fiche « ${cible} » introuvable${champ === "doublets" ? "" : ", ni candidat à faire"}` });
      } else if (champ !== "tradition.renvois" && fiche.id > cible && cibles(parId.get(cible)!).includes(fiche.id)) {
        erreurs.push({
          fichier,
          champ,
          regle: `relation déjà déclarée dans « ${cible} » : ne la déclarer que sur une des deux fiches`,
        });
      }
    }
  }
  return erreurs;
}

/**
 * Valide un ensemble de fiches de mots, chemins relatifs au dossier des fiches (ex. `e/et/etonner.yaml`),
 * avec les auteurs et ouvrages qu'elles citent et les identifiants des candidats à faire (`attendus`,
 * cibles possibles d'un renvoi). `fiches` contient les fiches structurellement
 * conformes ; le lot n'est utilisable que si `erreurs` est vide.
 */
export function validerFiches(
  sources: FichierSource[],
  ref: Referentiel,
  attendus: Set<string> = new Set(),
): { fiches: FicheIdentifiee[]; erreurs: Erreur[] } {
  const erreurs: Erreur[] = [];
  const fiches: FicheIdentifiee[] = [];
  const idsPresents = new Set<string>();
  const fichierDe = new Map<string, string>();

  for (const source of sources) {
    const { fichier } = source;
    const id = /([^/]+)\.yaml$/.exec(fichier)?.[1];
    if (id !== undefined) {
      if (idsPresents.has(id)) {
        erreurs.push({ fichier, champ: "id", regle: `id « ${id} » en double` });
        continue;
      }
      idsPresents.add(id);
      fichierDe.set(id, fichier);
      if (ID_VALIDE.test(id) && fichier !== cheminFiche(id)) {
        erreurs.push({ fichier, champ: "(emplacement)", regle: `la fiche doit être rangée dans « ${cheminFiche(id)} »` });
      }
    }
    const lu = lireEtValider(source, schemaFiche);
    erreurs.push(...lu.erreurs);
    if (!("id" in lu)) continue;
    erreurs.push(...verifierFiche(fichier, lu.id, lu.valeur, ref));
    fiches.push({ id: lu.id, ...lu.valeur });
  }

  erreurs.push(...verifierRelations("doublets", fiches, idsPresents, fichierDe));
  erreurs.push(...verifierRelations("renvois", fiches, idsPresents, fichierDe, attendus));
  erreurs.push(...verifierRelations("tradition.renvois", fiches, idsPresents, fichierDe, attendus));
  return { fiches, erreurs };
}

/**
 * Valide les listes de candidats, une par initiale (ex. `e.yaml`).
 * Un mot qui a déjà une fiche doit être retiré des candidats.
 */
export function validerCandidats(
  sources: FichierSource[],
  idsFiches: Set<string>,
): { candidats: Candidat[]; erreurs: Erreur[] } {
  const erreurs: Erreur[] = [];
  const candidats: Candidat[] = [];
  const fichierDe = new Map<string, string>();

  for (const { fichier, texte } of sources) {
    const lettre = /^([a-z])\.yaml$/.exec(fichier)?.[1];
    if (lettre === undefined) {
      erreurs.push({ fichier, champ: "(fichier)", regle: "nom attendu : une initiale ASCII minuscule, ex. « e.yaml »" });
      continue;
    }
    const lecture = lireYaml(fichier, texte);
    if ("erreurs" in lecture) {
      erreurs.push(...lecture.erreurs);
      continue;
    }
    const resultat = schemaCandidats.safeParse(lecture.valeur);
    if (!resultat.success) {
      erreurs.push(...erreursZod(fichier, resultat.error));
      continue;
    }
    resultat.data.forEach((candidat, i) => {
      const id = slug(candidat.mot);
      const ajouter = (regle: string) => erreurs.push({ fichier, champ: `${i}.mot`, regle });
      if (!id.startsWith(lettre)) ajouter(`« ${candidat.mot} » doit être rangé dans « ${id[0]}.yaml »`);
      if (idsFiches.has(id)) ajouter(`« ${candidat.mot} » a déjà une fiche : le retirer des candidats`);
      const autre = fichierDe.get(id);
      if (autre !== undefined) ajouter(`« ${candidat.mot} » figure déjà dans ${autre}`);
      fichierDe.set(id, fichier);
      candidats.push(candidat);
    });
  }
  return { candidats, erreurs };
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

/** Référentiel (auteurs, ouvrages par identifiant) à partir des fiches validées. */
export function referentiel(auteurs: Auteur[], ouvrages: Ouvrage[]): Referentiel {
  return { auteurs: new Map(auteurs.map((a) => [a.id, a])), ouvrages: new Map(ouvrages.map((o) => [o.id, o])) };
}

/** Sources des auteurs et des ouvrages aussi : même règle que pour les mots. */
export function verifierSourcesDesReferences(ref: Referentiel, fichierAuteur: (id: string) => string, fichierOuvrage: (id: string) => string): Erreur[] {
  const erreurs: Erreur[] = [];
  for (const a of ref.auteurs.values()) verifierSources(a, ref, (champ, regle) => erreurs.push({ fichier: fichierAuteur(a.id), champ, regle }));
  for (const o of ref.ouvrages.values()) verifierSources(o, ref, (champ, regle) => erreurs.push({ fichier: fichierOuvrage(o.id), champ, regle }));
  return erreurs;
}
