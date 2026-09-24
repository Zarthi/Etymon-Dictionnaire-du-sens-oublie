# Modèle v3 : proposition

> Document de travail, à valider par Thibault avant implémentation. Il part des cas
> d'épreuve (§1) et des décisions déjà prises (24 septembre 2026) : chaîne étymologique,
> forme déduite de l'écriture d'origine, fiches Auteur et Ouvrage, data.bnf.fr comme source.

## 1. Ce que les cas d'épreuve ont montré

Onze fiches rédigées dans le modèle v2 (philosophie, altruisme, utopie, algorithme, algèbre,
personne, conscience, Satan, miséricorde, louer, louer-2). Le validateur en refuse **une**
(altruisme : pas de langue « français »). Les autres passent, mais **huit ont dû perdre ou
forcer quelque chose** : une fiche valide n'est pas une fiche juste.

| Manque | Cas | Conséquence en v2 |
|---|---|---|
| Filiation **et** composition | philosophie, miséricorde | l'une des deux est perdue |
| Sens premier au bout de la chaîne | Satan, schizophrénie, philosophie | l'en-tête affiche un intermédiaire sans sens ; sens écrit deux fois |
| Langues manquantes | altruisme (français), utopie (latin humaniste), algorithme (ancien espagnol), personne (étrusque) | refus, ou langue approximative ; `origine.langue` est libre, `langue` fermée : incohérent |
| Créateur incertain, date approximative | altruisme (Comte ou Andrieux, vers 1830), algèbre (XIIe siècle) | `forge` impose un auteur et une année exacte |
| L'étymon est une personne ou un titre | algorithme (al-Khwârizmî), algèbre (traité de 825) | aucun lien vers l'auteur ni l'ouvrage |
| Étymologie savante écartée | personne (*per-sonare*, Aulu-Gelle), algorithme (*arithmos*, Littré) | rangée avec les légendes populaires, sans ses tenants |
| Double sens voulu | utopie (οὐ-τόπος / εὖ-τόπος) | aucun champ ; forme citée hors de la fiche |
| Calque, analogie | personne (traduit πρόσωπον), altruisme (sur le modèle d'égoïsme) | aucun champ |
| Nom propre | Satan | nature approximative |
| Homonymes de même nature | louer (*locare*) / louer (*laudare*) | numérotation arbitraire ; le second n'entre pas au §3.3 |
| Piège YAML des virgules | `{ sens: adversaire, accusateur }` | 3 fiches sur 11 cassées à la main (npm run rediger l'évite) |
| Translittération | `anarkhía` (fiches) et `phrēn` (Bailly) | deux conventions dans le corpus |

## 2. L'étymologie : une chaîne de maillons

`etymon`, `graphie`, `langue`, `sens`, `origine`, `forge` et `legende` sont remplacés par :

```yaml
etymologie:                      # du plus proche au plus lointain
  - forme: Schizophrenie
    langue: allemand
    forge: { par: [eugen-bleuler], date: "1911" }
  - langue: grec ancien
    elements:
      - { forme: σχίζω, sens: fendre }
      - { forme: φρήν, sens: diaphragme, siège de la pensée }
```

**Un maillon** a une `langue` et, au choix :
- une `forme` (écrite dans son écriture d'origine : φιλοσοφία, صفر, religio) ;
- des `elements` (composition) ; les deux ensemble pour une forme dont on montre la
  composition (φιλοσοφία = φίλος + σοφία) ;
- des `alternatives` : `{ mode: debattue | jeu, formes: [...] }`. *debattue* : hypothèses
  concurrentes, la plus suivie en premier, chacune avec `selon`. *jeu* : double sens voulu
  par l'auteur (utopie).

Champs facultatifs d'un maillon : `sens` (seulement s'il apprend quelque chose : pas de sens
pour l'allemand *Schizophrenie* ni le latin *Satanas*) ; `translitteration` (seulement pour
l'arabe et l'hébreu : celle du grec se déduit, convention Bailly) ; `forge` ; `modele`
(`{ forme, langue, relation: calque | analogie }`) ; `personne` ou `ouvrage` (identifiant, quand
la forme est un nom propre ou un titre : al-Khwârizmî, *al-jabr*).

**Le sens premier** (en-tête de la fiche) est celui du dernier maillon attesté qui porte un
sens ; `premier: true` le force ailleurs. Les maillons plus proches s'affichent comme voie :

> **schizophrénie** — du grec σχίζω, « fendre », et φρήν, « diaphragme », par l'allemand
> *Schizophrenie*, forgé par Eugen Bleuler (1911).
>
> **philosophie** — du grec φιλοσοφία, « amour de la sagesse », par le latin *philosophia*.
> Composé de φίλος, « ami », et σοφία, « sagesse ».
>
> **religion** — du latin *religio*, « attention scrupuleuse ». Origine débattue : de
> *relegere* (Cicéron), ou de *religare* (Lactance).

Conséquence : le §3.1 devient « le sens premier est celui de la forme la plus ancienne
attestée qui le porte ; la langue source directe est la voie ». Le §3.2 (règle d'arrêt) reste :
on ne remonte au-delà que si cela ajoute un sens ou si l'origine est débattue.

**`forge`** : `{ par: [identifiants d'auteurs], date, ouvrage? }`. Plusieurs auteurs = attribution
incertaine (« Comte ou Andrieux »). `date` : texte contrôlé (`1911`, `vers 1830`, `XIIe siècle`).

**Étymologies écartées** (remplace `legende`) : `ecartees: [{ forme, sens, selon?, raison,
populaire? }]`. *Idée reçue* si populaire (*sine cera*), *Étymologie écartée* sinon
(*per-sonare*, Aulu-Gelle ; *arithmos*, Littré).

**Langues** : une seule liste fermée pour tous les maillons, étendue (français, latin
humaniste, ancien espagnol, étrusque, indo-européen…).

**Nature** : ajout de « nom propre ». **Homonymes** : numérotés dans l'ordre du Littré ; un
homonyme qui ne remplit pas le §3.3 n'est pas rédigé (louer-2).

## 3. Trois types de fiches, un même socle

Mot, auteur et ouvrage partagent le **socle éditorial** : `statut`, `redaction`, `sources`,
`historique` (même validation, même mention dans l'app). Principe (§2.7 proposé) :
**la qualité, non la quantité** : peu de champs, une page lisible en dix secondes, pas de
listes interminables, une notice d'autorité plutôt qu'une encyclopédie.

### Auteur (`data/auteurs/<id>.yaml`)

| Champ | Exemple | Règle |
|---|---|---|
| `nom` | Augustin ; Eugen Bleuler | forme usuelle, affichée partout |
| `nomComplet` | Aurelius Augustinus | facultatif ; pas de découpage prénom / nom (inadapté aux Anciens) |
| `naissance`, `mort` | 354, 430 ; vers 250 | texte daté contrôlé |
| `description` | une ou deux phrases, 200 caractères | d'où il parle, pas sa vie |
| `tradition` | true | signe des lectures traditionnelles (sinon : tenant d'hypothèse, créateur de mot) |
| `bnf` | cb11889474d | identifiant de notice ; l'adresse data.bnf.fr se déduit |

**Page** `#/auteur/<id>` : nom, dates, description, lien BnF ; puis, **calculé** (jamais écrit) :
œuvres, mots forgés, hypothèses défendues, lectures signées. Partout où l'auteur apparaît
(`selon`, signature, `forge`, nom cité dans un texte), un lien mène à sa page.

### Ouvrage (`data/ouvrages/<id>.yaml`)

| Champ | Exemple | Règle |
|---|---|---|
| `titre`, `titreOriginal` | *Institutions divines*, *Divinae institutiones* | |
| `auteur` | lactance | facultatif (œuvre collective : Rituel romain, TLFi) |
| `date` | vers 305-311 ; 1863-1872 | texte daté contrôlé |
| `edition` | révision de Gérard Gréco, 2016 | l'édition réellement consultée (Gaffiot 2016 ≠ Gaffiot 1934) |
| `licence` | domaine public ; CC BY-NC-ND ; non libre | ce qu'Étymon a le droit d'en faire |
| `texte` | adresse du texte | textes de la tradition |
| `modeleEntree` | `https://www.littre.org/definition/{entree}` | dictionnaires (remplace data/sources.json) |
| `description` | même règle que l'auteur | |

**Page** `#/ouvrage/<id>` : titre, auteur, date, édition, licence, description ; les mots
éclairés pour une œuvre de la tradition, les mots issus de son titre (algèbre). Pas de liste
pour un dictionnaire (le Littré est cité par presque toutes les fiches).

**Un ouvrage n'est citable que s'il a sa fiche** : la liste fermée devient l'ensemble des
fiches Ouvrage. On ne crée une fiche que pour un ouvrage réellement cité (les cinq œuvres de
Guénon, jamais citées, sortent de la liste).

Source des faits (noms, dates, éditions) : **data.bnf.fr** (Licence ouverte), ajouté aux ouvrages.

## 4. Migration et suite

1. Schéma, validation (références croisées : auteurs, ouvrages, formes visées par les
   lectures), contrat et prompt régénérés.
2. Migration automatique des 79 fiches (etymon + origine + legende → chaîne ; formes grecques
   réécrites en écriture d'origine) ; fiches Auteur (8 existants + Bleuler) et Ouvrage (4
   dictionnaires, 3 œuvres citées, data.bnf.fr).
3. App : en-tête et chaîne, pages Auteur et Ouvrage, liens.
4. Les onze cas d'épreuve rédigés en v3 comme vraies fiches, dont trois deviennent exemples
   du prompt.
