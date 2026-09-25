# La langue de l'application

> Évolution future. L'architecture y est prête ; ajouter une langue reste à décider.
> [Retour aux évolutions](README.md).

Deux axes à ne pas confondre :

- **la langue du dictionnaire** : quels mots il explique (le français aujourd'hui ; l'hébreu et
  l'arabe peut-être, voir [les dictionnaires ouverts](dictionnaires-ouverts.md)) ;
- **la langue de l'application** : en quelle langue s'affiche tout le reste. Le français, pour tous
  les dictionnaires ; un jour peut-être une autre.

## Ce qui est prêt

La langue de l'application se choisit en un seul endroit, `src/i18n/index.ts`. Chaque langue fournit
un module de même forme que `src/i18n/fr.ts`, vérifié par TypeScript, en trois parts :

| Part | Pattern | Ce qu'elle contient |
|---|---|---|
| Messages | catalogue typé | tous les textes de l'interface, avec leurs accords (« Lecture traditionnelle » / « Lectures traditionnelles ») |
| Grammaire | Strategy | ce qui compose une phrase selon la langue : « du latin », « de l'italien », élisions, guillemets, deux-points, énumérations, dates |
| Libellés | table de correspondance | le nom affiché des valeurs des listes fermées (langues, thèmes, natures, traditions…), dont les identifiants ne changent pas |

La phrase de la chaîne étymologique est composée par une fonction pure (`src/lib/phrase.ts`, pattern
Builder), qui produit des segments mis en mots par la grammaire : une autre langue change la phrase,
pas ce code. `index.html` et le manifeste prennent aussi leurs textes dans `src/i18n/`. Aucun texte
affiché n'est écrit en dur dans un composant.

## Ce qui resterait à faire

1. **Écrire le module de la langue** : ses messages, sa grammaire, ses libellés.
2. **Traduire le contenu des fiches**, le plus lourd : un travail de rédaction, non de code. Chaque
   champ est soit neutre (identifiant, forme d'origine, langue, date, référence), soit du texte en
   français (sens, explication, texte d'une lecture, description) : le texte se traduirait par un
   calque par langue, posé sur le noyau neutre de chaque fiche, le français servant de repli.
3. **Repenser les noms Merci et Critique**, choisis pour leur étymologie française (*merces*,
   *kritikós*).

## La règle qui garde la porte ouverte

Une décision qui fermerait cette porte se discute d'abord : un texte affiché en dur, une phrase
composée dans un gabarit, un champ mêlant le neutre et le texte.
