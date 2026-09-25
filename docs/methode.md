# Méthode de rédaction autonome

Comment l'agent remplit seul le dictionnaire (mots, auteurs, ouvrages, lectures), jusqu'au
statut `brouillon`, pour que Thibault n'ait plus qu'à relire. Seconde version, refondue après le
premier pilote (`docs/journal-methode.md`) : un rédacteur seul pour tout le lot, un relecteur neuf.

## 1. Principes

1. **Les sources d'abord, l'écriture ensuite.** On ne rédige jamais de mémoire : la fiche
   n'affirme rien qui ne soit dans le dossier de sources du mot. La mémoire guide la recherche,
   elle ne la remplace pas (AGENTS.md §2.1).
2. **Un seul rédacteur par lot.** Il lit le cadrage une fois, garde le lot en tête (familles,
   doublets, renvois entre ses mots) et corrige sa manière d'un mot à l'autre.
3. **Un œil qui n'a pas écrit relit.** Un second agent, neuf, relit tout le lot d'après les
   dossiers. Au premier pilote, c'est lui qui a trouvé les vraies erreurs.
4. **Le mécanique aux scripts, le jugement aux modèles.** Ce qu'un script peut faire (Littré,
   TLFi, BnF, validation, citations en ligne, typographie), aucun modèle ne le fait.
5. **Le moteur est dit.** Chaque fiche porte le modèle et le niveau de réflexion qui l'ont
   rédigée (`redaction`).
6. **Le modèle de données est figé pendant un lot.** Les agents signalent ce qu'il ne permet
   pas de dire ; on l'affine entre deux lots (§6).

## 2. Qui décide quoi

| Niveau | Automatique | Revient à Thibault |
|---|---|---|
| Fiches | tout, jusqu'au `brouillon` | relecture, validation (`validee`) |
| Méthode (consignes, exemples) | ajustements tirés de ses corrections et de la relecture critique, notés dans `docs/journal-methode.md` | relire le journal, s'il le veut ; une refonte |
| Listes fermées (langues, traditions, thèmes) | ajouts (§7), notés au journal | retirer ou fusionner, à la relecture |
| Modèle de données | détection, épreuve, implémentation, migration, entre deux lots, avec un compte rendu | ce qui touche aux principes et aux critères (§2, §3.3, sacré ou consacré) : l'agent propose, Thibault tranche |

## 3. Le lot, en quatre passes

Un lot est une dizaine de mots, choisis par familles et voisinage (doublets, renvois, même
racine), jamais dans l'ordre alphabétique.

| Passe | Qui | Quoi | Consigne |
|---|---|---|---|
| 1 | rédacteur | pour chaque mot : dossier (tri compris), puis fiche dans `atelier/<id>/` | `docs/consignes/redacteur.md` |
| 2 | relecteur (neuf) | toutes les fiches du lot, d'après leurs dossiers : un verdict par mot | `docs/consignes/relecture.md` |
| 3 | rédacteur (repris, avec son contexte) | reprises (il adopte la proposition du relecteur quand elle est juste), auteurs et ouvrages d'après la BnF, écriture des fiches, lectures traditionnelles | `docs/consignes/redacteur.md` |
| 4 | relecteur (repris) | seulement les remarques de la passe 2 et les lectures ajoutées | `docs/consignes/relecture.md` |

Puis `npm run valider` et un commit par lot, que Thibault relit. Une remarque restée ouverte à la
passe 4 ne relance pas de boucle : le rédacteur la règle si elle est simple, sinon la fiche
reste dans l'atelier et va aux signalements.

Moteurs : **Claude Opus 5.5, réflexion élevée**, pour les deux rôles (agents du projet
`.claude/agents/etymon-redacteur.md` et `etymon-relecteur.md`). Au premier pilote, les fautes
venaient de la rédaction (Fable 5.1, réflexion élevée), et les propositions du relecteur (Opus
5.5) étaient sobres et exactes : le travail est d'abord de fidélité aux sources.

