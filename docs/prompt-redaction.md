# Rédiger un lot de fiches

> Généré par `npm run contrat` à partir de `src/lib/schema.ts` et des fiches citées en exemple : ne pas modifier à la main.

Tu rédiges des fiches d'Étymon, dictionnaire du sens premier des mots français. Une fiche se lit en dix secondes.

## Règles

- Principe : la justesse des noms, au service de la vérité. Étymon rend à chaque mot son nom juste, et s'écrit de même : chaque mot dans son sens propre, chaque phrase conforme à ce qui est et à ce que disent les sources, rien de plus. Pas de figure, pas de formule, pas d'effet. Relis chaque phrase avec une question : « que veux-tu dire exactement ? » ; si la réponse est plus claire que la phrase, écris la réponse.
- Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte, et tu lui signales ton doute.
- `etymologie` : la chaîne, du plus proche au plus lointain. Le premier maillon est la langue source directe (latin pour un mot hérité, italien pour un emprunt à l'italien) ; on ne remonte que si cela ajoute un sens ou si l'origine est débattue.
- Formes dans leur écriture d'origine (φρήν, صفر) ; translittération seulement pour l'arabe ou l'hébreu (celle du grec se déduit).
- `sens` seulement là où il apprend quelque chose : le sens premier, affiché seul en tête de fiche, est celui du maillon le plus lointain attesté qui en porte un. Une composition porte le sens littéral de ses éléments (schizophrénie : esprit fendu), et chaque élément le sien.
- `explication` : ce qui s'est perdu, affaibli ou retourné entre le sens premier et l'usage actuel. Elle n'explique pas une seconde fois le sens, affiché juste au-dessus ; mais mieux vaut redire le mot juste qu'un détour. Ton sobre, sans emphase ni jugement.
- Tout mot étranger cité dans un texte est une forme de la chaîne : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.
- `ecartees` : étymologies proposées puis écartées ; `populaire: true` pour une idée reçue (*sincère*, « sans cire »), jamais dans la chaîne.
- Liens entre mots, un seul endroit selon leur raison. Un lien qui s'explique en une phrase va dans l'explication : l'app lie tout mot qui a une fiche (Bleuler renommait la démence précoce). `renvois` (Voir aussi) : notions voisines du même ordre, sans racine commune (schizophrénie → délire, folie) ; trois au plus, souvent aucun. `tradition.renvois` (sous « Lectures traditionnelles » : voir obsession) : mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) ; deux au plus, rare. Un renvoi vise un mot important du dictionnaire, qu'il ait déjà sa fiche ou non.
- Auteurs et ouvrages sont cités par leur identifiant dans les champs (`selon`, `forge`, `personne`, `ouvrage`). S'il manque une fiche, ajoute-la au lot (`auteurs`, `ouvrages`), avec une description qui situe sans raconter et, dans `cite`, l'élément d'entrée de sa notice BnF (Bleuler, Comte).
- Dans un texte, nomme un auteur sous son nom usuel ou une de ses formes de citation (liste ci-dessous) : l'app en fait un lien, s'il est aussi cité dans un champ de la fiche.
- Tu rédiges de mémoire : n'invente ni tenant (`selon`), ni date (`forge`), ni forme reconstruite que tu ne connais pas avec certitude. En cas de doute sur la chaîne, `incertain: true`.
- Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` ni les lectures traditionnelles (`tradition.lectures`) : les scripts les posent (npm run rediger, npm run verifier), les lectures se rédigent à part, texte source sous les yeux.
- Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.

## Format

Un fichier JSON : une liste de fiches, ou `{ "fiches": [...], "auteurs": [...], "ouvrages": [...] }` quand il faut créer des auteurs ou des ouvrages. Chaque fiche a les champs ci-dessous et eux seuls ; un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872).

### Fiche d'un mot

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui | Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent). |
| `nature` | liste non vide de `nom masculin` \| `nom féminin` \| `nom` \| `nom propre` \| `verbe` \| `adjectif` \| `adverbe` \| `interjection` | non | Catégorie(s) grammaticale(s) ; tirée du Littré si absente. |
| `etymologie` | liste non vide d'objets (voir plus bas) | oui | Chaîne étymologique, du plus proche au plus lointain. La langue source directe ouvre la chaîne ; on ne remonte que si cela ajoute un sens. |
| `explication` | texte | oui | 1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens premier. Texte brut : les formes de la fiche y sont mises en italique par l'app. |
| `ecartees` | liste d'objets (voir plus bas) | non | Étymologies proposées puis écartées : idées reçues ou hypothèses savantes abandonnées. |
| `incertain` | `true` \| `false` | non | La chaîne elle-même est douteuse (une origine débattue relève des alternatives). Faux si absent. |
| `doublets` | liste d'identifiants | non | Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches. |
| `famille` | liste de textes | non | Mots français apparentés, de la même racine. |
| `renvois` | liste d'identifiants | non | Voir aussi : notions voisines du même ordre, sans racine commune (schizophrénie → délire) ; fiche ou candidat à faire, trois au plus, déclarés d'un seul côté. |
| `themes` | liste de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json). |
| `tradition` | objet (voir plus bas) | non | Les mots où la tradition parle de celui-ci ; les lectures s'écrivent à part. |

#### `etymologie[]`

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

#### `etymologie[].elements[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue de l'élément, si elle diffère de celle du maillon. |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |

#### `etymologie[].alternatives`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mode` | `debattue` \| `jeu` | oui | debattue : hypothèses concurrentes, la plus suivie en premier ; jeu : double sens voulu par l'auteur (utopie). |
| `formes` | liste non vide d'objets (voir plus bas) | oui | Les hypothèses, ou les sens voulus. |

#### `etymologie[].alternatives.formes[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | non | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue, si elle diffère de celle du maillon. |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |
| `elements` | liste non vide d'objets (voir plus bas) | non | Composition de cette forme. |
| `selon` | liste d'identifiants | non | Origine débattue : qui a proposé ou défend cette hypothèse (identifiants d'auteurs). Un ouvrage qui la rapporte n'en est pas tenant. |

#### `etymologie[].alternatives.formes[].elements[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue de l'élément, si elle diffère de celle du maillon. |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |

#### `etymologie[].forge`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | liste non vide d'identifiants | oui | Qui a forgé le mot ; plusieurs : attribution incertaine (« Comte ou Andrieux »). |
| `date` | nombre ou date historique | oui | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `ouvrage` | identifiant | non | Ouvrage où le mot est forgé (data/ouvrages). |

#### `etymologie[].modele`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | oui | Langue (liste fermée : data/langues.json). |
| `sens` | texte | non | Sens, sans guillemets (l'app les ajoute). |
| `relation` | `calque` \| `analogie` | oui | calque : traduction élément par élément ; analogie : formé sur le modèle d'un autre mot. |

#### `ecartees[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | non | Langue (liste fermée : data/langues.json). |
| `sens` | texte | oui | Sens, sans guillemets (l'app les ajoute). |
| `selon` | liste d'identifiants | non | Qui l'a proposée. |
| `raison` | texte | non | Pourquoi elle est écartée, en une phrase. |
| `populaire` | `true` \| `false` | non | Étymologie populaire (idée reçue : sine cera), et non savante (per-sonare). |

#### `tradition`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `renvois` | liste d'identifiants | non | Mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) : fiche ou candidat à faire, deux au plus ; affichés une fois leur fiche pourvue de lectures. |

### Auteur

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `nom` | texte | oui | Forme usuelle du nom, affichée partout (Augustin, Eugen Bleuler) ; le nom du fichier en est la forme sans accent. |
| `nomComplet` | texte | non | Forme complète ou d'origine (Aurelius Augustinus), si elle diffère. |
| `naissance` | nombre ou date historique | non | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `mort` | nombre ou date historique | non | Date exacte ou approximative : 1911, « vers 1830 », « XIIe siècle », « 106 av. J.-C. ». |
| `description` | texte | oui | Une ou deux phrases, 200 caractères au plus : ce qui le situe (époque, tradition, œuvre), pas une biographie. |
| `traditions` | liste non vide de `juive` \| `chrétienne` | non | Traditions dans lesquelles il parle ; un auteur qui en a signe des lectures traditionnelles. Plusieurs : chaque lecture précise la sienne. |
| `cite` | liste de textes | non | Formes courtes sous lesquelles on le cite dans un texte (Bleuler, Comte, More) : l'élément d'entrée de la notice BnF, retenue ou variante. Le nom usuel est toujours reconnu. |

### Ouvrage

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

### Listes fermées

- `nature` : nom masculin, nom féminin, nom, nom propre, verbe, adjectif, adverbe, interjection.
- `langue` : latin, latin populaire, bas latin, latin médiéval, latin humaniste, latin ecclésiastique, ancien français, français, grec ancien, gaulois, étrusque, francique, germanique, ancien nordique, arabe, hébreu, araméen, persan, turc, italien, espagnol, ancien espagnol, portugais, occitan, néerlandais, allemand, anglais, indo-européen.
- `themes` : émotions, esprit, parole, savoir, morale, religion, corps, santé, famille, société, droit, guerre, travail, argent, commerce, nourriture, maison, nature, météo, temps.
- `traditions` : juive, chrétienne.
- Auteurs existants (identifiant : nom, formes de citation) : al-khwarizmi (al-Khwârizmî) ; anatole-bailly (Anatole Bailly, Bailly) ; auguste-comte (Auguste Comte, Comte) ; augustin-calmet (Augustin Calmet, Calmet) ; augustin (Augustin) ; ciceron (Cicéron) ; emile-littre (Émile Littré, Littré) ; eugen-bleuler (Eugen Bleuler, Bleuler) ; felix-gaffiot (Félix Gaffiot, Gaffiot) ; francois-andrieux (François Andrieux, Andrieux) ; gavius-bassus (Gavius Bassus) ; gerard-de-cremone (Gérard de Crémone) ; isidore-de-seville (Isidore de Séville) ; lactance (Lactance) ; resh-lakish (Resh Lakish) ; thomas-more (Thomas More, More).
- Ouvrages existants : al-jabr (Abrégé du calcul par la restauration et la comparaison), bailly (Dictionnaire grec-français), bible-hebraique (Bible hébraïque), bnf (Catalogue général de la Bibliothèque nationale de France), dementia-praecox (Dementia praecox ou Groupe des schizophrénies), dictionnaire-de-la-bible (Dictionnaire historique, critique, chronologique, géographique et littéral de la Bible), etymologies (Étymologies), gaffiot (Dictionnaire latin-français), institutions-divines (Institutions divines), la-cite-de-dieu (La Cité de Dieu), la-nature-des-dieux (La Nature des dieux), littre (Dictionnaire de la langue française), talmud-de-babylone (Talmud de Babylone), tlfi (Trésor de la langue française informatisé), utopia (L'Utopie).

## Exemples

Fiches du dépôt (simple ; filiation ; filiation et composition ; mot forgé ; origine débattue ; nom de personne et étymologie écartée) :

```json
[
  {"mot":"étonner","etymologie":[{"forme":"*extonare","langue":"latin populaire","sens":"ébranler comme d'un coup de tonnerre"}],"explication":"Le sens propre a longtemps survécu : on étonnait la roche ou un diamant en les fêlant, et pour les classiques, être étonné, c'était rester frappé de stupeur. Le mot ne dit plus qu'une surprise.","themes":["émotions"]},
  {"mot":"chiffre","etymologie":[{"forme":"cifra","langue":"latin médiéval","sens":"zéro"},{"forme":"صفر","translitteration":"ṣifr","langue":"arabe","sens":"vide"}],"explication":"Le mot a d'abord désigné le seul zéro, puis tous les signes de numération, puis le montant qu'ils écrivent. Zéro, son doublet, a pris le sens que chiffre a perdu.","doublets":["zero"],"themes":["savoir"]},
  {"mot":"philosophie","etymologie":[{"forme":"philosophia","langue":"latin"},{"forme":"φιλοσοφία","langue":"grec ancien","sens":"amour de la sagesse","elements":[{"forme":"φίλος","sens":"ami, qui aime"},{"forme":"σοφία","sens":"sagesse, savoir"}]}],"explication":"Le philosophe ne se disait pas sage : il aimait une sagesse qu'il ne possédait pas. Le mot désigne aujourd'hui une discipline, et même une simple manière de voir.","famille":["philosophe","philosophique"],"themes":["savoir","esprit"]},
  {"mot":"schizophrénie","nature":["nom féminin"],"etymologie":[{"forme":"Schizophrenie","langue":"allemand","forge":{"par":["eugen-bleuler"],"date":"1911","ouvrage":"dementia-praecox"}},{"langue":"grec ancien","sens":"esprit fendu","elements":[{"forme":"σχίζω","sens":"fendre"},{"forme":"φρήν","sens":"diaphragme"}]}],"explication":"Bleuler renommait la démence précoce : non un dédoublement de la personnalité, contresens devenu courant, mais une discordance entre pensée, affects et volonté. Les Grecs situaient la pensée dans la poitrine, non dans la tête.","famille":["schizophrène","frénésie","frénétique"],"renvois":["delire","folie"],"themes":["esprit","santé"],"tradition":{"renvois":["obsession"]}},
  {"mot":"religion","etymologie":[{"forme":"religio","langue":"latin","sens":"attention scrupuleuse, scrupule"},{"langue":"latin","alternatives":{"mode":"debattue","formes":[{"forme":"relegere","sens":"reprendre avec soin","selon":["ciceron"]},{"forme":"religare","sens":"relier","selon":["lactance"]}]}}],"explication":"La religio est le scrupule qui fait hésiter, celui du juge devant un verdict comme celui du Romain devant les dieux. Le mot ne désignait pas une croyance, mais ce qui retient d'agir.","famille":["religieux","religiosité","irréligion"],"themes":["religion"]},
  {"mot":"algorithme","etymologie":[{"forme":"alguarismo","langue":"ancien espagnol","sens":"art de compter"},{"forme":"الخوارزمي","translitteration":"al-Ḫuwārizmī","langue":"arabe","sens":"celui du Khwarezm","personne":"al-khwarizmi"}],"explication":"Le mot vient du nom d'al-Khwârizmî, dont les traités firent connaître en Europe le calcul avec les chiffres dits arabes. Son nom latinisé a désigné ce calcul, puis toute méthode de calcul réglée.","ecartees":[{"forme":"ἀριθμός","langue":"grec ancien","sens":"nombre","raison":"Littré la rapporte et l'écarte : seul le nom du mathématicien rend compte du g."}],"famille":["algorithmique"],"themes":["savoir"]}
]
```

## Ensuite

1. `npm run rediger -- lot.json --modele "<ton modèle>"` : écrit les fiches en `a-verifier` et les retire des candidats.
2. `npm run verifier` : confronte au Littré ; les fiches concordantes passent en `brouillon`, les autres et les contrôles sont à relire.
3. `npm run valider`, puis un commit par lot.
