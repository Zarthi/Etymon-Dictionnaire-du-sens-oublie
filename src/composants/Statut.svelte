<script lang="ts">
  /** Mention d'une fiche non validée, quel que soit son type (mot, auteur, ouvrage). */
  import { messages as m } from "../i18n/index.ts";

  let { statut, objet = "etymologie" }: { statut: "a-verifier" | "brouillon" | "validee"; objet?: "etymologie" | "notice" } = $props();
</script>

{#if statut !== "validee"}
  <p class="statut {statut}">
    {#if statut === "a-verifier"}
      <strong>{m.statut.nonVerifiee(objet)}</strong> · {m.statut.nonVerifieeDetail}
    {:else}
      <strong>{m.statut.enRelecture}</strong> · {m.statut.enRelectureDetail}
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
