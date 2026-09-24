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
| Listes fermées (langues, traditions, thèmes) | ajouts (§7 bis), notés au journal | retirer ou fusionner, à la relecture |
| Modèle de données | détection, épreuve, implémentation, migration, entre deux lots, avec un compte rendu | ce qui touche aux principes et aux critères (§2, §3.3, sacré ou consacré) : l'agent propose, Thibault tranche |

## 3. La chaîne

Un lot est une dizaine de mots, choisis par familles et voisinage (doublets, renvois, même
racine), jamais dans l'ordre alphabétique : les fiches liées s'écrivent ensemble.

| Étape | Entrée → sortie | Moteur | Contrôle |
|---|---|---|---|
| 1. Dossier et tri | mot → chemin, drapeaux (§4) et dossier de faits (§5) | `npm run dossier` (Littré local, TLFi par son API) ; Sonnet, effort bas, pour trier et tirer les faits | `npm run dossier -- --verifier` : chaque fait a sa source et son entrée |
| 2. Rédaction | dossier → contenu de la fiche (`atelier/<id>/fiche.json`) | Fable 5.1, effort élevé | `npm run rediger -- --essai` : la fiche validée avec le dépôt |
| 3. Relecture critique | fiche et dossier → verdict | Opus 5.5, effort élevé | un seul retour à l'étape 2 ; au second refus, la fiche reste dans l'atelier, signalée |
| 4. Référentiel et écriture | auteurs et ouvrages demandés par le lot → fiches, sans doublon ; puis fiches écrites | `npm run bnf` (notices BnF) ; Sonnet, effort bas, pour choisir la notice et décrire ; `npm run rediger -- --dossier` | `npm run valider` |
| 5. Lectures | mots au drapeau `tradition` → lectures traditionnelles | Fable 5.1 pour trouver l'auteur et le passage (`npm run texte`) ; scripts pour vérifier la citation | `verifier:en-ligne` mot pour mot |
| 6. Relecture | brouillons → corrections de Thibault | Thibault | chaque correction devient une règle ou un exemple (§7) |

Le tri se fait avec le dossier : il demande la même lecture du Littré et du TLFi, et un agent de
moins par mot. Une fiche rédigée d'après son dossier et acceptée par la relecture critique entre
en `brouillon`, avec pour sources les entrées consultées du dossier. Une fiche refusée deux fois
n'est pas écrite : `npm run verifier` la ferait passer en brouillon sur la seule concordance avec
le Littré, et le refus serait perdu.

La relecture critique (étape 3) juge trois choses, et rien d'autre : chaque affirmation est
dans le dossier ; chaque phrase répond à « que veux-tu dire exactement ? » ; les règles
éditoriales que les scripts ne voient pas sont respectées (étymologie et tradition distinctes,
fonds commun, sens premier à sa place).

Un mot sacré (chemin `sacre`) sort du lot après son dossier : il se rédige à part, texte
d'origine sous les yeux, avec sa lecture `premier`.

## 4. Le tri

Chemins (un seul par mot) :

