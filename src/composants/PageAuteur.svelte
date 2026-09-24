<script lang="ts">
  import { ouvrages } from "../lib/fiches.ts";
  import { lienOuvrage } from "../lib/liens.ts";
  import type { AuteurAssemble } from "../lib/types.ts";
  import ListeMots from "./ListeMots.svelte";
  import Redaction from "./Redaction.svelte";
  import Sources from "./Sources.svelte";
  import Statut from "./Statut.svelte";

  /**
   * Page d'un auteur : ce qui le situe (nom, dates, description), puis ce qu'il a fait dans le
   * dictionnaire, calculé à partir des fiches. Peu de choses, lisibles en dix secondes.
   */
  let { auteur }: { auteur: AuteurAssemble } = $props();

  const dates = $derived([auteur.naissance, auteur.mort].some(Boolean) ? `${auteur.naissance ?? "?"} – ${auteur.mort ?? "?"}` : "");
</script>

<svelte:head>
  <title>{auteur.nom} · Étymon</title>
</svelte:head>

<article>
  <Statut statut={auteur.statut} objet="Notice" />
  <h1>{auteur.nom}</h1>
  <p class="identite">{[auteur.nomComplet, dates].filter(Boolean).join(" · ")}</p>
  <p class="description">{auteur.description}</p>

  {#if auteur.oeuvres.length > 0}
    <section>
      <h2>Œuvres citées</h2>
      <p>
        {#each auteur.oeuvres as id, i (id)}{#if i > 0},{" "}{/if}<a href={lienOuvrage(id)}><cite>{ouvrages.get(id)?.titre ?? id}</cite></a
          >{/each}
      </p>
    </section>
  {/if}
  <ListeMots titre="Mots forgés" mots={auteur.forges} />
  <ListeMots titre="Mots issus de son nom" mots={auteur.issus} />
  <ListeMots titre="Étymologies proposées" mots={auteur.hypotheses} />
  <ListeMots titre="Lectures traditionnelles" mots={auteur.lectures} />

  <footer>
    <Sources sources={auteur.sources} />
    <Redaction redaction={auteur.redaction} />
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
  .identite {
    margin: 0.3rem 0 1rem;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  .description {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.6;
  }
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
  section p {
    margin: 0;
  }
  a {
    color: inherit;
  }
  footer {
    margin-top: 2rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bordure);
  }
</style>
