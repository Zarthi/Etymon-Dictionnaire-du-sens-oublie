<script lang="ts">
  import Fiche from "./composants/Fiche.svelte";
  import MotDuJour from "./composants/MotDuJour.svelte";
  import PageAuteur from "./composants/PageAuteur.svelte";
  import PageOuvrage from "./composants/PageOuvrage.svelte";
  import Parametres from "./composants/Parametres.svelte";
  import Recherche from "./composants/Recherche.svelte";
  import { auteurs, chargerFiche, entrees, ouvrages } from "./lib/fiches.ts";
  import { lienMot } from "./lib/liens.ts";
  import { dateDuJour, motAuHasard, motDuJour } from "./lib/motDuJour.ts";
  import { ecrireParametres, lireParametres } from "./lib/stockage.ts";
  import { tick } from "svelte";
  import { grammaire as g, messages as m } from "./i18n/index.ts";

  /** Vue affichée, déduite de l'adresse : `#/`, `#/mot/<id>`, `#/auteur/<id>`, `#/ouvrage/<id>`, `#/parametres`. */
  type Vue =
    | { nom: "accueil" }
    | { nom: "fiche"; id: string }
    | { nom: "auteur"; id: string }
    | { nom: "ouvrage"; id: string }
    | { nom: "parametres" };

  function lireVue(hash: string): Vue {
    const [, page, id] = hash.split("/");
    if (page === "mot" && id) return { nom: "fiche", id: decodeURIComponent(id) };
    if (page === "auteur" && id) return { nom: "auteur", id: decodeURIComponent(id) };
    if (page === "ouvrage" && id) return { nom: "ouvrage", id: decodeURIComponent(id) };
    if (page === "parametres") return { nom: "parametres" };
    return { nom: "accueil" };
  }

  let vue = $state<Vue>(lireVue(location.hash));
  let parametres = $state(lireParametres());

  const duJour = motDuJour(entrees, dateDuJour());
  const ficheDuJour = duJour ? chargerFiche(duJour.id) : Promise.resolve(undefined);
  const ficheOuverte = $derived(vue.nom === "fiche" ? chargerFiche(vue.id) : undefined);

  /** Adresse d'une fiche existante ; rien pour un mot qui n'a pas encore sa fiche. */
  const idsPublies = new Set(entrees.map((e) => e.id));
  const lienVers = (id: string) => (idsPublies.has(id) ? lienMot(id) : undefined);
  const motsParId = new Map(entrees.map((e) => [e.id, e.mot]));
  const motDe = (id: string) => motsParId.get(id) ?? id;

  $effect(() => {
    ecrireParametres(parametres);
  });

  // Historique de navigation. L'API Navigation (Chrome, Edge) dit s'il y a une page avant ou
  // après ; ailleurs, les boutons restent actifs et le navigateur fait ce qu'il peut.
  const nav = typeof navigation === "undefined" ? undefined : navigation;
  let peutReculer = $state(nav ? nav.canGoBack : true);
  let peutAvancer = $state(nav ? nav.canGoForward : true);

  /** Position de défilement de chaque page visitée, pour la retrouver en revenant. */
  const positions = new Map<string, number>();
  let retourOuAvance = false;
  if (nav) history.scrollRestoration = "manual";

  $effect(() => {
    const avantNavigation = (evenement: NavigateEvent) => {
      if (nav?.currentEntry) positions.set(nav.currentEntry.key, window.scrollY);
      retourOuAvance = evenement.navigationType === "traverse";
    };
    const suivre = async () => {
      vue = lireVue(location.hash);
      if (nav) {
        peutReculer = nav.canGoBack;
        peutAvancer = nav.canGoForward;
      }
      const cle = nav?.currentEntry?.key;
      const position = retourOuAvance && cle ? (positions.get(cle) ?? 0) : 0;
      retourOuAvance = false;
      // La fiche se charge à la demande : attendre qu'elle soit affichée avant de défiler.
      if (vue.nom === "fiche") await ficheOuverte;
      await tick();
      window.scrollTo(0, position);
    };
    nav?.addEventListener("navigate", avantNavigation);
    window.addEventListener("hashchange", suivre);
    return () => {
      nav?.removeEventListener("navigate", avantNavigation);
      window.removeEventListener("hashchange", suivre);
    };
  });

  /** Revenir là où l'on était ; à défaut, à l'accueil. */
  function revenir() {
    if (peutReculer && history.length > 1) history.back();
    else location.hash = "/";
  }

  function ouvrir(id: string) {
    location.hash = lienMot(id).slice(1);
  }

  function auHasard() {
    const mot = motAuHasard(entrees, vue.nom === "fiche" ? vue.id : undefined);
    if (mot) ouvrir(mot.id);
  }
