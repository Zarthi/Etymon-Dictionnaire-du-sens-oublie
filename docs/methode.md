# Méthode de rédaction autonome

Comment l'agent remplit seul le dictionnaire (mots, auteurs, ouvrages, lectures), jusqu'au
statut `brouillon`, pour que Thibault n'ait plus qu'à relire. La méthode est adéquate quand
chaque étape reçoit le moteur que sa tâche demande, rien de plus.

## 1. Principes

1. **Les sources d'abord, l'écriture ensuite.** On ne rédige jamais de mémoire : la rédaction
   se fait le dossier de sources sous les yeux. La mémoire guide la recherche, elle ne la
   remplace pas (§2, principe 1).
2. **Trier avant d'écrire.** Chaque mot suit le chemin que sa nature impose (§4).
3. **Le mécanique aux scripts, le jugement aux modèles.** Ce qu'un script peut faire (Littré,
   BnF, validation, citations en ligne, typographie), aucun modèle ne le fait.
4. **Un point unique pour ce qui est partagé.** Auteurs, ouvrages, liens entre fiches : une
   seule étape les crée, sans doublon.
5. **Un œil qui n'a pas écrit relit.** La relecture critique est faite par un autre agent, d'un
   autre modèle, d'après le principe de justesse (AGENTS.md §3).
6. **Le modèle de données est figé pendant un lot.** Les agents signalent ce qu'il ne permet
   pas de dire ; on l'affine entre deux lots (§7).

## 2. Qui décide quoi

| Niveau | Automatique | Revient à Thibault |
|---|---|---|
| Fiches | tout, jusqu'au `brouillon` | relecture, validation (`validee`) |
| Méthode (consignes, exemples) | ajustements tirés de ses corrections et de la relecture critique, notés dans `docs/journal-methode.md` | relire le journal, s'il le veut |
| Modèle de données | détection, épreuve, implémentation, migration, entre deux lots, avec un compte rendu | ce qui touche aux principes et aux critères (§2, §3.3, sacré ou consacré) : l'agent propose, Thibault tranche |

## 3. La chaîne

Un lot est une dizaine de mots, choisis par familles et voisinage (doublets, renvois, même
racine), jamais dans l'ordre alphabétique : les fiches liées s'écrivent ensemble.

| Étape | Entrée → sortie | Moteur | Contrôle |
|---|---|---|---|
| 0. Tri | mot → chemin, drapeaux (§4) | Haiku, effort bas, avec le Littré local | le chemin est dans la liste fermée |
| 1. Dossier | mot et chemin → dossier de faits (§5) | scripts ; Sonnet, effort bas, pour lire une page (TLFi, Bailly, Gaffiot) | chaque fait a sa source et son entrée |
| 2. Rédaction | dossier → contenu de la fiche (format de `npm run rediger`) | Fable 5.1, effort élevé | le schéma d'entrée |
| 3. Référentiel | auteurs et ouvrages demandés par le lot → fiches, sans doublon | script SRU (BnF) ; Haiku pour la description | `npm run valider` |
| 4. Contrôle | fiches → verdict | scripts (`valider`, `verifier`, `verifier:en-ligne`), puis relecture critique : Opus 5.5, effort élevé | un seul retour à l'étape 2 ; au second échec, la fiche reste `a-verifier`, signalée |
| 5. Lectures | mots signalés au tri → lectures traditionnelles | Fable 5.1 pour trouver l'auteur et le passage ; scripts pour vérifier la citation | `verifier:en-ligne` mot pour mot |
| 6. Relecture | brouillons → corrections de Thibault | Thibault | chaque correction devient une règle ou un exemple (§7) |

La relecture critique (étape 4) juge trois choses, et rien d'autre : chaque affirmation est
dans le dossier ; chaque phrase répond à « que veux-tu dire exactement ? » ; les règles
éditoriales que les scripts ne voient pas sont respectées (étymologie et tradition distinctes,
fonds commun, sens premier à sa place).

Un mot sacré (étape 0) passe directement de l'étape 1 à une rédaction texte d'origine sous les
yeux, avec sa lecture `premier` ; il ne passe jamais par un lot de mémoire.

## 4. Le tri

Chemins (un seul par mot) :

