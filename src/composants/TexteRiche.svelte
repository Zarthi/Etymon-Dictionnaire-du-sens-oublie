<script lang="ts">
  import type { Mention } from "../lib/mentions.ts";
  import { analyser } from "../lib/texte.ts";

  /**
   * Texte de fiche : les `formes` étrangères de la fiche en italique, des liens vers les auteurs
   * et ouvrages qu'elle cite (`mentions`) et vers les mots qui ont une fiche.
   * `lienVers` donne l'adresse d'une fiche, ou rien si elle n'existe pas ;
   * `exclu` est la fiche en cours, jamais liée à elle-même.
   */
  let {
    texte,
    lienVers,
    exclu,
    formes = [],
    mentions = [],
  }: {
    texte: string;
    lienVers: (id: string) => string | undefined;
    exclu?: string;
    formes?: string[];
    mentions?: Mention[];
  } = $props();

  const segments = $derived(analyser(texte, (id) => lienVers(id) !== undefined, exclu, formes, mentions));
</script>

{#each segments as segment, i (i)}{#if segment.type === "italique"}<em>{segment.texte}</em
    >{:else if segment.type === "lien"}<a href={lienVers(segment.cible)}>{segment.texte}</a
    >{:else if segment.type === "mention"}<a href={segment.lien}>{segment.texte}</a
    >{:else}{segment.texte}{/if}{/each}

<style>
  /* Liens discrets : un filet léger, plus marqué au survol, pour ne pas hacher la lecture. */
  a {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--accent) 35%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
  a:hover,
  a:focus-visible {
    color: var(--accent);
    text-decoration-color: var(--accent);
  }
</style>
