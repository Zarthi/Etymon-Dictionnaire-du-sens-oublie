<script lang="ts">
  import { de, origine } from "../lib/affichage.ts";
  import { indexPremier, translitterationDe } from "../lib/etymologie.ts";
  import { lienAuteur, lienOuvrage } from "../lib/liens.ts";
  import type { Maillon } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  /**
   * Le sens premier, en tête de fiche : « du latin religio : « attention scrupuleuse » », ou,
   * pour une composition, « du grec ancien σχίζω (schizō), « fendre », et φρήν (phrēn), « diaphragme » ».
   */
  let { etymologie }: { etymologie: Maillon[] } = $props();

  const m = $derived(etymologie[indexPremier(etymologie)]);
  const elements = $derived(m.forme ? [] : (m.elements ?? []));
</script>

{origine(m.langue)}
{#if m.forme}<Forme
    forme={m.forme}
    translitteration={m.translitteration}
    lien={m.personne ? lienAuteur(m.personne) : m.ouvrage ? lienOuvrage(m.ouvrage) : undefined}
  />{#if m.sens}&nbsp;: <span class="sens">«&nbsp;{m.sens}&nbsp;»</span>{/if}{:else}{#each elements as e, i (i)}{#if i > 0}{i ===
      elements.length - 1
        ? ", et "
        : ", "}{/if}{#if e.langue && e.langue !== m.langue}{origine(e.langue)}{" "}{:else if i > 0}{de(
        translitterationDe(e) ?? e.forme,
      )}{/if}<Forme forme={e.forme} translitteration={e.translitteration} />, <span class="sens">«&nbsp;{e.sens}&nbsp;»</span
    >{/each}{/if}

<style>
  .sens {
    color: var(--accent);
  }
</style>
