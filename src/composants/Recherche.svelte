<script lang="ts">
  import { chercher, preparer } from "../lib/recherche.ts";
  import type { EntreeIndex } from "../lib/types.ts";

  let { entrees, onChoisir }: { entrees: EntreeIndex[]; onChoisir: (id: string) => void } = $props();

  let saisie = $state("");
  const preparees = $derived(preparer(entrees));
  const resultats = $derived(chercher(preparees, saisie));

  function choisir(id: string) {
    saisie = "";
    onChoisir(id);
  }

  function valider(evenement: SubmitEvent) {
    evenement.preventDefault();
    if (resultats.length > 0) choisir(resultats[0].id);
  }
</script>

<form role="search" onsubmit={valider}>
  <input
    type="search"
    bind:value={saisie}
    placeholder="Chercher un mot"
    aria-label="Chercher un mot"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />
  {#if saisie.trim() !== ""}
    {#if resultats.length > 0}
      <ul>
        {#each resultats as entree (entree.id)}
          <li><button type="button" onclick={() => choisir(entree.id)}>{entree.mot}</button></li>
        {/each}
      </ul>
    {:else}
      <p class="vide" role="status">Aucun mot trouvé.</p>
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
  button {
    display: block;
    width: 100%;
    text-align: left;
    font-family: var(--police-fiche);
    font-size: 1.1rem;
    padding: 0.45rem 0.9rem;
    color: var(--texte);
    background: none;
    border: 0;
    cursor: pointer;
  }
  button:hover,
  button:focus-visible {
    background: var(--survol);
  }
  .vide {
    margin: 0.5rem 0.2rem 0;
    color: var(--texte-discret);
  }
</style>
