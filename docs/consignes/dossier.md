# Constituer le dossier d'un mot

> Généré par `npm run contrat` : ne pas modifier à la main. Étape de la rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu rassembles les faits dont une autre IA tirera la fiche du mot ; tu ne rédiges pas la fiche. Le dossier se relit en quelques secondes.

## Étapes

1. `npm run dossier -- <mot>` : crée `atelier/<id>/dossier.json`, avec les entrées du Littré local, et affiche le Littré et l'étymologie du TLFi.
2. Choisis le chemin et les drapeaux du mot (ci-dessous).
3. Remonte la chaîne jusqu'au sens premier, sans aller plus loin qu'il ne faut (AGENTS.md §3.2) : pour chaque maillon, la forme, la langue et le sens, chacun avec l'ouvrage et l'entrée qui le donnent. Sens d'un étymon latin : Gaffiot (gaffiot.fr, dans le navigateur intégré), seulement si ni le Littré ni le TLFi ne le donnent ; grec : Bailly (`npm run texte -- bailly:φρήν`). Un mot voisin (« déverbal de ennuyer ») : `npm run dossier -- --consulter ennuyer`.
4. Mot forgé : l'auteur, la date et l'ouvrage, tels que les sources les donnent. Origine débattue : chaque hypothèse, qui la défend, et qui la rapporte seulement. Étymologie populaire connue : ce qu'en disent les sources.
5. Écris `chemin`, `drapeaux`, `faits`, `manques` et `notes` dans le fichier, puis `npm run dossier -- --verifier <mot>`.

## Règles

- Un fait est ce qu'une source dit, en une phrase à toi, avec l'ouvrage (identifiant de data/ouvrages : littre, tlfi, gaffiot, bailly…) et l'entrée consultée. Jamais de mémoire : ce que tu sais sans l'avoir lu va dans `notes`, comme une piste.
- Du Littré (domaine public), tu peux recopier. Du TLFi (non libre), du Gaffiot et du Bailly (CC BY-NC-ND), les faits seuls, reformulés.
- Jamais le Wiktionnaire (l'API du TLFi en contient une rubrique : l'ignorer), ni le Robert, ni Bloch et Wartburg, ni le FEW.
- Une étymologie du Littré dépassée par le TLFi : les deux faits, avec leur source ; la rédaction suivra le plus récent.
- Mot sacré (chemin `sacre`) : le texte d'origine, dans sa langue (Wikisource en hébreu : `npm run texte -- <adresse> --autour "<mot>"`), avec le livre, le chapitre et le verset où le mot paraît ou s'explique.
- Drapeau `tradition` : un auteur traditionnel a lu le mot lui-même, ou son étymon (Isidore, Augustin, Lactance, le Talmud…), et non la chose qu'il désigne aujourd'hui ; donne dans `notes` l'œuvre et le passage si tu les connais : la passe des lectures les cherchera.
- Pas plus de faits qu'il n'en faut pour la fiche : dix au plus.

## Format de `atelier/<id>/dossier.json`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui |  |
| `chemin` | `ordinaire` \| `forge` \| `debattu` \| `recent` \| `sacre` \| `consacre` | oui | ordinaire : héritage ou emprunt ; forge : forgé par un auteur connu ; debattu : plusieurs hypothèses et leurs tenants ; recent : absent du Littré (après 1872) ; sacre : né dans l'ordre sacré (manne, sabbat) ; consacre : profane à l'origine, pris dans l'ordre sacré (église, ange). |
| `drapeaux` | liste de `tradition` \| `doute` \| `nom-propre` | non | tradition : une tradition a lu le mot lui-même (lectures à chercher) ; doute : doute sur le critère du §3.3 (la fiche est rédigée quand même) ; nom-propre : la chaîne passe par un nom de personne ou un titre. |
| `littre` | liste d'objets (voir plus bas) | oui | Entrées du Littré local, posées par npm run dossier (vide : mot absent du Littré). |
| `faits` | liste non vide d'objets (voir plus bas) | oui | Ce que disent les sources consultées ; la rédaction n'affirme rien qui n'y soit. |
| `manques` | liste de textes | non | Sources inaccessibles, questions restées sans réponse. |
| `notes` | liste de textes | non | Doute sur le §3.3 et sa raison ; piste pour les lectures traditionnelles (auteur, œuvre, passage) ; ce que le modèle ne permet pas de dire. |

### `littre[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `terme` | texte | oui |  |
| `nature` | texte | non |  |
| `etymologie` | texte | oui |  |

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
