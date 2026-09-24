<script lang="ts">
  import { signatureRedaction } from "../lib/sources.ts";
  import type { LectureTraditionnelle } from "../lib/types.ts";
  import Redaction from "./Redaction.svelte";
  import Source from "./Source.svelte";
  import TexteRiche from "./TexteRiche.svelte";

  /**
   * Une lecture traditionnelle : le texte, le texte original de l'auteur s'il est donné,
   * puis la citation d'un seul tenant (auteur, *œuvre*, passage). Sa rédaction propre n'est
   * affichée que si elle diffère de celle de la fiche (`redactionFiche`, en pied de fiche).
   */
  let {
    lecture,
    lienVers,
    exclu,
    redactionFiche,
    formes,
  }: {
    lecture: LectureTraditionnelle;
    lienVers: (id: string) => string | undefined;
    exclu?: string;
    redactionFiche: string;
    formes: string[];
  } = $props();

  const redactionPropre = $derived(
    lecture.redaction && signatureRedaction(lecture.redaction) !== redactionFiche ? lecture.redaction : undefined,
  );
</script>

<div class="lecture">
  <p><TexteRiche texte={lecture.texte} {lienVers} {exclu} {formes} /></p>
  {#if lecture.citation}
    <blockquote lang="la">«&nbsp;{lecture.citation}&nbsp;»</blockquote>
  {/if}
  <p class="auteur">
    {lecture.auteur}{#each lecture.sources as source, i (i)}{i > 0 ? " ;" : ","} <Source {source} oeuvre />{/each}
  </p>
  {#if redactionPropre}
    <Redaction redaction={redactionPropre} />
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
  blockquote {
    margin: 0.5rem 0 0;
    font-style: italic;
    font-size: 0.95rem;
    color: var(--texte-discret);
  }
  .auteur {
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: var(--texte-discret);
  }
</style>
