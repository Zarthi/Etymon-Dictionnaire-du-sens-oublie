<script lang="ts">
  import { indexPremier } from "../lib/etymologie.ts";
  import type { Maillon } from "../lib/types.ts";

  /** Le sens premier seul, en tête de fiche : « esprit fendu ». D'où il vient, la phrase de la chaîne le dit juste dessous. */
  let { etymologie }: { etymologie: Maillon[] } = $props();

  const sens = $derived(etymologie[indexPremier(etymologie)].sens);
</script>

<span class="sens">«&nbsp;{sens}&nbsp;»</span>

<style>
  .sens {
    color: var(--accent);
  }
</style>
