# Contrat de données : la fiche

> Généré par `npm run contrat` à partir de `src/lib/schema.ts` : ne pas modifier à la main.
> Le même contrat existe en schéma JSON (`docs/fiche.schema.json`), utilisé par VS Code
> pour l'autocomplétion et la vérification des fiches pendant la saisie.

Une fiche est un fichier YAML. Exemple complet : `data/fiches/r/re/religion.yaml`.

## Champs

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui | Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent). |
| `nature` | liste non vide de `nom masculin` \| `nom féminin` \| `nom` \| `verbe` \| `adjectif` \| `adverbe` \| `interjection` | oui | Catégorie(s) grammaticale(s) ; « nom » pour les épicènes. |
| `etymon` | texte | oui | Forme source, dans la langue source directe ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `graphie` | texte | non | Écriture d'origine si l'alphabet n'est pas latin (ἀνάλυσις, صفر) ; la forme en garde la translittération. |
| `langue` | liste fermée (voir plus bas) | oui | Langue source directe de l'étymon (liste fermée : data/langues.json). |
| `forge` | objet (voir plus bas) | non | Mot savant forgé par un auteur connu : qui, et quand. |
| `sens` | texte | oui | Sens de l'étymon, sans guillemets (l'app les ajoute). Pour un mot forgé ou composé, le sens littéral de ses éléments ; l'intention de l'auteur va dans l'explication. |
| `explication` | texte | oui | 1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens. Texte brut : l'étymon et les formes d'origine y sont mis en italique par l'app. |
| `legende` | objet (voir plus bas) | non | Étymologie populaire démentie. |
| `incertain` | `true` \| `false` | non | L'étymon lui-même est douteux (une origine débattue relève de origine.mode). Faux si absent. |
| `origine` | objet (voir plus bas) | non | D'où vient l'étymon, ou ancêtre plus ancien qui ajoute du sens. |
| `doublets` | liste de textes | non | Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches. |
| `famille` | liste de textes | non | Mots français apparentés, de la même racine. |
| `themes` | liste de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json). |
| `sources` | liste d'objets (voir plus bas) | non | Ouvrages consultés pour l'étymologie ; au moins un hors statut a-verifier. Ajoutés par npm run verifier ou à la main, jamais de mémoire. |
| `redaction` | liste non vide d'objets (voir plus bas) | oui | Qui a rédigé la fiche ; affiché une fois, en pied de fiche. Écrit par npm run rediger. |
| `lecturesTraditionnelles` | liste d'objets (voir plus bas) | non | Lectures traditionnelles, rédigées dans une passe à part, texte source sous les yeux (souvent aucune). |
| `statut` | `a-verifier` \| `brouillon` \| `validee` | oui | a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault. |
| `historique` | liste d'objets (voir plus bas) | non | Corrections successives (ex. suite à une Critique). |

### `forge`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | texte | oui | Qui a forgé le mot (« Eugen Bleuler »). |
| `annee` | nombre | oui | Année de la création, selon la source consultée. |

### `legende`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme alléguée à tort (ex. « sine cera »). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets (ex. « sans cire »). |
| `explication` | texte | non | Pourquoi c'est une légende, en une phrase. |

### `origine`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mode` | `filiation` \| `composition` \| `debattue` | non | filiation (défaut) : l'étymon vient de ces formes, l'une de l'autre ; composition : il est formé de ces éléments ; debattue : plusieurs hypothèses, la plus suivie en premier. |
| `formes` | liste non vide d'objets (voir plus bas) | oui | Formes d'origine, dans l'ordre de lecture. |

### `origine.formes[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme d'origine ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `graphie` | texte | non | Écriture d'origine si l'alphabet n'est pas latin (ἀνάλυσις, صفر) ; la forme en garde la translittération. |
| `langue` | texte | oui | Langue de cette forme (latin, grec ancien, arabe, indo-européen…). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets. |
| `selon` | liste de `Platon` \| `Varron` \| `Cicéron` \| `Lactance` \| `Augustin` \| `Isidore de Séville` \| `Thomas d'Aquin` \| `René Guénon` | non | Origine débattue seulement : qui a proposé ou défend cette hypothèse (data/auteurs.json). Un ouvrage qui la rapporte n'en est pas tenant : il figure dans sources. |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | `Littré` \| `Gaffiot` \| `Bailly` \| `TLFi` | oui | Ouvrage consulté (liste fermée : data/sources.json). |
| `entree` | texte | oui | Entrée consultée dans l'ouvrage (« étonner », « adtono », « φρήν »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https) de l'entrée, seulement si elle ne se déduit pas de l'entrée. |

### `redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

