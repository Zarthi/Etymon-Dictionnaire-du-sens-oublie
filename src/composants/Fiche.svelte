<script lang="ts">
  import { dateLongue, origine } from "../lib/affichage.ts";
  import type { FicheIdentifiee } from "../lib/types.ts";
  import LectureTraditionnelle from "./LectureTraditionnelle.svelte";
  import Forme from "./Forme.svelte";
  import Sources from "./Sources.svelte";
  import TexteRiche from "./TexteRiche.svelte";

  let {
    fiche,
    deplierLectures,
    lienVers,
  }: { fiche: FicheIdentifiee; deplierLectures: boolean; lienVers: (id: string) => string | undefined } = $props();

  const correction = $derived(fiche.historique.at(-1));
  const lectures = $derived(fiche.lecturesTraditionnelles);
  /** Auteurs des lectures, sans doublon, pour l'intitulé replié : « Lactance, Augustin, Isidore de Séville ». */
  const auteurs = $derived([...new Set(lectures.map((l) => l.auteur))].join(", "));
</script>

<svelte:head>
  <title>{fiche.mot} · Étymon</title>
</svelte:head>

<article>
  {#if fiche.statut !== "validee"}
    <p class="statut {fiche.statut}">
      {#if fiche.statut === "a-verifier"}
        <strong>Étymologie non vérifiée</strong> · rédigée par IA, pas encore contrôlée sur les sources.
      {:else}
        <strong>En relecture</strong> · sources consultées, relecture en cours.
      {/if}
    </p>
  {/if}

  <h1>{fiche.mot}</h1>
  <p class="nature">{fiche.nature.join(" et ")}</p>
  <p class="etymon">
    {origine(fiche.langue)}
    <Forme forme={fiche.etymon} graphie={fiche.graphie} />&nbsp;: <span class="sens">«&nbsp;{fiche.sens}&nbsp;»</span>
  </p>

  <p class="explication"><TexteRiche texte={fiche.explication} {lienVers} exclu={fiche.id} /></p>

  {#if fiche.racine}
    <p class="racine">
      Plus haut, {origine(fiche.racine.langue)}
      <Forme forme={fiche.racine.forme} graphie={fiche.racine.graphie} />&nbsp;: «&nbsp;{fiche.racine.sens}&nbsp;».
    </p>
  {/if}

  {#if fiche.legende}
    <p class="legende"><strong>Idée reçue</strong>&nbsp;: <TexteRiche texte={fiche.legende} {lienVers} exclu={fiche.id} /></p>
  {/if}

  {#if fiche.incertain}
    <p class="note">Étymologie incertaine ou débattue.</p>
  {/if}

  <Sources sources={fiche.sources} />

  {#if lectures.length > 0}
    <!-- Toujours signalées, repliées par défaut : l'étymologie d'abord, la tradition à côté. -->
    <details class="traditions" open={deplierLectures}>
      <summary>
        <span class="intitule">{lectures.length > 1 ? "Lectures traditionnelles" : "Lecture traditionnelle"}</span>
        <span class="auteurs">{auteurs}</span>
      </summary>
      {#each lectures as lecture, i (i)}
        <LectureTraditionnelle {lecture} {lienVers} exclu={fiche.id} />
      {/each}
    </details>
  {/if}

  <footer>
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
  .statut {
    margin: 0 0 1rem;
    padding: 0.4rem 0.7rem;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
    border-left: 3px solid var(--brouillon);
    background: var(--surface);
    border-radius: 0 0.4rem 0.4rem 0;
  }
  .statut strong {
    color: var(--brouillon);
    font-weight: 600;
  }
  .statut.a-verifier {
    border-left-color: var(--non-verifie);
  }
  .statut.a-verifier strong {
    color: var(--non-verifie);
  }
  .nature {
    margin: 0.2rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-style: italic;
    color: var(--texte-discret);
  }
  .legende {
    margin: 1rem 0 0;
    padding-left: 0.7rem;
    border-left: 2px solid var(--bordure);
    color: var(--texte-discret);
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
    margin: 0.5rem 0 1.25rem;
    font-size: 1.25rem;
  }
  .sens {
    color: var(--accent);
  }
  .explication {
    margin: 0;
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
  .auteurs {
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  .racine,
  .note {
    margin: 1rem 0 0;
    color: var(--texte-discret);
  }
  .note {
    font-style: italic;
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
