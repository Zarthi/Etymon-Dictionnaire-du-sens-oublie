<script lang="ts">
  import type { Parametres } from "../lib/stockage.ts";

  let { parametres = $bindable(), onRetour }: { parametres: Parametres; onRetour: () => void } = $props();
</script>

<section>
  <button type="button" class="retour" onclick={onRetour}>← Retour</button>
  <h1>Paramètres</h1>

  <label class="option">
    <input type="checkbox" bind:checked={parametres.lectureTraditionnelle} />
    <span>
      Lecture traditionnelle
      <small>
        Affiche, quand la fiche en contient une, le sens donné au mot par une doctrine traditionnelle (Pères de
        l'Église, scolastique…). Toujours sourcée et séparée de l'étymologie.
      </small>
    </span>
  </label>

  <h2>Contribuer</h2>
  <button type="button" disabled>Merci <small>Soutenir le projet (en construction)</small></button>
  <button type="button" disabled>Critique <small>Proposer un mot absent (en construction)</small></button>

  <h2>À propos</h2>
  <p>
    Étymon donne le sens premier des mots français, d'après le Littré, le Gaffiot et le Bailly, vérifiés sur le
    Trésor de la langue française. Fiches sous licence CC&nbsp;BY-SA&nbsp;4.0.
  </p>
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
