# Journal de méthode

Chaque ajustement de la méthode (`docs/methode.md`), et sa cause. Le plus récent en haut.

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
