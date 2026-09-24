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
| `npm run rediger -- lot.json --modele "…"` | écrit un lot de fiches rédigées par l'IA (`a-verifier`) |
| `npm run verifier` | confronte les fiches au Littré local (`npm run littre` une fois) et signale les contrôles |
| `npm run verifier:en-ligne` | vérifie les entrées du Bailly et les citations des lectures traditionnelles |
| `npm run contrat` | régénère le contrat de données et la consigne de rédaction (`docs/`) |
| `npm test` | tests (Vitest) |
| `npm run build` | site de production dans `dist/` (fiches non validées signalées comme telles) |

Chaque push est validé par la CI. La publication sur GitHub Pages se déclenche à la main
(onglet Actions, « Run workflow »), une fois Pages activé dans les réglages du dépôt.

## Ajouter une fiche

Le format d'une fiche est décrit dans [docs/contrat-fiche.md](docs/contrat-fiche.md), généré
à partir du schéma ; VS Code le vérifie pendant la saisie. Exemples complets :
[religion](data/fiches/r/re/religion.yaml), [schizophrénie](data/fiches/s/sc/schizophrenie.yaml).

**Par l'IA, en lot** : l'IA reçoit [docs/prompt-redaction.md](docs/prompt-redaction.md) et
écrit un fichier JSON (le contenu seul), puis :

```bash
npm run rediger -- lot.json --modele "Claude Fable 5.1"
npm run verifier
npm run valider
```

**À la main** : créer `data/fiches/<initiale>/<deux lettres>/<id>.yaml` (par exemple
`data/fiches/e/et/etonner.yaml`) après avoir consulté les sources (Littré, Gaffiot ou Bailly ;
TLFi pour vérifier), retirer le mot de `data/candidats/<initiale>.yaml`, puis
`npm run valider` : chaque erreur indique le fichier, le champ et la règle enfreinte.

Seul Thibault passe une fiche en `validee`, après relecture dans l'app (`npm run dev`).

## Licences

- Code : MIT ([LICENSE](LICENSE)).
- Fiches et données (`data/`) : CC BY-SA 4.0 ([data/LICENSE.md](data/LICENSE.md)).
