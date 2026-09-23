<script lang="ts">
  import { dateLongue, origine } from "../lib/affichage.ts";
  import type { FicheIdentifiee } from "../lib/types.ts";
  import LectureTraditionnelle from "./LectureTraditionnelle.svelte";

  let { fiche, lectureTraditionnelle }: { fiche: FicheIdentifiee; lectureTraditionnelle: boolean } = $props();

  const correction = $derived(fiche.historique.at(-1));
</script>

<svelte:head>
  <title>{fiche.mot} · Étymon</title>
</svelte:head>

<article>
  {#if fiche.statut === "brouillon"}
    <p class="brouillon">Brouillon, non validé</p>
  {/if}

  <h1>{fiche.mot}</h1>
  <p class="etymon">
    {origine(fiche.langue)} <em>{fiche.etymon}</em>&nbsp;: <span class="sens">«&nbsp;{fiche.sens}&nbsp;»</span>
  </p>

  <p class="explication">{fiche.explication}</p>

  {#if fiche.racine}
    <p class="racine">
      Plus haut, {origine(fiche.racine.langue)} <em>{fiche.racine.forme}</em>&nbsp;: «&nbsp;{fiche.racine.sens}&nbsp;».
    </p>
  {/if}

  {#if fiche.incertain}
    <p class="note">Étymologie incertaine ou débattue.</p>
  {/if}

  {#if lectureTraditionnelle && fiche.lectureTraditionnelle}
    <LectureTraditionnelle lecture={fiche.lectureTraditionnelle} />
  {/if}

  <footer>
    <p>
      Sources&nbsp;:
      {#each fiche.sources as source, i (i)}{#if i > 0},{/if}
        {#if source.url}
          <a href={source.url} target="_blank" rel="noopener noreferrer" title="Entrée consultée : {source.entree}"
            >{source.ouvrage}</a
          >{:else}<span title="Entrée consultée : {source.entree}">{source.ouvrage}, p.&nbsp;{source.page}</span>{/if}
      {/each}
    </p>
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
  .brouillon {
    display: inline-block;
    margin: 0 0 0.75rem;
    padding: 0.1rem 0.5rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--brouillon);
    border: 1px solid currentColor;
    border-radius: 999px;
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
  footer a {
    color: inherit;
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
