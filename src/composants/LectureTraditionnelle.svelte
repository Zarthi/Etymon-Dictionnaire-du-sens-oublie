<script lang="ts">
  import type { LectureTraditionnelle } from "../lib/types.ts";
  import Source from "./Source.svelte";

  let { lecture }: { lecture: LectureTraditionnelle } = $props();
</script>

<aside>
  <h2>Lecture traditionnelle</h2>
  <p>{lecture.texte}</p>
  <p class="auteur">{lecture.auteur}</p>
  <p class="sources">
    Sources&nbsp;:
    {#each lecture.sources as source, i (i)}{#if i > 0}&nbsp;;{/if} <Source {source} avecPassage />{/each}
  </p>
</aside>

<style>
  aside {
    margin-top: 1.75rem;
    padding: 0.9rem 1rem;
    border-left: 3px solid var(--tradition);
    background: var(--surface);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  h2 {
    margin: 0 0 0.4rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tradition);
  }
  p {
    margin: 0;
  }
  .auteur {
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: var(--texte-discret);
  }
  .sources {
    margin-top: 0.3rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--texte-discret);
  }
</style>
