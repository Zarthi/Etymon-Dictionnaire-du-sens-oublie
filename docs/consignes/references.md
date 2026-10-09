# Créer les fiches d'auteurs et d'ouvrages

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Pour chaque auteur ou ouvrage cité par une fiche du lot et qui n'a pas encore la sienne (`npm run rediger -- atelier/<id>/fiche.json --essai` les dit « à créer »), tu choisis sa notice BnF et tu l'ajoutes à `atelier/references.json`, commun au lot. `npm run lot -- clore` crée les fiches, d'après la notice, avant d'écrire celles des mots.

1. Si `data/auteurs/<id>.yaml` (ou `data/ouvrages/<id>.yaml`) existe, rien à faire.
2. Cherche sa notice : `npm run bnf -- auteur "<nom> <année de naissance sur quatre chiffres>"` (`Augustin 0354`, `Bleuler 1857`) ; `npm run bnf -- ouvrage "<auteur> <titre>"`. Choisis la notice qui répond à ce que dit le dossier (dates, note) ; plusieurs recherches se lancent dans une même commande.
3. Ajoute-la à `atelier/references.json` : `id` (prénom et nom sans accent ; abrégé ou titre pour un ouvrage), `cb` (l'identifiant de la notice), `description`, et `nom` si le nom usuel n'est pas « prénom nom » (Augustin, Cicéron), `nomComplet` s'il diffère (Aurelius Augustinus), `traditions` seulement pour un auteur qui parle dans une tradition (une tradition absente de la liste : `npm run liste -- traditions "<tradition>"` d'abord). Un ouvrage : `titre` français, `licence`, `description`, `auteur` (l'identifiant de l'auteur, d'une fiche existante ou listée au même fichier), `abrege`, `titreOriginal`, `texte` (adresse en ligne libre).

## Règles

- Dates et forme d'entrée viennent de la notice : le script les pose, tu ne les écris pas.
- Description : 200 caractères au plus ; ce qui situe (époque, domaine, œuvre), pas une biographie, pas de jugement.
- Licence d'un ouvrage : domaine public, Licence ouverte, CC BY-SA, CC BY-NC-ND, non libre ; domaine public si l'auteur est mort depuis plus de soixante-dix ans.
- Sans notice qui réponde : la fiche du mot ne s'écrit pas ; signale-le dans `atelier/signalements.md`. Jamais de fiche d'auteur écrite à la main.

## Format de `atelier/references.json`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `auteurs` | liste d'objets (voir plus bas) | non |  |
| `ouvrages` | liste d'objets (voir plus bas) | non |  |

### `auteurs[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | texte | oui | Identifiant : prénom et nom sans accent (eugen-bleuler). |
| `cb` | texte | oui | Identifiant de la notice BnF, choisie avec `npm run bnf -- auteur "<nom> <année>"` (cb12065087s). |
| `description` | texte | oui | 200 caractères au plus : ce qui situe l'auteur. |
| `nom` | texte | non | Nom usuel, si ce n'est pas « prénom nom » (Augustin, Cicéron). |
| `nomComplet` | texte | non | Forme complète, si elle diffère (Aurelius Augustinus). |
| `traditions` | liste non vide de textes | non | Seulement pour un auteur qui parle dans une tradition (liste fermée). |

### `ouvrages[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | texte | oui | Identifiant : abrégé ou titre sans accent (utopia). |
| `cb` | texte | oui | Identifiant de la notice BnF d'œuvre, choisie avec `npm run bnf -- ouvrage "<auteur> <titre>"`. |
| `titre` | texte | oui | Titre français. |
| `licence` | texte | oui | Licence de l'édition consultée (liste fermée). |
| `description` | texte | oui | 200 caractères au plus : ce qui situe l'ouvrage. |
| `auteur` | texte | non | Identifiant de l'auteur (d'une fiche existante ou listée ci-dessus). |
| `abrege` | texte | non |  |
| `titreOriginal` | texte | non |  |
| `texte` | texte | non | Adresse d'un texte en ligne libre. |
| `traditions` | liste non vide de textes | non | Seulement pour une œuvre sans auteur (l'Écriture). |
