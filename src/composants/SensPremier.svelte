<script lang="ts">
  import { grammaire as g, messages as m } from "../i18n/index.ts";
  import { indexPremier, sensLitteral } from "../lib/etymologie.ts";
  import type { Maillon } from "../lib/types.ts";

  /** Le sens premier seul, en tête de fiche : « esprit fendu ». D'où il vient, la phrase de la chaîne le dit juste dessous. */
  let { etymologie }: { etymologie: Maillon[] } = $props();

  const sens = $derived(etymologie[indexPremier(etymologie)].sens);
  /** Composition sans forme composée attestée : le sens est celui de ses éléments, mis bout à bout. */
  const litteral = $derived(sensLitteral(etymologie));
</script>

{#if litteral}<span class="litteralement">{m.fiche.litteralement}</span>{" "}{/if}<span class="sens">{g.citer(sens ?? "")}</span>

<style>
  .sens {
    color: var(--accent);
  }
  .litteralement {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-style: italic;
    color: var(--texte-discret);
  }
</style>
