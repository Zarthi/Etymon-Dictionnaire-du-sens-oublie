<script lang="ts">
  import { de, origine, sur } from "../lib/affichage.ts";
  import { indexPremier, translitterationDe } from "../lib/etymologie.ts";
  import { auteurs, ouvrages } from "../lib/fiches.ts";
  import { lienAuteur, lienOuvrage } from "../lib/liens.ts";
  import type { Element, Maillon } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  /**
   * La chaîne étymologique en une phrase, du plus proche au plus lointain, sous le sens premier
   * affiché en tête (SensPremier), dont le sens n'est pas répété :
   * « De l'allemand Schizophrenie, forgé par Eugen Bleuler (1911), sur le grec σχίζω, « fendre », et φρήν, « diaphragme ». »
   * Puis les alternatives : « Origine débattue : de relegere, « … » (Cicéron), ou de religare, « … » (Lactance). »
   */
  let { etymologie }: { etymologie: Maillon[] } = $props();

  const premier = $derived(etymologie[indexPremier(etymologie)]);
  const chaine = $derived(etymologie.filter((m) => !m.alternatives));
  const alternatives = $derived(etymologie.filter((m) => m.alternatives));
  const nom = (id: string) => auteurs.get(id)?.nom ?? id;
  const titre = (id: string) => ouvrages.get(id)?.titre ?? id;
  const prep = (f: { forme: string; translitteration?: string }) => de(translitterationDe(f) ?? f.forme);
  const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

  /** Ce qui introduit un maillon : sa langue, ou « de » dans la même langue ; « sur » la matière d'un mot forgé. */
  function introduction(i: number): string {
    const m = chaine[i];
    if (i === 0) return m.langue === "français" && !m.forme ? "Composé " : `${majuscule(origine(m.langue))} `;
    const avant = chaine[i - 1];
    if (avant.forge && !avant.elements) return `, ${sur(m.langue)} `;
    // Après une composition sans forme (altruisme), le maillon suivant remonte l'un des éléments, pas la phrase qui précède.
    if (avant.elements && !avant.forme) return `\u00a0; plus haut, ${origine(m.langue)} `;
    if (m.langue === avant.langue && m.forme) return `, ${prep({ forme: m.forme, translitteration: m.translitteration })}`;
    return `, ${origine(m.langue)} `;
  }
</script>

{#snippet noms(ids: string[], liaison: string)}{#each ids as id, i (id)}{#if i > 0}{i === ids.length - 1 ? liaison : ", "}{/if}<a
      class="auteur"
      href={lienAuteur(id)}>{nom(id)}</a
    >{/each}{/snippet}

<!-- Éléments d'une composition ; `apresLangue` : la langue vient d'être dite (« du grec σχίζω et φρήν »), sinon « de » devant chacun. -->
{#snippet elementsDe(elements: Element[], langue: string, apresLangue = false)}{#each elements as e, i (i)}{#if i > 0}{i ===
      elements.length - 1
        ? ", et "
        : ", "}{/if}{#if e.langue && e.langue !== langue}{origine(e.langue)}{" "}{:else if !apresLangue}{prep(e)}{/if}<Forme
      forme={e.forme}
      translitteration={e.translitteration}
    />, «&nbsp;{e.sens}&nbsp;»{/each}{/snippet}

<!-- Un maillon dans la phrase : forme, sens (sauf le sens premier, déjà en tête), composition, forge, modèle. -->
{#snippet maillon(m: Maillon, francais: boolean)}{#if m.forme}<Forme
      forme={m.forme}
      translitteration={m.translitteration}
      lien={m.personne ? lienAuteur(m.personne) : m.ouvrage ? lienOuvrage(m.ouvrage) : undefined}
    />{#if m.sens && m !== premier}, «&nbsp;{m.sens}&nbsp;»{/if}{#if m.elements}, composé {@render elementsDe(
        m.elements,
        m.langue,
      )}{/if}{:else if m.elements}{@render elementsDe(m.elements, m.langue, !francais)}{/if}{#if m.forge}, forgé par {@render noms(
      m.forge.par,
      " ou ",
    )} ({m.forge.date}){#if m.forge.ouvrage}, dans
      <a class="ouvrage" href={lienOuvrage(m.forge.ouvrage)}><cite>{titre(m.forge.ouvrage)}</cite></a>{/if}{/if}{#if m.modele}{@const calque =
      m.modele.relation === "calque"}{calque ? ", calque " : ", sur le modèle "}{calque || m.modele.langue !== m.langue
      ? `${origine(m.modele.langue)} `
      : prep(m.modele)}<Forme forme={m.modele.forme} translitteration={m.modele.translitteration} />{#if m.modele.sens}, «&nbsp;{m.modele
          .sens}&nbsp;»{/if}{/if}{/snippet}

{#if chaine.length > 0}
  <p class="chaine">
    {#each chaine as m, i (i)}{introduction(i)}{@render maillon(m, i === 0 && m.langue === "français" && !m.forme)}{/each}.
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
