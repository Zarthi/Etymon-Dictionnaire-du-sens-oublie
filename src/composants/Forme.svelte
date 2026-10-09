<script lang="ts">
  import { messages as m } from "../i18n/index.ts";
  import { enAlphabetLatin, teinte as teinteDe, translitterationDe } from "../lib/etymologie.ts";

  /**
   * Une forme étrangère. En alphabet latin, en italique : religio. Sinon, l'écriture d'origine,
   * puis la translittération entre parenthèses : φρήν (phrēn). `langue` teinte la forme selon sa
   * langue source (latin, grec). `lien` : page de l'auteur ou de l'ouvrage dont la forme est le
   * nom ou le titre.
   */
  let { forme, translitteration, langue, lien }: { forme: string; translitteration?: string; langue?: string; lien?: string } = $props();

  const alphabetLatin = $derived(enAlphabetLatin(forme));
  const translit = $derived(translitterationDe({ forme, translitteration }));
  /** Teinte de la langue source : le latin ou le grec, rien pour une langue neutre. */
  const teinte = $derived(teinteDe(langue));
</script>

{#snippet contenu()}{#if alphabetLatin}<em class:latin={teinte === "latin"} class:grec={teinte === "grec"}>{forme}</em>{:else}<span
      class="graphie"
      class:latin={teinte === "latin"}
      class:grec={teinte === "grec"}>{forme}</span
    >{#if translit}{" "}<span class="translitteration" title={m.forme.translitteration}>(<em
          class:latin={teinte === "latin"}
          class:grec={teinte === "grec"}>{translit}</em
        >)</span
      >{/if}{/if}{/snippet}

{#if lien}<a href={lien}>{@render contenu()}</a>{:else}{@render contenu()}{/if}

<style>
  .translitteration {
    color: var(--texte-discret);
    font-size: 0.9em;
  }
  .latin {
    color: var(--latin);
  }
  .grec {
    color: var(--grec);
  }
  a {
    color: inherit;
  }
</style>
