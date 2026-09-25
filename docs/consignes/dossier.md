# Constituer le dossier d'un mot

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu rassembles les faits dont la fiche du mot sera tirée : elle n'affirmera rien qui n'y soit. Le dossier se relit en quelques secondes.

## Étapes

1. `npm run dossier -- <mot>` : crée `atelier/<id>/dossier.json`, avec les entrées du Littré local, et affiche le Littré, puis du TLFi le plan des sens et la rubrique « Étymologie et historique ».
2. Choisis le chemin et les drapeaux du mot (ci-dessous).
3. `usage` : ce que le mot désigne aujourd'hui, d'après le plan des sens du TLFi : les sens sans marque d'ancienneté, ou marqués « Moderne » ; pas un sens « Vieilli », « vx » ou « Littér. », qui n'est plus l'usage courant.
4. Les étapes du sens en français, datées, d'après la rubrique « Étymologie et historique » du TLFi : première attestation et changements de sens.
5. La chaîne jusqu'au sens premier, sans aller plus loin qu'il ne faut (AGENTS.md §3.2) : pour chaque maillon, la forme et la langue ; et, pour chaque maillon qui portera un sens, ce sens avec sa source. Le sens d'un étymon (et non du mot français) se prend au Littré ou au TLFi s'ils le glosent ; sinon au Gaffiot pour le latin (gaffiot.fr, dans le navigateur intégré), au Bailly pour le grec (`npm run texte -- bailly:φρήν`) : ils sont alors obligatoires. Un mot voisin (« déverbal de ennuyer ») est un maillon : consulte-le aussi (`npm run dossier -- --consulter ennuyer` ; si l'API n'a rien, cnrtl.fr/etymologie/<mot> dans le navigateur intégré).
6. Mot forgé : l'auteur, la date et l'ouvrage, tels que les sources les donnent. Origine débattue : chaque hypothèse, qui la défend, et qui la rapporte seulement. Doublet ou famille que les sources signalent (voy. CAPTIF) : un fait.
7. Écris `chemin`, `drapeaux`, `usage`, `faits`, `manques` et `notes` dans le fichier, puis `npm run dossier -- --verifier <mot>`.

## Règles

- Un fait est ce qu'une source dit, en une phrase à toi, avec l'ouvrage (identifiant de data/ouvrages : littre, tlfi, gaffiot, bailly…) et l'entrée consultée. Jamais de mémoire : ce que tu sais sans l'avoir lu va dans `notes`, comme une piste.
- Du Littré (domaine public), tu peux recopier. Du TLFi (non libre), du Gaffiot et du Bailly (CC BY-NC-ND), les faits seuls, reformulés.
- Jamais le Wiktionnaire (l'API du TLFi en contient une rubrique : l'ignorer), ni le Robert, ni Bloch et Wartburg, ni le FEW.
- Deux sources en désaccord (le Littré dépassé par le TLFi, deux étymons proposés) : les deux faits, chacun avec sa source ; la fiche suivra le plus récent, ou présentera l'origine comme débattue.
- Un « probablement » de la source reste un « probablement » dans le fait.
- Mot sacré (chemin `sacre`) : le texte d'origine, dans sa langue (Wikisource en hébreu : `npm run texte -- <adresse> --autour "<mot>"`), avec le livre, le chapitre et le verset où le mot paraît ou s'explique.
- Drapeau `tradition` : un auteur traditionnel a lu le mot lui-même, ou son étymon (Isidore, Augustin, Lactance, le Talmud…), et non la chose qu'il désigne aujourd'hui ; donne dans `notes` l'œuvre et le passage si tu les connais.
- Pas plus de faits qu'il n'en faut pour la fiche : douze au plus.

## Format de `atelier/<id>/dossier.json`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui |  |
| `chemin` | `ordinaire` \| `forge` \| `debattu` \| `recent` \| `sacre` \| `consacre` | oui | ordinaire : héritage ou emprunt ; forge : forgé par un auteur connu ; debattu : plusieurs hypothèses et leurs tenants ; recent : absent du Littré (après 1872) ; sacre : né dans l'ordre sacré (manne, sabbat) ; consacre : profane à l'origine, pris dans l'ordre sacré (église, ange). |
| `drapeaux` | liste de `tradition` \| `doute` \| `nom-propre` | non | tradition : une tradition a lu le mot lui-même (lectures à chercher) ; doute : doute sur le critère du §3.3 (la fiche est rédigée quand même) ; nom-propre : la chaîne passe par un nom de personne ou un titre. |
| `littre` | liste d'objets (voir plus bas) | oui | Entrées du Littré local, posées par npm run dossier (vide : mot absent du Littré). |
| `usage` | objet (voir plus bas) | oui | L'usage d'aujourd'hui : ce que le mot désigne maintenant, avec sa source (la définition du TLFi). |
| `faits` | liste non vide d'objets (voir plus bas) | oui | Ce que disent les sources consultées : la chaîne et le sens de chaque maillon qui en porte un, les étapes datées du sens en français. La rédaction n'affirme rien qui n'y soit. |
| `manques` | liste de textes | non | Sources inaccessibles, questions restées sans réponse. |
| `notes` | liste de textes | non | Doute sur le §3.3 et sa raison ; piste pour les lectures traditionnelles (auteur, œuvre, passage) ; ce que le modèle ne permet pas de dire. |

### `littre[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `terme` | texte | oui |  |
| `nature` | texte | non |  |
| `etymologie` | texte | oui |  |

### `usage`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `fait` | texte | oui | Un fait, en une phrase à toi : forme, langue, sens, date, auteur. Du Littré (domaine public), on peut recopier ; du TLFi, du Gaffiot, du Bailly, les faits seuls, jamais leur rédaction. |
| `source` | objet (voir plus bas) | oui | Ouvrage consulté. |

### `usage.source`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Ouvrage consulté (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Entrée consultée (« étonner », « adtono », « φρήν »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https), seulement si elle ne se déduit pas de l'entrée. |

### `faits[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `fait` | texte | oui | Un fait, en une phrase à toi : forme, langue, sens, date, auteur. Du Littré (domaine public), on peut recopier ; du TLFi, du Gaffiot, du Bailly, les faits seuls, jamais leur rédaction. |
| `source` | objet (voir plus bas) | oui | Ouvrage consulté. |

### `faits[].source`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Ouvrage consulté (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Entrée consultée (« étonner », « adtono », « φρήν »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https), seulement si elle ne se déduit pas de l'entrée. |

Chemins : ordinaire, forge, debattu, recent, sacre, consacre. Drapeaux : tradition, doute, nom-propre.
