<script lang="ts">
  import { dateLongue } from "../lib/affichage.ts";
  import { formesItaliques } from "../lib/etymologie.ts";
  import { auteurs as fichesAuteurs, ouvrages as fichesOuvrages } from "../lib/fiches.ts";
  import { mentionsDe } from "../lib/mentions.ts";
  import { nommerTraditions, parTradition } from "../lib/traditions.ts";
  import { lienAuteur } from "../lib/liens.ts";
  import { signatureRedaction } from "../lib/sources.ts";
  import type { FicheIdentifiee } from "../lib/types.ts";
  import Etymologie from "./Etymologie.svelte";
  import Forme from "./Forme.svelte";
  import LectureTraditionnelle from "./LectureTraditionnelle.svelte";
  import Redaction from "./Redaction.svelte";
  import SensPremier from "./SensPremier.svelte";
  import Sources from "./Sources.svelte";
  import Statut from "./Statut.svelte";
  import TexteRiche from "./TexteRiche.svelte";

  let {
    fiche,
    deplierLectures,
    lienVers,
    motDe,
  }: {
    fiche: FicheIdentifiee;
    deplierLectures: boolean;
    lienVers: (id: string) => string | undefined;
    motDe: (id: string) => string;
  } = $props();

  const correction = $derived(fiche.historique.at(-1));
  /** Mot sacré : la lecture du texte d'origine donne le sens en tête et tient lieu d'explication. */
  const origine = $derived(fiche.tradition.lectures.find((l) => l.premier));
  const lectures = $derived(fiche.tradition.lectures.filter((l) => !l.premier));
  /** Mots où la tradition parle de celui-ci (l'assemblage ne garde que ceux qui ont des lectures). */
  const ailleurs = $derived(fiche.tradition.renvois);
  /** Lectures regroupées par tradition, jamais mêlées ; l'intitulé replié nomme les traditions : « juive, chrétienne ». */
  const groupes = $derived(parTradition(lectures, fichesAuteurs, fichesOuvrages));
  /** Rédaction de la fiche, affichée une fois en pied ; une lecture ne la rappelle que si la sienne diffère. */
  const redactionFiche = $derived(signatureRedaction(fiche.redaction));
  /** Formes étrangères de la fiche, mises en italique dans ses textes (aucune mise en forme dans les données). */
  const formes = $derived(formesItaliques(fiche));
  /** Auteurs et ouvrages que la fiche cite, reconnus dans ses textes pour en faire des liens. */
  const mentions = $derived(mentionsDe(fiche, fichesAuteurs, fichesOuvrages));
</script>

<svelte:head>
  <title>{fiche.mot} · Étymon</title>
</svelte:head>

