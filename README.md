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
| `npm run etat -- themes` | les mots de chaque thème |
| `npm run dossier -- <mot>` | dossier de faits d'un mot (Littré, TLFi), dans `atelier/` |
| `npm run bnf -- auteur\|ouvrage "…"` | notices BnF ; avec `--cb`, écrit la fiche d'auteur ou d'ouvrage |
| `npm run texte -- <adresse>` | texte brut d'une page en ligne (citations, Bailly) |
| `npm run liste -- <liste> "<valeur>"` | ajoute une langue, une tradition ou un thème (`docs/methode.md`, §7 bis) |
| `npm run rediger -- <fiche.json>… --modele "…"` | écrit des fiches rédigées par l'IA (`--dossier` : d'après leur dossier, en brouillon ; `--essai` : sans écrire) |
| `npm run verifier` | confronte les fiches au Littré local (`npm run littre` une fois) et signale les contrôles |
| `npm run verifier:en-ligne` | vérifie les entrées du Bailly et les citations des lectures traditionnelles |
| `npm run contrat` | régénère le contrat de données et les consignes de chaque étape (`docs/`) |
| `npm test` | tests (Vitest) |
| `npm run build` | site de production dans `dist/` (fiches non validées signalées comme telles) |

Chaque push est validé par la CI. La publication sur GitHub Pages se déclenche à la main
(onglet Actions, « Run workflow »), une fois Pages activé dans les réglages du dépôt.

## Ajouter une fiche

Le format d'une fiche est décrit dans [docs/contrat-fiche.md](docs/contrat-fiche.md), généré
à partir du schéma ; VS Code le vérifie pendant la saisie. Exemples complets :
[religion](data/fiches/r/re/religion.yaml), [schizophrénie](data/fiches/s/sc/schizophrenie.yaml).

**Par l'IA, en lot** : selon [docs/methode.md](docs/methode.md), un agent rédacteur constitue le
dossier de sources de chaque mot et rédige la fiche d'après lui ([docs/consignes/](docs/consignes/)) ;
un agent relecteur, qui n'a pas écrit, relit tout le lot ; le rédacteur reprend, crée les auteurs
et ouvrages d'après la BnF, écrit les fiches en brouillon et cherche les lectures traditionnelles.

**À la main** : créer `data/fiches/<initiale>/<deux lettres>/<id>.yaml` (par exemple
`data/fiches/e/et/etonner.yaml`) après avoir consulté les sources (Littré, Gaffiot ou Bailly ;
TLFi pour vérifier), retirer le mot de `data/candidats/<initiale>.yaml`, puis
`npm run valider` : chaque erreur indique le fichier, le champ et la règle enfreinte.

Seul Thibault passe une fiche en `validee`, après relecture dans l'app (`npm run dev`).

## Licences

- Code : MIT ([LICENSE](LICENSE)).
- Fiches et données (`data/`) : CC BY-SA 4.0 ([data/LICENSE.md](data/LICENSE.md)).
