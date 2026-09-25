# Les dictionnaires ouverts

> Évolution future, à ne pas coder sans accord. [Retour aux évolutions](README.md).

Des dictionnaires hébreu et arabe, à côté du dictionnaire français, pour les mots qui intéressent
Étymon. Ils expliquent les mots en français.

## Voilés par défaut, ouverts d'un geste

Pour qui ne les cherche pas, l'app reste un seul dictionnaire : ils sont voilés, par réserve, comme
les lectures traditionnelles. Le lecteur les ouvre d'un geste : au premier lien vers l'une de ces
langues (« Ouvrir la langue hébraïque ? »), ou dans les paramètres (« Langues ouvertes ») ; il peut
les refermer. C'est la suite de la règle posée pour le sacré : on ne le tire pas au hasard, on y
vient en le cherchant ; « frappez, et l'on vous ouvrira » (*pulsate et aperietur vobis*, Matthieu
7, 7).

Le mot est « ouvrir », jamais « déverrouiller » : rien n'est interdit, rien ne s'achète. Un
dictionnaire s'ouvre par le seul geste du lecteur, jamais contre un don, un score ou une progression.

## Langues ouvrables

Les langues sacrées au sens strict, dans lesquelles une tradition lit les racines : l'hébreu,
l'arabe ; l'araméen est à discuter (la langue du Talmud et d'une partie de Daniel, déjà présente dans
les chaînes de *manne* et de *Pâque*). Le latin et le grec, sacrés au sens d'Isidore (*Étymologies*,
IX, 1, 3), restent ouverts : leurs pages de racine seraient philologiques.

## Avant de construire

1. **Ce qu'est le sens premier d'une entrée de langue sacrée.** Pour le français, c'est le plus
   ancien sens établi par la philologie. Pour une langue sacrée, deux ordres se présentent : l'histoire
   (la philologie comparée des langues sémitiques), ou la tradition (le sens de principe, *aṣl*, de
   la racine chez Ibn Fâris ; la racine chez Radak ; l'usage du Coran ou de la Torah). Pour les mots
   sacrés, Étymon a déjà tranché que le sens en tête vient du texte d'origine. Le dictionnaire d'une
   langue sacrée pourrait suivre la même règle : à éprouver sur quelques cas, comme on l'a fait pour
   *manne* et *sabbat* (`docs/cas-epreuve-sacre.md`).
2. **Un relecteur qui lit la langue.** Seul Thibault valide les fiches ; pour l'hébreu et l'arabe,
   il faut pouvoir juger des sources dans ces langues.
3. **L'ordre.** Chaque dictionnaire est un projet à part entière (sources, sens premier, relecture) :
   après que la méthode a fait ses preuves sur le français.

## Ce que cela implique pour l'architecture

- **Plusieurs dictionnaires, une app** (pattern Registre) : chaque dictionnaire est un module, avec
  ses fiches, son index, sa recherche, que l'app interroge par la même interface.
- **Un schéma par dictionnaire**, composé : un socle commun, étendu pour chaque langue (la racine
  obligatoire pour une entrée sémitique).
- **Chargés seulement une fois ouverts** : un dictionnaire fermé n'est ni chargé ni mis en cache hors
  ligne.
- **Des adresses par dictionnaire** : `#/fr/mot/…`, `#/he/mot/…`, `#/ar/mot/…`.
- **L'écriture de droite à gauche**, avec les voyelles, déjà en place pour les citations.
- **Le pont depuis les fiches françaises** : les maillons hébreux et arabes porteraient leur `racine`
  (*ṣ-f-r* pour *ṣifr*), qui mènerait à l'entrée du dictionnaire. C'est la seule préparation utile
  dès aujourd'hui, à décider avant la rédaction en masse.

## Pages de racine

Liée à ces dictionnaires, une évolution plus proche : une page par racine, dans toutes les langues,
qui réunit les mots français qui en viennent. Elle se calcule à l'assemblage, sans rien écrire de
plus, à condition d'une convention de forme pour les étymons (l'infinitif d'un verbe latin, le
nominatif d'un nom…). Exemple : la page de *legere* réunirait *lire*, *élire*, *collège*,
*intelligence*, *diligence*, *négligence*, et *religion*, par l'hypothèse de Cicéron.
