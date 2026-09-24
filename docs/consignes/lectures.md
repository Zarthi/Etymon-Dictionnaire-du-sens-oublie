# Chercher les lectures traditionnelles d'un mot

> Généré par `npm run contrat` : ne pas modifier à la main. Étape de la rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu ajoutes à la fiche d'un mot (`data/fiches/<initiale>/<préfixe>/<id>.yaml`) les lectures qu'une tradition a faites du mot lui-même, texte source sous les yeux (AGENTS.md §4.7). Aucune lecture vaut mieux qu'une lecture approximative.

## Étapes

1. Pistes : les `notes` du dossier (`atelier/<id>/dossier.json`), et ce que tu sais (Isidore, *Étymologies* ; Augustin ; Lactance ; Varron ; le Talmud ; les Pères…). L'auteur doit avoir lu le mot, ou son étymon, pas la chose qu'il désigne aujourd'hui.
2. Trouve le passage dans un texte original en ligne, du domaine public (Wikisource en latin, en grec, en hébreu ; thelatinlibrary.com ; archive.org), et lis-le tel quel : `npm run texte -- <adresse> --autour "<mot>"`. Jamais un outil qui résume la page pour une citation.
3. Écris la lecture dans `tradition.lectures` : la citation copiée de la page, mot pour mot, `[…]` pour une coupe ; le texte, ce que la doctrine tire du mot, en une ou deux phrases, sans commencer par le nom de l'auteur ni répéter l'hypothèse.
4. L'œuvre et son auteur doivent avoir leur fiche (`npm run bnf`, docs/consignes/references.md) : l'auteur avec ses `traditions`, l'œuvre avec l'adresse de son `texte`.
5. `npm run verifier:en-ligne -- <mot>`, puis `npm run valider`. Une citation introuvable est une erreur : corrige-la, ou retire la lecture.

## Règles

- Une seule voix par lecture. Elle se déduit de l'œuvre citée : son auteur, ou l'œuvre elle-même pour l'Écriture. `auteur` ne s'écrit que pour une parole rapportée par l'œuvre d'un autre (Resh Lakish dans le Talmud).
- `tradition` seulement si la voix parle dans plusieurs traditions ; `hypothese` quand la lecture repose sur l'une des alternatives de la chaîne.
- Le Nom divin s'écrit comme le texte l'écrit, jamais revocalisé.
- Rien trouvé dans un texte en ligne : pas de lecture ; dis-le dans tes notes, avec la piste.

## Format

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `texte` | texte | oui | Sens que la doctrine donne au mot, sans commencer par le nom de l'auteur ni répéter l'hypothèse étymologique. |
| `citation` | texte | oui | Texte original de l'auteur, dans sa langue, tel qu'il figure à l'adresse de la source ([…] pour une coupe). |
| `auteur` | identifiant | non | Celui dont la parole est rapportée, seulement s'il n'est pas l'auteur de l'œuvre citée (Resh Lakish dans le Talmud, Varron chez Augustin) : sinon la voix se déduit de l'œuvre, ou est l'œuvre elle-même (l'Écriture). |
| `tradition` | `juive` \| `chrétienne` | non | Tradition dans laquelle parle le passage ; seulement si sa voix en a plusieurs (Guénon). L'Écriture reçue en commun (Bible hébraïque) garde toutes les siennes. |
| `premier` | `true` \| `false` | non | Mot sacré : lecture du texte d'origine, qui donne le sens affiché en tête de fiche (Exode 16, 15 pour manne). |
| `sens` | texte | non | Sens que le texte d'origine donne au mot ; seulement pour la lecture premier. |
| `hypothese` | texte | non | Forme d'une alternative de la chaîne sur laquelle repose la lecture : le texte n'a pas à la répéter. |
| `sources` | liste non vide d'objets (voir plus bas) | oui | Passages cités, d'une même voix : œuvres de l'auteur, œuvre collective qui rapporte sa parole, ou Écriture. |
| `redaction` | liste non vide d'objets (voir plus bas) | non | Rédaction propre à cette lecture, seulement si elle diffère de celle de la fiche. |

### `sources[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `ouvrage` | identifiant | oui | Œuvre de l'auteur de la lecture (identifiant d'une fiche de data/ouvrages). |
| `entree` | texte | oui | Passage précis (« IV, 28, 3 »). |
| `page` | nombre ou texte | non | Page de l'édition papier consultée. |
| `url` | adresse https | oui | Adresse (https) du texte original, du domaine public : npm run verifier:en-ligne y cherche la citation. |

### `redaction[]`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `par` | `IA` \| `Étymon` | oui | IA (moteur d'IA) ou Étymon (Thibault, ou un lecteur via Critique). |
| `detail` | texte | oui | Modèle d'IA (« Claude Opus 5.5 ») ou nature de la contribution. |

## Exemples

Lectures du dépôt (Lactance sur *religion* ; Resh Lakish, parole rapportée par le Talmud, sur *Satan*) :

```json
{"texte":"La religion est le lien de piété qui attache l'homme à Dieu, et non le soin des rites que Cicéron y voyait.","citation":"hoc uinculo pietatis obstricti deo et religati sumus: unde ipsa religio nomen accepit, non ut Cicero interpretatus est a relegendo","hypothese":"religare","sources":[{"ouvrage":"institutions-divines","entree":"IV, 28, 3","url":"https://la.wikisource.org/wiki/Divinae_institutiones/Liber_IV"}]}
{"texte":"Le satan, le mauvais penchant et l'ange de la mort ne font qu'un : c'est celui qui, dans le livre de Job, « sortit de devant le Seigneur ».","citation":"הוא שטן הוא יצר הרע הוא מלאך המות","auteur":"resh-lakish","sources":[{"ouvrage":"talmud-de-babylone","entree":"Baba Batra 16a","url":"https://he.wikisource.org/wiki/בבא_בתרא_טז_א"}]}
```
