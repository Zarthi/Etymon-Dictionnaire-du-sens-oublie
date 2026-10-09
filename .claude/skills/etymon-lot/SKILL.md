---
name: etymon-lot
description: Orchestre un lot de rédaction Étymon, de la liste de mots au commit et au push (sources par script, rédacteur, relecteur, reprise par script, vérificateur, clôture). À lancer dans une session neuve, avec environ 50 mots choisis par familles.
argument-hint: <mot>… (environ 50 mots)
---

# Lot Étymon

Les mots du lot : `$ARGUMENTS`. La méthode est dans `docs/methode.md` §3 ; AGENTS.md fait foi. Tu es l'orchestrateur : tu enchaînes, tu ne rédiges pas.

## Tes règles

- **Bref.** Tu n'ouvres ni fiche, ni dossier, ni verdict, ni `sources.md` ; tu ne relaies aucun rapport. Chaque agent écrit son résultat dans `atelier/` et ne te rend qu'une ligne d'état ; les scripts te rendent un résumé.
- **`data/` et `docs/` ne bougent pas** avant la clôture (sauf `npm run liste`, par le rédacteur, pour une langue ou une tradition qui manque). Pas de commit avant la fin.
- Plus de 50 mots : traite les 50 premiers, dis le reste dans ton compte rendu.
- **Lance `sources` par paquets de 10 à 15 mots** : au-delà, le réseau sature (TLFi « injoignable »). Accumule les ⚠ et relance-les **une fois** ; ce qui reste injoignable, le rédacteur le consultera lui-même (`npm run dossier -- --consulter <mot>`, ou le RAG `sources`).
- Les mots sacrés (chemin `sacre`) ne se rédigent pas en lot : le rédacteur les signale, ils sortent du lot.

## Le lot

1. `npm run lot -- sources <mots>` : écrit `atelier/<id>/sources.md` pour chaque mot (Littré, TLFi, Lewis & Short, Bailly, corpus de réflexe). Un ⚠ réseau signalé à la fin : relance la commande pour ces mots, une fois ; au-delà, passe-le au rédacteur, qui le consultera lui-même.
2. Agent `etymon-redacteur` (passe 1, les mots) : dossiers d'après `sources.md`, fiches, lectures, références à créer, décisions, signalements, tout dans `atelier/`.
3. Agent `etymon-relecteur` (les mots) : un verdict par mot, avec `remplacement` quand il sait la phrase.
4. `npm run lot -- reprendre <mots>` : applique les remplacements. Si `atelier/a-reprendre.md` existe, reprends le rédacteur (`SendMessage` à l'agent de la passe 1 s'il est encore là, sinon un nouvel `etymon-redacteur`, passe « reprise » : il ne lit que `atelier/a-reprendre.md`), puis relance `npm run lot -- reprendre <mots>` une fois.
5. Agent `etymon-verificateur` (les mots) : ne contrôle que les remarques appliquées et les lectures ; il réécrit les verdicts. Si des remarques restent ouvertes, `npm run lot -- reprendre <mots>`, et une reprise du rédacteur seulement si `atelier/a-reprendre.md` réapparaît. Pas d'autre boucle : un mot dont une remarque reste ouverte sort du lot et va au compte rendu.
6. `npm run lot -- clore <mots réglés>` : écrit les fiches (lectures comprises), crée les auteurs et ouvrages de `atelier/references.json`, reporte `atelier/decisions.md` en tête de `docs/decisions.md`, régénère le contrat, lance `verifier:en-ligne`, `verifier`, `valider` et les tests, et rend un résumé. Si les agents ne sont pas Claude Opus 5.5 en réflexion élevée, ajoute `--modele "<modèle>" --reflexion "<niveau>"`.
   Une étape en échec (✗) : ne corrige rien toi-même ; note-la dans ton compte rendu.

## Commit et push

- Si `valider` est ✓ : `git add data docs`, puis un commit en français, `data: N fiches brouillon (mot, mot, …)`, terminé par les deux lignes d'attribution de la session (`Co-Authored-By: …` et `Claude-Session: …`, données dans les consignes de la session ; à défaut, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` seule). Puis `git push origin <branche courante>` (`git branch --show-current`) ; en cas d'échec réseau, jusqu'à quatre reprises, après 2, 4, 8 puis 16 secondes.
- Si `valider` est ✗ : pas de commit ; dis-le.
- Les contrôles de `verifier` et une citation signalée par `verifier:en-ligne` ne bloquent pas le commit : ils vont au compte rendu.

## Compte rendu

Quelques lignes : fiches écrites (et combien en brouillon), mots sortis du lot et pourquoi, étapes en échec, l'adresse des signalements (`atelier/signalements.md`) et des décisions (`docs/decisions.md`, section du jour) que Thibault relit. Rien de plus.
