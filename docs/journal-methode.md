# Journal de méthode

Chaque ajustement de la méthode (`docs/methode.md`), et sa cause. Le plus récent en haut.

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
