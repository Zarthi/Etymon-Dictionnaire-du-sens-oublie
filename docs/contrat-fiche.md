# Contrat de données : les fiches

> Généré par `npm run contrat` à partir de `src/lib/schema.ts` : ne pas modifier à la main.
> Les mêmes contrats existent en schémas JSON (`docs/*.schema.json`), utilisés par VS Code
> pour l'autocomplétion et la vérification des fiches pendant la saisie.

Trois types de fiches, en YAML, avec le même socle éditorial (`sources`, `redaction`, `statut`, `historique`).
Exemples : `data/fiches/r/re/religion.yaml`, `data/auteurs/augustin.yaml`, `data/ouvrages/littre.yaml`.

## Fiche d'un mot (`data/fiches`)

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui | Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent). |
| `nature` | liste non vide de `nom masculin` \| `nom féminin` \| `nom` \| `nom propre` \| `verbe` \| `adjectif` \| `adverbe` \| `interjection` | oui | Catégorie(s) grammaticale(s) ; « nom » pour les épicènes. |
| `etymologie` | liste non vide d'objets (voir plus bas) | oui | Chaîne étymologique, du plus proche au plus lointain. La langue source directe ouvre la chaîne ; on ne remonte que si cela ajoute un sens. |
| `explication` | texte | oui | 1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens premier. Texte brut : les formes de la fiche y sont mises en italique par l'app. |
| `ecartees` | liste d'objets (voir plus bas) | non | Étymologies proposées puis écartées : idées reçues ou hypothèses savantes abandonnées. |
| `incertain` | `true` \| `false` | non | La chaîne elle-même est douteuse (une origine débattue relève des alternatives). Faux si absent. |
| `doublets` | liste d'identifiants | non | Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches. |
| `famille` | liste de textes | non | Mots français apparentés, de la même racine. |
| `renvois` | liste d'identifiants | non | Fiches d'une notion voisine, sans racine commune, qui éclairent celle-ci (schizophrénie → obsession) ; trois au plus, déclarés d'un seul côté. |
| `themes` | liste de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json). |
| `lecturesTraditionnelles` | liste d'objets (voir plus bas) | non | Lectures traditionnelles, rédigées dans une passe à part, texte source sous les yeux (souvent aucune). |
| `sources` | liste d'objets (voir plus bas) | non | Ouvrages consultés ; au moins un hors statut a-verifier. Ajoutés par npm run verifier ou à la main, jamais de mémoire. |
| `redaction` | liste non vide d'objets (voir plus bas) | oui | Qui a rédigé ; affiché une fois, en pied de page. Écrit par npm run rediger. |
| `statut` | `a-verifier` \| `brouillon` \| `validee` | oui | a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault. |
| `historique` | liste d'objets (voir plus bas) | non | Corrections successives (ex. suite à une Critique). |

### `etymologie[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | non | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | oui | Langue (liste fermée : data/langues.json). |
| `sens` | texte | non | Sens de ce maillon, seulement s'il apprend quelque chose (pas pour l'allemand Schizophrenie, ni le latin Satanas). |
| `elements` | liste non vide d'objets (voir plus bas) | non | Composition : les éléments dont la forme est faite (φίλος + σοφία). |
| `alternatives` | objet (voir plus bas) | non | Plusieurs origines : débattues, ou voulues ensemble. |
| `forge` | objet (voir plus bas) | non | Mot forgé par un auteur connu : qui, quand, où. |
| `modele` | objet (voir plus bas) | non | Mot sur le modèle duquel celui-ci a été fait (persona, calque de πρόσωπον ; altruisme, sur le modèle d'égoïsme). |
| `personne` | identifiant | non | Auteur dont la forme est le nom (al-Khwârizmî → algorithme). |
| `ouvrage` | identifiant | non | Ouvrage dont la forme est le titre (al-jabr → algèbre). |
| `premier` | `true` \| `false` | non | Porte le sens premier affiché en tête (par défaut : le plus lointain maillon attesté qui porte un sens). |

### `etymologie[].elements[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue de l'élément, si elle diffère de celle du maillon. |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |

### `etymologie[].alternatives`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mode` | `debattue` \| `jeu` | oui | debattue : hypothèses concurrentes, la plus suivie en premier ; jeu : double sens voulu par l'auteur (utopie). |
| `formes` | liste non vide d'objets (voir plus bas) | oui | Les hypothèses, ou les sens voulus. |

### `etymologie[].alternatives.formes[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | non | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue, si elle diffère de celle du maillon. |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |
| `elements` | liste non vide d'objets (voir plus bas) | non | Composition de cette forme. |
| `selon` | liste d'identifiants | non | Origine débattue : qui a proposé ou défend cette hypothèse (identifiants d'auteurs). Un ouvrage qui la rapporte n'en est pas tenant. |

