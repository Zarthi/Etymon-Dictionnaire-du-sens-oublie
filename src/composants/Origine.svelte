<script lang="ts">
  import { de, origine as complementDe } from "../lib/affichage.ts";
  import type { Hypothese } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  /**
   * D'où vient l'étymon. Une hypothèse sûre : « Plus haut : de l'arabe صفر (ṣifr), « vide ». »
   * Plusieurs, débattues : « Origine débattue : de relegere… (Cicéron), ou de religare… (Lactance). »
   * La langue n'est rappelée que si elle diffère de celle de l'étymon (`langueEtymon`).
   */
  let {
    origine,
    langueEtymon,
  }: { origine: { debattue?: boolean; hypotheses: Hypothese[] }; langueEtymon: string } = $props();

  const dernier = $derived(origine.hypotheses.length - 1);
  /** « de A, de B ou de C » pour des hypothèses concurrentes ; « de A ; de B » pour une filiation. */
  const separateur = (i: number) => (!origine.debattue ? " ; " : i === dernier ? " ou " : ", ");
</script>

<p class="origine">
  <strong>{origine.debattue ? "Origine débattue" : "Plus haut"}</strong>&nbsp;:
  {#each origine.hypotheses as h, i (i)}{#if i > 0}{separateur(i)}{/if}{h.langue === langueEtymon
      ? de(h.forme)
      : `${complementDe(h.langue)} `}<Forme forme={h.forme} graphie={h.graphie} />, «&nbsp;{h.sens}&nbsp;»{#if h.selon?.length}{" "}<span
        class="selon">({h.selon.join(", ")})</span
      >{/if}{/each}.
</p>

<style>
  .origine {
    margin: 1rem 0 0;
    color: var(--texte-discret);
  }
  strong {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-weight: 600;
  }
  .selon {
    font-family: var(--police-interface);
    font-size: 0.8rem;
  }
</style>
