<script lang="ts">
  import { lienMot } from "../lib/liens.ts";
  import type { MotCite } from "../lib/types.ts";

  /** Une section de page d'auteur ou d'ouvrage : un intitulé et des mots, rien si la liste est vide. */
  let { titre, mots }: { titre: string; mots: MotCite[] } = $props();
</script>

{#if mots.length > 0}
  <section>
    <h2>{titre}</h2>
    <p>{#each mots as m, i (m.id)}{#if i > 0},{" "}{/if}<a href={lienMot(m.id)}>{m.mot}</a>{/each}</p>
  </section>
{/if}

<style>
  section {
    margin-top: 1.25rem;
  }
  h2 {
    margin: 0 0 0.3rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--texte-discret);
  }
  p {
    margin: 0;
  }
  a {
    color: inherit;
  }
</style>