Un mot sacré (chemin `sacre`) s'arrête après son dossier : il se rédige à part, texte d'origine
sous les yeux, avec sa lecture `premier`.

## 4. Le tri

Chemins (un seul par mot) :

- **ordinaire** : héritage ou emprunt ;
- **forgé** : un auteur, une date, parfois un ouvrage (`forge`) ;
- **débattu** : plusieurs hypothèses, avec leurs tenants (`alternatives`) ;
- **récent** : absent du Littré (après 1872) ; le TLFi suffit (AGENTS.md §5) ;
- **sacré** : né dans l'ordre sacré (AGENTS.md §3.3 bis) ; texte d'origine ;
- **consacré** : profane à l'origine, pris dans l'ordre sacré ; chemin ordinaire.

Drapeaux (plusieurs possibles) : `tradition` (lectures à chercher), `doute` sur le critère
d'entrée (le rédacteur rédige quand même et signale), `nom-propre` (nom de personne ou titre dans
la chaîne).

## 5. Les artefacts

Tout vit dans `atelier/`, hors du dépôt : un lot interrompu reprend où il s'était arrêté.

- **Dossier** (`atelier/<id>/dossier.json`) : chemin, drapeaux, l'usage d'aujourd'hui (`usage`),
  et des faits, chacun avec sa source et son entrée : la chaîne, le sens de chaque maillon qui en
  porte un, les étapes datées du sens en français. Du texte recopié seulement pour le domaine
  public (Littré, Wikisource) ; du TLFi, du Gaffiot et du Bailly, les faits seuls, jamais leur
  rédaction (AGENTS.md §5). Format : `scripts/lib/atelier.ts`.
- **Fiche rédigée** (`atelier/<id>/fiche.json`) : le format de `npm run rediger`.
- **Verdict** (`atelier/<id>/verdict.json`) : décision et remarques du relecteur.
- **Signalements** (`atelier/signalements.md`) : doutes sur le critère d'entrée, listes fermées
  touchées, limites du modèle, sources inaccessibles, remarques non suivies.
- **Journal de méthode** (`docs/journal-methode.md`, versionné) : chaque ajustement de la méthode
  et sa cause.

## 6. L'affinage entre deux lots

1. Rassembler les signalements du lot et les corrections de Thibault.
2. Classer chacun : erreur de fiche (corriger), de méthode (consigne ou exemple), de modèle.
3. Méthode : ajuster les consignes ; une faute relevée par la relecture ou par Thibault devient
   un exemple de la consigne de rédaction (« Fautes à ne pas refaire »). Noter la cause au
   journal.
4. Listes fermées : ajouter les thèmes proposés par plusieurs mots, reclasser (§7).
5. Modèle : éprouver le changement sur des cas réels, l'implémenter, migrer, tester ; compte
   rendu court. S'il touche un principe ou un critère, le proposer à Thibault et attendre.
6. Vider l'atelier du lot, puis lot suivant.

## 7. Les listes fermées

Langues, traditions et thèmes sont des listes fermées (`data/*.json`) : une fiche ne peut citer
que leurs valeurs. Aucune n'est exhaustive d'avance ; elles grandissent avec les mots, par un
seul point (`npm run liste`), jamais au gré d'un agent qui écrirait une valeur ailleurs.

- **Une langue** qui manque est un fait : l'agent qui en a besoin l'ajoute pendant le lot.
- **Une tradition** qui manque : l'agent qui en a besoin l'ajoute aussi. Une tradition de trop se
  retire à la relecture plus aisément qu'une tradition manquante ne s'ajoute après coup.
- **Un thème** qui manque ne s'ajoute pas pendant le lot : la fiche porte le plus proche, et
  l'agent propose le thème manquant. Entre deux lots, un thème proposé par plusieurs mots (trois,
  par exemple) est ajouté ; les fiches déjà écrites qui en relèvent sont reclassées
  (`npm run etat -- themes` les montre par thème).
