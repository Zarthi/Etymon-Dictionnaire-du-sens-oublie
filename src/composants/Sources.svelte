<script lang="ts">
  import { estRedaction } from "../lib/sources.ts";
  import Source from "./Source.svelte";

  /**
   * Sources d'une partie de fiche : les ouvrages consultés et/ou, à part, qui a rédigé.
   * `ouvrages` et `redaction` choisissent les lignes à afficher.
   */
  let {
    sources,
    ouvrages = true,
    redaction = true,
  }: {
    sources: { ouvrage: string; entree: string; page?: number | string; url?: string }[];
    ouvrages?: boolean;
    redaction?: boolean;
  } = $props();

  const listeOuvrages = $derived(ouvrages ? sources.filter((s) => !estRedaction(s)) : []);
  const listeRedaction = $derived(redaction ? sources.filter(estRedaction) : []);
</script>

{#if listeOuvrages.length > 0 || listeRedaction.length > 0}
  <div class="sources">
    {#if listeOuvrages.length > 0}
      <p>Sources&nbsp;: {#each listeOuvrages as source, i (i)}{#if i > 0},{/if} <Source {source} />{/each}</p>
    {/if}
    {#if listeRedaction.length > 0}
      <p class="redaction">
        Rédaction&nbsp;: {#each listeRedaction as source, i (i)}{#if i > 0},{/if} <Source {source} />{/each}
      </p>
    {/if}
  </div>
{/if}

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
