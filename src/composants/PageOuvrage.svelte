<script lang="ts">
  import { libelles as l, messages as m } from "../i18n/index.ts";
  import { auteurs } from "../lib/fiches.ts";
  import { lienAuteur } from "../lib/liens.ts";
  import type { OuvrageAssemble } from "../lib/types.ts";
  import ListeMots from "./ListeMots.svelte";
  import Redaction from "./Redaction.svelte";
  import Sources from "./Sources.svelte";
  import Statut from "./Statut.svelte";

  /**
   * Page d'un ouvrage : titre, auteur, date, description ; l'édition consultée et ce qu'Étymon a le
   * droit d'en faire ; puis les mots qu'il éclaire. Pas de liste pour un dictionnaire, cité partout.
   */
  let { ouvrage }: { ouvrage: OuvrageAssemble } = $props();

  const auteur = $derived(ouvrage.auteur ? auteurs.get(ouvrage.auteur) : undefined);
</script>

<svelte:head>
  <title>{m.titrePage(ouvrage.titre)}</title>
</svelte:head>

<article>
  <Statut statut={ouvrage.statut} objet="notice" />
  <h1><cite>{ouvrage.titre}</cite></h1>
  <p class="identite">
    {#if ouvrage.titreOriginal}<cite>{ouvrage.titreOriginal}</cite>{/if}{#if auteur}{ouvrage.titreOriginal ? " · " : ""}<a
        href={lienAuteur(auteur.id)}>{auteur.nom}</a
      >{/if}{#if ouvrage.date}{ouvrage.titreOriginal || auteur ? " · " : ""}{ouvrage.date}{/if}
  </p>
  <p class="description">{ouvrage.description}</p>
  <p class="usage">
    {#if ouvrage.edition}{m.ouvrage.edition(ouvrage.edition)}{/if}
    {m.ouvrage.licence(l.licence(ouvrage.licence))}
    {#if ouvrage.texte}<a href={ouvrage.texte} target="_blank" rel="noopener noreferrer">{m.ouvrage.lire}</a>.{/if}
  </p>

  <ListeMots titre={m.ouvrage.lectures} mots={ouvrage.lectures} />
  <ListeMots titre={m.ouvrage.forges} mots={ouvrage.forges} />
  <ListeMots titre={m.ouvrage.issus} mots={ouvrage.issus} />

  <footer>
    <Sources sources={ouvrage.sources} />
    <Redaction redaction={ouvrage.redaction} />
  </footer>
</article>

<style>
  article {
    font-family: var(--police-fiche);
  }
  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 6vw, 2.4rem);
    font-weight: normal;
    line-height: 1.15;
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
  .usage {
    margin: 0.75rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
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
