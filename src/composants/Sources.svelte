<script lang="ts">
  import Source from "./Source.svelte";

  /** Ouvrages consultés pour l'étymologie : « Sources : Littré, Gaffiot, TLFi ». */
  let { sources }: { sources: { ouvrage: string; entree: string; page?: number | string; url?: string }[] } = $props();
</script>

{#if sources.length > 0}
  <p class="sources">Sources&nbsp;: {#each sources as source, i (i)}{#if i > 0},{/if} <Source {source} />{/each}</p>
{/if}

<style>
  .sources {
    margin: 1rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--texte-discret);
  }
</style>
