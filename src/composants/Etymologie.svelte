<script lang="ts">
  import { de, origine, par } from "../lib/affichage.ts";
  import { indexPremier, translitterationDe } from "../lib/etymologie.ts";
  import { auteurs, ouvrages } from "../lib/fiches.ts";
  import { lienAuteur, lienOuvrage } from "../lib/liens.ts";
  import type { Element, Maillon } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  /**
   * La chaîne étymologique, sous le sens premier affiché en tête (SensPremier) :
   * - composition du sens premier : « Composé de φίλος, « ami », et σοφία, « sagesse ». » ;
   * - mot forgé : « Forgé par Thomas More (1516), dans Utopia. » ;
   * - voie, du plus proche au plus lointain : « Par l'allemand Schizophrenie, forgé par Eugen Bleuler (1911). » ;
   * - plus haut : « Plus haut : de l'indo-européen … » ;
   * - alternatives : « Origine débattue : de relegere, « … » (Cicéron), ou de religare, « … » (Lactance). »
   */
  let { etymologie }: { etymologie: Maillon[] } = $props();

  const iPremier = $derived(indexPremier(etymologie));
  const premier = $derived(etymologie[iPremier]);
  const simples = (liste: Maillon[]) => liste.filter((m) => !m.alternatives);
  const voie = $derived(simples(etymologie.slice(0, iPremier)));
  const plusHaut = $derived(simples(etymologie.slice(iPremier + 1)));
  const alternatives = $derived(etymologie.filter((m) => m.alternatives));
  const nom = (id: string) => auteurs.get(id)?.nom ?? id;
  const titre = (id: string) => ouvrages.get(id)?.titre ?? id;
  const prep = (f: { forme: string; translitteration?: string }) => de(translitterationDe(f) ?? f.forme);
</script>

{#snippet noms(ids: string[], liaison: string)}{#each ids as id, i (id)}{#if i > 0}{i === ids.length - 1 ? liaison : ", "}{/if}<a
      class="auteur"
      href={lienAuteur(id)}>{nom(id)}</a
    >{/each}{/snippet}

<!-- Éléments d'une composition ; `apresLangue` : la langue vient d'être dite, pas de « de » devant le premier. -->
{#snippet elementsDe(elements: Element[], langue: string, apresLangue = false)}{#each elements as e, i (i)}{#if i > 0}{i ===
      elements.length - 1
        ? ", et "
        : ", "}{/if}{#if e.langue && e.langue !== langue}{origine(e.langue)}{" "}{:else if i > 0 || !apresLangue}{prep(e)}{/if}<Forme
      forme={e.forme}
      translitteration={e.translitteration}
    />, «&nbsp;{e.sens}&nbsp;»{/each}{/snippet}

{#snippet forge(m: Maillon)}{#if m.forge}, forgé par {@render noms(m.forge.par, " ou ")} ({m.forge.date}){#if m.forge.ouvrage}, dans
      <a class="ouvrage" href={lienOuvrage(m.forge.ouvrage)}><cite>{titre(m.forge.ouvrage)}</cite></a>{/if}{/if}{/snippet}

{#snippet modele(m: Maillon, majuscule: boolean)}{#if m.modele}{@const calque = m.modele.relation === "calque"}{majuscule
      ? calque
        ? "Calque"
        : "Sur le modèle"
      : calque
        ? ", calque"
        : ", sur le modèle"}{" "}{calque || m.modele.langue !== m.langue ? `${origine(m.modele.langue)} ` : prep(m.modele)}<Forme
      forme={m.modele.forme}
      translitteration={m.modele.translitteration}
    />{#if m.modele.sens}, «&nbsp;{m.modele.sens}&nbsp;»{/if}{/if}{/snippet}

<!-- Un maillon dans une phrase : forme, sens, forge, modèle ; sa langue est dite par l'appelant. -->
{#snippet maillon(m: Maillon)}{#if m.forme}<Forme
      forme={m.forme}
      translitteration={m.translitteration}
      lien={m.personne ? lienAuteur(m.personne) : m.ouvrage ? lienOuvrage(m.ouvrage) : undefined}
    />{#if m.sens}, «&nbsp;{m.sens}&nbsp;»{/if}{:else if m.elements}{@render elementsDe(m.elements, m.langue, true)}{/if}{@render forge(m)}{@render modele(m, false)}{/snippet}

{#if premier.forme && premier.elements}
  <p class="chaine"><strong>Composé</strong>&nbsp;: {@render elementsDe(premier.elements, premier.langue)}.</p>
{/if}
{#if premier.forge}
  <p class="chaine">
    <strong>Forgé</strong> par {@render noms(premier.forge.par, " ou ")} ({premier.forge.date}){#if premier.forge.ouvrage}, dans
      <a class="ouvrage" href={lienOuvrage(premier.forge.ouvrage)}><cite>{titre(premier.forge.ouvrage)}</cite></a>{/if}.
  </p>
{/if}
{#if premier.modele}
  <p class="chaine">{@render modele(premier, true)}.</p>
{/if}
{#if voie.length > 0}
  <p class="chaine">
    <strong>Voie</strong>&nbsp;: {#each voie as m, i (i)}{#if i > 0},{" "}{/if}{i === 0 ? par(m.langue) : origine(m.langue)}
      {@render maillon(m)}{/each}.
  </p>
{/if}
{#if plusHaut.length > 0}
  <p class="chaine">
    <strong>Plus haut</strong>&nbsp;: {#each plusHaut as m, i (i)}{#if i > 0}&nbsp;;{" "}{/if}{origine(m.langue)}
      {@render maillon(m)}{/each}.
  </p>
{/if}
{#each alternatives as m, i (i)}
  {@const formes = m.alternatives!.formes}
  <p class="chaine">
    <strong>{m.alternatives!.mode === "debattue" ? "Origine débattue" : "Double sens voulu"}</strong>&nbsp;:
    {#each formes as a, j (j)}{#if j > 0}{j === formes.length - 1 ? (m.alternatives!.mode === "debattue" ? ", ou " : ", et ") : ", "}{/if}{#if a.forme}{#if a.langue && a.langue !== m.langue}{origine(
            a.langue,
          )}{" "}{:else}{prep({ forme: a.forme, translitteration: a.translitteration })}{/if}<Forme
          forme={a.forme}
          translitteration={a.translitteration}
        />, «&nbsp;{a.sens}&nbsp;»{:else}«&nbsp;{a.sens}&nbsp;», {@render elementsDe(a.elements ?? [], a.langue ?? m.langue)}{/if}{#if a.selon?.length}{" "}<span
          class="selon">({@render noms(a.selon, ", ")})</span
        >{/if}{/each}.
  </p>
{/each}

<style>
  .chaine {
    margin: 0.6rem 0 0;
    color: var(--texte-discret);
  }
  .chaine:first-child {
    margin-top: 1rem;
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
