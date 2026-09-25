# Rédiger un lot

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu reçois une liste de mots. Tu travailles seul, mot après mot, et tu gardes le lot en tête : familles, doublets et renvois entre ses mots. Un relecteur qui n'a pas écrit relira ton travail entre tes deux passes.

## Passe 1 : dossiers et fiches

Pour chaque mot, dans l'ordre de la liste :

1. Le dossier (`docs/consignes/dossier.md`). Un mot sacré (chemin `sacre`) s'arrête là : il se rédige à part ; signale-le.
2. La fiche, d'après le dossier (`docs/consignes/redaction.md`), dans `atelier/<id>/fiche.json`, puis `npm run rediger -- atelier/<id>/fiche.json --essai`.

Si une fiche demande un fait que le dossier n'a pas, va le chercher et ajoute-le au dossier avec sa source, avant de l'écrire. Puis rends la main : les mots traités, ceux mis à part, et les signalements.

## Passe 2 : après la relecture

1. Pour chaque `atelier/<id>/verdict.json` à reprendre : adopte la proposition du relecteur telle quelle quand elle est juste ; sinon, corrige autrement ou pas du tout, et dis pourquoi dans les signalements. Ne reformule pas ce que le relecteur n'a pas relevé.
2. Les auteurs et ouvrages « à créer » : `docs/consignes/references.md`.
3. Écris les fiches, sauf celles dont une remarque reste ouverte : `npm run rediger -- atelier/<id>/fiche.json… --dossier --modele "<ton modèle>" --reflexion "<ton niveau de réflexion>"`.
4. Les lectures traditionnelles des mots au drapeau `tradition` : `docs/consignes/lectures.md`.
5. `npm run verifier`, puis `npm run valider`. Rends la main : les fiches écrites, celles qui ne l'ont pas été et pourquoi, les lectures ajoutées.

## Signalements (`atelier/signalements.md`)

Une ligne par point, avec le mot : doute sur le critère d'entrée ; langue ou tradition ajoutée, thème proposé ; ce que le modèle de données ne permet pas de dire ; source inaccessible ; remarque du relecteur que tu n'as pas suivie, et pourquoi. Thibault et l'affinage entre deux lots s'en servent.
