export const meta = {
  name: "etymon-lot",
  description: "Rédige un lot de fiches d'Étymon : dossier, rédaction, relecture critique, référentiel, écriture, lectures traditionnelles",
  whenToUse: 'Rédaction autonome d\'un lot de mots (docs/methode.md). args : { mots: ["étonner", …] }',
  phases: [
    { title: "Dossier", detail: "sources et tri, un agent par mot", model: "sonnet" },
    { title: "Rédaction", detail: "d'après le dossier", model: "fable" },
    { title: "Relecture", detail: "relecture critique, un retour au plus", model: "opus" },
    { title: "Écriture", detail: "auteurs et ouvrages (BnF), puis fiches écrites", model: "sonnet" },
    { title: "Lectures", detail: "lectures traditionnelles, texte source sous les yeux", model: "fable" },
  ],
};

/**
 * Workflow d'un lot (docs/methode.md, §6). Le script enchaîne les étapes et ne lit aucun fichier :
 * les agents lisent leur consigne (docs/consignes/), écrivent dans atelier/<id>/ et lancent les
 * scripts du projet. Chaque mot suit sa chaîne sans attendre les autres ; l'écriture seule attend
 * tout le lot, pour créer une seule fois les auteurs et ouvrages demandés.
 */
// <schemas> généré par npm run contrat (scripts/lib/atelier.ts) : ne pas modifier à la main
const SCHEMAS = {"dossier":{"type":"object","properties":{"mot":{"type":"string"},"id":{"type":"string","description":"Identifiant de la fiche (nom du dossier dans atelier/)."},"chemin":{"type":"string","enum":["ordinaire","forge","debattu","recent","sacre","consacre"],"description":"ordinaire : héritage ou emprunt ; forge : forgé par un auteur connu ; debattu : plusieurs hypothèses et leurs tenants ; recent : absent du Littré (après 1872) ; sacre : né dans l'ordre sacré (manne, sabbat) ; consacre : profane à l'origine, pris dans l'ordre sacré (église, ange)."},"drapeaux":{"default":[],"description":"tradition : une tradition a lu le mot lui-même (lectures à chercher) ; doute : doute sur le critère du §3.3 (la fiche est rédigée quand même) ; nom-propre : la chaîne passe par un nom de personne ou un titre.","type":"array","items":{"type":"string","enum":["tradition","doute","nom-propre"]}},"faits":{"type":"integer","minimum":-9007199254740991,"maximum":9007199254740991,"description":"Nombre de faits du dossier."},"manques":{"default":[],"type":"array","items":{"type":"string"}}},"required":["mot","id","chemin","drapeaux","faits","manques"],"additionalProperties":false},"redaction":{"type":"object","properties":{"mot":{"type":"string"},"id":{"type":"string"},"references":{"default":[],"description":"Auteurs et ouvrages cités par la fiche qui n'ont pas encore la leur (npm run rediger -- --essai les signale).","type":"array","items":{"type":"object","properties":{"type":{"type":"string","enum":["auteur","ouvrage"]},"id":{"type":"string","description":"Identifiant employé dans la fiche."},"indication":{"type":"string","description":"Nom et dates, ou titre et auteur : de quoi trouver la notice BnF."}},"required":["type","id","indication"],"additionalProperties":false}},"notes":{"default":[],"description":"Doutes, limites du modèle, pistes de lecture.","type":"array","items":{"type":"string"}}},"required":["mot","id","references","notes"],"additionalProperties":false},"verdict":{"type":"object","properties":{"decision":{"type":"string","enum":["accepte","a-reprendre"],"description":"a-reprendre : au moins une remarque qui oblige à changer la fiche."},"remarques":{"default":[],"type":"array","items":{"type":"object","properties":{"critere":{"type":"string","enum":["dossier","justesse","regle"],"description":"dossier : affirmation absente du dossier ; justesse : phrase qui ne répond pas à « que veux-tu dire exactement ? » ; regle : règle éditoriale que les scripts ne voient pas."},"champ":{"type":"string","minLength":1,"description":"Champ visé (explication, etymologie.1.sens…)."},"probleme":{"type":"string","minLength":1},"proposition":{"description":"Ce qu'il faudrait écrire, si tu le sais.","type":"string","minLength":1}},"required":["critere","champ","probleme"],"additionalProperties":false}}},"required":["decision","remarques"],"additionalProperties":false,"description":"Verdict de la relecture critique."},"ecriture":{"type":"object","properties":{"creees":{"default":[],"description":"Auteurs et ouvrages créés (identifiants).","type":"array","items":{"type":"string"}},"echecs":{"default":[],"description":"Références sans notice ou refusées.","type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"raison":{"type":"string"}},"required":["id","raison"],"additionalProperties":false}},"ecrites":{"default":[],"description":"Mots dont la fiche est écrite dans data/.","type":"array","items":{"type":"string"}},"nonEcrites":{"default":[],"type":"array","items":{"type":"object","properties":{"mot":{"type":"string"},"raison":{"type":"string"}},"required":["mot","raison"],"additionalProperties":false}}},"required":["creees","echecs","ecrites","nonEcrites"],"additionalProperties":false},"lectures":{"type":"object","properties":{"mot":{"type":"string"},"lectures":{"type":"integer","minimum":-9007199254740991,"maximum":9007199254740991,"description":"Lectures ajoutées à la fiche, citations vérifiées (npm run verifier:en-ligne)."},"notes":{"default":[],"description":"Pistes sans texte en ligne, passages introuvables.","type":"array","items":{"type":"string"}}},"required":["mot","lectures","notes"],"additionalProperties":false}}
// </schemas>

const MOTS = Array.isArray(args) ? args : (args?.mots ?? []);
if (MOTS.length === 0) throw new Error('args : { mots: ["étonner", …] }');
const REDACTEUR = "Claude Fable 5.1";
const REFERENTIEL = "Claude Sonnet 5";

const consigne = (etape) => `Lis docs/consignes/${etape}.md et suis-la.`;

function dossier(mot) {
  return agent(`${consigne("dossier")}\n\nMot : « ${mot} ».\nRends le résumé demandé : mot, id, chemin, drapeaux, nombre de faits, manques.`, {
    label: `dossier:${mot}`,
    phase: "Dossier",
    model: "sonnet",
    effort: "low",
    schema: SCHEMAS.dossier,
  });
}

function rediger(d, remarques) {
  const reprise = remarques
    ? `\n\nLa relecture critique demande de reprendre atelier/${d.id}/fiche.json :\n${remarques
        .map((r) => `- [${r.critere}] ${r.champ} : ${r.probleme}${r.proposition ? ` → ${r.proposition}` : ""}`)
        .join("\n")}\nCorrige ce qui est juste ; une remarque qui te semble fausse, dis pourquoi dans tes notes.`
    : "";
  return agent(
    `${consigne("redaction")}\n\nMot : « ${d.mot} ». Dossier : atelier/${d.id}/dossier.json. Écris atelier/${d.id}/fiche.json.${reprise}\nRends les références à créer et tes notes.`,
    { label: `${remarques ? "reprise" : "redaction"}:${d.mot}`, phase: "Rédaction", model: "fable", effort: "high", schema: SCHEMAS.redaction },
  );
}

function relire(d) {
  return agent(`${consigne("relecture")}\n\nMot : « ${d.mot} » : atelier/${d.id}/dossier.json et atelier/${d.id}/fiche.json.`, {
    label: `relecture:${d.mot}`,
    phase: "Relecture",
    model: "opus",
    effort: "high",
    schema: SCHEMAS.verdict,
  });
}

/** Chaîne d'un mot jusqu'au verdict : un seul retour à la rédaction ; au second refus, la fiche reste dans l'atelier. */
async function chaine(d) {
  if (!d) return null;
  if (d.chemin === "sacre") return { ...d, aPart: "mot sacré : se rédige à part, texte d'origine sous les yeux" };
  if (d.faits === 0) return { ...d, aPart: "dossier sans fait" };
  const premiere = await rediger(d);
  if (!premiere) return { ...d, aPart: "rédaction interrompue" };
  let verdict = await relire(d);
  let reprise = null;
  if (verdict?.decision === "a-reprendre") {
    reprise = await rediger(d, verdict.remarques);
    verdict = reprise ? await relire(d) : verdict;
  }
  const notes = [...d.manques, ...premiere.notes, ...(reprise?.notes ?? [])];
  const references = [...premiere.references, ...(reprise?.references ?? [])];
  if (verdict?.decision !== "accepte") return { ...d, notes, aPart: "refusée deux fois par la relecture critique", remarques: verdict?.remarques ?? [] };
  return { ...d, notes, references, reprise: reprise !== null };
}

phase("Dossier");
const traites = (await pipeline(MOTS, dossier, chaine)).filter(Boolean);
const acceptes = traites.filter((t) => !t.aPart);
log(`${acceptes.length}/${MOTS.length} fiche(s) acceptée(s) par la relecture critique`);

// Barrière : chaque auteur ou ouvrage demandé par le lot n'est créé qu'une fois.
const vues = new Set();
const references = acceptes
  .flatMap((t) => t.references)
  .filter((r) => {
    const cle = `${r.type}:${r.id}`;
    if (vues.has(cle)) return false;
    vues.add(cle);
    return true;
  });

phase("Écriture");
const ecriture = acceptes.length
  ? await agent(
      [
        references.length
          ? `${consigne("references")} Modèle, pour --modele : « ${REFERENTIEL} ».\n\nRéférences demandées :\n${references.map((r) => `- ${r.type} ${r.id} : ${r.indication}`).join("\n")}`
          : "Aucune référence à créer.",
        `Puis écris les fiches acceptées : npm run rediger -- ${acceptes.map((t) => `atelier/${t.id}/fiche.json`).join(" ")} --dossier --modele "${REDACTEUR}" --essai ; retire de la commande les fiches qui restent « à corriger » ou « à créer », relance-la sans --essai, puis npm run valider.`,
        "Rends les références créées, les échecs, les mots écrits et ceux qui ne l'ont pas été, avec la raison.",
      ].join("\n\n"),
      { label: "ecriture", phase: "Écriture", model: "sonnet", effort: "low", schema: SCHEMAS.ecriture },
    )
  : null;

const ecrites = new Set(ecriture?.ecrites ?? []);
const aLire = acceptes.filter((t) => ecrites.has(t.mot) && t.drapeaux.includes("tradition"));
const lectures = await pipeline(aLire, (t) =>
  agent(
    `${consigne("lectures")}\n\nMot : « ${t.mot} ». Fiche : data/fiches/${t.id[0]}/${t.id.slice(0, 2)}/${t.id}.yaml ; dossier : atelier/${t.id}/dossier.json.`,
    { label: `lectures:${t.mot}`, phase: "Lectures", model: "fable", effort: "high", schema: SCHEMAS.lectures },
  ),
);

return {
  ecrites: [...ecrites],
  reprises: acceptes.filter((t) => t.reprise).map((t) => t.mot),
  aPart: traites.filter((t) => t.aPart).map((t) => ({ mot: t.mot, raison: t.aPart, remarques: t.remarques })),
  nonEcrites: ecriture?.nonEcrites ?? [],
  references: { creees: ecriture?.creees ?? [], echecs: ecriture?.echecs ?? [] },
  lectures: lectures.filter(Boolean),
  notes: traites.filter((t) => t.notes?.length).map((t) => ({ mot: t.mot, notes: t.notes })),
  interrompus: MOTS.length - traites.length,
};
