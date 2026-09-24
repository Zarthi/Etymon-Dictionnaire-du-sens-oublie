<script lang="ts">
  import { estRedaction } from "../lib/sources.ts";

  /**
   * Une source, lien si possible : « Littré », « IA (Claude Opus 5.5) ».
   * `oeuvre` : l'ouvrage est le titre d'une œuvre (lectures traditionnelles), en italique,
   * suivi du passage précis (« *Institutions divines*, IV, 28, 3 »).
   */
  let {
    source,
    oeuvre = false,
  }: { source: { ouvrage: string; entree: string; page?: number | string; url?: string }; oeuvre?: boolean } =
    $props();

  const redaction = $derived(estRedaction(source));
  const complement = $derived(
    [oeuvre ? source.entree : "", source.page !== undefined ? `p. ${source.page}` : ""].filter(Boolean).join(", "),
  );
</script>

{#snippet libelle()}{#if redaction}{source.ouvrage} ({source.entree}){:else}{#if oeuvre}<cite>{source.ouvrage}</cite
      >{:else}{source.ouvrage}{/if}{#if complement}, {complement}{/if}{/if}{/snippet}

{#if source.url && !redaction}<a href={source.url} target="_blank" rel="noopener noreferrer" title="Entrée consultée : {source.entree}"
    >{@render libelle()}</a
  >{:else}<span title={redaction ? undefined : `Entrée consultée : ${source.entree}`}>{@render libelle()}</span>{/if}

<style>
  a {
    color: inherit;
  }
</style>
