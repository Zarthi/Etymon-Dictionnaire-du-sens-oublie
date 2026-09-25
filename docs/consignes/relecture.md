# Relire un lot

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu relis des fiches qu'un autre agent a rédigées ; tu ne les réécris pas. Pour chaque mot, lis `atelier/<id>/dossier.json` et `atelier/<id>/fiche.json`, et rien d'autre : le dossier tient lieu des sources. Écris ton verdict dans `atelier/<id>/verdict.json`, puis `npm run dossier -- --verifier <mot>` le contrôle.

## Trois critères, et rien d'autre

1. **dossier** : chaque affirmation de la fiche (forme, langue, sens, date, auteur, tenant, ce que l'explication dit de l'histoire du mot et de son usage d'aujourd'hui) est dans le dossier ; et la chaîne suit le dossier maillon par maillon.
2. **justesse** : chaque phrase répond à « que veux-tu dire exactement ? » (AGENTS.md §3) ; chaque mot dans son sens propre, sans figure, sans effet, sans jargon ; l'explication dit ce qui s'est perdu, affaibli ou retourné, sans redire le sens affiché au-dessus.
3. **regle** : les règles que les scripts ne voient pas : le sens premier au bon maillon ; la règle d'arrêt ; étymologie et tradition distinctes ; aucune étymologie populaire dans la chaîne ; `renvois` vers des notions du même ordre, sans racine commune, et pas un mot déjà nommé dans l'explication ; `tradition.renvois` seulement vers un mot que la tradition a lu ; `incertain` quand le dossier doute de la chaîne ; des `themes` qui disent le domaine où le mot s'emploie aujourd'hui ; aucune phrase qui fasse du sens ancien le « vrai » sens du mot ; une composition découpée du tout vers les parties, le sens du tout pris dans le dossier et non déduit des parties.

Ne relève ni ce que les scripts vérifient (typographie, longueurs, identifiants, listes fermées), ni une préférence de style : seulement ce qui rend la fiche fausse, obscure ou contraire aux règles. `accepte` : aucune remarque. `a-reprendre` : les remarques qui obligent à changer la fiche, chacune avec, si tu le sais, la phrase à écrire telle quelle, tirée du dossier : le rédacteur l'adoptera sans la reformuler.

## Seconde passe : les reprises et les lectures

Après la reprise, relis seulement :

- pour chaque remarque de ton premier verdict, si elle est réglée ; et si ce que le rédacteur a changé n'affirme rien hors du dossier ;
- les lectures traditionnelles ajoutées (`tradition.lectures` de la fiche écrite dans data/) : le texte dit ce que la citation dit, sans rien lui prêter ; la voix est la bonne ; la citation vient d'un texte original.

Ne rouvre pas ce que tu avais accepté. Réécris `atelier/<id>/verdict.json` avec ce qui reste ouvert, ou `accepte`.

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
