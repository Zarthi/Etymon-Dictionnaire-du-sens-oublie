# Étymon : Dictionnaire du sens oublié

Ce fichier est le cadrage de référence du projet. Lis-le entièrement avant toute action.
Tu travailles avec Thibault, ingénieur systèmes (SysML/MBSE), sous Windows 11, dans VS Code.
Réponds toujours en français. Sois concis et précis. Quand un choix n'est pas
tranché ici, ne t'arrête pas : décide, applique, et note la décision et sa raison dans
`docs/decisions.md`, que Thibault relit. Ce qui lui est réservé attend sa décision : valider
une fiche, écarter un mot, changer un principe de ce cadrage.

---

## 1. Vision

Étymon est un dictionnaire minimaliste qui donne, pour chaque mot français, son **sens premier
étymologique** : l'étymon dans sa langue source directe, le sens de cet étymon, et une courte
explication de ce que ce sens révèle ou de ce qui s'est perdu.

**Ce que « sens premier » veut dire.** Premier dans le temps : le sens le plus ancien que les
sources atteignent, établi par la philologie. Ce n'est ni le sens principiel du mot, ni son
« vrai sens ». *Étymon* vient du grec ἔτυμος, « vrai » (Bailly), et pour les Anciens l'étymologie
était l'origine des mots « quand la force du mot est recueillie par l'interprétation » (Isidore,
*Étymologies*, I, 29, 1) : ils y cherchaient la vérité du mot, la philologie n'y cherche que son
histoire. Étymon donne l'histoire, qu'il peut établir par ses sources ; ce qu'une tradition lit
dans un mot, elle le dit par ses propres textes, cités (§4.7). L'app ne prête jamais au mot un
« vrai sens » qui lui serait propre.

Ce n'est PAS un dictionnaire étymologique complet. Les ouvrages existants (Robert historique,
TLFi, Bloch & Wartburg) noient l'étymon dans l'histoire complète du mot. Étymon fait l'inverse :
une fiche courte, lisible en dix secondes, sans surcharge.

Exemple de fiche cible :

> **Étonner** — du latin populaire *\*extonare* : « ébranler comme d'un coup de tonnerre ».
> Le mot désignait un ébranlement violent ; il ne dit plus qu'une surprise.

Autres exemples de mots parlants : *ennui* (latin *in odio esse*, « être un objet de haine »), *chétif*
(latin *captivus*, « prisonnier »), *chiffre* (arabe *ṣifr*, « vide »), *merci* (latin
*merces*, « salaire, récompense »), *critique* (grec *kritikós*, « capable de discerner »).

## 2. Principes non négociables

1. **Fiabilité avant tout.** Une étymologie fausse détruit la valeur de l'app. On ne
   rédige **jamais de mémoire** : une fiche s'écrit d'après son dossier de sources (§6.5) et
   n'affirme rien qui n'y soit. Une source n'est citée que si elle a réellement été consultée.
   Le statut `a-verifier` (« Étymologie non vérifiée ») ne sert plus qu'à d'anciennes fiches
   rédigées de mémoire, s'il en reste, jusqu'à leur reprise d'après un dossier. Attention aux étymologies populaires
   (*sincère* « sans cire »), nombreuses sur les mots « parlants ».
   Une étymologie douteuse est signalée (`incertain: true`) ; une origine débattue est
   présentée avec toutes ses hypothèses et leurs tenants (alternatives de la chaîne).
2. **Simplicité.** Une seule chose bien faite. Pas de fonctionnalité non listée ici sans
   accord explicite. Pas de bibliothèque lourde quand quelques lignes suffisent.
3. **Deux ordres, sans confusion ni rang : l'histoire et la tradition.** L'histoire du mot vient
   en tête parce que c'est ce que l'app établit elle-même, par ses sources ; ce n'est pas un
   rang. La tradition ne parle que par ses textes cités (§4.7), dans sa rubrique, signalée sur
   chaque fiche qui en a, toujours visuellement distincte de l'étymon, toujours sourcée. Elle est
   repliée par réserve, et s'ouvre d'un geste, non parce qu'elle vaudrait moins ; dépliée pour un
   mot sacré, dont elle donne le sens même (§3.3 bis).
4. **Transparence.** Les fiches, les comptes et les corrections sont des données publiques
   et versionnées dans le dépôt.
5. **L'IA n'intervient pas dans l'app.** Elle sert uniquement en amont, dans des scripts
   de préparation des fiches, que Thibault relit avant validation. L'app affiche toutes les
   fiches, mais signale clairement celles qui ne sont pas validées (« Étymologie non
   vérifiée », « En relecture »). Aucun appel réseau ni serveur.
