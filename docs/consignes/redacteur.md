# Rédiger un lot

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu reçois une liste de mots, dont `npm run lot -- sources` a déjà rassemblé les sources (`atelier/<id>/sources.md`). Tu travailles seul, mot après mot, et tu gardes le lot en tête : familles, doublets et renvois entre ses mots. **Tout s'écrit dans `atelier/` : tu ne touches ni `data/` ni `docs/`**, et tu ne commites pas (une langue ou une tradition qui manque est la seule exception : `npm run liste`, voir plus bas). Après toi, un relecteur qui n'a pas écrit relit, `npm run lot -- reprendre` applique ses remplacements, un vérificateur contrôle ce qui a changé, puis `npm run lot -- clore` écrit les fiches.

## Passe 1 : dossiers, fiches et lectures

Pour chaque mot, dans l'ordre de la liste :

1. Le dossier (`docs/consignes/dossier.md`), d'après `atelier/<id>/sources.md` : tu n'en refais aucune consultation, sauf pour ce qu'il signale (⚠, « Aucune entrée ») ou ce qu'il ne couvre pas. Un mot sacré (chemin `sacre`) s'arrête là : il se rédige à part ; signale-le.
2. La fiche, d'après le dossier (`docs/consignes/redaction.md`), dans `atelier/<id>/fiche.json`, puis `npm run rediger -- atelier/<id>/fiche.json --essai`.
3. Les lectures traditionnelles (`docs/consignes/lectures.md`), dans `tradition.lectures` du même `fiche.json`, texte source sous les yeux : une étape à part, après la fiche, pour chaque mot au drapeau `tradition` ou dont le corpus a donné un passage ★.
4. Les auteurs et ouvrages que l'essai dit « à créer » : une entrée dans `atelier/references.json` (`docs/consignes/references.md`), commune au lot.

Si une fiche demande un fait que le dossier n'a pas, va le chercher et ajoute-le au dossier avec sa source, avant de l'écrire. Puis rends une ligne d'état : les mots traités, ceux mis à part. Rien d'autre : le reste est dans les fichiers.

## Reprise

Si on te reprend après la relecture, lis seulement `atelier/a-reprendre.md` : les remarques que le script n'a pas pu régler seul. Corrige `fiche.json` (la proposition du relecteur, telle quelle quand elle est juste ; sinon autrement, ou pas du tout, et dis pourquoi dans `atelier/signalements.md`), puis relance l'essai. Ne reformule pas ce que le relecteur n'a pas relevé. Rends une ligne d'état.

## Signalements (`atelier/signalements.md`)

Une ligne par point, avec le mot : doute sur le critère d'entrée ; langue ou tradition ajoutée, thème proposé ; ce que le modèle de données ne permet pas de dire ; source inaccessible ; remarque du relecteur que tu n'as pas suivie, et pourquoi. Thibault et l'affinage entre deux lots s'en servent.

## Décisions (`atelier/decisions.md`)

Un point qui attendrait Thibault ne t'arrête pas : décide, applique, et note la décision et sa raison dans `atelier/decisions.md`, une ligne de tableau par décision : `| sujet | décision | raison | à relire |`. `npm run lot -- clore` les reporte en tête de `docs/decisions.md`, sous une section datée. Restent à Thibault seul : `validee`, écarter un mot, changer un principe d'AGENTS.md.

## Langue ou tradition qui manque

`npm run liste -- langues "<langue>"` ou `traditions` : la seule commande qui écrit dans `data/` (et régénère le contrat) pendant un lot, parce que l'essai refuse une valeur hors liste. Note-la dans `atelier/signalements.md` : l'orchestrateur la commite avec le lot.
