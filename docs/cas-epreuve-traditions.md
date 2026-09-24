# Cas d'épreuve : la tradition dans le modèle

Modèle éprouvé (proposition, non implémentée) :

- la **voix** d'une lecture se déduit de sa source : `auteur` de la lecture, sinon auteur de
  l'œuvre, sinon l'œuvre elle-même (Écriture) ; `auteur` ne s'écrit que si la voix diffère de
  l'auteur de l'œuvre (Resh Lakish dans le Talmud, Varron chez Augustin) ;
- une œuvre **sans auteur** porte ses `traditions` (une œuvre d'auteur tient les siennes de lui) ;
- la **tradition** d'une lecture : `tradition` si la voix en a plusieurs (Guénon), sauf pour une
  Écriture reçue en commun, qui garde toutes les siennes.

Trois mots, sources consultées le 24 septembre 2026, textes sous les yeux.

## 1. *homme* : la tradition rejoint une hypothèse de l'histoire

Sources :

- Littré : du latin *hominem* ; « sur l'origine de *homo* il n'y a que des conjectures », dont
  *humus*, « le terrestre » (sans tenant nommé) ;
- TLFi : du latin *homo*, « être humain », qui a pris dès l'époque impériale le sens d'« être
  humain du sexe masculin » en supplantant *vir* ;
- Isidore, *Étymologies*, XI, 1, 4 : *Homo dictus, quia ex humo est factus, sicut in Genesi
  dicitur : « Et creavit Deus hominem de humo terrae. » […] Nam proprie homo ab humo.*

```yaml
mot: homme
etymologie:
  - forme: homo
    langue: latin
    sens: être humain
explication: >-
  Homo désignait l'être humain, homme ou femme ; il a pris sous l'Empire le sens d'humain de
  sexe masculin, en supplantant vir. Le français a hérité des deux sens dans un seul mot.
tradition:
  lectures:
    - texte: L'homme est nommé de la terre dont il a été fait, comme le dit la Genèse.
      citation: Homo dictus, quia ex humo est factus
      sources:                      # pas d'auteur : Isidore se déduit des Étymologies
        - { ouvrage: etymologies, entree: "XI, 1, 4", url: … }
```

**Verdict : tient.** La voix et la tradition se déduisent (Isidore, chrétienne). Le lien avec
*humus* n'apparaît que dans la lecture : aucune source autorisée ne l'affirme comme étymologie
(le Littré le cite parmi des conjectures, sans tenant ; un ouvrage qui rapporte n'est pas
tenant). Limite **des sources**, pas du modèle : le §5 n'a aucun dictionnaire étymologique
indo-européen.

## 2. *manne* : l'Écriture donne elle-même l'étymologie

Sources :

- Littré : du latin *manna*, grec μάννα, « qui vient d'un mot hébreu, ou plutôt de deux mots
  hébreux, comme le montre le verset 15 du ch. XVI de l'Exode : *Manhu, quod significat : quid
  est hoc ?* » ;
- TLFi : latin chrétien *manna*, grec μάννα, de l'araméen *mannā*, de l'hébreu *mān*,
  « nourriture des Hébreux dans le désert » ; rien sur *mān hou'* ;
- Exode 16, 15 (texte massorétique) : ויאמרו איש אל־אחיו מן הוא כי לא ידעו מה־הוא, « ils se
  dirent l'un à l'autre : *mân hou'*, car ils ne savaient pas ce que c'était » ; 16, 31 : « la
  maison d'Israël lui donna le nom de *mân* ».

```yaml
mot: manne
etymologie:
  - forme: manna
    langue: latin ecclésiastique
  - forme: מָן
    translitteration: mān
    langue: hébreu
    sens: nourriture des Hébreux dans le désert
tradition:
  lectures:
    - texte: Le nom vient de la question des Hébreux devant cette nourriture inconnue :
        « qu'est-ce que c'est ? »
      citation: ויאמרו איש אל־אחיו מן הוא כי לא ידעו מה־הוא
      sources:                      # voix : l'Écriture ; traditions : juive et chrétienne
        - { ouvrage: bible-hebraique, entree: "Exode 16, 15", url: … }
```

**Verdict : le modèle tient, la fiche non.**

- Tient : la lecture est celle de l'Écriture reçue en commun, affichée « juive et chrétienne »
  (règle du cas 2) ; l'étymologie que le Littré tire de l'Exode n'est pas une hypothèse de la
  chaîne (il la rapporte, il n'en est pas le tenant) ni une étymologie écartée (aucune source ne
  l'écarte) : c'est une lecture.
- Ne tient pas : le sens premier affiché en tête, « nourriture des Hébreux dans le désert », ne
  dit rien ; tout ce qui rend le mot parlant est dans la rubrique repliée. Le principe 3
  (l'étymologie d'abord, la tradition à côté) cache ici la seule raison d'être de la fiche.
- Manque : « araméen » dans la liste des langues (maillon *mannā* du TLFi), omis ci-dessus.

## 3. *Satan* : l'Écriture sans auteur, et sa traduction

Source : Apocalypse 12, 9, Vulgate clémentine (Wikisource) : *Et projectus est draco ille
magnus, serpens antiquus, qui vocatur diabolus, et Satanas, qui seducit universum orbem.*

```yaml
tradition:
  lectures:
    - texte: … (Resh Lakish, Talmud : auteur écrit, la voix diffère de l'œuvre)
      auteur: resh-lakish
    - texte: Satan est le grand dragon, le serpent ancien, appelé aussi le diable, qui séduit
        toute la terre.
      citation: Et projectus est draco ille magnus, serpens antiquus, qui vocatur diabolus, et
        Satanas
      sources:                      # voix : la Vulgate ; tradition : chrétienne
        - { ouvrage: vulgate, entree: "Apocalypse 12, 9", url: … }
    - texte: … (Isidore : auteur déduit des Étymologies)
```

**Verdict : tient, à une condition.** La Vulgate est une traduction, en grande partie de
Jérôme : si sa fiche portait `auteur: jerome`, la voix de l'Apocalypse deviendrait Jérôme, ce
qui est faux. Règle : **une traduction de l'Écriture est une œuvre sans auteur**, avec ses
traditions (la Vulgate : chrétienne ; la Septante : juive et chrétienne), le traducteur allant
dans `edition` ou `description`. C'est aussi ce que dit le cas 4 : la Bible hébraïque, la
Septante et la Vulgate sont trois œuvres.

## Bilan

Le modèle proposé tient sur les trois mots, avec deux précisions à écrire :

1. une traduction de l'Écriture est une œuvre sans auteur ;
2. une étymologie qui n'a pour fondement que le texte sacré (*manne*) est une lecture, même si
   un dictionnaire la rapporte.

À trancher par Thibault :

1. **Un mot dont seule la tradition est parlante** (*manne*) : entre-t-il (§3.3 exige un sens
   premier parlant, historique) ? S'il entre, la tête de fiche doit-elle pouvoir montrer la
   lecture, contre le principe 3 ?
2. **Les sources** : faut-il un dictionnaire étymologique moderne pour les maillons au-delà du
   latin (*homo* et *humus*) ? Aucun n'est autorisé au §5.
3. **« araméen »** dans la liste des langues.
