<script lang="ts">
  import { enAlphabetLatin, translitterationDe } from "../lib/etymologie.ts";

  /**
   * Une forme étrangère. En alphabet latin, en italique : religio. Sinon, l'écriture d'origine,
   * puis la translittération entre parenthèses : φρήν (phrēn). `lien` : page de l'auteur ou de
   * l'ouvrage dont la forme est le nom ou le titre.
   */
  let { forme, translitteration, lien }: { forme: string; translitteration?: string; lien?: string } = $props();

  const latin = $derived(enAlphabetLatin(forme));
  const translit = $derived(translitterationDe({ forme, translitteration }));
</script>

{#snippet contenu()}{#if latin}<em>{forme}</em>{:else}<span class="graphie">{forme}</span>{#if translit}{" "}<span
        class="translitteration"
        title="Translittération">(<em>{translit}</em>)</span
      >{/if}{/if}{/snippet}

{#if lien}<a href={lien}>{@render contenu()}</a>{:else}{@render contenu()}{/if}

<style>
  .translitteration {
    color: var(--texte-discret);
    font-size: 0.9em;
  }
  a {
    color: inherit;
  }
</style>
