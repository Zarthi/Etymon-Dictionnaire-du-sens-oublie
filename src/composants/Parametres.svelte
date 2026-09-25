<script lang="ts">
  import { messages } from "../i18n/index.ts";
  import type { Parametres } from "../lib/stockage.ts";

  let { parametres = $bindable(), onRetour }: { parametres: Parametres; onRetour: () => void } = $props();

  const m = messages.parametres;
</script>

<section>
  <button type="button" class="retour" onclick={onRetour}>{messages.navigation.retour}</button>
  <h1>{m.titre}</h1>

  <label class="option">
    <input type="checkbox" bind:checked={parametres.deplierLectures} />
    <span>
      {m.deplierLectures}
      <small>{m.deplierLecturesDetail}</small>
    </span>
  </label>

  <h2>{m.contribuer}</h2>
  <button type="button" disabled>{m.merci} <small>{m.merciDetail}</small></button>
  <button type="button" disabled>{m.critique} <small>{m.critiqueDetail}</small></button>

  <h2>{m.aPropos}</h2>
  <p>{m.aProposSources}</p>
  <p>{m.aProposHistoire.avant}<i>{m.aProposHistoire.nom}</i>{m.aProposHistoire.apres}</p>
  <p>{m.licence}</p>
</section>

<style>
  .retour {
    display: inline-block;
    width: auto;
    margin: 0 0 1rem;
    padding: 0;
    border: 0;
    font-size: 0.95rem;
    color: var(--texte-discret);
    cursor: pointer;
  }
  .retour:hover {
    color: var(--accent);
  }
  h1 {
    margin: 0 0 1.25rem;
    font-family: var(--police-fiche);
    font-weight: normal;
    font-size: 2rem;
  }
  h2 {
    margin: 2rem 0 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--texte-discret);
  }
  .option {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    cursor: pointer;
  }
  .option input {
    flex: none;
    margin-top: 0.3rem;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: var(--accent);
  }
  small {
    display: block;
    color: var(--texte-discret);
    font-size: 0.85rem;
  }
  button {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
    text-align: left;
    font: inherit;
    padding: 0.7rem 0.9rem;
    color: var(--texte-discret);
    background: none;
    border: 1px dashed var(--bordure);
    border-radius: 0.5rem;
    cursor: not-allowed;
  }
  p {
    color: var(--texte-discret);
    font-size: 0.9rem;
  }
</style>
