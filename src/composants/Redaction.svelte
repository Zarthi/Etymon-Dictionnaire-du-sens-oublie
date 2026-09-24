<script lang="ts">
  import type { Redaction } from "../lib/sources.ts";

  /** Qui a rédigé : « Rédaction : IA (Claude Opus 5.5), Étymon (correction suite à une Critique) ». */
  let { redaction }: { redaction: Redaction[] } = $props();
</script>

<p class="redaction">
  Rédaction&nbsp;: {redaction.map((r) => `${r.par} (${r.detail})`).join(", ")}
</p>

<style>
  .redaction {
    margin: 0.3rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.75rem;
    color: var(--texte-discret);
  }
</style>
