# Relire un lot

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu relis des fiches qu'un autre agent a rédigées ; tu ne les réécris pas. Pour chaque mot, lis `atelier/<id>/dossier.json` et `atelier/<id>/fiche.json`, et l'étymologie brute du mot (`npm run dossier -- --consulter <mot>`) pour vérifier le dossier ; le dossier tient lieu des autres sources. Si `atelier/<id>/sources.md` existe, il tient lieu de l'étymologie brute : confronte-y le dossier sans refaire les consultations. Écris ton verdict dans `atelier/<id>/verdict.json`, puis `npm run dossier -- --verifier <mot>` le contrôle.

## Trois critères, et rien d'autre

1. **dossier** : chaque affirmation de la fiche (forme, langue, sens, date, auteur, tenant, ce que l'explication dit de l'histoire du mot et de son usage d'aujourd'hui) est dans le dossier ; et la chaîne suit le dossier maillon par maillon. Le dossier lui-même est fidèle à ses sources : confronte-le à l'étymologie brute (`npm run dossier -- --consulter <mot>` affiche le Littré et le TLFi) ; une infidélité du dossier (fait absent, déformé ou mal daté) est une remarque « dossier ».
2. **justesse** : chaque phrase répond à « que veux-tu dire exactement ? » (AGENTS.md §3) ; chaque mot dans son sens propre, sans figure, sans effet, sans jargon ; l'explication dit ce qui s'est perdu, affaibli ou retourné, sans redire le sens affiché au-dessus.
3. **regle** : les règles que les scripts ne voient pas : le sens premier au bon maillon ; la règle d'arrêt ; étymologie et tradition distinctes ; aucune étymologie populaire dans la chaîne ; `renvois` vers des notions du même ordre, sans racine commune, et pas un mot déjà nommé dans l'explication ; `tradition.renvois` seulement vers un mot que la tradition a lu ; `incertain` quand le dossier doute de la chaîne ; des `themes` qui disent le domaine où le mot s'emploie aujourd'hui ; aucune phrase qui fasse du sens ancien le « vrai » sens du mot ; une composition découpée du tout vers les parties, le sens du tout pris dans le dossier et non déduit des parties.

Ne relève ni ce que les scripts vérifient (typographie, longueurs, identifiants, listes fermées), ni une préférence de style : seulement ce qui rend la fiche fausse, obscure ou contraire aux règles. `accepte` : aucune remarque. `a-reprendre` : les remarques qui obligent à changer la fiche. Quand tu sais exactement ce qu'il faut écrire, donne un `remplacement` : `npm run lot -- reprendre` l'applique à `fiche.json` sans agent ; sans `remplacement`, la remarque va au rédacteur, qui adopte ta `proposition` quand elle est juste.

Un `remplacement` est `{ champ, valeur }` : `champ` est un chemin dans `atelier/<id>/fiche.json`, séparé par des points, un rang pour un élément de liste (`explication`, `etymologie.1.sens`, `tradition.lectures.0.texte`, `renvois`) ; `valeur` est le JSON exact à y mettre, texte entre guillemets, liste ou objet ; `null` retire le champ ou l'élément de liste. Les remplacements s'appliquent dans l'ordre : après un `null` sur un élément de liste, les rangs suivants se décalent. Ne donne que le texte tel qu'il doit paraître, tiré du dossier ; la typographie est posée par le script.

## Seconde passe : le vérificateur

Après `npm run lot -- reprendre`, un autre agent (le vérificateur) ne relit que ce qui a changé, dans `atelier/<id>/fiche.json` :

- chaque remarque `appliquee` de `verdict.json` : ce que le remplacement a changé n'affirme rien hors du dossier, et répond à la remarque ;
- les lectures traditionnelles (`tradition.lectures`) : le texte ne dit rien de plus que sa citation ; la voix est la bonne ; la citation vient d'un texte original. Les scripts vérifient la citation mot pour mot (`npm run verifier:en-ligne`, à la clôture) : n'y revenir que si le passage cité ne dit pas ce que le texte lui fait dire ;
- pour un mot au drapeau `tradition`, le `corpus` du dossier : chaque œuvre du corpus de réflexe a été consultée (`npm run dossier -- --verifier <mot>` dit celles qui manquent) ; un passage ★ de `sources.md` écarté l'a été avec raison.

Ne rouvre pas ce que le premier relecteur avait accepté. Réécris `atelier/<id>/verdict.json` : `accepte` si tout est réglé ; sinon `a-reprendre`, avec seulement les remarques restées ouvertes (les remarques `appliquee` n'y figurent plus), chacune avec son `remplacement` quand tu sais la phrase. Une remarque ouverte à ce stade ne relance pas de boucle : le rédacteur la règle si elle est simple, sinon la fiche reste dans l'atelier.

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
| `remplacement` | objet (voir plus bas) | non | Quand tu sais exactement ce qu'il faut écrire : `npm run lot -- reprendre` l'applique à la fiche, sans agent. |
| `statut` | texte | non | Posé par `npm run lot -- reprendre` : le remplacement est appliqué à la fiche. Tu ne l'écris jamais. |

### `remarques[].remplacement`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `champ` | texte | oui | Chemin dans atelier/<id>/fiche.json, séparé par des points, un rang pour une liste : explication, etymologie.2.sens, tradition.lectures.1.texte, renvois. |
| `valeur` | JSON | oui | Le JSON exact à y mettre (un texte entre guillemets, une liste, un objet) ; null retire le champ ou l'élément de liste. |
