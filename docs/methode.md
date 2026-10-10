# Méthode de rédaction autonome

Comment l'agent remplit seul le dictionnaire (mots, auteurs, ouvrages, lectures), jusqu'au
statut `brouillon`, pour que Thibault n'ait plus qu'à relire. Troisième version : après le premier
pilote, un rédacteur seul pour tout le lot et un relecteur neuf ; puis (2026-10-05), pour réduire le
coût d'un lot, les consultations et les reprises mécaniques confiées à des scripts
(`npm run lot`, `docs/journal-methode.md`).

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

Un point qui attendrait Thibault n'arrête pas le travail : l'agent décide, applique, et note la
décision et sa raison dans `docs/decisions.md` ; Thibault relit ce journal, confirme ou infirme, et
une décision infirmée se défait. Restent à Thibault seul, sans décision provisoire : `validee`,
écarter un mot, changer un principe d'AGENTS.md (l'agent y décide pour le lot, sans y toucher).

## 3. Le lot

Un lot est d'**environ 50 mots**, choisis par familles et voisinage (doublets, renvois, même racine),
jamais dans l'ordre alphabétique. Il se fait dans **une session neuve**, lancée par la compétence
`/etymon-lot <mot>…` (`.claude/skills/etymon-lot/SKILL.md`) : l'orchestrateur est bref, n'ouvre
aucune fiche, ne relaie aucun rapport. Chaque agent écrit son résultat dans `atelier/` et ne rend
qu'une ligne d'état ; `data/` et `docs/` ne bougent qu'à la clôture, et le commit est fait une fois, à la fin.

