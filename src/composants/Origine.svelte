<script lang="ts">
  import { de, origine as complementDe } from "../lib/affichage.ts";
  import type { Fiche } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  /**
   * D'où vient l'étymon, selon le mode :
   * - filiation : « Plus haut : de l'arabe صفر (ṣifr), « vide ». » ;
   * - composition : « Composé : du grec ancien σχίζω (schizô), « fendre », et de φρήν (phrên), « diaphragme ». » ;
   * - debattue : « Origine débattue : de relegere… (Cicéron), ou de religare… (Lactance). »
   * La langue n'est rappelée que si elle change (l'étymon ouvre la chaîne : `langueEtymon`).
   */
  let { origine, langueEtymon }: { origine: NonNullable<Fiche["origine"]>; langueEtymon: string } = $props();

  const INTITULES = { filiation: "Plus haut", composition: "Composé", debattue: "Origine débattue" };
  const formes = $derived(origine.formes);
  const dernier = $derived(formes.length - 1);
  function separateur(i: number): string {
    if (origine.mode === "filiation") return " ; ";
    if (i < dernier) return ", ";
    return origine.mode === "composition" ? ", et " : ", ou ";
  }
  /** Langue en vigueur avant la forme `i` : celle de la forme précédente, ou celle de l'étymon. */
  const languePrecedente = (i: number) => (i === 0 ? langueEtymon : formes[i - 1].langue);
</script>

<p class="origine">
  <strong>{INTITULES[origine.mode]}</strong>&nbsp;:
  {#each formes as f, i (i)}{#if i > 0}{separateur(i)}{/if}{f.langue === languePrecedente(i)
      ? de(f.forme)
      : `${complementDe(f.langue)} `}<Forme forme={f.forme} graphie={f.graphie} />, «&nbsp;{f.sens}&nbsp;»{#if f.selon?.length}{" "}<span
        class="selon">({f.selon.join(", ")})</span
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