- Chaque ajout est noté au journal de méthode, avec le mot qui l'a demandé. Retirer ou fusionner
  une valeur revient à Thibault, à la relecture.

Le thème dit le domaine où le mot s'emploie aujourd'hui, non celui de son sens premier
(*étonner* : émotions, non météo). Il est affiché sur la fiche, à côté de la nature.

## 7 bis. Les lectures : un corpus de réflexe

Pour l'histoire du mot, le Littré, le TLFi, le Gaffiot et le Bailly se consultent par réflexe ; pour
la tradition, un corpus de même rang (`scripts/lib/corpus.ts`, `npm run corpus`) : des œuvres qui
lisent les mots eux-mêmes, où l'on peut chercher un mot, et dont le texte original est en ligne,
du domaine public. Aujourd'hui : Isidore (*Étymologies*, *Différences*), Jérôme (*Livre des noms
hébreux*), Rashi (*Commentaire sur la Torah*). Téléchargées une fois dans `sources/`, elles
s'interrogent par un script, sans jeton : la machine trouve et cite, elle ne parle pas à la place
de la tradition.

- **Un plancher, jamais une limite** (décision de Thibault) : tout autre auteur traditionnel qui a
  lu le mot se cherche aussi, et se cite de même, texte sous les yeux.
- **Consulter n'oblige pas à trouver** : une lecture n'entre que si l'auteur lit le mot et dit
  quelque chose qui diffère de l'histoire ou la complète.
- Une œuvre entre au corpus si elle remplit les trois conditions ; on l'ajoute à
  `scripts/lib/corpus.ts`, et la consigne des lectures suit.

## 8. L'économie

- Les scripts d'abord (zéro jeton) ; le jugement seulement là où il faut juger.
- Deux agents par lot, chacun repris une fois avec son contexte : le cadrage et les consignes se
  lisent deux fois par lot, non plus cinq fois par mot (premier pilote : 51 agents, 3,9 millions
  de jetons, environ 77 000 par agent, pour deux fiches acceptées).
- Des dossiers complets du premier coup (usage d'aujourd'hui, étapes datées, sens de chaque
  maillon sourcé) : c'est leur manque qui faisait refuser les fiches.
- La seconde relecture ne relit que les remarques et les lectures.
- Mesurer chaque lot (jetons, fiches acceptées, remarques par critère) et ajuster d'après la
  mesure, non d'après l'intuition.

## 9. Les outils

| Outil | Rôle |
|---|---|
| `npm run dossier -- <mot>` | crée le dossier (Littré recopié) et affiche le Littré, le plan des sens du TLFi (avec ses marques d'usage) et sa rubrique « Étymologie et historique », lus par l'API du portail du CNRTL ; `--consulter` pour un mot voisin ; `--verifier` contrôle un dossier et son verdict |
| `npm run texte -- <adresse>` | texte brut d'une page, tel quel (`bailly:φρήν` pour une entrée du Bailly) ; `--autour "<mot>"` pour n'en lire que les passages utiles |
| `npm run bnf -- auteur\|ouvrage "<nom>"` | cherche les notices BnF ; avec `--cb`, écrit la fiche en brouillon d'après la notice |
| `npm run rediger -- <fiche.json>… --dossier` | écrit les fiches d'après leur dossier, avec `--modele` et `--reflexion` ; `--essai` valide sans écrire |
| `npm run corpus -- chercher <radical>` | cherche un étymon dans le corpus de réflexe des lectures (après `npm run corpus -- telecharger`) ; les passages ★ expliquent un mot |
| `npm run liste -- <liste> "<valeur>"` | ajoute une langue, une tradition ou un thème, et régénère les consignes ; `npm run etat -- themes` montre les mots de chaque thème |
| `docs/consignes/*.md` | les consignes du rédacteur, du relecteur et de chaque étape, générées par `npm run contrat` |
| `.claude/agents/etymon-*.md` | les deux agents, avec leur modèle et leur réflexion |
