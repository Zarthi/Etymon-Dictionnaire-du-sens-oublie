<script lang="ts">
  import * as langue from "../i18n/index.ts";
  import { auteurs, ouvrages } from "../lib/fiches.ts";
  import { lienAuteur, lienOuvrage } from "../lib/liens.ts";
  import { hypotheses, phraseChaine, type Segment } from "../lib/phrase.ts";
  import type { Maillon } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  /**
   * La chaîne étymologique, sous le sens premier affiché en tête (SensPremier) : une phrase, puis les
   * alternatives, une par ligne. La phrase est composée par src/lib/phrase.ts, dans la langue de
   * l'application ; ce composant ne fait que l'afficher.
   */
  let { etymologie }: { etymologie: Maillon[] } = $props();

  const phrase = $derived(phraseChaine(etymologie, langue));
  const alternatives = $derived(etymologie.filter((m) => m.alternatives).map((m) => hypotheses(m, langue)));
  const nom = (id: string) => auteurs.get(id)?.nom ?? id;
  const titre = (id: string) => ouvrages.get(id)?.titre ?? id;
</script>

{#snippet segments(liste: Segment[])}{#each liste as s, i (i)}{#if s.type === "texte"}{s.texte}{:else if s.type === "forme"}<Forme
        forme={s.forme}
        translitteration={s.translitteration}
        lien={s.personne ? lienAuteur(s.personne) : s.ouvrage ? lienOuvrage(s.ouvrage) : undefined}
      />{:else if s.type === "auteur"}<a class="auteur" href={lienAuteur(s.id)}>{nom(s.id)}</a>{:else}<a
        class="ouvrage"
        href={lienOuvrage(s.id)}><cite>{titre(s.id)}</cite></a
      >{/if}{/each}{/snippet}

{#if phrase.length > 0}
  <p class="chaine">{@render segments(phrase)}</p>
{/if}
{#each alternatives as alternative, i (i)}
  <div class="alternatives">
    <strong>{alternative.titre}</strong>
    <ul>
      {#each alternative.lignes as ligne, j (j)}
        <li>
          {@render segments(ligne.segments)}{#if ligne.selon.length > 0}{" "}<span class="selon"
              >({#each ligne.selon as id, k (id)}{#if k > 0},{" "}{/if}<a class="auteur" href={lienAuteur(id)}>{nom(id)}</a>{/each})</span
            >{/if}
        </li>
      {/each}
    </ul>
  </div>
{/each}

<style>
  .chaine {
    margin: 0.6rem 0 0;
    color: var(--texte-discret);
  }
  .alternatives {
    margin: 0.6rem 0 0;
    color: var(--texte-discret);
  }
  ul {
    margin: 0.2rem 0 0;
    padding-left: 1.1rem;
  }
  li {
    margin: 0.15rem 0 0;
  }
  strong {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-weight: 600;
  }
  .selon {
    font-family: var(--police-interface);
    font-size: 0.8rem;
  }
  a {
    color: inherit;
  }
</style>
