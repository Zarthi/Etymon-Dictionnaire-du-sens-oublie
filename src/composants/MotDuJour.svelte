<script lang="ts">
  import { origine } from "../lib/affichage.ts";
  import type { FicheIdentifiee } from "../lib/types.ts";
  import Forme from "./Forme.svelte";

  let { fiche, onOuvrir }: { fiche: FicheIdentifiee; onOuvrir: (id: string) => void } = $props();
</script>

<section>
  <h2>Mot du jour</h2>
  <button type="button" onclick={() => onOuvrir(fiche.id)}>
    <span class="mot">{fiche.mot}</span>
    <span class="etymon"
      >{origine(fiche.langue)}
      <Forme forme={fiche.etymon} graphie={fiche.graphie} />&nbsp;: «&nbsp;{fiche.sens}&nbsp;»</span
    >
    {#if fiche.statut !== "validee"}
      <span class="statut">{fiche.statut === "a-verifier" ? "Étymologie non vérifiée" : "En relecture"}</span>
    {/if}
  </button>
</section>

<style>
  h2 {
    margin: 0 0 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--texte-discret);
  }
  button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 1.1rem 1.2rem;
    font-family: var(--police-fiche);
    color: var(--texte);
    background: var(--surface);
    border: 1px solid var(--bordure);
    border-radius: 0.75rem;
    cursor: pointer;
  }
  button:hover,
  button:focus-visible {
    border-color: var(--accent);
  }
  .mot {
    display: block;
    font-size: 2rem;
    line-height: 1.2;
  }
  .etymon {
    display: block;
    margin-top: 0.3rem;
    font-size: 1.1rem;
    color: var(--texte-discret);
  }
  .statut {
    display: block;
    margin-top: 0.5rem;
    font-family: var(--police-interface);
    font-size: 0.8rem;
    color: var(--brouillon);
  }
</style>