- **ordinaire** : héritage ou emprunt ; Littré, puis Gaffiot, Bailly ou TLFi ;
- **forgé** : un auteur, une date, parfois un ouvrage (`forge`) ;
- **débattu** : plusieurs hypothèses, avec leurs tenants (`alternatives`) ;
- **récent** : absent du Littré (après 1872) ; le TLFi suffit (§5 d'AGENTS.md) ;
- **sacré** : né dans l'ordre sacré (§3.3 bis) ; texte d'origine ;
- **consacré** : profane à l'origine, pris dans l'ordre sacré ; chemin ordinaire.

Drapeaux (plusieurs possibles) : tradition probable (étape 5), doute au §3.3 (l'agent rédige
quand même et signale), nom propre ou titre dans la chaîne (`personne`, `ouvrage`).

## 5. Les artefacts

- **Dossier** (`atelier/<id>/dossier.json`, hors du dépôt, comme `sources/`) : des faits, chacun
  avec sa source et son entrée (formes, langues, sens, dates, tenants). Du texte recopié
  seulement pour le domaine public (Littré, Wikisource) ; du TLFi, du Gaffiot et du Bailly, les
  faits seuls, jamais leur rédaction (§5 d'AGENTS.md). Il se relit en quelques secondes.
- **Contenu rédigé** (`atelier/<id>/fiche.json`) : le format de `npm run rediger`.
- **Signalements** (`atelier/signalements.md`) : doutes au §3.3, limites du modèle, sources
  inaccessibles, avec le mot et le cas.
- **Journal de méthode** (`docs/journal-methode.md`, versionné) : chaque ajustement de la
  méthode et sa cause.

Tout est écrit sur disque à chaque étape : un lot interrompu reprend où il s'était arrêté.

## 6. L'orchestration

- **Le chef d'orchestre est un script de workflow**, pas un modèle : il enchaîne les étapes,
  répartit les mots, regroupe les demandes d'auteurs et d'ouvrages avant l'étape 3. Il ne
  coûte rien et ne dévie pas. Chaque étape est un `pipeline()` : un mot peut être à l'étape 4
  pendant qu'un autre est à l'étape 1. Seule l'étape 3 est une barrière (dédoublonnage).
- **Chaque agent reçoit son modèle, son effort et un schéma de sortie** (`model`, `effort`,
  `schema`) : la forme de sa réponse est garantie, les validateurs garantissent le fond.
- **Consignes courtes, par étape**, générées par `npm run contrat` comme `prompt-redaction.md` :
  un agent ne reçoit que ce que son étape exige. AGENTS.md lui est déjà donné au démarrage.
- **Le script n'a pas accès aux fichiers** : ce sont les agents qui lisent, écrivent et lancent
  les scripts du projet.
- **Échelle** : une dizaine d'agents en même temps ; un lot par workflow ; on reprend un lot
  interrompu (`resumeFromRunId`).
- **Commit** : un par lot (`data: 10 fiches brouillon (…)`), après `npm run valider`.

## 7. L'affinage entre deux lots

1. Rassembler les signalements du lot et les corrections de Thibault.
2. Classer chacun : erreur de fiche (corriger), de méthode (consigne ou exemple), de modèle.
3. Méthode : ajuster les consignes, noter la cause au journal.
4. Modèle : éprouver le changement sur des cas réels, l'implémenter, migrer, tester ; compte
   rendu court. S'il touche un principe ou un critère, le proposer à Thibault et attendre.
5. Lot suivant.

## 8. L'économie

- Les scripts d'abord (zéro jeton) ; le jugement seulement là où il faut juger.
- Fable 5.1 reçoit un dossier compact, jamais des pages entières.
- Consignes par étape plutôt que le contrat entier ; sorties structurées, sans prose.
- Relecture critique sur la fiche et son dossier, pas sur les sources.
- Mesurer au pilote le coût par fiche et par étape, et ajuster les moteurs d'après la mesure,
  non d'après l'intuition.

## 9. Le pilote

Dix mots, au moins un par chemin du tri, dont un avec tradition. On mesure le coût, la qualité
(à la relecture de Thibault) et ce qui a échoué ; on corrige la méthode ; puis on étend.

À vérifier au pilote :

- l'accès au TLFi : il ne s'ouvre que dans le navigateur, et il n'y en a qu'un (étape 1
  en série, ou autre chemin) ;
- le coût d'AGENTS.md, donné à chaque agent ;
- la répartition des moteurs (Haiku suffit-il au tri ? Sonnet au dossier ?) ;
- le taux de retour de la relecture critique vers la rédaction.

## 10. À construire avant le pilote

- les schémas du tri, du dossier et du verdict de relecture (`src/lib/schema.ts`) ;
- les consignes de chaque étape, générées par `npm run contrat` ;
- un script de dossier (`npm run dossier -- <mot>`) : Littré local, BnF, Wikisource ;
- le script du workflow d'un lot.
