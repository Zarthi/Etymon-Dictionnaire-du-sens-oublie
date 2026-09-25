# Journal de méthode

Chaque ajustement de la méthode (`docs/methode.md`), et sa cause. Le plus récent en haut.

## 2026-09-25 — Second pilote, avec la méthode refondue

Mêmes dix mots, un rédacteur et un relecteur (Opus 5.5, réflexion élevée), quatre passes. Deux
agents en tout, contre 51 ; environ 370 000 jetons (compteurs de fin : rédacteur 216 000,
relecteur 156 000), contre 3,9 millions. Dix fiches écrites en `brouillon`, contre deux acceptées.

- **La relecture converge.** Passe 2 : quatre fiches acceptées, six à reprendre, huit remarques ;
  le rédacteur les adopte toutes telles quelles. Passe 4 : les huit sont réglées, deux restent
  ouvertes, simples, réglées sans boucle (§3).
- **Le corpus de réflexe n'est pas encore un réflexe.** Pour *ange*, le rédacteur s'est arrêté à
  Isidore sans chercher Augustin, qui est au corpus ; le relecteur l'a trouvé (*Cité de Dieu* X,
  25), et la lecture est entrée. À faire : la consigne des lectures demande de noter au dossier
  la recherche faite dans chaque œuvre du corpus, même vaine, et le relecteur la contrôle.
- **Les dates approximatives de la BnF se perdent.** Notice de Platon « 0427?-0348? av. J.-C. » :
  la fiche portait une naissance exacte et aucune mort ; relevé par le relecteur, corrigé à la
  main. À faire : `npm run bnf` doit lire les dates incertaines avant notre ère.
- **Les consignes générées vieillissent pendant le lot** : les auteurs et ouvrages créés n'y sont
  listés qu'après `npm run contrat`, et le test du contrat échoue jusque-là. À faire : l'écriture
  (`npm run rediger`, `npm run bnf --cb`) régénère les consignes, ou la fin de lot le prévoit.
- **Gaffiot inaccessible aux scripts** (gaffiot.fr coupe la connexion, pas de navigateur dans les
  agents) : les sens latins du lot viennent du Littré et du TLFi, qui les glosent. Tant que ce
  sera le cas, un sens latin qu'aucun des deux ne donne ne peut pas être sourcé.
- **Le TLFi manque parfois à l'API du portail** (*ennuyer*) : lu sur l'interface Stella de l'ATILF,
  même article. À faire, si le cas revient : un repli de `npm run dossier` sur Stella.
- **Nature** : le script ne lit pas « s. f. sans pluriel » (*merci*), écrite à la main ; pour
  *panique*, le Littré ne donne que l'adjectif, le nom est l'usage courant (TLFi) : la règle
  « nature tirée du Littré » est à revoir pour les mots dont l'usage a changé de nature.
- **Limite du modèle** : un croisement (*chétif*, *captivus* croisé avec le gaulois *\*cactos*)
  ne se dit pas dans la chaîne. Une seule occurrence : on attend un deuxième cas.
- **Listes fermées** : tradition « grecque » ajoutée pour la lecture de Platon (*Ion* 534b, sur
  ἔνθεος), demandée par *enthousiasme* ; à Thibault de la garder, la renommer ou la retirer.
  Candidat ajouté : *captif* (doublet de *chétif*).

## 2026-09-25 — Un corpus de réflexe pour les lectures

- **Les lectures partent d'un corpus consulté par réflexe** (méthode §7 bis), non plus de la seule
  mémoire de l'agent : Isidore (*Étymologies*, *Différences*), Jérôme (*Livre des noms hébreux*),
  Rashi (*Commentaire sur la Torah*), téléchargés une fois et interrogés par `npm run corpus`.
  Cause : question de Thibault ; côté profane, les sources se consultaient déjà par réflexe. Le
  corpus est un plancher, jamais une limite (décision de Thibault).
- **Augustin et Thomas d'Aquin y entrent aussi** : précieux pour les lectures (Thibault), et leur
  taille n'est pas un obstacle pour une recherche par script. Wikisource ne donne qu'une part de
  la *Somme théologique* (214 questions).
- Premier essai : *misericord* trouve Isidore dans les *Étymologies* (X) et les *Différences*
  (misericordia et miseratio) ; *religio*, dans les *Différences*, une seconde lecture d'Isidore.

## 2026-09-25 — Refonte après le premier pilote

Pilote de dix mots (*ennui, chétif, merci, enthousiasme, travail, psychologie, écologie, ange,
panique, lunatique*), par un workflow de cinq agents par mot : 51 agents, 3,9 millions de jetons
(environ 77 000 par agent, surtout le cadrage relu par chacun), deux fiches acceptées sur dix.
Les huit refus étaient justes : *psychologie* contredisait son dossier, *travail* sautait le
verbe *travailler*, *chétif* manquait *captif* et *\*cactivus*, *écologie* inventait une
chronologie. Tout ce que le pilote a produit a été supprimé.

