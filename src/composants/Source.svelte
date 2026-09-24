<script lang="ts">
  /**
   * Un ouvrage consulté, lien si possible : « Littré ».
   * `oeuvre` : l'ouvrage est le titre d'une œuvre (lectures traditionnelles), en italique,
   * suivi du passage précis (« *Institutions divines*, IV, 28, 3 »).
   */
  let {
    source,
    oeuvre = false,
  }: { source: { ouvrage: string; entree: string; page?: number | string; url?: string }; oeuvre?: boolean } =
    $props();

  const complement = $derived(
    [oeuvre ? source.entree : "", source.page !== undefined ? `p. ${source.page}` : ""].filter(Boolean).join(", "),
  );
</script>

{#snippet libelle()}{#if oeuvre}<cite>{source.ouvrage}</cite>{:else}{source.ouvrage}{/if}{#if complement}, {complement}{/if}{/snippet}

{#if source.url}<a href={source.url} target="_blank" rel="noopener noreferrer" title="Entrée consultée : {source.entree}"
    >{@render libelle()}</a
  >{:else}<span title="Entrée consultée : {source.entree}">{@render libelle()}</span>{/if}

<style>
  a {
    color: inherit;
  }
</style>
