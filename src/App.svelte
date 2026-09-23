<script lang="ts">
  import Fiche from "./composants/Fiche.svelte";
  import MotDuJour from "./composants/MotDuJour.svelte";
  import Parametres from "./composants/Parametres.svelte";
  import Recherche from "./composants/Recherche.svelte";
  import { chargerFiche, entrees } from "./lib/fiches.ts";
  import { dateDuJour, motAuHasard, motDuJour } from "./lib/motDuJour.ts";
  import { ecrireParametres, lireParametres } from "./lib/stockage.ts";

  /** Vue affichée, déduite de l'adresse : `#/`, `#/mot/<id>`, `#/parametres`. */
  type Vue = { nom: "accueil" } | { nom: "fiche"; id: string } | { nom: "parametres" };

  function lireVue(hash: string): Vue {
    const [, page, id] = hash.split("/");
    if (page === "mot" && id) return { nom: "fiche", id: decodeURIComponent(id) };
    if (page === "parametres") return { nom: "parametres" };
    return { nom: "accueil" };
  }

  let vue = $state<Vue>(lireVue(location.hash));
  let parametres = $state(lireParametres());

  const duJour = motDuJour(entrees, dateDuJour());
  const ficheDuJour = duJour ? chargerFiche(duJour.id) : Promise.resolve(undefined);
  const ficheOuverte = $derived(vue.nom === "fiche" ? chargerFiche(vue.id) : undefined);

  $effect(() => {
    ecrireParametres(parametres);
  });

  $effect(() => {
    const suivre = () => {
      vue = lireVue(location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", suivre);
    return () => window.removeEventListener("hashchange", suivre);
  });

  function ouvrir(id: string) {
    location.hash = `/mot/${encodeURIComponent(id)}`;
  }

  function auHasard() {
    const mot = motAuHasard(entrees, vue.nom === "fiche" ? vue.id : undefined);
    if (mot) ouvrir(mot.id);
  }
</script>

<svelte:head>
  {#if vue.nom !== "fiche"}<title>Étymon</title>{/if}
</svelte:head>

<header>
  <a class="titre" href="#/">Étymon</a>
  <nav>
    <button type="button" onclick={auHasard} disabled={entrees.length === 0}>Au hasard</button>
    <a href="#/parametres" aria-current={vue.nom === "parametres" ? "page" : undefined}>Paramètres</a>
  </nav>
</header>

<main>
  {#if vue.nom === "parametres"}
    <Parametres bind:parametres />
  {:else}
    <Recherche {entrees} onChoisir={ouvrir} />

    <div class="contenu">
      {#if vue.nom === "fiche"}
        {#await ficheOuverte then fiche}
          {#if fiche}
            <Fiche {fiche} lectureTraditionnelle={parametres.lectureTraditionnelle} />
          {:else}
            <p class="message">Ce mot n'a pas (encore) de fiche.</p>
          {/if}
        {/await}
      {:else}
        <p class="devise">Le sens premier des mots français.</p>
        {#await ficheDuJour then fiche}
          {#if fiche}
            <MotDuJour {fiche} onOuvrir={ouvrir} />
          {:else}
            <p class="message">Aucune fiche publiée pour l'instant.</p>
          {/if}
        {/await}
      {/if}
    </div>
  {/if}
</main>

<style>
  header,
  main {
    max-width: 38rem;
    margin: 0 auto;
    padding: 0 1rem;
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }
  .titre {
    font-family: var(--police-fiche);
    font-style: italic;
    font-size: 1.6rem;
    color: var(--texte);
    text-decoration: none;
  }
  nav {
    display: flex;
    gap: 1rem;
    align-items: baseline;
  }
  nav a,
  nav button {
    font: inherit;
    font-size: 0.95rem;
    color: var(--texte-discret);
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-decoration: none;
  }
  nav a:hover,
  nav button:hover:not(:disabled),
  nav a[aria-current="page"] {
    color: var(--accent);
  }
  nav button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  main {
    padding-bottom: 3rem;
  }
  .contenu {
    margin-top: 2rem;
  }
  .devise {
    margin: 0 0 1.5rem;
    font-family: var(--police-fiche);
    font-size: 1.15rem;
    color: var(--texte-discret);
  }
  .message {
    color: var(--texte-discret);
  }
</style>
