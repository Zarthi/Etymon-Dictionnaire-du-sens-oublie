# Relire une fiche d'après son dossier

> Généré par `npm run contrat` : ne pas modifier à la main. Étape de la rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu relis une fiche qu'une autre IA a rédigée ; tu ne la réécris pas. Lis `atelier/<id>/dossier.json` et `atelier/<id>/fiche.json`, et rien d'autre : le dossier tient lieu des sources.

## Trois critères, et rien d'autre

1. **dossier** : chaque affirmation de la fiche (forme, langue, sens, date, auteur, tenant, ce que l'explication dit de l'histoire du mot) est dans le dossier.
2. **justesse** : chaque phrase répond à « que veux-tu dire exactement ? » (AGENTS.md §3) ; chaque mot dans son sens propre, sans figure, sans effet, sans jargon ; l'explication dit ce qui s'est perdu, affaibli ou retourné, sans redire le sens affiché au-dessus.
3. **regle** : les règles que les scripts ne voient pas : le sens premier au bon maillon ; la règle d'arrêt ; étymologie et tradition distinctes ; aucune étymologie populaire dans la chaîne ; `renvois` vers des notions du même ordre, sans racine commune ; `tradition.renvois` seulement vers un mot que la tradition a lu ; `incertain` quand le dossier doute de la chaîne ; des `themes` qui disent le domaine où le mot s'emploie aujourd'hui ; aucune phrase qui fasse du sens ancien le « vrai » sens du mot.

Ne relève ni ce que les scripts vérifient (typographie, longueurs, identifiants, listes fermées), ni une préférence de style : seulement ce qui rend la fiche fausse, obscure ou contraire aux règles. `accepte` : aucune remarque. `a-reprendre` : les remarques qui obligent à changer la fiche, chacune avec ce qu'il faudrait écrire si tu le sais.

## Verdict

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `decision` | `accepte` \| `a-reprendre` | oui | a-reprendre : au moins une remarque qui oblige à changer la fiche. |
| `remarques` | liste d'objets (voir plus bas) | non |  |

### `remarques[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `critere` | `dossier` \| `justesse` \| `regle` | oui | dossier : affirmation absente du dossier ; justesse : phrase qui ne répond pas à « que veux-tu dire exactement ? » ; regle : règle éditoriale que les scripts ne voient pas. |
| `champ` | texte | oui | Champ visé (explication, etymologie.1.sens…). |
| `probleme` | texte | oui |  |
| `proposition` | texte | non | Ce qu'il faudrait écrire, si tu le sais. |
