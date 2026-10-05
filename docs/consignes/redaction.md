# Rédiger une fiche d'après son dossier

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu rédiges une fiche d'Étymon, dictionnaire du sens premier des mots français, d'après le dossier de faits du mot (`atelier/<id>/dossier.json`). Une fiche se lit en dix secondes.

## Règles

- Principe : la justesse des noms, au service de la vérité. Étymon rend à chaque mot son nom juste, et s'écrit de même : chaque mot dans son sens propre, chaque phrase conforme à ce qui est et à ce que disent les sources, rien de plus. Pas de figure, pas de formule, pas d'effet. Relis chaque phrase avec une question : « que veux-tu dire exactement ? » ; si la réponse est plus claire que la phrase, écris la réponse.
- Tu rédiges d'après le dossier (`atelier/<id>/dossier.json`) : la fiche n'affirme rien qui n'y soit (forme, langue, sens, date, auteur, tenant, histoire du mot, usage d'aujourd'hui). Si un fait te manque, va le chercher et ajoute-le au dossier avec sa source ; ce que tu sais sans l'avoir lu ne s'écrit pas. Si le dossier doute de la chaîne, `incertain: true`.
- Un mot entre s'il est important (usage courant, porteur de sens dans la vie intellectuelle, morale, spirituelle ou sociale) et si son sens premier éclaire ce qu'on dit en l'employant. Un mot douteux est rédigé quand même : seul Thibault écarte ; note ton doute dans les signalements.
- `etymologie` : la chaîne, du plus proche au plus lointain, maillon par maillon comme le dossier la donne (un déverbal passe par son verbe : travail, de travailler). Le premier maillon est la langue source directe (latin pour un mot hérité, italien pour un emprunt à l'italien) ; on ne remonte que si cela ajoute un sens ou si l'origine est débattue. Un dernier maillon sans sens (le mot de base latin, credere, lex, regere) se retire : la chaîne s'arrête au maillon qui apprend quelque chose.
- Formes dans leur écriture d'origine (φρήν, صفر) ; translittération seulement pour l'arabe ou l'hébreu (celle du grec se déduit).
- `sens` seulement là où il apprend quelque chose : le sens premier, affiché seul en tête de fiche, est celui du maillon le plus lointain attesté qui en porte un. Chaque sens vient du dossier.
- Découper une forme composée, du tout vers les parties : la forme garde son sens attesté (jamais déduit des parties), puis ses `elements`, chacun avec son sens ; seulement si les parties parlent encore (re-legere, oui ; śāṭān, non). Une hypothèse d'une origine débattue se découpe de même (relegere : re-, « de nouveau », et legere, « recueillir »). Un même élément peut avoir deux sens selon le composé (re- : « de nouveau » dans relegere, « en arrière » dans religare) : chacun vient de l'entrée de son composé.
- `croisement` d'un maillon : les formes avec lesquelles la sienne s'est croisée (chétif : captivus croisé avec le gaulois *cactos ; algorithme : algorisme croisé avec ἀριθμός), seulement si une source le dit ; jamais une hypothèse tirée de la ressemblance des formes.
- `explication` : ce qui s'est perdu, affaibli ou retourné entre le sens premier et l'usage d'aujourd'hui (le fait `usage` du dossier). Elle n'explique pas une seconde fois le sens, affiché juste au-dessus ; mais mieux vaut redire le mot juste qu'un détour. Ton sobre, sans emphase ni jugement. Le sens ancien n'est pas le « vrai » sens du mot, ni l'usage actuel une erreur : l'explication dit ce qui a changé, l'histoire n'en juge pas.
- `themes` : le domaine où le mot s'emploie aujourd'hui, non celui de son sens premier (étonner : émotions, pas météo) ; un ou deux, affichés sur la fiche. Aucune liste fermée n'est exhaustive. Une langue qui manque est un fait : ajoute-la (`npm run liste -- langues "<langue>"`) et note-le dans les signalements. Un thème qui manque ne s'ajoute pas pendant le lot : mets le plus proche, et propose le thème manquant dans les signalements, avec la raison.
- Tout mot étranger cité dans un texte est une forme de la chaîne : l'app le met en italique. Aucune mise en forme, aucun lien écrit à la main.
- Un mot sacré par origine (né dans l'ordre sacré : manne, sabbat, alléluia) ne se rédige pas dans le lot : signale-le, il se rédige à part, texte d'origine sous les yeux. Un mot consacré (profane à l'origine : église, ange, baptême) se rédige comme les autres : son sens profane premier est justement ce que le dictionnaire révèle.
- Le Nom divin s'écrit comme le texte l'écrit (Yah, YHWH), jamais traduit (« Dieu ») ni vocalisé (« Jéhovah », « Yahvé »).
- Une composition : si la forme composée est attestée, elle porte son sens attesté, puis chaque élément le sien ; si le mot est forgé sur des éléments sans forme composée avant lui (schizophrénie), le sens premier est le sens littéral des éléments (esprit fendu), que l'app affiche comme tel (« littéralement »), jamais comme le sens d'une forme qui n'a pas existé.
- `ecartees` : étymologies proposées puis écartées ; `populaire: true` pour une idée reçue (*sincère*, « sans cire »), jamais dans la chaîne.
- Liens entre mots, un seul endroit selon leur raison. Un lien qui s'explique en une phrase va dans l'explication : l'app lie tout mot qui a une fiche (Bleuler renommait la démence précoce) ; un mot nommé dans l'explication n'est donc pas aussi un renvoi. `renvois` (Voir aussi) : notions voisines du même ordre que l'usage d'aujourd'hui, sans racine commune (schizophrénie → délire, folie) ; trois au plus, souvent aucun. `tradition.renvois` (sous « Lectures traditionnelles » : voir obsession) : mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) ; deux au plus, rare. Un renvoi vise un mot important du dictionnaire, qu'il ait déjà sa fiche ou non.
- Auteurs et ouvrages sont cités par leur identifiant dans les champs (`selon`, qui accepte aussi un ouvrage sans auteur unique comme tenant, `forge`, `personne`, `ouvrage`). S'il manque une fiche, choisis son identifiant (prénom et nom sans accent : eugen-bleuler ; abrégé ou titre : utopia) : elle se crée d'après sa notice BnF avant l'écriture des fiches (docs/consignes/references.md).
- Dans un texte, nomme un auteur sous son nom usuel ou une de ses formes de citation (liste ci-dessous) : l'app en fait un lien, s'il est aussi cité dans un champ de la fiche.
- Tu n'écris jamais `sources`, `redaction`, `statut`, `historique` ni les lectures traditionnelles (`tradition.lectures`) : les scripts posent les premiers (npm run rediger), les lectures se rédigent à part, texte source sous les yeux.
- Typographie : le script pose les espaces insécables et les guillemets « » ; les sens s'écrivent sans guillemets.

## Fautes à ne pas refaire

Relevées par la relecture critique au premier pilote :

| Faute | Écrit | À écrire |
|---|---|---|
| La chose prend la place du mot | « Le salaire est devenu la faveur. » | « Le mot qui nommait le salaire a pris le sens de faveur. » |
| Formule d'effet (chiasme) | « L'ardeur est restée, le dieu n'y est plus. » | Dire le fait : ce que le mot désignait, ce qu'il désigne aujourd'hui, selon le dossier. |
| Absolu que le dossier ne dit pas | « Seul le travail du maréchal garde l'idée de contrainte. » | Aucun « seul », « toujours », « jamais », « ne… plus que » sans un fait du dossier qui le dise. |
| Usage actuel de mémoire | « Il nomme aujourd'hui moins la science que la cause. » | L'usage d'aujourd'hui vient du fait `usage` du dossier, et de lui seul. |
| Chronologie inventée | « Botanique d'abord, puis tous les êtres vivants, puis les sociétés. » | N'ordonner dans le temps que des sens que le dossier date. |
| Mot d'une autre époque | « Chez Homère, l'ange est quiconque porte une nouvelle. » | « Chez Homère, ἄγγελος désigne… » : la forme de l'époque dont on parle. |
| Mot juste contourné | Sens affiché « en haine », puis « l'aversion que disait la locution ». | Redire « haine » : le mot juste, pas un voisin plus faible. |
| Premier sens mal placé | « Le mot nomma d'abord la partie de la philosophie qui traite de l'âme » (attesté en 1690, alors que le premier emploi date de 1588). | « D'abord » seulement pour la première attestation du dossier. |

## Format

Un fichier JSON, `atelier/<id>/fiche.json` : la fiche seule, avec les champs ci-dessous et eux seuls ; un champ facultatif à sa valeur par défaut ne s'écrit pas ; `nature` se déduit du Littré et ne s'écrit que pour un mot qui n'y figure pas (postérieur à 1872 : le TLFi la donne).

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `mot` | texte | oui | Le mot français, tel qu'on l'écrit (le nom du fichier en est la forme sans accent). |
| `nature` | liste non vide de `nom masculin` \| `nom féminin` \| `nom` \| `nom propre` \| `verbe` \| `adjectif` \| `adverbe` \| `interjection` | non | Catégorie(s) grammaticale(s) ; tirée du Littré si absente. |
| `etymologie` | liste non vide d'objets (voir plus bas) | oui | Chaîne étymologique, du plus proche au plus lointain. La langue source directe ouvre la chaîne ; on ne remonte que si cela ajoute un sens. |
| `explication` | texte | non | 1 à 3 phrases, 300 caractères au plus : ce qui s'est perdu, affaibli ou retourné ; ne répète pas le sens premier. Texte brut : les formes de la fiche y sont mises en italique par l'app. Obligatoire, sauf pour un mot sacré, qui n'en a pas. |
| `ecartees` | liste d'objets (voir plus bas) | non | Étymologies proposées puis écartées : idées reçues ou hypothèses savantes abandonnées. |
| `incertain` | `true` \| `false` | non | La chaîne elle-même est douteuse (une origine débattue relève des alternatives). Faux si absent. |
| `doublets` | liste d'identifiants | non | Fiches issues du même étymon par une autre voie ; la relation se déclare sur une seule des deux fiches. |
| `famille` | liste de textes | non | Mots français apparentés, de la même racine. |
| `renvois` | liste d'identifiants | non | Voir aussi : notions voisines du même ordre, sans racine commune (schizophrénie → délire) ; fiche ou candidat à faire, trois au plus, déclarés d'un seul côté. |
| `themes` | liste non vide de valeurs d'une liste fermée (voir plus bas) | oui | Thèmes (liste fermée : data/themes.json), un ou deux. |
| `tradition` | objet (voir plus bas) | non | Les mots où la tradition parle de celui-ci ; les lectures s'écrivent à part. |

### `etymologie[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | non | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | oui | Langue (liste fermée : data/langues.json). |
| `sens` | texte | non | Sens de ce maillon, seulement s'il apprend quelque chose (pas pour l'allemand Schizophrenie, ni le latin Satanas). |
| `elements` | liste non vide d'objets (voir plus bas) | non | Composition : les éléments dont la forme est faite (φίλος + σοφία). |
| `croisement` | liste non vide d'objets (voir plus bas) | non | Croisement : formes avec lesquelles celle du maillon s'est croisée (captivus croisé avec le gaulois *cactos ; algorisme croisé avec ἀριθμός). Seulement si une source le dit. |
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

### `etymologie[].croisement[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `forme` | texte | oui | Forme dans son écriture d'origine (religio, φρήν, صفر) ; reconstruite, elle commence par `*` et s'écrit entre guillemets. |
| `translitteration` | texte | non | Translittération, seulement pour une écriture ni latine ni grecque (arabe, hébreu) : celle du grec se déduit. |
| `langue` | liste fermée (voir plus bas) | oui | Langue (liste fermée : data/langues.json). |
| `sens` | texte | non | Sens, sans guillemets (l'app les ajoute). |

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
| `selon` | liste d'identifiants | non | Origine débattue : qui a proposé ou défend cette hypothèse (identifiants d'auteurs, ou d'un ouvrage sans auteur unique : un dictionnaire comme Lewis & Short). Un ouvrage qui ne fait que la rapporter n'en est pas tenant. |

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

### `tradition`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `renvois` | liste d'identifiants | non | Mots que la tradition a lus et où elle parle de ce dont traite celui-ci (schizophrénie → obsession) : fiche ou candidat à faire, deux au plus ; affichés une fois leur fiche pourvue de lectures. |

### Listes fermées

- `nature` : nom masculin, nom féminin, nom, nom propre, verbe, adjectif, adverbe, interjection.
- `langue` : latin, latin populaire, bas latin, latin médiéval, latin humaniste, latin ecclésiastique, ancien français, français, grec ancien, gaulois, étrusque, francique, germanique, ancien nordique, arabe, hébreu, araméen, persan, turc, italien, espagnol, ancien espagnol, portugais, occitan, néerlandais, allemand, anglais, indo-européen.
- `themes` : émotions, esprit, parole, savoir, morale, religion, corps, santé, famille, société, droit, guerre, travail, argent, commerce, nourriture, maison, nature, météo, temps, politique.
- Auteurs existants (identifiant : nom, formes de citation) : al-khwarizmi (al-Khwârizmî) ; anatole-bailly (Anatole Bailly, Bailly) ; auguste-comte (Auguste Comte, Comte) ; auguste-scheler (Auguste Scheler, Scheler) ; augustin-calmet (Augustin Calmet, Calmet) ; augustin (Augustin) ; ciceron (Cicéron) ; emile-littre (Émile Littré, Littré) ; ernst-haeckel (Ernst Haeckel, Haeckel) ; eugen-bleuler (Eugen Bleuler, Bleuler) ; felix-gaffiot (Félix Gaffiot, Gaffiot) ; francois-andrieux (François Andrieux, Andrieux) ; gavius-bassus (Gavius Bassus) ; gerard-de-cremone (Gérard de Crémone) ; isidore-de-seville (Isidore de Séville) ; lactance (Lactance) ; philipp-melanchthon (Philipp Melanchthon, Melanchthon) ; platon (Platon) ; rabban-gamliel (Rabban Gamliel) ; rashi (Rashi, Salomon ben Isaac) ; thomas-d-aquin (Thomas d'Aquin) ; thomas-more (Thomas More, More) ; varron (Varron).
- Ouvrages existants : al-jabr (Abrégé du calcul par la restauration et la comparaison), bailly (Dictionnaire grec-français), bible-hebraique (Bible hébraïque), bnf (Catalogue général de la Bibliothèque nationale de France), brown-driver-briggs (Lexique hébreu et anglais de l'Ancien Testament), commentaire-sur-la-torah (Commentaire sur la Torah), de-l-invention (De l'invention), de-la-langue-latine (De la langue latine), dementia-praecox (Dementia praecox ou Groupe des schizophrénies), dictionnaire-de-la-bible (Dictionnaire historique, critique, chronologique, géographique et littéral de la Bible), differences (Différences), etymologies (Étymologies), gaffiot (Dictionnaire latin-français), gorgias (Gorgias), institutions-divines (Institutions divines), ion (Ion), la-cite-de-dieu (La Cité de Dieu), lewis-short (Dictionnaire latin), littre (Dictionnaire de la langue française), michna (Michna), philippiques (Philippiques), somme-theologique (Somme théologique), talmud-de-babylone (Talmud de Babylone), tlfi (Trésor de la langue française informatisé), traite-des-lois (Traité des lois), utopia (L'Utopie), vulgate (Vulgate).

## Exemples

Fiches du dépôt (simple ; filiation ; filiation et composition ; mot forgé ; origine débattue ; nom de personne et étymologie écartée) :

```json
[
  {"mot":"étonner","etymologie":[{"forme":"*extonare","langue":"latin populaire","sens":"ébranler comme par un coup de tonnerre"}],"explication":"Vers 1100, étonner, c'était être étourdi par un coup violent ; la langue classique y entendait encore épouvanter comme la foudre. Le mot dit aujourd'hui la surprise devant l'extraordinaire ou l'inattendu ; le sens concret reste dans des emplois techniques : étonner une roche, une voûte.","themes":["émotions"]},
  {"mot":"chiffre","etymologie":[{"forme":"cifra","langue":"latin médiéval","sens":"zéro"},{"forme":"صفر","translitteration":"ṣifr","langue":"arabe","sens":"vide"}],"explication":"Chiffre a d'abord nommé le zéro, la nouveauté la plus marquante de la numération arabe ; à partir de 1485, tous les signes de cette numération, puis le nombre qu'ils écrivent. Zéro, son doublet, a pris le sens que chiffre quittait.","doublets":["zero"],"famille":["chiffrer","déchiffrer"],"themes":["savoir"]},
  {"mot":"philosophie","etymologie":[{"forme":"philosophia","langue":"latin"},{"forme":"φιλοσοφία","langue":"grec ancien","sens":"amour du savoir","elements":[{"forme":"φίλος","sens":"qui aime"},{"forme":"σοφία","sens":"habileté, savoir, sagesse"}]}],"explication":"En grec, φιλοσοφία se disait de l'étude de tout art ou de toute science, et de la recherche de la vérité. En français, le mot a d'abord désigné l'ensemble des disciplines spéculatives (vers 1175) ; il nomme aujourd'hui une discipline parmi d'autres, et la manière dont chacun prend la vie.","famille":["philosophe","philosophique","philosopher"],"themes":["savoir","esprit"]},
  {"mot":"schizophrénie","nature":["nom féminin"],"etymologie":[{"forme":"Schizophrenie","langue":"allemand","forge":{"par":["eugen-bleuler"],"date":"1908"}},{"langue":"grec ancien","sens":"esprit fendu","elements":[{"forme":"σχίζω","sens":"fendre"},{"forme":"φρήν","sens":"esprit"}]}],"explication":"Bleuler renommait la démence précoce, parce que la scission des fonctions psychiques en était à ses yeux l'un des caractères les plus importants. En grec, φρήν désignait d'abord le diaphragme, puis le cœur ou l'âme, siège des sentiments et de la pensée.","famille":["schizophrène","frénésie","frénétique"],"renvois":["delire","folie"],"themes":["esprit","santé"],"tradition":{"renvois":["obsession"]}},
  {"mot":"religion","etymologie":[{"forme":"religio","langue":"latin","sens":"attention scrupuleuse"},{"langue":"latin","alternatives":{"mode":"debattue","formes":[{"forme":"religare","sens":"attacher, relier","elements":[{"forme":"re-","sens":"en arrière"},{"forme":"ligare","sens":"lier"}],"selon":["lactance"]},{"forme":"relegere","sens":"recueillir de nouveau","elements":[{"forme":"re-","sens":"de nouveau"},{"forme":"legere","sens":"recueillir"}],"selon":["ciceron"]}]}}],"explication":"Envers les dieux, religio disait aussi la crainte pieuse, le culte et la croyance. Le mot désigne aujourd'hui le rapport de l'homme au divin et les croyances et pratiques d'un groupe ; le sens de conscience scrupuleuse reste dans « éclairer la religion de quelqu'un ».","famille":["religieux","religiosité","irréligion"],"themes":["religion"]},
  {"mot":"algorithme","etymologie":[{"forme":"algorisme","langue":"ancien français","croisement":[{"forme":"ἀριθμός","langue":"grec ancien"}]},{"forme":"alguarismo","langue":"ancien espagnol","sens":"art de compter"},{"forme":"الخوارزمي","translitteration":"al-Ḫuwārizmī","langue":"arabe","sens":"celui du Khwarezm","personne":"al-khwarizmi"}],"explication":"Algorisme a d'abord nommé le calcul avec les chiffres arabes, que les traductions des œuvres d'al-Khwârizmî avaient introduit dans l'Europe médiévale ; croisé avec ἀριθμός, il est devenu algorithme. Le mot désigne aujourd'hui l'ensemble des procédés propres à un calcul.","ecartees":[{"forme":"ἀριθμός","langue":"grec ancien","sens":"nombre","raison":"Littré l'écarte comme étymon, précédé de l'article arabe, car seul le nom d'al-Khwârizmî rend compte du g ; le TLFi n'y voit qu'un croisement, qui a donné la forme algorithme."}],"famille":["algorithmique"],"renvois":["algebre"],"themes":["savoir"]}
]
```

## Contrôle

`npm run rediger -- atelier/<id>/fiche.json --essai` : valide la fiche avec le dépôt sans l'écrire. Corrige ce qui est « à corriger » ; ce qui est « à créer » (auteurs, ouvrages) se crée d'après la BnF avant l'écriture.
