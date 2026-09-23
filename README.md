# Étymon : dictionnaire du sens oublié

Pour chaque mot français, Étymon donne son **sens premier étymologique** : l'étymon dans sa
langue source directe, le sens de cet étymon, et en une à trois phrases ce que ce sens révèle.

> **Étonner** — du latin populaire *\*extonare* : « ébranler comme d'un coup de tonnerre ».

Application web installable, utilisable hors ligne, sans serveur ni appel réseau
(pas encore publiée).

Chaque fiche s'appuie sur des sources citées et vérifiables : Littré, Gaffiot, Bailly,
vérifiées sur le TLFi. Aucune étymologie n'est publiée sans avoir été relue et validée.
Le cadrage complet du projet est dans [AGENTS.md](AGENTS.md).

## Démarrer

Node 24 ou plus récent.

```bash
npm install
npm run dev          # app en local
```

| Commande | Rôle |
|---|---|
| `npm run valider` | valide fiches, candidats et comptes (aussi en pre-commit et en CI) |
| `npm run etat` | avancement : fiches par statut, candidats restants |
| `npm run brouillons` | fiches en brouillon à relire |
| `npm test` | tests (Vitest) |
| `npm run build` | site de production dans `dist/` (fiches non validées signalées comme telles) |

Chaque push est validé par la CI. La publication sur GitHub Pages se déclenche à la main
(onglet Actions, « Run workflow »), une fois Pages activé dans les réglages du dépôt.

## Ajouter une fiche

1. Choisir un mot dans les candidats : `npm run etat -- candidats 10`.
2. Consulter réellement les sources (Littré, Gaffiot ou Bailly ; TLFi pour vérifier).
3. Créer `data/fiches/<initiale>/<deux lettres>/<id>.yaml`, par exemple
   `data/fiches/e/et/etonner.yaml` :

   ```yaml
   mot: étonner
   etymon: "*extonare"          # entre guillemets s'il commence par *
   reconstruit: true
   langue: latin populaire      # liste fermée : data/langues.json
   sens: ébranler comme d'un coup de tonnerre
   explication: >
     Une à trois phrases, 300 caractères au plus, espace insécable avant : ; ? !
   incertain: false
   racine: null
   doublets: []
   famille: []
   themes: [émotions]           # liste fermée : data/themes.json
   sources:
     - ouvrage: Littré
       entree: étonner
       url: "https://www.littre.org/definition/%C3%A9tonner"
   lectureTraditionnelle: null
   statut: brouillon
   historique: []
   ```

4. Retirer le mot de `data/candidats/<initiale>.yaml`.
5. `npm run valider` : chaque erreur indique le fichier, le champ et la règle enfreinte.
6. Relire la fiche dans l'app (`npm run dev`), puis passer `statut: validee` pour la publier.

## Licences

- Code : MIT ([LICENSE](LICENSE)).
- Fiches et données (`data/`) : CC BY-SA 4.0 ([data/LICENSE.md](data/LICENSE.md)).