6. **Toute fiche que tu rédiges est `brouillon`** (rédigée d'après son dossier) tant que
   Thibault ne l'a pas validée lui-même.
7. **La qualité, non la quantité** (principe traditionnel). Peu de champs, une page lisible
   en dix secondes, pas de liste interminable, une notice d'autorité (BnF) plutôt qu'une
   encyclopédie. Aucun champ ne sert à tout dire : il dit ce qui situe ou ce qui dévoile.

## 3. Règles éditoriales des fiches

**Justesse des noms, au service de la vérité.** Étymon rend à chaque mot son nom juste, et
s'écrit de même : chaque mot dans son sens propre, chaque phrase conforme à ce qui est et à ce
que disent les sources, rien de plus. Une phrase qu'il faut relire, ou qui cherche l'effet,
nomme mal. Les règles qui suivent en sont des applications ; en cas de doute, le principe
tranche. Relire chaque phrase avec une question : « que veux-tu dire exactement ? » ; si la
réponse est plus claire que la phrase, écrire la réponse.

### 3.1 Sens premier : au bout de la chaîne
L'étymologie est une **chaîne de maillons**, du plus proche au plus lointain. Le premier
maillon est la **langue source directe** (latin pour un mot hérité, italien pour un emprunt à
l'italien, allemand pour *schizophrénie*, où le mot a été forgé).
Le **sens premier**, affiché seul en tête, est celui du maillon le plus lointain attesté qui
porte un sens (`premier: true` le force ailleurs). Ce n'est pas le premier sens attesté en
français. Dessous, une phrase suit la chaîne du plus proche au plus lointain, sans étiquette :
les liaisons se déduisent des champs (*de*, *forgé par… sur*, *sur le modèle de*).

> **schizophrénie** — « esprit fendu »
> De l'allemand *Schizophrenie*, forgé par Eugen Bleuler (1911), dans *Dementia praecox*,
> sur le grec σχίζω, « fendre », et φρήν, « diaphragme ».

### 3.2 Règle d'arrêt
On ne remonte au-delà de la langue source directe que si cela **ajoute un sens** ou si
l'origine est **débattue**. Un maillon porte :
- une **forme**, dans son écriture d'origine (religio, φρήν, صفر ; reconstruite : *\*extonare*) ;
- des **éléments** (composition : φίλος + σοφία), seuls ou avec la forme qu'ils composent.
  Quand la forme composée existe (φιλοσοφία, *religio*), on découpe **du tout vers les
  parties**, non l'inverse (l'erreur de Descartes) : la forme porte son sens, attesté par une
  source et non déduit des parties, puis chaque élément le sien ; et seulement si les parties
  parlent encore (*re-legere*, oui ; *śāṭān*, non). Quand le mot est forgé sur des éléments
  sans forme composée avant lui (*schizophrénie*, sur σχίζω et φρήν), le sens premier est le
  **sens littéral de ses éléments** (« esprit fendu »), que l'app affiche comme tel
  (« littéralement ») : jamais comme le sens attesté d'une forme qui n'a pas existé. Une
  hypothèse se découpe de même : celles de *religio* en sont la décomposition (*re-* et *legere*,
  ou *re-* et *ligare*), et l'app les affiche une par ligne ;
- ou des **alternatives** : hypothèses **débattues** (la plus suivie en premier, chacune avec
  ses tenants, `selon`), ou double sens **voulu** par l'auteur (*utopie*).

Il peut aussi porter `forge` (qui a forgé le mot, quand, dans quel ouvrage ; plusieurs
auteurs si l'attribution est incertaine), `modele` (calque ou analogie : *altruisme*, sur le
modèle d'*égoïsme*), `personne` ou `ouvrage` (la forme est un nom ou un titre : *algorithme*,
d'al-Khwârizmî ; *algèbre*, du traité *al-jabr*). Un mot forgé en français même (*altruisme*)
ouvre la chaîne par un maillon `français` fait de ses éléments. Un ouvrage qui rapporte une
hypothèse n'en est pas le tenant ; une étymologie purement doctrinale (*religere*
d'Augustin) relève des lectures traditionnelles. Les étymologies écartées, populaires
(*sine cera*) ou savantes (*per-sonare*, Gavius Bassus), vont dans `ecartees`.

### 3.3 Critère de sélection d'un mot
Un mot entre dans le dictionnaire s'il remplit deux conditions :
1. **il est important** : d'usage courant, et porteur de sens dans la vie intellectuelle,
   morale, spirituelle ou sociale ;
2. **son sens premier éclaire ce qu'on dit en l'employant** : sens concret oublié, affaibli
   ou retourné, que le locuteur ignore mais qui reste parlant.

Les simples curiosités (étymologie amusante sur un mot secondaire, comme *banqueroute*)
ne sont retenues que si elles éclairent un mot important, par exemple comme doublet.
Les emprunts plats (*pizza*, *week-end*) sont exclus. **La qualité prime sur la quantité** :
pas d'objectif de volume. **Seul Thibault écarte un mot** : l'agent qui doute d'un
candidat rédige quand même la fiche et lui signale son doute.

### 3.3 bis Mots sacrés
Le profane et le sacré sont distincts. Un mot **sacré par origine**, né dans l'ordre sacré
(*manne*, *sabbat*, *alléluia*, *Pâque*), n'a pas de partie profane : on ne le mesure pas à
ce qui lui est extérieur. Un mot **consacré**, profane à l'origine (*église*, « assemblée des
citoyens » ; *ange*, « messager » ; *baptême*, *religion*), se traite comme les autres : son
sens profane premier est justement ce que le dictionnaire révèle.
- `sacre` : les traditions où le mot est sacré (*sabbat* : juive ; *Pâques* : chrétienne ;
  *manne* : juive et chrétienne). L'agent le pose, Thibault relit.
- La chaîne ne garde que les **formes** : par quelles langues le mot est passé.
- Le **sens en tête** vient du **texte d'origine**, que toutes les traditions du mot reçoivent :
  la lecture `premier`, avec son `sens`, signée (*sabbat* : « il cessa », Genèse 2, 3). Si le
  texte d'origine n'explique pas le mot, c'est le sens du mot dans sa langue, selon un
  dictionnaire de cette langue (*alléluia* : « louez Yah ») : seul ce maillon porte un sens.
- Si les traditions divergent sur le sens même du texte d'origine, il n'y a pas un sens unique
  en tête, mais un sens par tradition, chacun signé de sa lecture `premier` (*manne*, Exode 16,
  15 : « qu'est-ce que c'est ? » selon la Septante et la Vulgate ; « c'est une préparation de
  nourriture » selon Rashi). Diverger dans la lecture seule ne suffit pas : *Pâques*, lu comme
  le passage chez Isidore, garde le sens unique d'Exode 12, 27.
- Pas d'explication : la lecture d'origine en tient lieu ; les autres lectures suivent, par
  tradition, dépliées.
- Deux graphies pour deux traditions, deux fiches (*Pâque*, fête juive ; *Pâques*, fête
  chrétienne). Un sens profané (*sabbat* des sorcières) n'a sa fiche, homonyme et profane, que
  s'il remplit par lui-même le critère du §3.3 : c'est rare, et ce n'est pas le cas du sabbat.
- Le **Nom divin** s'écrit comme le texte l'écrit (*Yah*, YHWH), jamais traduit (« Dieu ») ni
  vocalisé (« Jéhovah », « Yahvé »), ce qui inviterait à le prononcer (Exode 20, 7) ; le validateur
  refuse ces formes. Dans une citation, il reste tel que le texte l'écrit (יהוה). Dans le texte
  d'une lecture, « le Seigneur » est admis : c'est le substitut traditionnel, juif et chrétien,
  qui évite de prononcer le Nom, non une traduction du Nom.
- Un mot sacré n'est tiré ni comme mot du jour ni au hasard : on ne tire pas le sacré comme une
  carte (« ne donnez pas ce qui est saint aux chiens », Matthieu 7, 6) ; on y vient par la recherche.
- Un mot sacré ne se rédige pas en lot, de mémoire : à part, texte d'origine sous les yeux.

### 3.4 Format d'une fiche
- `sens` : sens d'un maillon, entre guillemets français « » (posés par l'app), seulement
  là où il apprend quelque chose (pas pour l'allemand *Schizophrenie*). Pour une forme
  composée attestée, son sens attesté ; pour un mot forgé sur des éléments, le **sens littéral
  de ses éléments** (*schizophrénie* : « esprit fendu »), affiché comme tel (§3.2).
  L'intention de l'auteur va dans l'explication.
- `explication` : une à trois phrases, pas plus (aucune pour un mot sacré, §3.3 bis). Elle doit **dire ce qui s'est perdu,
  affaibli ou retourné** entre le sens premier et l'usage actuel, pas seulement donner le
  sens premier (*religion* : « *religio* nommait d'abord le scrupule qui retient
  d'agir »). Elle n'explique pas une seconde fois le `sens`, déjà affiché juste
  au-dessus ; mais mieux vaut redire le mot juste que le contourner par une périphrase.
  Ton sobre, pas d'emphase, pas de jugement moral. Elle ne présente pas le sens ancien comme le
  « vrai » sens du mot, ni l'usage actuel comme une erreur : elle dit ce qui a changé.
- Texte d'une lecture traditionnelle : il **ne commence pas par le nom de l'auteur**, que la
  citation affichée dessous donne déjà (« _Religio_ viendrait de _religare_… », signé
  « Lactance, *Institutions divines*, IV, 28, 3 »).
- Aucune mise en forme dans les textes : l'app met en italique l'étymon, les formes
  d'origine et la forme légendaire, et pose les liens vers les autres fiches. Un mot étranger
  cité dans un texte est donc une forme de la chaîne (translittération comprise).
- Typographie française : espaces insécables avant `:` `;` `?` `!`, guillemets « ».

## 4. Fonctionnalités

### 4.1 Version 1 (à construire maintenant)
- Recherche d'un mot (normalisation : minuscules, accents ignorés ; tolérance aux fautes
  légère si peu coûteuse).
- Affichage de la fiche.
- Mot du jour (déterministe à partir de la date, identique pour tous).
- Mot au hasard. Ni l'un ni l'autre ne tire un mot sacré (§3.3 bis).
- Liens entre mots, chacun à un seul endroit selon sa raison :
  - un lien qui s'explique en une phrase va dans l'**explication** (l'app lie tout mot qui a
    une fiche : « Bleuler renommait la démence précoce ») ;
  - **« Voir aussi »** (`renvois`) : notions voisines **du même ordre**, sans racine commune
    (*schizophrénie* → *délire*, *folie*), déclarées d'un seul côté, affichées des deux, trois
    au plus ;
  - **vers la tradition** (`tradition.renvois`) : mots que la tradition a lus et où elle parle
    de ce dont traite celui-ci (*schizophrénie* → *obsession*), deux au plus, à sens unique,
    affichés dans la rubrique « Lectures traditionnelles » (§4.7) : « voir *obsession* », sans
    phrase qui lui prête rien.
  Un renvoi peut viser un **candidat à faire** : l'app ne l'affiche qu'une fois la fiche écrite ;
  vers la tradition, qu'une fois cette fiche pourvue de lectures (le lien promet que la
  tradition y parle).
  L'IA les écrit comme le reste de la fiche ; Thibault les relit à la validation.
