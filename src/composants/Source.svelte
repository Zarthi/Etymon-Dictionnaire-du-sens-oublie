<script lang="ts">
  import { SOURCES_DE_REDACTION } from "../lib/sources.ts";

  /**
   * Une source, lien si possible : « Littré », « IA (Claude Opus 5.5) ».
   * `avecPassage` ajoute l'entrée consultée, utile quand elle est une référence précise
   * (« Institutions divines, IV, 28, 3 »).
   */
  let {
    source,
    avecPassage = false,
  }: { source: { ouvrage: string; entree: string; page?: number | string; url?: string }; avecPassage?: boolean } =
    $props();

  const redaction = $derived(SOURCES_DE_REDACTION.includes(source.ouvrage));
  const libelle = $derived(
    redaction
      ? `${source.ouvrage} (${source.entree})`
      : [source.ouvrage, avecPassage ? source.entree : "", source.page !== undefined ? `p. ${source.page}` : ""]
          .filter(Boolean)
          .join(", "),
  );
</script>

{#if source.url && !redaction}<a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    title="Entrée consultée : {source.entree}">{libelle}</a
  >{:else}<span title={redaction ? undefined : `Entrée consultée : ${source.entree}`}>{libelle}</span>{/if}

<style>
  a {
    color: inherit;
  }
</style>