- **ordinaire** : héritage ou emprunt ; Littré, puis Gaffiot, Bailly ou TLFi ;
- **forgé** : un auteur, une date, parfois un ouvrage (`forge`) ;
- **débattu** : plusieurs hypothèses, avec leurs tenants (`alternatives`) ;
- **récent** : absent du Littré (après 1872) ; le TLFi suffit (§5 d'AGENTS.md) ;
- **sacré** : né dans l'ordre sacré (§3.3 bis) ; texte d'origine ;
- **consacré** : profane à l'origine, pris dans l'ordre sacré ; chemin ordinaire.

Drapeaux (plusieurs possibles) : `tradition` (étape 5), `doute` au §3.3 (l'agent rédige quand
même et signale), `nom-propre` : nom de personne ou titre dans la chaîne (`personne`, `ouvrage`).

## 5. Les artefacts

- **Dossier** (`atelier/<id>/dossier.json`, hors du dépôt, comme `sources/`) : le chemin, les
  drapeaux, et des faits, chacun avec sa source et son entrée (formes, langues, sens, dates,
  tenants). Du texte recopié seulement pour le domaine public (Littré, Wikisource) ; du TLFi, du
  Gaffiot et du Bailly, les faits seuls, jamais leur rédaction (§5 d'AGENTS.md). Il se relit en
  quelques secondes. Format : `scripts/lib/atelier.ts`.
- **Contenu rédigé** (`atelier/<id>/fiche.json`) : le format de `npm run rediger`.
- **Verdict** de la relecture critique, et **ce que rend chaque agent** au workflow : des sorties
  structurées (`scripts/lib/atelier.ts`), gardées dans le journal du workflow.
- **Signalements** : doutes au §3.3, limites du modèle, sources inaccessibles, fiches refusées,
  rendus par le workflow à la fin du lot, avec le mot et le cas.
- **Journal de méthode** (`docs/journal-methode.md`, versionné) : chaque ajustement de la
  méthode et sa cause.

Dossiers et fiches sont écrits sur disque ; le reste est dans le journal du workflow, qui
reprend un lot interrompu là où il s'était arrêté.

## 6. L'orchestration

- **Le chef d'orchestre est un script de workflow** (`scripts/workflow-lot.js`), pas un modèle :
  il enchaîne les étapes, répartit les mots, regroupe les demandes d'auteurs et d'ouvrages avant
  l'étape 4. Il ne coûte rien et ne dévie pas. Chaque mot suit sa chaîne dans un `pipeline()` :
  un mot peut être en relecture pendant qu'un autre est au dossier. Seule l'étape 4 est une
  barrière (dédoublonnage). Lancement : Workflow avec `scriptPath: scripts/workflow-lot.js` et
  `args: { mots: [...] }`.
- **Chaque agent reçoit son modèle, son effort et un schéma de sortie** (`model`, `effort`,
  `schema`) : la forme de sa réponse est garantie, les validateurs garantissent le fond.
- **Consignes courtes, par étape** (`docs/consignes/`), générées par `npm run contrat` avec les
  schémas de sortie du workflow : un agent ne reçoit que ce que son étape exige. AGENTS.md lui
  est déjà donné au démarrage.
- **Le script n'a pas accès aux fichiers** : ce sont les agents qui lisent, écrivent et lancent
  les scripts du projet.
- **Échelle** : une dizaine d'agents en même temps ; un lot par workflow ; on reprend un lot
  interrompu (`resumeFromRunId`).
- **Commit** : un par lot (`data: 10 fiches brouillon (…)`), après `npm run valider`.

## 7. L'affinage entre deux lots

1. Rassembler les signalements du lot et les corrections de Thibault.
2. Classer chacun : erreur de fiche (corriger), de méthode (consigne ou exemple), de modèle.
3. Méthode : ajuster les consignes, noter la cause au journal.
4. Listes fermées : ajouter les thèmes proposés par plusieurs mots, reclasser (§7 bis).
5. Modèle : éprouver le changement sur des cas réels, l'implémenter, migrer, tester ; compte
   rendu court. S'il touche un principe ou un critère, le proposer à Thibault et attendre.
6. Lot suivant.

## 7 bis. Les listes fermées

Langues, traditions et thèmes sont des listes fermées (`data/*.json`) : une fiche ne peut citer
que leurs valeurs. Aucune n'est exhaustive d'avance ; elles grandissent avec les mots, par un
seul point (`npm run liste`), jamais au gré d'un agent qui écrirait une valeur ailleurs.

- **Une langue** qui manque est un fait : l'agent qui en a besoin l'ajoute pendant le lot.
- **Une tradition** qui manque : l'agent qui en a besoin l'ajoute aussi. Une tradition de trop se
  retire à la relecture plus aisément qu'une tradition manquante ne s'ajoute après coup.
- **Un thème** qui manque ne s'ajoute pas pendant le lot : la fiche porte le plus proche, et
  l'agent propose le thème manquant. Entre deux lots, un thème proposé par plusieurs mots (trois,
  par exemple) est ajouté ; les fiches déjà écrites qui en relèvent sont reclassées
  (`npm run etat -- themes` les montre par thème). Ainsi la liste se forme à partir des mots,
  sans en compter cent.
- Chaque ajout est noté au journal de méthode, avec le mot qui l'a demandé. Retirer ou fusionner
  une valeur revient à Thibault, à la relecture.

Le thème dit le domaine où le mot s'emploie aujourd'hui, non celui de son sens premier
(*étonner* : émotions, non météo). Il est affiché sur la fiche, à côté de la nature.

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

- le Gaffiot, qui ne se lit que dans le navigateur intégré : plusieurs agents du dossier en
  même temps, chacun dans son onglet, ou seulement quand le Littré et le TLFi ne donnent pas
  le sens de l'étymon ;
- le coût d'AGENTS.md, donné à chaque agent ;
- la répartition des moteurs (Sonnet suffit-il au dossier ? à l'écriture ?) ;
- le taux de retour de la relecture critique vers la rédaction.

## 10. Les outils

| Outil | Rôle |
|---|---|
| `npm run dossier -- <mot>` | crée le dossier (Littré recopié) et affiche le Littré et l'étymologie du TLFi, lue par l'API du portail du CNRTL ; `--consulter` pour un mot voisin, `--verifier` pour contrôler un dossier |
| `npm run texte -- <adresse>` | texte brut d'une page, tel quel (`bailly:φρήν` pour une entrée du Bailly) ; `--autour "<mot>"` pour n'en lire que les passages utiles |
| `npm run bnf -- auteur\|ouvrage "<nom>"` | cherche les notices BnF ; avec `--cb`, écrit la fiche en brouillon d'après la notice |
| `npm run liste -- <liste> "<valeur>"` | ajoute une langue, une tradition ou un thème, et régénère les consignes (§7 bis) ; `npm run etat -- themes` montre les mots de chaque thème |
| `npm run rediger -- <fiche.json>… --dossier` | écrit les fiches d'après leur dossier ; `--essai` valide sans écrire |
| `docs/consignes/*.md` | la consigne de chaque étape, générée par `npm run contrat` |
| `scripts/lib/atelier.ts` | les formats du dossier, du verdict et de ce que rend chaque agent |
| `scripts/workflow-lot.js` | le workflow d'un lot |