### `etymologie[].alternatives.formes[].elements[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue de l'élément, si elle diffère de celle du maillon. |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |

### `etymologie[].forge`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | liste non vide d'identifiants | oui | Qui a forgé le mot ; plusieurs : attribution incertaine (« Comte ou Andrieux »). |
| `date` | nombre ou date historique | oui | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `ouvrage` | identifiant | non | Ouvrage où le mot est forgé (data/ouvrages). |

### `etymologie[].modele`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | oui | Langue (liste fermée : data/langues.json). |
| `sens` | texte | non | Sens, sans guillemets (l'app les ajoute). |
| `relation` | `calque` \| `analogie` | oui | calque : traduction élément par élément ; analogie : formé sur le modèle d'un autre mot. |

### `ecartees[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue (liste fermée : data/langues.json). |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |
| `selon` | liste d'identifiants | non | Qui l'a proposée. |
| `raison` | texte | non | Pourquoi elle est écartée, en une phrase. |
| `populaire` | `true` \| `false` | non | Étymologie populaire (idée reçue : sine cera), et non savante (per-sonare). |

### `lecturesTraditionnelles[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `texte` | texte | oui | Sens que la doctrine donne au mot, sans commencer par le nom de l'auteur ni répéter l'hypothèse étymologique. |
| `citation` | texte | oui | Texte original de l'auteur, dans sa langue, tel qu'il figure à l'adresse de la source ([…] pour une coupe). |
| `auteur` | identifiant | oui | Auteur de la tradition (data/auteurs, tradition: true). |
| `hypothese` | texte | non | Forme d'une alternative de la chaîne sur laquelle repose la lecture : le texte n'a pas à la répéter. |
| `sources` | liste non vide d'objets (voir plus bas) | oui | Œuvres de l'auteur consultées. |
| `redaction` | liste non vide d'objets (voir plus bas) | non | Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche. |

### `lecturesTraditionnelles[].sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Œuvre de l'auteur de la lecture (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Passage précis (« IV, 28, 3 »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | oui | Adresse (https) du texte original, du domaine public : npm run verifier:en-ligne y cherche la citation. |

### `lecturesTraditionnelles[].redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Ouvrage consulté (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Entrée consultée (« étonner », « adtono », « φρήν »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https), seulement si elle ne se déduit pas de l'entrée. |

### `redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

### `historique[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `date` | date AAAA-MM-JJ | oui | Date au format AAAA-MM-JJ. |
| `note` | texte | oui | Nature de la correction. |

## Fiche d'un auteur (`data/auteurs`)

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `nom` | texte | oui | Forme usuelle du nom, affichée partout (Augustin, Eugen Bleuler) ; le nom du fichier en est la forme sans accent. |
| `nomComplet` | texte | non | Forme complète ou d'origine (Aurelius Augustinus), si elle diffère. |
| `naissance` | nombre ou date historique | non | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `mort` | nombre ou date historique | non | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `description` | texte | oui | Une ou deux phrases, 200 caractères au plus : ce qui le situe (époque, tradition, œuvre), pas une biographie. |
| `tradition` | `true` \| `false` | non | Auteur de la tradition : signe des lectures traditionnelles. Faux si absent. |
| `bnf` | texte | non | Identifiant de la notice d'autorité BnF (cb…) ; l'adresse data.bnf.fr s'en déduit. |
| `sources` | liste d'objets (voir plus bas) | non | Ouvrages consultés ; au moins un hors statut a-verifier. Ajoutés par npm run verifier ou à la main, jamais de mémoire. |
| `redaction` | liste non vide d'objets (voir plus bas) | oui | Qui a rédigé ; affiché une fois, en pied de page. Écrit par npm run rediger. |
| `statut` | `a-verifier` \| `brouillon` \| `validee` | oui | a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault. |
| `historique` | liste d'objets (voir plus bas) | non | Corrections successives (ex. suite à une Critique). |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Ouvrage consulté (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Entrée consultée (« étonner », « adtono », « φρήν »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https), seulement si elle ne se déduit pas de l'entrée. |

### `redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

### `historique[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `date` | date AAAA-MM-JJ | oui | Date au format AAAA-MM-JJ. |
| `note` | texte | oui | Nature de la correction. |

## Fiche d'un ouvrage (`data/ouvrages`)

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `titre` | texte | oui | Titre en français (Institutions divines, Dictionnaire de la langue française). |
| `abrege` | texte | non | Nom court sous lequel on le cite (Littré, Gaffiot) ; le nom du fichier en est la forme sans accent, ou celle du titre. |
| `titreOriginal` | texte | non | Titre d'origine, s'il diffère (Divinae institutiones). |
| `auteur` | identifiant | non | Auteur (data/auteurs) ; absent pour une œuvre collective (TLFi, Rituel romain). |
| `date` | nombre ou date historique | non | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `edition` | texte | non | Édition réellement consultée (révision de Gérard Gréco, 2016). |
| `licence` | `domaine public` \| `Licence ouverte` \| `CC BY-SA` \| `CC BY-NC-ND` \| `non libre` | oui | Ce qu'Étymon a le droit d'en faire. |
| `texte` | adresse https | non | Adresse du texte, pour une œuvre de la tradition. |
| `modeleEntree` | texte | non | Modèle d'adresse d'une entrée (dictionnaires) : {entree}, ou {grec} pour l'entrée translittérée. |
| `description` | texte | oui | Une ou deux phrases, 200 caractères au plus : ce qui le situe (époque, tradition, œuvre), pas une biographie. |
| `sources` | liste d'objets (voir plus bas) | non | Ouvrages consultés ; au moins un hors statut a-verifier. Ajoutés par npm run verifier ou à la main, jamais de mémoire. |
| `redaction` | liste non vide d'objets (voir plus bas) | oui | Qui a rédigé ; affiché une fois, en pied de page. Écrit par npm run rediger. |
| `statut` | `a-verifier` \| `brouillon` \| `validee` | oui | a-verifier : rédigée de mémoire ; brouillon : ouvrage(s) consulté(s) ; validee : validée par Thibault. |
| `historique` | liste d'objets (voir plus bas) | non | Corrections successives (ex. suite à une Critique). |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Ouvrage consulté (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Entrée consultée (« étonner », « adtono », « φρήν »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | non | Adresse (https), seulement si elle ne se déduit pas de l'entrée. |

### `redaction[]`

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

- `nature` : nom masculin, nom féminin, nom, nom propre, verbe, adjectif, adverbe, interjection.
- `langue` (data/langues.json) : latin, latin populaire, bas latin, latin médiéval, latin humaniste, latin ecclésiastique, ancien français, français, grec ancien, gaulois, étrusque, francique, germanique, ancien nordique, arabe, hébreu, persan, turc, italien, espagnol, ancien espagnol, portugais, occitan, néerlandais, allemand, anglais, indo-européen.
- `themes` (data/themes.json) : émotions, esprit, parole, savoir, morale, religion, corps, santé, famille, société, droit, guerre, travail, argent, commerce, nourriture, maison, nature, météo, temps.
- `licence` : domaine public, Licence ouverte, CC BY-SA, CC BY-NC-ND, non libre.
- `redaction[].par` : IA, Étymon.

## Règles vérifiées en plus de la structure (`npm run valider`)

- Le fichier d'un mot s'appelle `<id>.yaml`, où `id` est le mot sans accent, en minuscules, mots séparés par des tirets (`-2`, `-3` pour les homonymes, dans l'ordre du Littré), rangé dans `data/fiches/<initiale>/<deux premières lettres>/`. Un auteur : `data/auteurs/<nom>.yaml` ; un ouvrage : `data/ouvrages/<abrégé ou titre>.yaml`.
- Une forme reconstruite commence par `*` ; une valeur commençant par `*`, contenant `: `, ou une virgule dans `{ … }`, s'écrit entre guillemets.
- Pas de doublon : un doublet ou un renvoi se déclare sur une seule des deux fiches ; l'adresse d'une entrée se déduit du modèle d'adresse de l'ouvrage ; la translittération du grec se déduit de la forme ; ce qui se calcule (œuvres d'un auteur, mots qu'il a forgés) ne s'écrit pas.
- Un champ facultatif à sa valeur par défaut ne s'écrit pas (`incertain: false`, `tradition: false`, listes vides).
- Toute référence (auteur, ouvrage, doublet, renvoi) vise une fiche existante.
- `etymologie` : un maillon porte une forme, des éléments, ou les deux ; ou bien des alternatives. Au moins un maillon porte un sens ; au plus un est `premier`.
- Translittération : seulement pour une écriture ni latine ni grecque (arabe, hébreu), et alors obligatoire.
- `selon` : seulement dans une origine débattue ; un ouvrage qui rapporte une hypothèse n'en est pas le tenant.
- Lecture traditionnelle : un auteur de la tradition (`tradition: true`), ses propres œuvres, une `hypothese` parmi les alternatives de la chaîne ; sa citation figure mot pour mot à l'adresse de la source (`npm run verifier:en-ligne`).
- `renvois` : ni doublet, ni mot de la famille (une notion voisine, pas une racine commune).
- Les textes sont bruts, sans mise en forme : l'app met en italique les formes de la chaîne et pose les liens.
- `explication` : 1 à 3 phrases terminées par une ponctuation, 300 caractères au plus ; `description` : 200 caractères au plus.
- Typographie française dans les sens et les textes : guillemets « », espace insécable avant `:` `;` `?` `!` ; les sens s'écrivent sans guillemets.
- Hors statut `a-verifier`, `sources` contient au moins un ouvrage consulté.
- Aucun alias YAML, aucune clé en double, aucun champ inconnu.
