<script lang="ts">
  import { SOURCES_DE_REDACTION } from "../lib/sources.ts";
  import Source from "./Source.svelte";

  /** Sources d'une partie de fiche : les ouvrages consultés, puis, à part, qui a rédigé. */
  let { sources }: { sources: { ouvrage: string; entree: string; page?: number | string; url?: string }[] } = $props();

  const oeuvres = $derived(sources.filter((s) => !SOURCES_DE_REDACTION.includes(s.ouvrage)));
  const redaction = $derived(sources.filter((s) => SOURCES_DE_REDACTION.includes(s.ouvrage)));
</script>

<div class="sources">
  {#if oeuvres.length > 0}
    <p>Sources&nbsp;: {#each oeuvres as source, i (i)}{#if i > 0},{/if} <Source {source} />{/each}</p>
  {/if}
  {#if redaction.length > 0}
    <p class="redaction">Rédaction&nbsp;: {#each redaction as source, i (i)}{#if i > 0},{/if} <Source {source} />{/each}</p>
  {/if}
</div>

<style>
  .sources {
    margin-top: 1rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--texte-discret);
  }
  p {
    margin: 0;
  }
  .redaction {
    margin-top: 0.15rem;
    font-size: 0.75rem;
  }
</style>