<article>
  <Statut statut={fiche.statut} />

  <h1>{fiche.mot}</h1>
  <p class="nature">
    {fiche.nature.join(" et ")}{#if fiche.sacre}{" "}<span class="sacre">· mot sacré, tradition {nommerTraditions(fiche.sacre)}</span>{/if}
  </p>
  <p class="etymon">
    {#if origine}
      <!-- Mot sacré : le sens que lui donne le texte d'origine, signé ; aucune lecture profane. -->
      <span class="sens">«&nbsp;{origine.sens}&nbsp;»</span>
      <span class="signature">{origine.sources.map((s) => s.entree).join(" ; ")}</span>
    {:else}
      <SensPremier etymologie={fiche.etymologie} />
    {/if}
    {#if fiche.incertain}<span class="incertain">· étymologie incertaine</span>{/if}
  </p>

  <Etymologie etymologie={fiche.etymologie} />

  {#if origine}
    <div class="origine">
      <LectureTraditionnelle lecture={origine} {lienVers} exclu={fiche.id} {redactionFiche} {formes} {mentions} />
    </div>
  {:else if fiche.explication}
    <p class="explication"><TexteRiche texte={fiche.explication} {lienVers} exclu={fiche.id} {formes} {mentions} /></p>
  {/if}

  {#each fiche.ecartees as e, i (i)}
    <!-- Idée reçue (populaire) ou hypothèse savante abandonnée : présentée, jamais confondue avec l'étymologie. -->
    <p class="legende">
      <strong>{e.populaire ? "Idée reçue" : "Étymologie écartée"}</strong>&nbsp;: <Forme
        forme={e.forme}
        translitteration={e.translitteration}
      />, «&nbsp;{e.sens}&nbsp;»{#if e.selon?.length}{" "}({#each e.selon as id, j (id)}{#if j > 0},{" "}{/if}<a
            href={lienAuteur(id)}>{fichesAuteurs.get(id)?.nom ?? id}</a
          >{/each}){/if}.
      {#if e.raison}<TexteRiche texte={e.raison} {lienVers} exclu={fiche.id} {formes} {mentions} />{/if}
    </p>
  {/each}

  {#if fiche.renvois.length > 0}
    <!-- Notions voisines, sans racine commune : « Voir aussi : obsession ». -->
    <p class="renvois">
      <strong>Voir aussi</strong>&nbsp;: {#each fiche.renvois as id, i (id)}{#if i > 0},{" "}{/if}<a href={lienVers(id)}
          >{motDe(id)}</a
        >{/each}.
    </p>
  {/if}

  <Sources sources={fiche.sources} />

  {#snippet voir()}voir {#each ailleurs as id, i (id)}{#if i > 0},{" "}{/if}<a href={lienVers(id)}>{motDe(id)}</a>{/each}{/snippet}

  {#if lectures.length > 0}
    <!-- Toujours signalées, repliées par défaut (l'étymologie d'abord, la tradition à côté) ; dépliées pour un mot sacré, dont elles sont la substance. -->
    <details class="traditions" open={deplierLectures || fiche.sacre !== undefined}>
      <summary>
        <span class="intitule">{lectures.length > 1 ? "Lectures traditionnelles" : "Lecture traditionnelle"}</span>
        <span class="precision">{groupes.map((g) => nommerTraditions(g.traditions)).join(", ")}</span>
      </summary>
      {#each groupes as groupe (groupe.traditions.join())}
        {#if groupes.length > 1}<h2 class="tradition">
            {groupe.traditions.length > 1 ? "Traditions" : "Tradition"}
            {nommerTraditions(groupe.traditions)}
          </h2>{/if}
        {#each groupe.lectures as lecture, i (i)}
          <LectureTraditionnelle {lecture} {lienVers} exclu={fiche.id} {redactionFiche} {formes} {mentions} />
        {/each}
      {/each}
      {#if ailleurs.length > 0}<p class="ailleurs">{@render voir()}</p>{/if}
    </details>
  {:else if ailleurs.length > 0}
    <!-- Mot que la tradition n'a pas lu : la même rubrique, qui mène là où elle parle, sans rien lui prêter. -->
    <p class="traditions ligne">
      <span class="intitule">Lectures traditionnelles</span>
      <span class="precision">{@render voir()}</span>
    </p>
  {/if}

  <footer>
    <Redaction redaction={fiche.redaction} />
    {#if correction}
      <p>Corrigée le {dateLongue(correction.date)}.</p>
    {/if}
    <button type="button" disabled title="En construction">
      Critique&nbsp;: signaler une erreur <small>(en construction)</small>
    </button>
  </footer>
</article>

<style>
  article {
    font-family: var(--police-fiche);
  }
  .nature {
    margin: 0.2rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-style: italic;
    color: var(--texte-discret);
  }
  .renvois {
    margin: 1rem 0 0;
    color: var(--texte-discret);
  }
  .renvois strong {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-weight: 600;
  }
  .renvois a {
    color: inherit;
  }
  .legende {
    margin: 1rem 0 0;
    padding-left: 0.7rem;
    border-left: 2px solid var(--bordure);
    color: var(--texte-discret);
  }
  .legende a {
    color: inherit;
  }
  .legende strong {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-weight: 600;
  }
  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 8vw, 3rem);
    font-weight: normal;
    line-height: 1.1;
  }
  .etymon {
    margin: 0.5rem 0 0;
    font-size: 1.25rem;
  }

  .explication {
    margin: 1.25rem 0 0;
    font-size: 1.15rem;
    line-height: 1.6;
  }
  .traditions {
    margin-top: 1.75rem;
    padding: 0.9rem 1rem;
    border-left: 3px solid var(--tradition);
    background: var(--surface);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  summary {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.2rem 0.6rem;
    cursor: pointer;
    list-style: none;
    font-family: var(--police-interface);
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary::after {
    content: "▸";
    margin-left: auto;
    color: var(--tradition);
    transition: transform 0.15s;
  }
  .traditions[open] summary {
    margin-bottom: 0.6rem;
  }
  .traditions[open] summary::after {
    transform: rotate(90deg);
  }
  .intitule {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tradition);
  }
  .precision {
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  .tradition {
    margin: 1.2rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--tradition);
  }
  .ligne {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.2rem 0.6rem;
    margin-bottom: 0;
    font-family: var(--police-interface);
  }
  .ailleurs {
    margin: 1rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  .traditions a {
    color: inherit;
  }
  .sacre {
    color: var(--tradition);
  }
  .sens {
    color: var(--accent);
  }
  .signature {
    margin-left: 0.4rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--texte-discret);
  }
  .origine {
    margin-top: 1.25rem;
    font-size: 1.05rem;
  }
  .incertain {
    font-family: var(--police-interface);
    font-size: 0.8rem;
    font-style: italic;
    color: var(--texte-discret);
    white-space: nowrap;
  }
  footer {
    margin-top: 2rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bordure);
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  footer p {
    margin: 0 0 0.5rem;
  }
  button {
    margin-top: 0.25rem;
    font: inherit;
    padding: 0.35rem 0.7rem;
    color: var(--texte-discret);
    background: none;
    border: 1px dashed var(--bordure);
    border-radius: 0.4rem;
    cursor: not-allowed;
  }
</style>
