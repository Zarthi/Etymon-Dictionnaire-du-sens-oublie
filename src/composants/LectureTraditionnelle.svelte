<script lang="ts">
  import { estRedaction, signatureRedaction } from "../lib/sources.ts";
  import type { LectureTraditionnelle } from "../lib/types.ts";
  import Source from "./Source.svelte";
  import Sources from "./Sources.svelte";
  import TexteRiche from "./TexteRiche.svelte";

  /**
   * Une lecture traditionnelle : le texte, puis la citation d'un seul tenant
   * (auteur, *œuvre*, passage). Sa rédaction n'est rappelée que si elle diffère de celle
   * de la fiche (`redactionFiche`), affichée une seule fois en pied de fiche.
   */
  let {
    lecture,
    lienVers,
    exclu,
    redactionFiche,
  }: {
    lecture: LectureTraditionnelle;
    lienVers: (id: string) => string | undefined;
    exclu?: string;
    redactionFiche: string;
  } = $props();

  const oeuvres = $derived(lecture.sources.filter((s) => !estRedaction(s)));
  const redactionPropre = $derived(signatureRedaction(lecture.sources) !== redactionFiche);
</script>

<div class="lecture">
  <p><TexteRiche texte={lecture.texte} {lienVers} {exclu} /></p>
  <p class="auteur">
    {lecture.auteur}{#each oeuvres as source, i (i)}{i > 0 ? " ;" : ","} <Source {source} oeuvre />{/each}
  </p>
  {#if redactionPropre}
    <Sources sources={lecture.sources} ouvrages={false} />
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
</style>