Causes, et ce qui change :
- **Le dossier ne donnait ni l'usage d'aujourd'hui ni les étapes datées du sens**, que
  l'explication doit dire : le rédacteur les tirait de sa mémoire, le relecteur les refusait.
  Le dossier porte désormais `usage` (d'après le plan des sens du TLFi, que `npm run dossier`
  affiche avec ses marques « Vieilli », « Moderne ») et les étapes datées ; le sens de chaque
  maillon qui en porte un est sourcé, Gaffiot et Bailly obligatoires quand le Littré et le TLFi
  ne le donnent pas. Un déverbal passe par son verbe.
- **Le rédacteur (Fable 5.1) cherchait l'effet** (chiasmes, la chose à la place du mot, absolus
  sans source) : la consigne de rédaction donne ces fautes en exemples, avec ce qu'il fallait
  écrire ; la rédaction passe à Opus 5.5, dont les propositions de relecteur étaient justes.
- **La reprise ne convergeait pas** : le rédacteur reformulait au lieu d'adopter la proposition,
  et la seconde relecture relisait tout. Il adopte désormais la proposition telle quelle quand
  elle est juste ; la seconde relecture ne relit que les remarques et les lectures.
- **Cinq agents par mot coûtaient le cadrage cinq fois par mot** : un rédacteur seul pour le lot,
  un relecteur neuf, chacun repris une fois avec son contexte. Le workflow est supprimé ; les
  deux agents sont définis dans `.claude/agents/`.
- **Le moteur est dit** : `redaction` porte aussi le niveau de réflexion (`reflexion`), demandé
  par Thibault.

## 2026-09-25 — Ce que « sens premier » veut dire

- **Le sens premier est premier dans le temps**, non dans le principe : l'histoire du mot, non sa
  vérité (AGENTS.md §1, §2.3). Cause : question de Thibault, « traditionnellement, l'application
  est-elle mauvaise ? ». *Étymon* veut dire « vrai », et pour Isidore l'étymologie recueille la
  force du mot par l'interprétation ; l'app qui mettait l'histoire en tête et la tradition « à
  côté » posait sans le dire la perspective moderne en principe.
- Consignes : l'explication ne fait pas du sens ancien le « vrai » sens du mot, ni de l'usage
  actuel une erreur ; la relecture critique le vérifie. La tradition est repliée par réserve, non
  par rang ; l'app ne prête jamais au mot un sens qui lui serait propre.

## 2026-09-25 — Listes fermées, thème affiché

- **Les listes fermées grandissent avec les mots** (§7 bis), par `npm run liste` seulement :
  langues et traditions ajoutées pendant le lot par l'agent qui en a besoin, thèmes proposés et
  ajoutés entre deux lots s'ils sont demandés par plusieurs mots, puis fiches reclassées. Cause :
  aucune liste n'est exhaustive d'avance (il manque « art » pour *musique*, « politique » pour
  *république*). Décision de Thibault : une tradition de trop se retire à la relecture plus
  aisément qu'une tradition manquante ne s'ajoute.
- **Le thème est affiché sur la fiche** (« nom féminin · esprit, santé »), et dit le domaine où le
  mot s'emploie aujourd'hui. Cause : sans lui, le lecteur ne sait pas où se range le mot.
- Écartée : les quatre ordres du critère d'entrée (intellectuel, moral, spirituel, social) comme
  niveau fixe au-dessus des thèmes.

## 2026-09-25 — Construction des outils

- **Le tri se fait avec le dossier**, par le même agent. Cause : il demande la même lecture du
  Littré et du TLFi ; un agent de plus par mot coûtait AGENTS.md une fois de plus, sans rien
  apporter.
- **Le TLFi est lu par l'API de son portail** (`npm run dossier`), comme le fait la page, et non
  plus dans le navigateur. Cause : un seul navigateur aurait mis l'étape du dossier en série.
  On n'en tire que des faits, comme avant.
- **La relecture critique précède la création des auteurs et ouvrages.** Cause : le relecteur
  n'a besoin que de la fiche et du dossier, et l'on ne crée pas la fiche d'un auteur pour une
  fiche refusée.
- **Une fiche refusée deux fois reste dans l'atelier**, signalée, au lieu d'entrer en
  `a-verifier`. Cause : `npm run verifier` l'aurait passée en brouillon sur la seule concordance
  avec le Littré, et le refus aurait été perdu.
- **Une fiche rédigée d'après son dossier entre en `brouillon`**, avec pour sources les entrées
  consultées du dossier. Cause : c'est la définition du brouillon (ouvrages consultés) ; la
  confrontation au Littré ne sert plus qu'aux fiches rédigées de mémoire.
- **Référentiel et écriture sont faits par un seul agent**, après la barrière du lot. Cause :
  l'écriture attend les auteurs et ouvrages, et ne demande que des commandes.
- **Les notices BnF se cherchent avec l'année de naissance** (`Augustin 0354`). Cause : l'API ne
  classe pas ses réponses ; sans l'année, les homonymes récents passent devant.