### `lecturesTraditionnelles[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `texte` | texte | oui | Sens que la doctrine donne au mot, sans commencer par le nom de l'auteur ni répéter l'hypothèse étymologique. |
| `citation` | texte | oui | Texte original de l'auteur, dans sa langue, tel qu'il figure à l'adresse de la source ([…] pour une coupe). |
| `auteur` | `Platon` \| `Varron` \| `Cicéron` \| `Lactance` \| `Augustin` \| `Isidore de Séville` \| `Thomas d'Aquin` \| `René Guénon` | oui | Auteur de la tradition (data/auteurs.json, rôle tradition). |
| `hypothese` | texte | non | Forme d'origine (origine.formes) sur laquelle repose la lecture : le texte n'a pas à la répéter. |
| `sources` | liste non vide d'objets (voir plus bas) | oui | Œuvres de l'auteur consultées. |
| `redaction` | liste non vide d'objets (voir plus bas) | non | Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche. |

### `lecturesTraditionnelles[].sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | liste fermée (voir plus bas) | oui | Œuvre de l'auteur (liste fermée : data/auteurs.json). |
| `entree` | texte | oui | Passage précis (ex. « IV, 28, 3 »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | oui | Adresse (https) du texte original, du domaine public : npm run verifier:en-ligne y cherche la citation. |

### `lecturesTraditionnelles[].redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

### `historique[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `date` | date AAAA-MM-JJ | oui | Date au format AAAA-MM-JJ. |
| `note` | texte | oui | Nature de la correction. |

## Listes fermées

- `nature` : nom masculin, nom féminin, nom, verbe, adjectif, adverbe, interjection.
- `langue` (data/langues.json) : latin, latin populaire, bas latin, latin médiéval, latin ecclésiastique, ancien français, grec ancien, gaulois, francique, germanique, ancien nordique, arabe, hébreu, persan, turc, italien, espagnol, portugais, occitan, néerlandais, allemand, anglais.
- `themes` (data/themes.json) : émotions, esprit, parole, savoir, morale, religion, corps, santé, famille, société, droit, guerre, travail, argent, commerce, nourriture, maison, nature, météo, temps.
- `sources[].ouvrage` (data/sources.json) : Littré, Gaffiot, Bailly, TLFi.
- `redaction[].par` : IA, Étymon.
- Auteurs (data/auteurs.json) : tenants d'une hypothèse (`origine.formes[].selon`) ; ceux de la tradition signent aussi les lectures, avec leurs œuvres :
  - Platon (tradition) : *Cratyle*.
  - Varron (tradition) : *De la langue latine*.
  - Cicéron (tradition) : *De la nature des dieux*.
  - Lactance (tradition) : *Institutions divines*.
  - Augustin (tradition) : *La Cité de Dieu*, *De la vraie religion*, *Rétractations*, *Confessions*.
  - Isidore de Séville (tradition) : *Étymologies*.
  - Thomas d'Aquin (tradition) : *Somme théologique*.
  - René Guénon (tradition) : *Introduction générale à l'étude des doctrines hindoues*, *La Crise du monde moderne*, *Le Règne de la quantité et les signes des temps*, *Aperçus sur l'initiation*, *Symboles de la Science sacrée*.

## Règles vérifiées en plus de la structure (`npm run valider`)

- Le fichier s'appelle `<id>.yaml`, où `id` est le mot sans accent, en minuscules, mots séparés par des tirets (`-2`, `-3` pour les homonymes), rangé dans `data/fiches/<initiale>/<deux premières lettres>/`.
- Un étymon reconstruit commence par `*` (c'est ce qui le dit reconstruit) ; une valeur commençant par `*` ou contenant `: ` s'écrit entre guillemets.
- Pas de doublon : un doublet se déclare sur une seule des deux fiches (l'app l'affiche des deux côtés) ; l'adresse d'un ouvrage en ligne se déduit de l'entrée et ne s'écrit pas (Bailly : entrée en grec, adresse translittérée).
- Un champ facultatif à sa valeur par défaut ne s'écrit pas (`incertain: false`, listes vides, `mode: filiation`).
- `origine.formes[].selon` : seulement pour une origine débattue ; un ouvrage qui rapporte une hypothèse n'en est pas le tenant.
- `lecturesTraditionnelles[].hypothese` : une forme de `origine.formes`.
- Les textes sont bruts, sans mise en forme : l'app met en italique l'étymon, les formes d'origine et la forme légendaire, et pose les liens vers les autres fiches.
- `explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus.
- Typographie française dans les sens, l'explication, la légende, les lectures et l'historique : guillemets « », espace insécable avant `:` `;` `?` `!` ; les sens s'écrivent sans guillemets.
- Une œuvre citée par une lecture traditionnelle appartient à l'auteur de la lecture ; sa citation figure mot pour mot à l'adresse de la source (`npm run verifier:en-ligne`).
- Hors statut `a-verifier`, `sources` contient au moins un ouvrage consulté.
- Aucun alias YAML, aucune clé en double, aucun champ inconnu.