| Étape | Qui | Quoi |
|---|---|---|
| 1 | script : `npm run lot -- sources <mots>` | pour chaque mot, `atelier/<id>/sources.md` : le Littré (famille comprise), le TLFi (plan des sens, étymologie et historique, autres articles), le début des entrées du Lewis & Short et du Bailly pour les formes latines et grecques relevées dans ces étymologies, la recherche de leurs radicaux dans le corpus de réflexe (passages ★ d'abord). Une page non lue est signalée (⚠), jamais prise pour une absence ; reprise après un 429 ou un 503 |
| 2 | rédacteur (DeepSeek Flash) | pour chaque mot : dossier d'après `sources.md` (tri compris), fiche, **lectures traditionnelles** (une étape à part, texte source sous les yeux), dans `atelier/<id>/` ; les auteurs et ouvrages à créer dans `atelier/references.json`, les décisions dans `atelier/decisions.md`, les doutes dans `atelier/signalements.md` ; consigne `docs/consignes/redacteur.md` |
| 3 | relecteur (DeepSeek Flash, neuf) | toutes les fiches du lot, d'après leurs dossiers : un verdict par mot, avec un `remplacement` (`{ champ, valeur }`) quand il sait exactement la phrase à écrire ; consigne `docs/consignes/relecture.md` |
| 4 | script : `npm run lot -- reprendre <mots>` | applique les remplacements à `fiche.json`, essaie chaque fiche (typographie, validation avec le dépôt), marque les remarques `appliquee` ; ce qui reste (remarque sans remplacement, remplacement au chemin faux, essai refusé) va dans `atelier/a-reprendre.md` |
| 4 bis | rédacteur (repris) | seulement pour `atelier/a-reprendre.md`, puis `reprendre` de nouveau |
| 5 | vérificateur (DeepSeek Flash) | seulement les remarques appliquées et ce qu'elles changent, les lectures et le corpus du dossier ; il réécrit le verdict (`accepte`, ou les remarques restées ouvertes) |
| 6 | script : `npm run lot -- clore <mots>` | écrit les fiches (lectures comprises, en `brouillon`), crée les auteurs et ouvrages de `references.json` d'après leur notice BnF, reporte `decisions.md` en tête de `docs/decisions.md` (section datée), régénère le contrat, lance `verifier:en-ligne` (adresses, citations mot pour mot), `verifier`, `valider` et les tests, et rend un résumé court |

Puis le commit et le push du lot, par l'orchestrateur ; Thibault relit. Une remarque restée ouverte
après le vérificateur ne relance pas de boucle : le mot sort du lot (la clôture refuse un mot dont
une remarque est ouverte), reste dans l'atelier et va aux signalements.

Moteurs : **DeepSeek Flash** pour les trois rôles — rédacteur, relecteur neuf, vérificateur (agents du
projet `.claude/agents/etymon-redacteur.md`, `etymon-relecteur.md`, `etymon-verificateur.md`, modèle
`openrouter/~deepseek/deepseek-flash-latest`).

**Modèles : des modèles économiques, jamais un modèle américain cher.** Décision de Thibault
(2026-10-10) après un lot entièrement rédigé en Claude Opus : n'utiliser que des modèles bon marché
(DeepSeek Flash), sans exception, et **annoncer le coût estimé du lot avant de le lancer** (§8). Un
choix plus cher ne se fait que si Thibault le demande lui-même.

Un mot sacré (chemin `sacre`) s'arrête après son dossier : il se rédige à part, texte d'origine
sous les yeux, avec sa lecture `premier` (une par tradition si elles divergent sur le sens du
texte d'origine, AGENTS.md §3.3 bis).

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
  public (Littré, Lewis & Short, Georges, Wikisource) ; du TLFi, du Gaffiot et du Bailly, les faits seuls, jamais leur
  rédaction (AGENTS.md §5). Format : `scripts/lib/atelier.ts`.
- **Sources** (`atelier/<id>/sources.md`) : ce que disent le Littré, le TLFi, les dictionnaires des
  étymons et le corpus de réflexe, écrit par `npm run lot -- sources`, sans interprétation.
- **Fiche rédigée** (`atelier/<id>/fiche.json`) : le format de `npm run rediger`, lectures
  traditionnelles (`tradition.lectures`) comprises.
- **Verdict** (`atelier/<id>/verdict.json`) : décision et remarques du relecteur ; une remarque peut
  porter un `remplacement` (`{ champ, valeur }`), que `npm run lot -- reprendre` applique, et passe alors au
  statut `appliquee`.
- **À reprendre** (`atelier/a-reprendre.md`) : ce que `reprendre` n'a pas pu régler seul.
- **Références** (`atelier/references.json`) : les auteurs et ouvrages à créer, avec leur notice BnF.
- **Signalements** (`atelier/signalements.md`) : doutes sur le critère d'entrée, listes fermées
  touchées, limites du modèle, sources inaccessibles, remarques non suivies.
- **Décisions du lot** (`atelier/decisions.md`) : lignes de tableau, reportées par `clore`.
- **Journal des décisions** (`docs/decisions.md`, versionné) : les décisions prises à la place de
  Thibault, avec leur raison, qu'il relit (§2).
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

Pour l'histoire du mot, le Littré, le TLFi, un dictionnaire latin (Lewis & Short, Georges ou
Gaffiot) et le Bailly se consultent par réflexe ; pour
la tradition, un corpus de même rang (`scripts/lib/corpus.ts`, `npm run corpus`) : des œuvres qui
lisent les mots eux-mêmes, où l'on peut chercher un mot, et dont le texte original est en ligne,
du domaine public. Aujourd'hui : Isidore (*Étymologies*, *Différences*), Jérôme (*Livre des noms
hébreux*), Rashi (*Commentaire sur la Torah*), Augustin (*La Cité de Dieu*, *Confessions*, *De la
doctrine chrétienne*), Thomas d'Aquin (*Somme théologique*, entière, d'après le Corpus Thomisticum).
Téléchargées une fois dans `sources/`, elles s'interrogent par un script, sans jeton : la taille
d'une œuvre n'est donc pas un obstacle ; la machine trouve et cite, elle ne parle pas à la place de
la tradition.

- **Un plancher, jamais une limite** (décision de Thibault) : tout autre auteur traditionnel qui a
  lu le mot se cherche aussi, et se cite de même, texte sous les yeux.
