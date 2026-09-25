<script lang="ts">
  import { messages as m } from "../i18n/index.ts";
  import { ouvrages } from "../lib/fiches.ts";
  import { urlDe } from "../lib/ouvrages.ts";

  /**
   * Un ouvrage consulté, lien vers l'entrée si possible : « Littré ».
   * `oeuvre` : une œuvre de la tradition, titre en italique suivi du passage précis
   * (« *Institutions divines*, IV, 28, 3 »).
   * `parEntree` : l'entrée est nommée à la place de l'ouvrage (« Bailly (σχίζω, φρήν) »).
   */
  let {
    source,
    oeuvre = false,
    parEntree = false,
  }: {
    source: { ouvrage: string; entree: string; page?: number | string; url?: string };
    oeuvre?: boolean;
    parEntree?: boolean;
  } = $props();

  const fiche = $derived(ouvrages.get(source.ouvrage));
  const nom = $derived(fiche ? (oeuvre ? fiche.titre : (fiche.abrege ?? fiche.titre)) : source.ouvrage);
  /** Adresse donnée, ou déduite de l'entrée par le modèle d'adresse de l'ouvrage. */
  const adresse = $derived(urlDe(source, fiche?.modeleEntree));
  const complement = $derived(
    [oeuvre ? source.entree : "", source.page !== undefined ? m.sources.page(source.page) : ""].filter(Boolean).join(", "),
  );
</script>

{#snippet libelle()}{#if oeuvre}<cite>{nom}</cite>{:else if parEntree}{source.entree}{:else}{nom}{/if}{#if complement}, {complement}{/if}{/snippet}

{#if adresse}<a href={adresse} target="_blank" rel="noopener noreferrer" title={m.sources.entreeConsultee(source.entree)}
    >{@render libelle()}</a
  >{:else}<span title={m.sources.entreeConsultee(source.entree)}>{@render libelle()}</span>{/if}

<style>
  a {
    color: inherit;
  }
</style>
