<script lang="ts">
  import { SOURCES_DE_REDACTION } from "../lib/sources.ts";
  import type { LectureTraditionnelle } from "../lib/types.ts";
  import Source from "./Source.svelte";
  import TexteRiche from "./TexteRiche.svelte";

  let {
    lecture,
    lienVers,
    exclu,
  }: { lecture: LectureTraditionnelle; lienVers: (id: string) => string | undefined; exclu?: string } = $props();

  // La citation (auteur, œuvre, passage) d'un seul tenant ; la rédaction (IA…) à part, en discret.
  const oeuvres = $derived(lecture.sources.filter((s) => !SOURCES_DE_REDACTION.includes(s.ouvrage)));
  const redaction = $derived(lecture.sources.filter((s) => SOURCES_DE_REDACTION.includes(s.ouvrage)));
</script>

<div class="lecture">
  <p><TexteRiche texte={lecture.texte} {lienVers} {exclu} /></p>
  <p class="auteur">
    {lecture.auteur}{#each oeuvres as source, i (i)}{i > 0 ? " ;" : ","} <Source {source} avecPassage />{/each}
  </p>
  {#if redaction.length > 0}
    <p class="redaction">
      Rédaction&nbsp;: {#each redaction as source, i (i)}{#if i > 0},{/if} <Source {source} />{/each}
    </p>
  {/if}
</div>

<style>
  .lecture:not(:first-of-type) {
    margin-top: 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--bordure);
  }
  p {
    margin: 0;
  }
  .auteur {
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: var(--texte-discret);
  }
  .redaction {
    margin-top: 0.3rem;
    font-family: var(--police-interface);
    font-size: 0.75rem;
    color: var(--texte-discret);
  }
</style>
