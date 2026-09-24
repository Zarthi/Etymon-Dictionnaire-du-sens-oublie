<script lang="ts">
  /** Mention d'une fiche non validée, quel que soit son type (mot, auteur, ouvrage). */
  let { statut, objet = "Étymologie" }: { statut: "a-verifier" | "brouillon" | "validee"; objet?: string } = $props();
</script>

{#if statut !== "validee"}
  <p class="statut {statut}">
    {#if statut === "a-verifier"}
      <strong>{objet} non vérifiée</strong> · rédigée par IA, pas encore contrôlée sur les sources.
    {:else}
      <strong>En relecture</strong> · sources consultées, relecture en cours.
    {/if}
  </p>
{/if}

<style>
  .statut {
    margin: 0 0 1rem;
    padding: 0.4rem 0.7rem;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
    border-left: 3px solid var(--brouillon);
    background: var(--surface);
    border-radius: 0 0.4rem 0.4rem 0;
  }
  .statut strong {
    color: var(--brouillon);
    font-weight: 600;
  }
  .statut.a-verifier {
    border-left-color: var(--non-verifie);
  }
  .statut.a-verifier strong {
    color: var(--non-verifie);
  }
</style>
