import type { Grammaire, Libelles } from "./types.ts";

/**
 * Le français, langue de l'application. C'est aussi la langue de référence : les autres langues
 * fournissent les mêmes messages (même forme, vérifiée par TypeScript).
 */

const NBSP = " ";
/** Voyelle ou h muet : élision (« de l'italien », « d'adolescere »). */
const ELISION = /^[aeiouyàâéèêh]/i;

export const grammaire: Grammaire = {
  code: "fr",
  locale: "fr-FR",
  origine: (langue) => (ELISION.test(langue) ? `de l'${langue}` : `du ${langue}`),
  de: (forme) => (ELISION.test(forme.replace(/^\*/, "")) ? "d'" : "de "),
  sur: (langue) => (ELISION.test(langue) ? `sur l'${langue}` : `sur le ${langue}`),
  dateLongue: (dateIso) =>
    new Date(`${dateIso}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
  guillemets: [`«${NBSP}`, `${NBSP}»`],
  citer: (texte) => `«${NBSP}${texte}${NBSP}»`,
  deuxPoints: `${NBSP}:`,
  pointVirgule: `${NBSP};`,
  enumerer: (elements, liaison) =>
    elements.length <= 1 ? (elements[0] ?? "") : `${elements.slice(0, -1).join(", ")} ${liaison} ${elements.at(-1)}`,
  majuscule: (texte) => texte.charAt(0).toUpperCase() + texte.slice(1),
};

/** En français, les identifiants des listes fermées sont déjà leurs libellés. */
const memeNom = (id: string) => id;
export const libelles: Libelles = {
  langue: memeNom,
  theme: memeNom,
  nature: memeNom,
  tradition: memeNom,
  licence: memeNom,
  redacteur: memeNom,
  reflexion: memeNom,
};

const { deuxPoints } = grammaire;

export const messages = {
  titre: "Étymon",
  sousTitre: "Dictionnaire du sens oublié",
  titreDocument: "Étymon : Dictionnaire du sens oublié",
  titrePage: (nom: string) => `${nom} · Étymon`,
  description: "Étymon : le sens premier des mots français.",
  devise: "Le sens premier des mots français.",
  navigation: {
    historique: "Historique",
    precedente: "Page précédente",
    suivante: "Page suivante",
    auHasard: "Au hasard",
    parametres: "Paramètres",
    retour: "← Retour",
  },
  absent: {
    mot: "Ce mot n'a pas (encore) de fiche.",
    auteur: "Cet auteur n'a pas de fiche.",
    ouvrage: "Cet ouvrage n'a pas de fiche.",
    accueil: "Aucune fiche publiée pour l'instant.",
  },
  recherche: {
    invite: "Chercher un mot",
    propositions: "Propositions",
    aucun: "Aucun mot trouvé.",
  },
  motDuJour: "Mot du jour",
  statut: {
    /** « Étymologie non vérifiée », « Notice non vérifiée ». */
    nonVerifiee: (objet: "etymologie" | "notice") => `${objet === "etymologie" ? "Étymologie" : "Notice"} non vérifiée`,
    nonVerifieeDetail: "rédigée par IA, pas encore contrôlée sur les sources.",
    enRelecture: "En relecture",
    enRelectureDetail: "sources consultées, relecture en cours.",
  },
  chaine: {
    compose: "Composé ",
    plusHaut: `${NBSP}; plus haut, `,
    composeDe: ", composé ",
    forgePar: ", forgé par ",
    dans: ", dans ",
    calque: ", calque ",
    surLeModele: ", sur le modèle ",
    debattue: "Origine débattue",
    jeu: "Double sens voulu",
  },
  fiche: {
    motSacre: (traditions: string) => `· mot sacré, tradition ${traditions}`,
    incertaine: "· étymologie incertaine",
    ideeRecue: "Idée reçue",
    ecartee: "Étymologie écartée",
    voirAussi: "Voir aussi",
    voir: "voir ",
    lectures: (nombre: number) => (nombre > 1 ? "Lectures traditionnelles" : "Lecture traditionnelle"),
    tradition: (nombre: number) => (nombre > 1 ? "Traditions" : "Tradition"),
    corrigee: (date: string) => `Corrigée le ${date}.`,
    critique: `Critique${deuxPoints} signaler une erreur`,
    enConstruction: "En construction",
    enConstructionCourt: "(en construction)",
  },
  lecture: {
    sur: "Sur ",
  },
  sources: {
    titre: "Sources",
    entreeConsultee: (entree: string) => `Entrée consultée : ${entree}`,
    page: (page: string | number) => `p. ${page}`,
  },
  redaction: {
    titre: "Rédaction",
    reflexion: (niveau: string) => `réflexion ${niveau}`,
  },
  forme: {
    translitteration: "Translittération",
  },
  auteur: {
    oeuvres: "Œuvres citées",
    forges: "Mots forgés",
    issus: "Mots issus de son nom",
    hypotheses: "Étymologies proposées",
    lectures: "Lectures traditionnelles",
  },
  ouvrage: {
    edition: (edition: string) => `Édition consultée${deuxPoints} ${edition}.`,
    licence: (licence: string) => `Licence${deuxPoints} ${licence}.`,
    lire: "Lire le texte",
    lectures: "Mots éclairés",
    forges: "Mots forgés dans cet ouvrage",
    issus: "Mots issus de son titre",
  },
  parametres: {
    titre: "Paramètres",
    deplierLectures: "Déplier les lectures traditionnelles",
    deplierLecturesDetail:
      "Le sens donné au mot par une doctrine traditionnelle (Pères de l'Église, Talmud…), par ses propres textes, figure sous l'étymologie, replié par réserve. Cochée, cette option l'affiche toujours en entier. Toujours sourcé et séparé de l'étymologie.",
    contribuer: "Contribuer",
    merci: "Merci",
    merciDetail: "Soutenir le projet (en construction)",
    critique: "Critique",
    critiqueDetail: "Proposer un mot absent (en construction)",
    aPropos: "À propos",
    aProposSources: `Étymon donne le sens premier des mots français${deuxPoints} le plus ancien que les sources atteignent, d'après le Littré, le Gaffiot et le Bailly, vérifiés sur le Trésor de la langue française.`,
    aProposHistoire: {
      avant: "C'est l'histoire du mot, non sa vérité. ",
      nom: "Étymon",
      apres: ` vient du grec ἔτυμος, «${NBSP}vrai${NBSP}», et les Anciens cherchaient dans l'étymologie la force du mot plutôt que sa date. Ce qu'une tradition lit dans un mot, elle le dit par ses propres textes, cités sous «${NBSP}Lectures traditionnelles${NBSP}».`,
    },
    licence: `Fiches sous licence CC${NBSP}BY-SA${NBSP}4.0.`,
  },
};