</script>

<svelte:head>
  {#if vue.nom === "accueil" || vue.nom === "parametres"}<title>{m.titreDocument}</title>{/if}
</svelte:head>

<header>
  <div class="gauche">
    <nav class="historique" aria-label={m.navigation.historique}>
      <button type="button" onclick={() => history.back()} disabled={!peutReculer} aria-label={m.navigation.precedente} title={m.navigation.precedente}>←</button>
      <button type="button" onclick={() => history.forward()} disabled={!peutAvancer} aria-label={m.navigation.suivante} title={m.navigation.suivante}>→</button>
    </nav>
    <a class="titre" href="#/">{m.titre}<span class="sous-titre"><span class="deux-points">{g.deuxPoints}</span> {m.sousTitre}</span></a>
  </div>
  <nav>
    <button type="button" onclick={auHasard} disabled={entrees.length === 0}>{m.navigation.auHasard}</button>
    <a href="#/parametres" aria-current={vue.nom === "parametres" ? "page" : undefined}>{m.navigation.parametres}</a>
  </nav>
</header>

<main>
  {#if vue.nom === "parametres"}
    <Parametres bind:parametres onRetour={revenir} />
  {:else}
    <Recherche {entrees} onChoisir={ouvrir} />

    <div class="contenu">
      {#if vue.nom === "auteur"}
        {@const auteur = auteurs.get(vue.id)}
        {#if auteur}<PageAuteur {auteur} />{:else}<p class="message">{m.absent.auteur}</p>{/if}
      {:else if vue.nom === "ouvrage"}
        {@const ouvrage = ouvrages.get(vue.id)}
        {#if ouvrage}<PageOuvrage {ouvrage} />{:else}<p class="message">{m.absent.ouvrage}</p>{/if}
      {:else if vue.nom === "fiche"}
        {#await ficheOuverte then fiche}
          {#if fiche}
            <Fiche {fiche} deplierLectures={parametres.deplierLectures} {lienVers} {motDe} />
          {:else}
            <p class="message">{m.absent.mot}</p>
          {/if}
        {/await}
      {:else}
        <p class="devise">{m.devise}</p>
        {#await ficheDuJour then fiche}
          {#if fiche}
            <MotDuJour {fiche} onOuvrir={ouvrir} />
          {:else}
            <p class="message">{m.absent.accueil}</p>
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
  .gauche {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .historique {
    gap: 0.35rem;
  }
  .historique button {
    font-size: 1.1rem;
    line-height: 1;
  }
  .titre {
    font-family: var(--police-fiche);
    font-style: italic;
    font-size: 1.6rem;
    color: var(--texte);
    text-decoration: none;
  }
  .sous-titre {
    font-size: 1.05rem;
    color: var(--texte-discret);
  }
  /* Écran étroit : le sous-titre passe sous le nom, sans deux-points. */
  @media (max-width: 600px) {
    .sous-titre {
      display: block;
      font-size: 0.85rem;
      line-height: 1.2;
    }
    .deux-points {
      display: none;
    }
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
