# Plan : réduire le coût d'un lot

Décidé le 2026-10-05 (Thibault) après les lots 3 à 18 : environ 1,20 $ par fiche, l'essentiel en
relecture de contexte (chaque appel d'outil relit tout le contexte de l'agent ou de l'orchestrateur).
But : 0,40 à 0,50 $ par fiche, même rigueur. Ce fichier se fond dans `docs/methode.md` et
`docs/journal-methode.md` une fois implémenté, puis se supprime.

## 1. Orchestration courte, data/ intact pendant le lot

- **Une session neuve par lot**, lancée par une compétence de projet `.claude/skills/etymon-lot/SKILL.md`
  (`/etymon-lot <mot>…`). L'orchestrateur ne relaie aucun rapport : chaque agent écrit son résultat
  dans `atelier/` et ne rend qu'une ligne d'état ; l'orchestrateur enchaîne les étapes et lance les
  scripts, puis fait le commit du lot. Pas de relecture des fiches par l'orchestrateur.
- **data/ et docs/ ne bougent pas pendant le lot** : tout s'écrit dans `atelier/` (fiches, lectures,
  décisions dans `atelier/decisions.md`, auteurs et ouvrages à créer listés dans `atelier/references.json`).
  Une seule commande de fin, `npm run lot -- clore <mot>…`, écrit les fiches (avec leurs lectures),
  crée les auteurs et ouvrages (BnF), reporte les décisions en tête de `docs/decisions.md`,
  régénère le contrat, lance `verifier:en-ligne`, `verifier`, `valider` et les tests. Le hook de fin de
  tour qui réclame un commit ne se déclenche donc plus pendant un lot.

## 2. `npm run lot -- sources <mot>…` : le dossier brut par script

Un seul appel par lot. Pour chaque mot, `atelier/<id>/sources.md`, compact (quelques centaines de
lignes au plus par mot) :
- Littré local : entrées, nature, étymologie, famille (dérivés listés par l'index si disponible) ;
- TLFi : plan des sens avec marques d'usage complètes, étymologie et historique, et les articles des
  autres natures ou homographes (titre seulement, avec l'adresse) ;
- formes latines relevées dans ces étymologies (`lat.`, `lat. pop.`, `b. lat.`…) : leur entrée du
  Lewis & Short sur Perseus (entrées numérotées essayées : forme, forme1, forme2) ; formes grecques :
  leur entrée du Bailly (`npm run texte -- bailly:…`) ; texte réduit à l'étymologie et aux premiers sens ;
- corpus de réflexe : recherche du radical de chaque forme dans les huit œuvres, passages marqués ★
  d'abord, chaque passage tronqué, avec son repère et son adresse.
Le squelette `atelier/<id>/dossier.json` est créé comme aujourd'hui ; l'agent y reporte les faits
d'après `sources.md`, sans appel réseau sauf manque signalé. Échecs réseau signalés en clair, jamais
pris pour une absence ; relance sur 429.

## 3. `npm run lot -- reprendre <mot>…` : verdicts appliqués par script

- Le verdict gagne, par remarque, un champ facultatif `remplacement` : `{ champ, valeur }`, où
  `champ` est un chemin dans `atelier/<id>/fiche.json` (`explication`, `tradition.lectures.1.texte`,
  `etymologie.2`, `renvois`…) et `valeur` le JSON exact à y mettre (ou `null` pour retirer).
- Le script applique les remplacements, prépare chaque fiche (typographie, `--essai`), et marque la
  remarque `appliquee`. Les remarques sans remplacement, ou dont l'essai échoue, vont dans
  `atelier/a-reprendre.md` : seules elles demandent un agent (le rédacteur, repris).
- Les lectures sont écrites dès la passe 1 dans `atelier/<id>/fiche.json` (`tradition.lectures`),
  texte source sous les yeux (étape à part dans la passe du rédacteur) ; `npm run rediger` les accepte.

## 4. Le bon modèle à chaque étape

- Rédacteur (dossier, fiche, lectures) : Opus, réflexion élevée.
- Relecteur, première passe : Opus, réflexion élevée.
- Seconde passe (seulement les remarques appliquées et ce qu'elles changent, et les citations) :
  nouvel agent `.claude/agents/etymon-verificateur.md`, Sonnet.
- Lots de 12 à 15 mots.

## Le lot, après

1. `npm run lot -- sources <mots>` (script).
2. Rédacteur (Opus) : dossiers d'après `sources.md`, fiches, lectures, dans `atelier/`.
3. Relecteur (Opus) : verdicts avec `remplacement` quand il sait la phrase à écrire.
4. `npm run lot -- reprendre` (script) ; rédacteur repris seulement pour `atelier/a-reprendre.md`.
5. Vérificateur (Sonnet) : les remarques appliquées, les citations.
6. `npm run lot -- clore <mots>` (script), commit et push du lot.
