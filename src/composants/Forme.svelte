<script lang="ts">
  /**
   * Forme d'un étymon ou d'une racine. En alphabet non latin, l'écriture d'origine vient
   * d'abord, la translittération ensuite, entre parenthèses : ἀνάλυσις (análysis).
   */
  let { forme, graphie }: { forme: string; graphie?: string } = $props();
</script>

{#if graphie}<span class="graphie">{graphie}</span> <span class="translitteration" title="Translittération"
    >(<em>{forme}</em>)</span
  >{:else}<em>{forme}</em>{/if}

<style>
  .translitteration {
    color: var(--texte-discret);
    font-size: 0.9em;
  }
</style>
