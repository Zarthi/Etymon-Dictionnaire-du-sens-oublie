<script lang="ts">
  import { grammaire as g, messages as m } from "../i18n/index.ts";
  import { ouvrages } from "../lib/fiches.ts";
  import Source from "./Source.svelte";

  type SourceEtymologie = { ouvrage: string; entree: string; page?: number | string; url?: string };

  /**
   * Ouvrages consultés pour l'étymologie, chacun nommé une fois :
   * « Sources : TLFi, Bailly (σχίζω, φρήν) » ; plusieurs entrées d'un même ouvrage sont nommées par leur entrée.
   */
  let { sources }: { sources: SourceEtymologie[] } = $props();

  const nom = (id: string) => {
    const o = ouvrages.get(id);
    return o ? (o.abrege ?? o.titre) : id;
  };
  const groupes = $derived(
    sources.reduce<{ ouvrage: string; entrees: SourceEtymologie[] }[]>((acc, s) => {
      const groupe = acc.find((g) => g.ouvrage === s.ouvrage);
      if (groupe) groupe.entrees.push(s);
      else acc.push({ ouvrage: s.ouvrage, entrees: [s] });
      return acc;
    }, []),
  );
</script>

{#if sources.length > 0}
  <p class="sources">
    {m.sources.titre}{g.deuxPoints} {#each groupes as g, i (g.ouvrage)}{#if i > 0},{/if}
      {#if g.entrees.length === 1}<Source source={g.entrees[0]} />{:else}{nom(g.ouvrage)} ({#each g.entrees as s, j (j)}{#if j > 0},{" "}{/if}<Source
            source={s}
            parEntree
          />{/each}){/if}{/each}
  </p>
{/if}

<style>
  .sources {
    margin: 1rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--texte-discret);
  }
</style>
