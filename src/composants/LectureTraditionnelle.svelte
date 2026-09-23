<script lang="ts">
  import type { Fiche } from "../lib/types.ts";

  let { lecture }: { lecture: NonNullable<Fiche["lectureTraditionnelle"]> } = $props();
</script>

<aside>
  <h2>Lecture traditionnelle</h2>
  <p>{lecture.texte}</p>
  <p class="auteur">{lecture.auteur}, <cite>{lecture.source}</cite></p>
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
</style>
