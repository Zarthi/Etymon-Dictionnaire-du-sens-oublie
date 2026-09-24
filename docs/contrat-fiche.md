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
| `sens` | texte | oui | Sens de l'étymon, sans guillemets (l'app les ajoute). |
| `explication` | texte | oui | 1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens. Texte brut : l'étymon et les formes d'origine y sont mis en italique par l'app. |
| `legende` | objet (voir plus bas) | non | Étymologie populaire démentie. |
| `incertain` | `true` \| `false` | oui | L'étymon lui-même est douteux (une origine débattue relève de origine.debattue). |
| `origine` | objet (voir plus bas) | non | D'où vient l'étymon, ou ancêtre plus ancien qui ajoute du sens. |
| `doublets` | liste de textes | oui | Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches. |
| `famille` | liste de textes | oui | Mots français apparentés. |
| `themes` | liste de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json). |
| `sources` | liste d'objets (voir plus bas) | oui | Ouvrages consultés pour l'étymologie ; au moins un hors statut a-verifier. |
| `redaction` | liste non vide d'objets (voir plus bas) | oui | Qui a rédigé la fiche ; affiché une fois, en pied de fiche. |
| `lecturesTraditionnelles` | liste d'objets (voir plus bas) | oui | Lectures traditionnelles, une par tradition (souvent aucune). |
| `statut` | `a-verifier` \| `brouillon` \| `validee` | oui | a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault. |
| `historique` | liste d'objets (voir plus bas) | oui | Corrections successives (ex. suite à une Critique). |

### `legende`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme alléguée à tort (ex. « sine cera »). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets (ex. « sans cire »). |
| `explication` | texte | non | Pourquoi c'est une légende, en une phrase. |

### `origine`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `debattue` | `true` \| `false` | non | Plusieurs hypothèses, aucune établie. |
| `hypotheses` | liste non vide d'objets (voir plus bas) | oui | Une ou plusieurs formes d'origine. |

### `origine.hypotheses[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme d'origine proposée. |
| `graphie` | texte | non | Écriture d'origine si l'alphabet n'est pas latin (ἀνάλυσις, صفر) ; la forme en garde la translittération. |
| `langue` | texte | oui | Langue de cette forme (latin, grec ancien, arabe, indo-européen…). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets. |
| `selon` | liste de valeurs d'une liste fermée (voir plus bas) | non | Qui soutient cette hypothèse : auteurs (data/auteurs.json) ou ouvrages (data/sources.json). |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | `Littré` \| `Gaffiot` \| `Bailly` \| `TLFi` | oui | Ouvrage consulté (liste fermée : data/sources.json). |
| `entree` | texte | oui | Entrée consultée dans l'ouvrage (ex. « étonner », « adtono »). |
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
| `texte` | texte | oui | Le sens doctrinal, sans commencer par le nom de l'auteur ni répéter l'hypothèse étymologique. |
| `citation` | texte | non | Texte original de l'auteur, dans sa langue. |
| `auteur` | `Platon` \| `Varron` \| `Cicéron` \| `Lactance` \| `Augustin` \| `Isidore de Séville` \| `Thomas d'Aquin` \| `René Guénon` | oui | Auteur de la tradition (liste fermée : data/auteurs.json). |
| `sources` | liste d'objets (voir plus bas) | oui | Œuvres de l'auteur consultées. Vide : la lecture repose sur sa seule rédaction (signalé par npm run etat si c'est l'IA). |
| `redaction` | liste non vide d'objets (voir plus bas) | non | Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche. |

### `lecturesTraditionnelles[].sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | liste fermée (voir plus bas) | oui | Œuvre de l'auteur (liste fermée : data/auteurs.json). |
| `entree` | texte | oui | Passage précis (ex. « IV, 28, 3 »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https) de l'entrée, seulement si elle ne se déduit pas de l'entrée. |

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
- `sources[].ouvrage` (data/sources.json) : Littré, Gaffiot, Bailly, TLFi ; `origine.hypotheses[].selon` : ces ouvrages ou les auteurs ci-dessous.
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
- Un étymon reconstruit commence par `*` (c'est ce qui le dit reconstruit) ; une valeur commençant par `*` ou contenant `: ` s'écrit entre guillemets.
- Pas de doublon : un doublet se déclare sur une seule des deux fiches (l'app l'affiche des deux côtés) ; l'adresse d'un ouvrage en ligne se déduit de l'entrée et ne s'écrit pas.
- Les textes sont bruts, sans mise en forme : l'app met en italique l'étymon, les formes d'origine et la forme légendaire, et pose les liens vers les autres fiches.
- `explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus.
- Typographie française dans les sens, l'explication, la légende, les lectures et l'historique : guillemets « », espace insécable avant `:` `;` `?` `!` ; les sens s'écrivent sans guillemets.
- Une œuvre citée par une lecture traditionnelle appartient à l'auteur de la lecture.
- Hors statut `a-verifier`, `sources` contient au moins un ouvrage consulté.
- Aucun alias YAML, aucune clé en double, aucun champ inconnu.
