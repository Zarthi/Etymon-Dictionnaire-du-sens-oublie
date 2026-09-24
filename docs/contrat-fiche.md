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
| `reconstruit` | `true` \| `false` | oui | true si et seulement si l'étymon commence par `*`. |
| `langue` | liste fermée (voir plus bas) | oui | Langue source directe de l'étymon (liste fermée : data/langues.json). |
| `sens` | texte | oui | Sens de l'étymon, sans guillemets (l'app les ajoute). |
| `explication` | texte | oui | 1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens ; italique avec `_…_`. |
| `legende` | texte | non | Étymologie populaire démentie (« On dit souvent… »). |
| `incertain` | `true` \| `false` | oui | L'étymon lui-même est douteux (pour une origine plus ancienne débattue : racine.incertain). |
| `racine` | objet (voir plus bas) ou null | non | Origine plus ancienne, seulement si elle apporte un sens que l'étymon n'a pas. |
| `doublets` | liste de textes | oui | Identifiants des fiches issues du même étymon par une autre voie (relation réciproque). |
| `famille` | liste de textes | oui | Mots français apparentés. |
| `themes` | liste de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json). |
| `sources` | liste d'objets (voir plus bas) | oui | Ouvrages consultés pour l'étymologie ; au moins un hors statut a-verifier. |
| `redaction` | liste non vide d'objets (voir plus bas) | oui | Qui a rédigé la fiche ; affiché une fois, en pied de fiche. |
| `lecturesTraditionnelles` | liste d'objets (voir plus bas) | oui | Lectures traditionnelles, une par tradition (souvent aucune). |
| `statut` | `a-verifier` \| `brouillon` \| `validee` | oui | a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault. |
| `historique` | liste d'objets (voir plus bas) | oui | Corrections successives (ex. suite à une Critique). |

### `racine`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme plus ancienne que l'étymon. |
| `graphie` | texte | non | Écriture d'origine si l'alphabet n'est pas latin (ἀνάλυσις, صفر) ; la forme en garde la translittération. |
| `langue` | texte | oui | Langue de cette forme (indo-européen, grec ancien, arabe…). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets. |
| `incertain` | `true` \| `false` | non | Origine de l'étymon débattue : la racine n'est qu'une hypothèse. |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | `Littré` \| `Gaffiot` \| `Bailly` \| `TLFi` | oui | Ouvrage consulté (liste fermée : data/sources.json). |
| `entree` | texte | oui | Entrée consultée dans l'ouvrage (ex. « étonner », « adtono »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https) de l'entrée consultée en ligne. |

### `redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

### `lecturesTraditionnelles[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `texte` | texte | oui | Paraphrase de la lecture, sans commencer par le nom de l'auteur ; italique avec `_…_`. |
| `citation` | texte | non | Texte original de l'auteur, dans sa langue. |
| `auteur` | `Platon` \| `Varron` \| `Cicéron` \| `Lactance` \| `Augustin` \| `Isidore de Séville` \| `Thomas d'Aquin` \| `René Guénon` | oui | Auteur de la tradition (liste fermée : data/auteurs.json). |
| `sources` | liste d'objets (voir plus bas) | oui | Œuvres consultées. Vide : la lecture repose sur sa seule rédaction (signalé par npm run etat si c'est l'IA). |
| `redaction` | liste non vide d'objets (voir plus bas) | non | Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche. |

### `lecturesTraditionnelles[].sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | liste fermée (voir plus bas) | oui | Œuvre de l'auteur (liste fermée : data/auteurs.json). |
| `entree` | texte | oui | Passage précis (ex. « IV, 28, 3 »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https) de l'entrée consultée en ligne. |

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
- Lectures traditionnelles, `auteur` et œuvres (data/auteurs.json) :
  - Platon : *Cratyle*.
  - Varron : *De la langue latine*.
  - Cicéron : *De la nature des dieux*.
  - Lactance : *Institutions divines*.
  - Augustin : *La Cité de Dieu*, *De la vraie religion*, *Rétractations*, *Confessions*.
  - Isidore de Séville : *Étymologies*.
  - Thomas d'Aquin : *Somme théologique*.
  - René Guénon : *Introduction générale à l'étude des doctrines hindoues*, *La Crise du monde moderne*, *Le Règne de la quantité et les signes des temps*, *Aperçus sur l'initiation*, *Symboles de la Science sacrée*.

## Règles vérifiées en plus de la structure (`npm run valider`)

- Le fichier s'appelle `<id>.yaml`, où `id` est le mot sans accent, en minuscules, mots séparés par des tirets (`-2`, `-3` pour les homonymes), rangé dans `data/fiches/<initiale>/<deux premières lettres>/`.
- `reconstruit` vaut `true` si et seulement si `etymon` commence par `*` ; une valeur commençant par `*` ou contenant `: ` s'écrit entre guillemets.
- `doublets` : chaque fiche citée existe et cite la fiche en retour.
- `explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus (balisage exclu).
- Typographie française dans `sens`, `explication`, `legende`, les lectures et l'historique : guillemets « », espace insécable avant `:` `;` `?` `!`.
- Italique avec `_…_` dans `explication`, `legende` et les lectures traditionnelles ; un `_` isolé est refusé. Les liens entre fiches sont posés automatiquement par l'app.
- Hors statut `a-verifier`, `sources` contient au moins un ouvrage consulté.
- Aucun alias YAML, aucune clé en double, aucun champ inconnu.