- Paramètres, contenant les entrées grisées « en construction » décrites ci-dessous.
- Hors ligne complet (PWA installable).

### 4.2 Versions suivantes (prévoir la structure, ne pas coder sans accord)
- Favoris (stockés sur l'appareil).
- Parcours par racine : tous les mots issus d'un même étymon.
- **Doublets** : mots issus du même étymon par deux voies (*hôtel* / *hôpital*,
  *poison* / *potion*, *chiffre* / *zéro*). Doit être présenté de façon très claire.
- Listes de mots par thème (champ `themes` sur chaque fiche).
- Partage d'une fiche (lien, éventuellement image).
- **Évolutions conçues, à ne pas coder sans accord** : leur conception est dans
  `docs/evolutions/` (visible sur le dépôt), où elle se discute et se tient à jour, pas ici :
  - **les dictionnaires ouverts** (hébreu, arabe), voilés par défaut, ouverts d'un geste ; avec les
    pages de racine ;
  - **la langue de l'application** : l'architecture y est prête (§7) ;
  - **la Quête** : un mode pour la découverte des sens sacrés, qui ouvre une langue qui ne se parle
    pas et la lecture du lecteur.

### 4.3 « Merci » (financement)
Bouton de don, volontairement discret, placé dans les paramètres. Nommé **Merci**
(latin *merces*, « salaire, récompense »). C'est un don, jamais un achat : personne n'y est
obligé, et il ne débloque **absolument aucune** fonctionnalité ; tout est offert à tous. En v1 : bouton grisé « en construction ».
À terme, une page publique de comptes, calculée depuis `data/comptes.json` : total reçu,
coûts par catégorie (hébergement, domaine, comptes développeur), rémunération, impôts et
cotisations, solde, historique ligne par ligne. Dons regroupés par mois (anonymat).
La page des coûts peut être active dès la v1, même sans dons.

### 4.4 « Critique » (retours utilisateurs)
Formulaire de remontée, nommé **Critique** (grec *kritikós*, « capable de discerner »).
Accessible depuis chaque fiche (remarque rattachée au mot) et depuis les paramètres
(proposer un mot absent). Champs : type (erreur / précision / source / mot à proposer /
autre), texte, source facultative, e-mail facultatif. En v1 : bouton grisé « en
construction ». Le mécanisme d'envoi (service de formulaire ou fonction serverless) sera
choisi plus tard. Prévoir : anti-spam par champ piège, envoi différé hors ligne, mention
RGPD si e-mail collecté. Une fiche corrigée suite à une Critique porte une mention
« corrigée le … ».

### 4.5 Sources affichées
Chaque fiche affiche discrètement ses sources (voir §5).

### 4.6 Thèmes
Champ `themes` (liste fermée : `data/themes.json`) sur chaque fiche : le domaine où le mot
s'emploie aujourd'hui (*étonner* : émotions, non météo), un ou deux. Affiché sur la fiche à côté
de la nature (« nom féminin · esprit, santé »), il servira aussi aux listes thématiques.
Aucune liste fermée (thèmes, langues, traditions) n'est exhaustive d'avance : elles grandissent
avec les mots, par `npm run liste` seulement, selon `docs/methode.md` (§7 bis).

### 4.7 Lecture traditionnelle
Champ `tradition` : une seule rubrique, « Lectures traditionnelles », sur toutes les fiches.
Elle contient les lectures du mot (`tradition.lectures` : liste de `{ texte, citation, auteur,
hypothese?, sources }`), ou, pour un mot que la tradition n'a pas lu, les mots où elle parle
(`tradition.renvois`, §4.1) ; ou les deux.
Sens donné au mot par une doctrine traditionnelle (Pères de l'Église, scolastique, Isidore
de Séville, Talmud, Guénon…), quand il diffère de l'étymologie historique ou la complète.
- **Les traditions sont distinctes et jamais mêlées** (liste fermée : `data/traditions.json`,
  que l'agent étend quand une voix parle dans une tradition absente ; Thibault retire à la
  relecture ce qui n'a pas lieu d'être).
  Un auteur porte les `traditions` dans lesquelles il parle ; la tradition d'une lecture se
  déduit de son auteur, et ne s'écrit (`tradition`) que s'il en a plusieurs (Guénon). Les
  lectures s'affichent regroupées par tradition. Exemple :
*religion*, hypothèses *relegere* (Cicéron) et *religare* (Lactance) ; la lecture de
Lactance vise *religare* (`hypothese`) et dit ce qu'en tire la doctrine, sans le répéter.
- **La tradition doit avoir lu le mot lui-même**, pas la chose qu'il désigne aujourd'hui :
  aucun auteur traditionnel n'a lu *schizophrénie* (1911). Rapprocher un mot moderne d'une
  notion traditionnelle serait une interprétation libre ; la tradition se place sur les mots
  qu'elle a réellement lus (*obsession*, *lunatique*, *énergumène*…). Le mot moderne y mène
  par un simple lien, sous le même titre : « Lectures traditionnelles · voir *obsession* ».
- Toujours signalée sur la fiche qui en contient, **repliée par défaut** sous un intitulé
  qui nomme les traditions (« Lectures traditionnelles · juive, chrétienne ») ; un clic la
  déplie. Option « Déplier les lectures traditionnelles » dans les paramètres, mémorisée
  sur l'appareil.
- Toujours sous un titre propre, avec l'auteur cité, visuellement distincte de l'étymon.
- **La voix d'une lecture se déduit de l'œuvre citée** : son auteur, ou, sans auteur, l'œuvre
  elle-même (l'Écriture, qui signe seule : « Vulgate, Apocalypse 12, 9 »). `auteur` ne s'écrit
  que pour une parole rapportée par l'œuvre d'un autre (Resh Lakish dans le Talmud, Varron chez
  Augustin). Une œuvre sans auteur porte ses `traditions` ; une traduction de l'Écriture
  (Vulgate, Septante) est une œuvre sans auteur, distincte du texte original.
- Chaque lecture cite le texte original (`citation`) d'une seule voix, avec le passage et
  l'adresse d'un texte en ligne libre. `npm run verifier:en-ligne`
  y cherche la citation mot pour mot : une citation introuvable est une erreur.
- Les lectures se rédigent **dans une passe à part, le texte source sous les yeux**, jamais
  de mémoire ni dans les lots de rédaction. Elles partent d'un **corpus consulté par réflexe**
  (`npm run corpus` : Isidore, Jérôme, Rashi, Augustin, Thomas d'Aquin ; `docs/methode.md` §7 bis), qui est un plancher,
  jamais une limite : tout autre auteur traditionnel qui a lu le mot se cherche aussi.
- Jamais une interprétation libre : uniquement des sources précises.

## 5. Sources autorisées

| Usage | Source | Statut |
|---|---|---|
| Base textuelle | **Littré** (1864-1873, supplément 1878) | Domaine public. Vérifier la licence de la version numérique utilisée (ex. XMLittré). Étymologies parfois dépassées : à recouper. |
| Sens des étymons latins | **Gaffiot** (1934) | Domaine public. Autorisé ; son édition en ligne (gaffiot.fr) ne se consulte pas par script. |
| Sens des étymons latins, interrogeable | **Lewis & Short** (1879, sur Perseus) ou **Georges** (1913) | Domaine public. Consultés en ligne, un mot à la fois, quand le Littré et le TLFi ne glosent pas l'étymon. Fiche d'ouvrage à créer (BnF) avant la première citation. |
| Sens des mots hébreux (mots sacrés, §3.3 bis) | **Gesenius** et **Brown-Driver-Briggs** (1906) | Domaine public. Le lexique de la langue sacrée, quand le texte d'origine n'explique pas le mot. Fiche d'ouvrage à créer (BnF) avant la première citation. |
| Sens des étymons grecs | **Bailly** (1895) | Domaine public |
| Source de faits | **TLFi / CNRTL** | Non libre. On en tire des faits : l'usage d'aujourd'hui (plan des sens), les étapes datées du sens, l'étymologie admise. Jamais sa rédaction recopiée : un fait n'est pas protégé, une rédaction l'est. Pour un mot absent du Littré (postérieur à 1872), le TLFi, notre source la plus récente, suffit à vérifier l'étymon (avec le Bailly ou le Gaffiot pour les éléments). |
| Lecture traditionnelle | Isidore de Séville (*Étymologies*), Varron, Platon (*Cratyle*), Pères, saint Thomas, Guénon (domaine public en France depuis 2022 ; attention aux éditions annotées) | Domaine public |
| Auteurs et ouvrages (noms, dates, éditions) | **data.bnf.fr** (catalogue de la BnF) | Licence ouverte. Notice d'autorité (de personne, ou d'œuvre), citée comme source de la fiche d'auteur ou d'ouvrage (`{ ouvrage: bnf, entree: cb… }`). Un ouvrage sans notice d'œuvre (Gaffiot, Bailly) reste sans cette source. Relevé par l'API SRU du catalogue (catalogue.bnf.fr/api/SRU). |
| Éditions numériques | **Gaffiot 2016** (gaffiot.fr) et **Bailly 2020** (bailly.app), révisions de Gérard Gréco | CC BY-NC-ND 4.0 et droit des bases de données. **Consultation en ligne uniquement**, un mot à la fois : jamais téléchargées, extraites ni recopiées. Formuler le `sens` soi-même plutôt que reprendre leur glose mot pour mot. Seul le Littré (XMLittré, CC BY-SA) peut être utilisé en local. |
| Rédaction (champ `redaction`, pas une source) | **IA** (`par: IA`, `detail` = modèle) ou **Étymon** (`par: Étymon`, contribution de Thibault ou d'un lecteur via Critique) | Dit qui a rédigé, par transparence. Ne remplace jamais un ouvrage consulté pour la lecture profane. |
| **Interdit comme source** | Wiktionnaire | Qualité inégale. Éventuellement une piste pour trouver un doublet, jamais cité. |
| **Interdit** | Robert historique, Bloch & Wartburg, FEW | Non libres. Pas de recopie. |

## 6. Modèle de données

Le contrat de données complet, **généré à partir du schéma**, est dans
`docs/contrat-fiche.md` (lisible) et `docs/fiche.schema.json` (utilisé par VS Code, extension
YAML, pour l'autocomplétion et la vérification pendant la saisie). Après toute modification
de `src/lib/schema.ts` : `npm run contrat` (un test échoue sinon).

### 6.1 Fiche : un fichier YAML par mot (`data/fiches/<initiale>/<préfixe>/<id>.yaml`)

Chaque fiche est un fichier YAML. Le nom du fichier est l'`id` (slug ASCII sans accent,
unique ; suffixe `-2`, `-3`… pour les homonymes). Pour éviter les gros dossiers plats, la
fiche est rangée selon la première lettre puis les deux premières lettres de son `id` :
`data/fiches/e/et/etonner.yaml`, `data/fiches/c/ch/chiffre.yaml`.

Quatre principes gouvernent le modèle :
- **le fond, pas la forme** : les textes sont bruts, sans aucune mise en forme. L'app met
  elle-même en italique les formes de la chaîne et des étymologies écartées, et pose les
  liens vers les autres fiches ;
- **pas de doublon** : rien de ce qui se déduit n'est écrit (étymon reconstruit = il
  commence par `*` ; adresse d'une entrée = déduite de l'ouvrage et de l'entrée, Bailly
  compris ; un doublet se déclare sur une seule des deux fiches ; un champ facultatif à sa
  valeur par défaut ne s'écrit pas) ;
- **chaque champ a un seul sens, un seul rédacteur et une vérification** : l'IA n'écrit que
  le contenu (`docs/consignes/redaction.md`) ; les scripts écrivent le statut, la rédaction et
  les sources ; ce que rien ne vérifie, l'IA ne l'écrit pas ;
- **neutre ou texte, jamais les deux** : un champ est soit neutre (identifiant, forme d'origine,
  langue, date, référence : le même dans toute langue de l'application), soit du texte en français
  (sens, explication, texte d'une lecture, description, raison). C'est ce qui permettra un jour un
  calque de textes par langue sur le même noyau (§4.2).

Les champs, leur type et leurs règles sont décrits dans `docs/contrat-fiche.md` (généré, à
jour par construction). Exemples complets : `data/fiches/r/re/religion.yaml` (origine
débattue, lectures traditionnelles), `data/fiches/s/sc/schizophrenie.yaml` (composition, mot
forgé), `data/fiches/c/ch/chiffre.yaml` (filiation, doublet). Points à retenir :

| Champ | Écrit par | Vérifié par |
|---|---|---|
| `mot`, `etymologie`, `explication`, `ecartees`, `incertain`, `doublets`, `famille`, `renvois`, `tradition.renvois`, `themes` | IA (`npm run rediger`) | validateur ; Littré (`npm run verifier`) ; à la main (Gaffiot, Bailly, TLFi) ; Thibault |
| `nature` | script, tirée du Littré ; IA pour un mot absent du Littré | contrôle contre le Littré |
| `sources` | `npm run rediger -- --dossier` (entrées consultées du dossier), ou à la main | validateur (adresse déduite), `npm run verifier:en-ligne` (Bailly) |
| `redaction`, `statut` | `npm run rediger -- --dossier` (`brouillon`) ; `validee` : Thibault seul | validateur |
| `tradition.lectures` | passe à part, texte source sous les yeux (§4.7) | `npm run verifier:en-ligne` (citation mot pour mot) |
| `historique` | Thibault ou l'agent qui corrige | validateur |

- `redaction` : qui a rédigé la fiche, `{ par: IA | Étymon, detail, reflexion? }` (le modèle
  d'IA et son niveau de réflexion : « Claude Opus 5.5, réflexion élevée »), affichée une fois en
  pied de fiche. Une contribution de Thibault ou d'un lecteur s'y ajoute (`par: Étymon`),
  avec une note d'`historique` « corrigée le … ». La simple validation n'y figure pas.
- `statut` : `a-verifier` (ancienne fiche rédigée de mémoire, s'il en reste ; mention
  « Étymologie non vérifiée » ; aucune fiche nouvelle n'y entre) |
  `brouillon` (rédigée d'après son dossier, « En relecture ») | `validee` (par Thibault). Le mot du jour
  est tiré parmi les fiches `validee` dès qu'il en existe une.
- **Auteurs** (`data/auteurs/<id>.yaml`) et **ouvrages** (`data/ouvrages/<id>.yaml`) ont leur
  fiche et leur page, avec le même socle éditorial. Un auteur : `nom` usuel, `nomComplet`,
  dates (exactes ou approximatives), `description` qui le situe (200 caractères), `traditions`
  (celles dans lesquelles il parle ; il signe alors des lectures), `cite`. Un ouvrage : `titre`, `abrege`, `titreOriginal`, `auteur`,
  `date`, `edition` réellement consultée, `licence`, `texte` ou `modeleEntree`, `description`.
  Ce qui se calcule (œuvres, mots forgés, hypothèses défendues, lectures, mots issus d'un nom
  ou d'un titre) n'est jamais écrit : l'assemblage le produit. Un ouvrage n'est citable que
  s'il a sa fiche ; on ne crée la fiche que d'un auteur ou d'un ouvrage réellement cité.
  Source des faits (noms, dates, éditions) : **data.bnf.fr**.
- **Liens vers les auteurs et ouvrages dans les textes** : aucun balisage. L'app reconnaît,
  dans l'explication, les étymologies écartées et les lectures, les noms des auteurs et les
  titres des ouvrages **que la fiche cite déjà** (tenants, créateurs, noms et titres de la
  chaîne, écartées, lectures ; jamais les dictionnaires des sources), écrits tels quels,
  la forme la plus longue d'abord, à la première occurrence. Formes reconnues : le nom usuel
  et `cite` pour un auteur (l'élément d'entrée de sa notice BnF, retenue ou variante :
  Bleuler, Comte, More) ; le titre, l'abrégé et le titre d'origine pour un ouvrage. Une forme
  qui, dans une fiche, désignerait deux pages est refusée ; `npm run verifier` signale un
  auteur nommé dans un texte sans que la fiche le cite.
- Piège YAML : une valeur commençant par `*` est un alias YAML, et `: ` dans une valeur
  casse la lecture. Ces valeurs sont toujours entre guillemets (`"*extonare"`) ;
  `npm run rediger` s'en charge.

Au build, `scripts/assembler-fiches.ts` produit à partir de toutes les fiches (l'app signale
celles qui ne sont pas validées) :
- `src/generes/index.json` : `{ id, mot, statut, sacre }` de chaque fiche (`sacre` seulement
  pour un mot sacré), pour la recherche, le mot
  du jour et le mot au hasard ;
- `src/generes/fiches/<préfixe>.json` : les fiches complètes par préfixe de deux lettres,
  doublets rendus symétriques, chargées à la demande et mises en cache pour le hors ligne.

Ces fichiers générés ne sont pas versionnés. L'IA ne les modifie jamais : elle modifie
les fiches YAML.

### 6.2 Validation du format (`scripts/valider-fiches.ts`)

La validation est un point central du projet. Elle se fait avec **Zod** (schéma typé,
qui fournit aussi les types TypeScript de `src/lib/types.ts`), après lecture du fichier
avec la bibliothèque `yaml`. Elle est exécutée :
- à la demande : `npm run valider` ;
- avant chaque build (le build échoue si une fiche est invalide) ;
- en pre-commit (`simple-git-hooks`) ;
- en CI (GitHub Actions) sur chaque push.

Chaque erreur indique le fichier, le champ et la règle enfreinte. Les règles sont écrites
dans `scripts/lib/validation.ts` (fonctions pures, testées une à une) ; le schéma de
référence est `src/lib/schema.ts`, et sa description complète `docs/contrat-fiche.md`.

Règles au-delà de la structure :
- `id` (nom de fichier) unique, en ASCII minuscule sans accent, cohérent avec `mot`, rangé à
  son emplacement (`e/et/etonner.yaml`) ;
- `renvois` et `tradition.renvois` : fiche existante ou candidat à faire ; `tradition.renvois`
  est à sens unique ;
- `doublets` et `renvois` : relation déclarée d'un seul côté ; un doublet vise une fiche
  existante ; un renvoi
  n'est ni un doublet ni un mot de la famille ;
- pas d'`url` qui se déduit de l'entrée ;
- toute référence (auteur, ouvrage, doublet, renvoi) vise une fiche existante ;
- `etymologie` : un maillon a une forme, des éléments, ou des alternatives (au moins deux) ;
  le maillon du sens premier porte un sens ; translittération seulement pour une écriture ni latine ni grecque,
  et alors obligatoire ; des tenants (`selon`) seulement pour une origine débattue ;
- lecture traditionnelle : une seule voix, `auteur` écrit seulement s'il ne se déduit pas de
  l'œuvre, tradition précisée seulement si un auteur en a plusieurs, `hypothese` parmi les
  formes d'origine ; `traditions` sur une œuvre seulement si elle n'a pas d'auteur ;
- mot sacré : pas d'explication, pas de sens de chaîne (sauf celui de la langue sacrée faute de
  lecture `premier`), lecture `premier` reçue par toutes ses traditions, ou une par tradition
  quand elles divergent sur le sens du texte d'origine (§3.3 bis ; le validateur suivra) ;
- `explication` : 1 à 3 phrases, 300 caractères maximum (éviter les abréviations suivies
  d'un point, comptées comme fins de phrase) ;
- typographie française : guillemets « » (jamais " "), espace insécable avant `:` `;` `?` `!` ;
  les sens sans guillemets (l'app les ajoute) ;
- un mot qui a une fiche ne figure plus dans les candidats (§6.4).

### 6.3 Comptes (`data/comptes.json`)

```json
{ "date": "2026-10-01", "type": "cout", "categorie": "domaine", "libelle": "Nom de domaine", "montant": 12.00, "justificatif": null }
```

`type` : `"don"` | `"cout"` | `"remuneration"` | `"impot"`. Les dons sont regroupés par mois.
Ce fichier est validé par le même script (schéma Zod, dates ISO, montants positifs).

### 6.4 Candidats (`data/candidats/<initiale>.yaml`)

Mots envisagés qui n'ont pas encore de fiche, une liste par initiale sans accent :

```yaml
- { mot: ennui, statut: a-faire }
- { mot: essorer, statut: sans-source, raison: Aucune source fiable accessible. }
- { mot: express, statut: ecarte, raison: Emprunt plat, hors critère §3.3. }
```

- `statut` : `a-faire` | `sans-source` (aucune source fiable accessible) | `ecarte` (hors
  critère §3.3). `raison` est obligatoire pour les deux derniers : on garde la trace des
  mots écartés et pourquoi.
- Quand une fiche est créée, le mot est **retiré** des candidats (le validateur le vérifie).

### 6.5 Travail par lots et suivi (`npm run etat`)

La base est rédigée par lots d'une dizaine de mots, un commit par lot (`data: 10 fiches brouillon (c, e)`).
Pour ne jamais parcourir toute la base, l'agent interroge `npm run etat` :
- `npm run etat` : résumé (fiches par statut, candidats par statut, conformité) ;
- `npm run etat -- candidats 15` : les 15 prochains mots à traiter ;
- `npm run brouillons` : mots en brouillon à relire, avec leur chemin et leur incertitude.

L'app (en développement comme en production) affiche toutes les fiches, avec leur
mention de statut.

**Chaîne de rédaction** (`docs/methode.md` : un rédacteur seul pour le lot, un relecteur neuf,
agents `.claude/agents/etymon-*.md` ; le Littré local se télécharge une fois : `npm run littre`,
dans `sources/`, hors du dépôt). On rédige d'après les sources, jamais de mémoire :
1. **Dossier** : `npm run dossier -- <mot>` crée `atelier/<id>/dossier.json` (hors du dépôt)
   avec le Littré et affiche le plan des sens et l'étymologie du TLFi ; l'agent y écrit l'usage
   d'aujourd'hui et les faits, chacun avec sa source et son entrée (Bailly :
   `npm run texte -- bailly:φρήν` ; latin : Lewis & Short ou Georges, Gaffiot dans le navigateur).
2. **Rédaction** d'après le dossier (`docs/consignes/redaction.md`), contrôlée par
   `npm run rediger -- atelier/<id>/fiche.json --essai`.
3. **Relecture critique** par un autre agent (`docs/consignes/relecture.md`).
4. **Auteurs et ouvrages** d'après leur notice BnF (`npm run bnf`), puis
   `npm run rediger -- <fiche.json>… --dossier --modele "<modèle>" --reflexion "<niveau>"` :
   fiches en `brouillon`,
   sources tirées du dossier, mots retirés des candidats, mot écarté par Thibault refusé.
5. **Lectures traditionnelles** (`docs/consignes/lectures.md`), puis
   `npm run verifier:en-ligne -- <mot>` (citations mot pour mot).
6. `npm run verifier` (contrôles : nature, famille, formes d'origine, auteurs nommés ; un
   contrôle signale, il ne bloque pas), `npm run valider`, un commit par lot. Thibault valide
   ensuite les brouillons.

`npm run rediger` n'écrit une fiche que d'après son dossier (`--dossier`). Aucun script ne fait
passer une fiche en `brouillon` par concordance avec le Littré : `npm run verifier` contrôle et
signale, il ne change ni le statut ni les sources. Ces contrôles ne voient que l'étymon, pas le
`sens` ni l'explication : la relecture reste nécessaire, et les étymologies du Littré sont
parfois dépassées (§5).

## 7. Stack technique

- **Svelte 5** (runes : `$state`, `$derived`, `$props`) + **TypeScript** + **Vite**.
- **PWA** via `vite-plugin-pwa` : installable, hors ligne complet, index et lots de fiches (générés) mis en cache.
- Données : `yaml` (lecture des fiches), **Zod** (validation et types).
- Recherche : normalisation maison ; **MiniSearch** uniquement si la tolérance aux fautes
  est demandée et que le coût reste faible.
- **Aucun backend, aucune base de données, aucun appel réseau** dans l'app.
- Pas de React, pas d'Angular, pas de framework CSS lourd (Tailwind, Bootstrap). CSS
  maison, sobre, typographie serif pour les fiches, thème clair/sombre suivant le système.
- Hébergement statique sur GitHub Pages, publication déclenchée à la main (la CI valide
  chaque push sans publier).
- **Langue de l'application** (`src/i18n/`) : le seul endroit où elle se choisit
  (`src/i18n/index.ts`). Chaque langue fournit trois parts : les **messages** de l'interface
  (catalogue typé, avec les accords : « Lecture traditionnelle » / « Lectures traditionnelles ») ;
  une **grammaire** (pattern Strategy : « du latin », élisions, guillemets, deux-points,
  énumérations, dates) ; des **libellés** pour les valeurs des listes fermées, dont les identifiants
  ne changent pas. La phrase de la chaîne est composée par une fonction pure (`src/lib/phrase.ts`,
  pattern Builder), qui produit des segments que `Etymologie.svelte` affiche sans rien composer.
  `index.html` et le manifeste prennent aussi leurs textes dans `src/i18n/`. Seul le français
  existe ; une autre langue fournirait un module de même forme que `fr.ts`, vérifiée par TypeScript.
- Prévu plus tard : migration vers **Astro** (une page statique par mot pour le
  référencement) en réutilisant les composants Svelte tels quels, et **Capacitor** pour
  les stores. Garder les composants indépendants du routage pour faciliter ce passage.

## 8. Structure du projet

```
etymon/
  AGENTS.md
  README.md
  .claude/agents/        # agents de la rédaction : etymon-redacteur, etymon-relecteur (modèle, réflexion)
  docs/                  # méthode et son journal ; evolutions/ ; générés par npm run contrat : contrat, schémas JSON, consignes/
  atelier/               # dossiers et fiches en cours de rédaction, hors du dépôt
  LICENSE                # MIT (code)
  package.json
  vite.config.ts
  data/                  # CC BY-SA 4.0 (voir data/LICENSE.md)
    fiches/              # une fiche YAML par mot, rangée par initiale puis préfixe
      e/
        en/ennui.yaml
        et/etonner.yaml
      c/
        ch/chiffre.yaml
    candidats/           # mots à traiter, une liste par initiale
      e.yaml
    langues.json         # liste fermée des langues sources
    auteurs/             # une fiche par auteur (cicéron, lactance, eugen-bleuler…)
    ouvrages/            # une fiche par ouvrage (littre, gaffiot, bailly, tlfi, œuvres citées)
    themes.json          # liste des thèmes
    traditions.json      # liste fermée des traditions (juive, chrétienne…)
    comptes.json
    LICENSE.md
  scripts/
    lib/validation.ts    # règles de validation (fonctions pures)
    valider-fiches.ts    # npm run valider : lecture de data/ et rapport d'erreurs
    assembler-fiches.ts  # toutes les fiches, auteurs et ouvrages -> src/generes/ (au build)
    etat.ts              # npm run etat : avancement, candidats, brouillons
    rediger-lot.ts       # npm run rediger : fiches rédigées par l'IA d'après leur dossier -> brouillon
    dossier.ts           # npm run dossier -- <mot> : dossier de faits (Littré, TLFi) dans atelier/
    bnf.ts               # npm run bnf : notices BnF, fiches d'auteurs et d'ouvrages
    texte.ts             # npm run texte -- <adresse> : texte brut d'une page (citations, Bailly)
    liste.ts             # npm run liste -- <liste> "<valeur>" : ajoute une langue, une tradition, un thème
    corpus.ts            # npm run corpus : corpus de réflexe des lectures (sources/corpus/), recherche d'un étymon
    lib/corpus.ts        # les œuvres du corpus de réflexe, recherche des passages
    verifier-en-ligne.ts # npm run verifier:en-ligne : entrées du Bailly, citations des lectures
    lib/redaction.ts     # préparation d'une fiche rédigée (typographie, valeurs par défaut)
    lib/controles.ts     # contrôles contre le Littré (nature, famille, formes, auteurs nommés)
    lib/en-ligne.ts      # texte d'une page, recherche d'une citation
    lib/atelier.ts       # formats du dossier, du verdict et des sorties des agents
    lib/tlfi.ts          # étymologie du TLFi, par l'API du portail du CNRTL (consultation)
    lib/bnf.ts           # notices d'autorité BnF (API SRU)
    contrat.ts           # npm run contrat : docs/contrat-fiche.md, *.schema.json, consignes/, schémas du workflow
    littre.ts            # npm run littre : télécharge et indexe le Littré local (sources/)
    preparer-fiche.ts    # npm run preparer -- <mot> : étymologie du Littré et son lien
    verifier-fiches.ts   # npm run verifier : contrôles des fiches contre le Littré (signalent)
    lib/littre.ts        # extraction XMLittré, concordance étymon / Littré
    __tests__/           # tests + dépôts de test conformes et fautifs (fixtures/)
  src/
    App.svelte
    main.ts
    generes/             # généré, jamais édité à la main, ignoré par git
      index.json         # { id, mot, statut, sacre } de toutes les fiches
      fiches/et.json     # fiches complètes, par préfixe
      auteurs.json       # auteurs, avec ce qui se calcule (œuvres, mots forgés, lectures…)
      ouvrages.json      # ouvrages, avec ce qui se calcule
    i18n/                # langue de l'application : le seul endroit où elle se choisit
      index.ts           # la langue choisie : messages, grammaire, libellés
      types.ts           # ce qu'une langue doit fournir
      fr.ts              # le français
    lib/
      schema.ts          # schéma Zod : fiche, auteur, ouvrage, candidat, comptes
      types.ts           # types dérivés du schéma
      decoupage.ts       # préfixe de rangement d'une fiche
      fiches.ts          # index embarqué, lots de fiches chargés à la demande
      phrase.ts          # la chaîne mise en phrase (segments), dans la langue de l'application
      etymologie.ts      # sens premier, translittération, formes en italique
      liens.ts           # adresses des pages : mot, auteur, ouvrage
      ouvrages.ts        # ouvrages et adresses de leurs entrées, déduites de l'entrée
      grec.ts            # translittération du grec (adresses du Bailly)
      traditions.ts      # tradition d'une lecture, lectures regroupées par tradition
      texte.ts           # découpage d'un texte : italique, liens vers les fiches, mentions
      mentions.ts        # auteurs et ouvrages cités par une fiche, formes reconnues
      sources.ts         # rédacteurs (IA, Étymon)
      recherche.ts       # normalisation, index
      motDuJour.ts
      stockage.ts        # favoris, paramètres (localStorage, try/catch)
    composants/
      Recherche.svelte, MotDuJour.svelte, Parametres.svelte
      Fiche.svelte, SensPremier.svelte, Etymologie.svelte, Forme.svelte
      TexteRiche.svelte, LectureTraditionnelle.svelte, ListeMots.svelte
      Sources.svelte, Source.svelte, Statut.svelte, Redaction.svelte
      PageAuteur.svelte, PageOuvrage.svelte
    styles/
      global.css
  public/
    icônes (SVG, PNG 192/512, maskable, apple-touch)
  .github/workflows/
    validation.yml       # valider, types, tests, build à chaque push ; publication à la main
```

## 9. Conventions

- Code, commentaires, commits, noms de fichiers et de variables en **français**
  (sauf mots-clés et API).
- Un composant = un fichier, styles isolés dans le composant.
- Pas de code mort, pas d'abstraction anticipée.
- Aucun texte affiché en dur dans un composant : il passe par `src/i18n/` (un message, une règle
  de grammaire, un libellé). Une phrase composée de morceaux se compose dans une fonction pure de
  `src/lib`, jamais dans le gabarit d'un composant.
- Ne jamais parcourir toute la base de fiches : utiliser `npm run etat` et ouvrir
  seulement les fiches concernées (`data/fiches/<initiale>/<préfixe>/<id>.yaml`).
- Commits petits et explicites (`feat: recherche par mot`, `data: 10 fiches brouillon`).
- Tests (Vitest) : le script de validation lui-même (fiches valides et invalides de test
  dans `scripts/__tests__/`), plus des tests unitaires sur `recherche.ts` et `motDuJour.ts`.
- Optimise l'usage des tokens : utilise **rtk** (rust token killer) pour les actions qui
  le nécessitent.

## 10. Ce que tu ne fais jamais

- Citer une source qui n'a pas réellement été consultée, ou rédiger une fiche de mémoire.
- Citer le Wiktionnaire comme source, ou recopier du texte du TLFi, du Robert ou de
  Bloch & Wartburg.
- Marquer une fiche `validee` : seul Thibault le fait.
- Ajouter une fonctionnalité, une dépendance ou un service externe non listés ici sans
  demander.
- Ajouter un backend, un appel réseau ou un appel à une IA dans l'app.
- Mélanger étymologie historique et lecture traditionnelle dans un même champ.

## 11. Travail en cours

La v1 (§4.1) est construite ; le modèle de données a été éprouvé sur des cas fondamentaux
(`docs/modele-v3.md`, `docs/cas-epreuve-traditions.md`, `docs/cas-epreuve-sacre.md`).
La rédaction autonome suit **`docs/methode.md`** : sources d'abord, tri, relecture critique,
affinage entre deux lots ; ses ajustements sont notés dans `docs/journal-methode.md`, les
décisions prises à la place de Thibault dans `docs/decisions.md`. Deux pilotes et un troisième
lot (*hospes*, *amicus*, *potio*) faits selon la méthode refondue (un rédacteur seul pour le lot,
un relecteur neuf) ; relecture critique du projet faite le 2026-10-04. Prochaine étape :
reprendre par la méthode actuelle les fiches antérieures à elle (*algèbre*, *algorithme*,
*conscience*, *religion*, *personne*, *schizophrénie*, *merci*… et les mots sacrés), puis
continuer par lots.
À chaque étape, dis brièvement ce que tu as fait et ce qui reste à décider.
