<script lang="ts">
  import { grammaire as g, messages as m } from "../i18n/index.ts";
  import type { RacineAssemblee } from "../lib/types.ts";
  import Forme from "./Forme.svelte";
  import ListeMots from "./ListeMots.svelte";
  import Redaction from "./Redaction.svelte";
  import Sources from "./Sources.svelte";
  import Statut from "./Statut.svelte";

  /**
   * Page d'une racine grecque ou latine : entrée de plein droit du dictionnaire. La forme, teintée
   * selon sa langue, son sens, et les mots français qui en sont issus (calculés à l'assemblage).
   */
  let { racine }: { racine: RacineAssemblee } = $props();
</script>

<svelte:head>
  <title>{m.titrePage(racine.forme)}</title>
</svelte:head>

<article>
  <Statut statut={racine.statut} />
  <h1><Forme forme={racine.forme} translitteration={racine.translitteration} langue={racine.langue} /></h1>
  <p class="sens">{g.citer(racine.sens)}</p>

  <ListeMots titre={m.racine.mots} mots={racine.mots} />

  <footer>
    <Sources sources={racine.sources} />
    <Redaction redaction={racine.redaction} />
  </footer>
</article>

<style>
  article {
    font-family: var(--police-fiche);
  }
  h1 {
    margin: 0;
    font-size: clamp(2rem, 7vw, 2.6rem);
    font-weight: normal;
    line-height: 1.1;
  }
  .sens {
    margin: 0.5rem 0 0;
    font-size: 1.25rem;
  }
  footer {
    margin-top: 2rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bordure);
  }
</style>
