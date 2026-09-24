<script lang="ts">
  import { dateLongue } from "../lib/affichage.ts";
  import { formesItaliques } from "../lib/etymologie.ts";
  import { auteurs as fichesAuteurs } from "../lib/fiches.ts";
  import { lienAuteur } from "../lib/liens.ts";
  import { signatureRedaction } from "../lib/sources.ts";
  import type { FicheIdentifiee } from "../lib/types.ts";
  import Etymologie from "./Etymologie.svelte";
  import Forme from "./Forme.svelte";
  import LectureTraditionnelle from "./LectureTraditionnelle.svelte";
  import Redaction from "./Redaction.svelte";
  import SensPremier from "./SensPremier.svelte";
  import Sources from "./Sources.svelte";
  import Statut from "./Statut.svelte";
  import TexteRiche from "./TexteRiche.svelte";

  let {
    fiche,
    deplierLectures,
    lienVers,
    motDe,
  }: {
    fiche: FicheIdentifiee;
    deplierLectures: boolean;
    lienVers: (id: string) => string | undefined;
    motDe: (id: string) => string;
  } = $props();

  const correction = $derived(fiche.historique.at(-1));
  const lectures = $derived(fiche.lecturesTraditionnelles);
  /** Auteurs des lectures, sans doublon, pour l'intitulé replié : « Lactance, Augustin, Isidore de Séville ». */
  const auteurs = $derived([...new Set(lectures.map((l) => fichesAuteurs.get(l.auteur)?.nom ?? l.auteur))].join(", "));
  /** Rédaction de la fiche, affichée une fois en pied ; une lecture ne la rappelle que si la sienne diffère. */
  const redactionFiche = $derived(signatureRedaction(fiche.redaction));
  /** Formes étrangères de la fiche, mises en italique dans ses textes (aucune mise en forme dans les données). */
  const formes = $derived(formesItaliques(fiche));
</script>

<svelte:head>
  <title>{fiche.mot} · Étymon</title>
</svelte:head>

<article>
  <Statut statut={fiche.statut} />

  <h1>{fiche.mot}</h1>
  <p class="nature">{fiche.nature.join(" et ")}</p>
  <p class="etymon">
    <SensPremier etymologie={fiche.etymologie} />
    {#if fiche.incertain}<span class="incertain">· étymologie incertaine</span>{/if}
  </p>

  <p class="explication"><TexteRiche texte={fiche.explication} {lienVers} exclu={fiche.id} {formes} /></p>

  <Etymologie etymologie={fiche.etymologie} />

  {#each fiche.ecartees as e, i (i)}
    <!-- Idée reçue (populaire) ou hypothèse savante abandonnée : présentée, jamais confondue avec l'étymologie. -->
    <p class="legende">
      <strong>{e.populaire ? "Idée reçue" : "Étymologie écartée"}</strong>&nbsp;: <Forme
        forme={e.forme}
        translitteration={e.translitteration}
      />, «&nbsp;{e.sens}&nbsp;»{#if e.selon?.length}{" "}({#each e.selon as id, j (id)}{#if j > 0},{" "}{/if}<a
            href={lienAuteur(id)}>{fichesAuteurs.get(id)?.nom ?? id}</a
          >{/each}){/if}.
      {#if e.raison}<TexteRiche texte={e.raison} {lienVers} exclu={fiche.id} {formes} />{/if}
    </p>
  {/each}

  {#if fiche.renvois.length > 0}
    <!-- Notions voisines, sans racine commune : « Voir aussi : obsession ». -->
    <p class="renvois">
      <strong>Voir aussi</strong>&nbsp;: {#each fiche.renvois as id, i (id)}{#if i > 0},{" "}{/if}<a href={lienVers(id)}
          >{motDe(id)}</a
        >{/each}.
    </p>
  {/if}

  <Sources sources={fiche.sources} />

  {#if lectures.length > 0}
    <!-- Toujours signalées, repliées par défaut : l'étymologie d'abord, la tradition à côté. -->
    <details class="traditions" open={deplierLectures}>
      <summary>
        <span class="intitule">{lectures.length > 1 ? "Lectures traditionnelles" : "Lecture traditionnelle"}</span>
        <span class="auteurs">{auteurs}</span>
      </summary>
      {#each lectures as lecture, i (i)}
        <LectureTraditionnelle {lecture} {lienVers} exclu={fiche.id} {redactionFiche} {formes} />
      {/each}
    </details>
  {/if}

  <footer>
    <Redaction redaction={fiche.redaction} />
    {#if correction}
      <p>Corrigée le {dateLongue(correction.date)}.</p>
    {/if}
    <button type="button" disabled title="En construction">
      Critique&nbsp;: signaler une erreur <small>(en construction)</small>
    </button>
  </footer>
</article>

<style>
  article {
    font-family: var(--police-fiche);
  }
  .nature {
    margin: 0.2rem 0 0;
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-style: italic;
    color: var(--texte-discret);
  }
  .renvois {
    margin: 1rem 0 0;
    color: var(--texte-discret);
  }
  .renvois strong {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-weight: 600;
  }
  .renvois a {
    color: inherit;
  }
  .legende {
    margin: 1rem 0 0;
    padding-left: 0.7rem;
    border-left: 2px solid var(--bordure);
    color: var(--texte-discret);
  }
  .legende a {
    color: inherit;
  }
  .legende strong {
    font-family: var(--police-interface);
    font-size: 0.85rem;
    font-weight: 600;
  }
  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 8vw, 3rem);
    font-weight: normal;
    line-height: 1.1;
  }
  .etymon {
    margin: 0.5rem 0 1.25rem;
    font-size: 1.25rem;
  }

  .explication {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.6;
  }
  .traditions {
    margin-top: 1.75rem;
    padding: 0.9rem 1rem;
    border-left: 3px solid var(--tradition);
    background: var(--surface);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  summary {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.2rem 0.6rem;
    cursor: pointer;
    list-style: none;
    font-family: var(--police-interface);
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary::after {
    content: "▸";
    margin-left: auto;
    color: var(--tradition);
    transition: transform 0.15s;
  }
  .traditions[open] summary {
    margin-bottom: 0.6rem;
  }
  .traditions[open] summary::after {
    transform: rotate(90deg);
  }
  .intitule {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tradition);
  }
  .auteurs {
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  .incertain {
    font-family: var(--police-interface);
    font-size: 0.8rem;
    font-style: italic;
    color: var(--texte-discret);
    white-space: nowrap;
  }
  footer {
    margin-top: 2rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bordure);
    font-family: var(--police-interface);
    font-size: 0.85rem;
    color: var(--texte-discret);
  }
  footer p {
    margin: 0 0 0.5rem;
  }
  button {
    margin-top: 0.25rem;
    font: inherit;
    padding: 0.35rem 0.7rem;
    color: var(--texte-discret);
    background: none;
    border: 1px dashed var(--bordure);
    border-radius: 0.4rem;
    cursor: not-allowed;
  }
</style>