- **Consulter n'oblige pas à trouver** : une lecture n'entre que si l'auteur lit le mot et dit
  quelque chose qui diffère de l'histoire ou la complète.
- Une œuvre entre au corpus si elle remplit les trois conditions ; on l'ajoute à
  `scripts/lib/corpus.ts`, et la consigne des lectures suit.

## 8. L'économie

Mesure du 2026-10-05 (lots 3 à 18) : environ 1,20 $ par fiche, presque tout en relecture de contexte
(chaque appel d'outil relit tout le contexte de l'agent ou de l'orchestrateur). But : 0,40 à 0,50 $
par fiche, même rigueur.

- Les scripts d'abord (zéro jeton) : les sources d'un mot se lisent en un appel (`sources.md`), non en
  vingt ; les remplacements se font par script ; la clôture est une seule commande.
- Peu d'appels d'outil par agent : un agent qui écrit dans `atelier/` et rend une ligne d'état ;
  l'orchestrateur n'ouvre rien et ne relaie rien.
- Le même modèle économique partout (DeepSeek Flash) : un seul tarif bas, et pas de course au moteur.
- **Annoncer le coût estimé du lot avant de le lancer** (jetons attendus × tarif du modèle), et
  l'arrêter ou en réduire la taille s'il dépasse ce que Thibault accepte. Un modèle cher ne se choisit
  jamais de soi-même.
- Une session neuve par lot, d'environ 50 mots : le cadrage et les consignes se lisent une fois par agent.
- `data/` et `docs/` ne bougent pas pendant le lot : le hook de fin de tour qui réclame un commit ne se
  déclenche pas.
- Des dossiers complets du premier coup (usage d'aujourd'hui, étapes datées, sens de chaque
  maillon sourcé) : c'est leur manque qui faisait refuser les fiches.
- Mesurer chaque lot (jetons, fiches acceptées, remarques par critère, remarques réglées par script) et
  ajuster d'après la mesure, non d'après l'intuition.

## 9. Les outils

| Outil | Rôle |
|---|---|
| `npm run lot -- sources\|reprendre\|clore <mot>…` | le lot, par script : le dossier brut d'un mot (`sources.md`), l'application des remplacements d'un verdict, la clôture (écriture des fiches, références, décisions, contrôles) ; §3 |
| `npm run dossier -- <mot>` | crée le dossier (Littré recopié) et affiche le Littré, le plan des sens du TLFi (avec ses marques d'usage) et sa rubrique « Étymologie et historique », lus par l'API du portail du CNRTL ; `--consulter` pour un mot voisin ; `--verifier` contrôle un dossier et son verdict |
| `npm run texte -- <adresse>` | texte brut d'une page, tel quel (`bailly:φρήν` pour une entrée du Bailly) ; `--autour "<mot>"` pour n'en lire que les passages utiles |
| `npm run bnf -- auteur\|ouvrage "<nom>"` | cherche les notices BnF ; avec `--cb`, écrit la fiche en brouillon d'après la notice |
| `npm run rediger -- <fiche.json>… --dossier` | écrit les fiches d'après leur dossier (lectures comprises), avec `--modele` et `--reflexion` ; `--essai` valide sans écrire |
| `npm run corpus -- chercher <radical>` | cherche un étymon dans le corpus de réflexe des lectures (après `npm run corpus -- telecharger`) ; les passages ★ expliquent un mot |
| `npm run liste -- <liste> "<valeur>"` | ajoute une langue, une tradition ou un thème, et régénère les consignes ; `npm run etat -- themes` montre les mots de chaque thème |
| `docs/consignes/*.md` | les consignes du rédacteur, du relecteur et de chaque étape, générées par `npm run contrat` |
| `.claude/agents/etymon-*.md` | les trois agents (rédacteur, relecteur, vérificateur), avec leur modèle et leur réflexion |
| `.claude/skills/etymon-lot/SKILL.md` | la compétence qui orchestre un lot (`/etymon-lot <mot>…`) |
