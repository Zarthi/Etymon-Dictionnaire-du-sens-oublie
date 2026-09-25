<script lang="ts">
  import { messages as m } from "../i18n/index.ts";
  import { chercher, preparer } from "../lib/recherche.ts";
  import { choisie, deplacer, TOUCHES_LISTE } from "../lib/selection.ts";
  import type { EntreeIndex } from "../lib/types.ts";

  /**
   * Champ de recherche et ses propositions, selon le motif « combobox » de WAI-ARIA : le focus
   * reste dans le champ ; ↓ et ↑ désignent une proposition (aria-activedescendant), Entrée la
   * choisit (ou la première), Échap la désigne plus. La logique des touches est dans selection.ts.
   */
  let { entrees, onChoisir }: { entrees: EntreeIndex[]; onChoisir: (id: string) => void } = $props();

  const ID_LISTE = "propositions";
  let saisie = $state("");
  /** Proposition désignée au clavier ou au survol ; -1 : aucune. */
  let actif = $state(-1);
  const preparees = $derived(preparer(entrees));
  const resultats = $derived(chercher(preparees, saisie));
  const ouverte = $derived(saisie.trim() !== "" && resultats.length > 0);
  const idOption = (i: number) => `${ID_LISTE}-${i}`;

  function saisir() {
    actif = -1; // de nouveaux résultats : l'ancienne désignation ne vaut plus
  }

  function touche(evenement: KeyboardEvent) {
    if (!ouverte || evenement.isComposing || !TOUCHES_LISTE.has(evenement.key)) return;
    // Échap sans proposition désignée : laisser le champ se vider (comportement natif).
    if (evenement.key === "Escape" && actif === -1) return;
    evenement.preventDefault();
    actif = deplacer(actif, evenement.key, resultats.length);
  }

  function choisir(id: string) {
    saisie = "";
    actif = -1;
    onChoisir(id);
  }

  function valider(evenement: SubmitEvent) {
    evenement.preventDefault();
    const i = choisie(actif, resultats.length);
    if (i >= 0) choisir(resultats[i].id);
  }
</script>

<form role="search" onsubmit={valider}>
  <input
    type="search"
    role="combobox"
    bind:value={saisie}
    oninput={saisir}
    onkeydown={touche}
    placeholder={m.recherche.invite}
    aria-label={m.recherche.invite}
    aria-autocomplete="list"
    aria-expanded={ouverte}
    aria-controls={ID_LISTE}
    aria-activedescendant={ouverte && actif >= 0 ? idOption(actif) : undefined}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />
  {#if saisie.trim() !== ""}
    {#if ouverte}
      <!-- Les options ne prennent jamais le focus : le clavier reste dans le champ, la souris choisit au clic. -->
      <ul id={ID_LISTE} role="listbox" aria-label={m.recherche.propositions}>
        {#each resultats as entree, i (entree.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events (le clavier est géré par le champ : motif combobox) -->
          <li
            id={idOption(i)}
            role="option"
            aria-selected={i === actif}
            class:actif={i === actif}
            onpointerenter={() => (actif = i)}
            onpointerdown={(e) => e.preventDefault()}
            onclick={() => choisir(entree.id)}
          >
            {entree.mot}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="vide" role="status">{m.recherche.aucun}</p>
    {/if}
  {/if}
</form>

<style>
  input {
    width: 100%;
    font: inherit;
    font-size: 1.1rem;
    padding: 0.7rem 0.9rem;
    color: var(--texte);
    background: var(--surface);
    border: 1px solid var(--bordure);
    border-radius: 0.5rem;
  }
  input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  ul {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0.25rem 0;
    background: var(--surface);
    border: 1px solid var(--bordure);
    border-radius: 0.5rem;
  }
  li {
    font-family: var(--police-fiche);
    font-size: 1.1rem;
    padding: 0.45rem 0.9rem;
    color: var(--texte);
    cursor: pointer;
  }
  .actif {
    background: var(--survol);
  }
  .vide {
    margin: 0.5rem 0.2rem 0;
    color: var(--texte-discret);
  }
</style>
