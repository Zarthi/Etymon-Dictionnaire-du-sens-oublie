# Rédiger un lot de fiches

> Généré par `npm run contrat` à partir de `src/lib/schema.ts` et des fiches citées en exemple : ne pas modifier à la main.

Tu rédiges des fiches d'Étymon, dictionnaire du sens premier des mots français. Une fiche se lit en dix secondes.

## Règles

- Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte, et tu lui signales ton doute.
- Étymon : la forme de la langue source directe (latin pour un mot hérité du latin, italien pour un emprunt à l'italien). Ce qui est plus ancien va dans `origine`, seulement s'il ajoute un sens ou si l'origine est débattue.
- `sens` : le sens de l'étymon, pas celui du mot français. Pour un mot forgé ou composé, le sens littéral des éléments.
- `explication` : ce qui s'est perdu, affaibli ou retourné entre ce sens et l'usage actuel. Elle ne répète pas le sens, déjà affiché juste au-dessus. Ton sobre, sans emphase ni jugement.
- Tout mot étranger cité dans un texte est une forme de la fiche (étymon, `origine`, légende) : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.
- `renvois` : seulement vers une fiche existante dont la notion éclaire vraiment celle-ci sans racine commune (schizophrénie → obsession, où la tradition a lu la chose sous un autre mot) ; trois au plus, souvent aucun.
- Méfie-toi des étymologies populaires (*sincère*, « sans cire ») : elles vont dans `legende`, jamais dans l'étymon.
- Tu rédiges de mémoire : n'invente ni tenant (`selon`), ni date (`forge`), ni forme reconstruite que tu ne connais pas avec certitude. En cas de doute sur l'étymon, `incertain: true`.
- Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` ni les lectures traditionnelles : les scripts les posent (npm run rediger, npm run verifier), les lectures se rédigent à part, texte source sous les yeux.
- Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.

## Format

Un fichier JSON : une liste de fiches, chacune avec les champs ci-dessous et eux seuls. Un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872).

### Champs

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui | Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent). |
| `nature` | liste non vide de `nom masculin` \| `nom féminin` \| `nom` \| `verbe` \| `adjectif` \| `adverbe` \| `interjection` | non | Catégorie(s) grammaticale(s) ; tirée du Littré si absente. |
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
| `renvois` | liste de textes | non | Fiches d'une notion voisine, sans racine commune, qui éclairent celle-ci (schizophrénie → obsession) ; trois au plus, déclarés sur une seule des deux fiches. |
| `themes` | liste de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json). |

#### `forge`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | texte | oui | Qui a forgé le mot (« Eugen Bleuler »). |
| `annee` | nombre | oui | Année de la création, selon la source consultée. |

#### `legende`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme alléguée à tort (ex. « sine cera »). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets (ex. « sans cire »). |
| `explication` | texte | non | Pourquoi c'est une légende, en une phrase. |

#### `origine`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mode` | `filiation` \| `composition` \| `debattue` | non | filiation (défaut) : l'étymon vient de ces formes, l'une de l'autre ; composition : il est formé de ces éléments ; debattue : plusieurs hypothèses, la plus suivie en premier. |
| `formes` | liste non vide d'objets (voir plus bas) | oui | Formes d'origine, dans l'ordre de lecture. |

#### `origine.formes[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme d'origine ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `graphie` | texte | non | Écriture d'origine si l'alphabet n'est pas latin (ἀνάλυσις, صفر) ; la forme en garde la translittération. |
| `langue` | texte | oui | Langue de cette forme (latin, grec ancien, arabe, indo-européen…). |
| `sens` | texte | oui | Sens de cette forme, sans guillemets. |
| `selon` | liste de `Platon` \| `Varron` \| `Cicéron` \| `Lactance` \| `Augustin` \| `Isidore de Séville` \| `Thomas d'Aquin` \| `René Guénon` | non | Origine débattue seulement : qui a proposé ou défend cette hypothèse (data/auteurs.json). Un ouvrage qui la rapporte n'en est pas tenant : il figure dans sources. |

### Listes fermées

- `nature` : nom masculin, nom féminin, nom, verbe, adjectif, adverbe, interjection.
- `langue` : latin, latin populaire, bas latin, latin médiéval, latin ecclésiastique, ancien français, grec ancien, gaulois, francique, germanique, ancien nordique, arabe, hébreu, persan, turc, italien, espagnol, portugais, occitan, néerlandais, allemand, anglais.
- `themes` : émotions, esprit, parole, savoir, morale, religion, corps, santé, famille, société, droit, guerre, travail, argent, commerce, nourriture, maison, nature, météo, temps.
- `origine.formes[].selon` : Platon, Varron, Cicéron, Lactance, Augustin, Isidore de Séville, Thomas d'Aquin, René Guénon.

## Exemples

Fiches du dépôt (simple, filiation, composition et mot forgé, origine débattue) :

```json
[
  {"mot":"étonner","etymon":"*extonare","langue":"latin populaire","sens":"ébranler comme d'un coup de tonnerre","explication":"Étonner, c'était d'abord frapper comme la foudre : l'ancien français l'emploie pour un étourdissement violent. Le sens s'est affaibli jusqu'à la simple surprise.","themes":["émotions"]},
  {"mot":"chiffre","etymon":"cifra","langue":"latin médiéval","sens":"zéro","explication":"Le chiffre fut d'abord le zéro, signe vide de toute valeur dans la numération venue des Arabes. Le nom de ce signe nouveau s'est ensuite étendu à tous les signes de numération.","origine":{"formes":[{"forme":"ṣifr","graphie":"صفر","langue":"arabe","sens":"vide"}]},"doublets":["zero"],"themes":["savoir"]},
  {"mot":"schizophrénie","nature":["nom féminin"],"etymon":"Schizophrenie","langue":"allemand","forge":{"par":"Eugen Bleuler","annee":1911},"sens":"esprit fendu","explication":"Bleuler désignait la discordance entre pensée, affects et volonté, non un dédoublement de la personnalité, contresens devenu courant. Le phrēn grec est d'abord le diaphragme : on logeait la pensée dans la poitrine.","origine":{"mode":"composition","formes":[{"forme":"schizō","graphie":"σχίζω","langue":"grec ancien","sens":"fendre"},{"forme":"phrēn","graphie":"φρήν","langue":"grec ancien","sens":"diaphragme, puis siège des passions et de la pensée"}]},"famille":["schizophrène","frénésie","frénétique"],"renvois":["obsession"],"themes":["esprit","santé"]},
  {"mot":"religion","etymon":"religio","langue":"latin","sens":"attention scrupuleuse, scrupule","explication":"La religio retenait aussi bien le juge devant un verdict que le Romain devant les dieux : une conscience qui arrête. Le mot ne désignait pas ce que l'on croit, mais ce qui retient d'agir.","origine":{"mode":"debattue","formes":[{"forme":"relegere","langue":"latin","sens":"reprendre avec soin","selon":["Cicéron"]},{"forme":"religare","langue":"latin","sens":"relier","selon":["Lactance"]}]},"famille":["religieux","religiosité","irréligion"],"themes":["religion"]}
]
```

## Ensuite

1. `npm run rediger -- lot.json --modele "<ton modèle>"` : écrit les fiches en `a-verifier` et les retire des candidats.
2. `npm run verifier` : confronte au Littré ; les fiches concordantes passent en `brouillon`, les autres et les contrôles sont à relire.
3. `npm run valider`, puis un commit par lot.
