# Journal des décisions

Quand un point attendrait Thibault, l'agent ne s'arrête pas : il décide, applique, et note ici la
décision et sa raison. Thibault relit ce journal et confirme ou infirme ; une décision infirmée
se défait, et la correction se note sur sa ligne. Le plus récent en haut.

Restent à Thibault seul, sans décision provisoire : passer une fiche en `validee`, écarter un mot,
changer un principe d'AGENTS.md (l'agent y décide pour le lot en cours, sans toucher AGENTS.md).

Relecture : `à relire` (par défaut), `confirmée`, `infirmée : <ce qui a été fait>`.

## 2026-10-09 — Export pour un autre projet, et couleur des langues

- **Export stable et versionné** (`npm run export` → `export/etymon.json`) : les fiches (statut
  compris), les ouvrages et les listes fermées, triés par identifiant, sous une `version` de
  format (`docs/export.md`). Raison : le jeu Sphynx réutilise Étymon comme dictionnaire hors
  ligne (décision de Thibault) ; un artefact publié et épinglé vaut mieux qu'un appel réseau,
  interdit dans l'app. Le consommateur choisit ce qu'il publie ; l'export n'entre pas dans l'app.
  — à relire
- **Teinte des langues** : la forme d'un maillon se teinte selon sa langue source — le latin (et
  ses variantes) en pourpre impérial, le grec ancien en vert-de-gris ; le français et les autres
  langues restent sans teinte. Variables `--latin` / `--grec` (clair et sombre), axe distinct de
  `--accent` (sens premier) et de `--tradition` (lectures). La langue est portée par le segment de
  la phrase (`src/lib/phrase.ts`) et la couleur posée par `Forme.svelte`. Raison : Thibault veut
  distinguer d'un coup d'œil la part grecque et latine du dictionnaire. — à relire

## 2026-10-07 — Mot du jour et statut

- Le mot du jour est tiré parmi toutes les fiches non sacrées, sans filtrer sur le statut (avant :
  parmi les `validee` dès qu'il en existe une). Raison : demandé par Thibault. Le statut reste
  affiché sur la fiche tirée (« En relecture »), donc la fiabilité n'est pas masquée. AGENTS.md §6.1
  mis à jour. — à relire
- Le statut `brouillon` / `a-verifier` / `validee` est conservé, avec ses mentions. Thibault a
  envisagé de le supprimer ; après examen de son rôle (trace de la relecture, marqueur de
  fiabilité), il a choisi de le garder. — à relire

## 2026-10-05 — Workflow GitHub

- La CI valide chaque push sur toute branche (avant : `main` seulement, si bien qu'aucune branche
  de travail n'était validée) ; une pull request venue d'un fork l'est aussi. Un nouveau push annule
  la validation en cours de la même branche. — à relire
- La publication devient un workflow à part, manuel, depuis `main`, qui rappelle la validation
  avant de déployer. — à relire
- Dependabot (service de GitHub même) : mises à jour mensuelles, une pull request groupée pour npm,
  une pour les actions. Raison : garder les dépendances à jour sans bruit. — à relire
- Modèle de pull request : ce qui change, fiches en brouillon, décisions à relire, vérifications.
  À régler par Thibault dans GitHub (hors du dépôt) : protéger `main` (pull request et CI verte
  obligatoires). — à relire

## 2026-10-04 — Mots sacrés repris à part (manne, sabbat, alléluia, Pâque, Pâques)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| *manne*, degré 3 | deux lectures `premier` : chrétienne, la Vulgate (Exode 16, 15, « qu'est-ce que c'est ? ») ; juive, Rashi (même verset, « c'est une préparation de nourriture ») ; la lecture du texte hébreu seul retirée | le texte hébreu est reçu par les deux traditions : signé seul, il ne peut porter qu'un sens, or elles le lisent autrement ; Rashi cite déjà le verset | à relire |
| Septante (*manne*) | non citée : la Vulgate signe seule la lecture chrétienne | pas de fiche d'ouvrage pour la Septante ; une voix suffit | à relire |
| Rashi, *Commentaire sur la Torah* | auteur `rashi` (BnF cb11923509g) et ouvrage `commentaire-sur-la-torah` (BnF cb11985540b) créés, en `brouillon` | Rashi signe désormais des lectures (*manne*, *Pâque*) | à relire |
| Rashi sur Genèse 2, 2 (*sabbat*) | lecture retirée, notée au corpus comme écartée ; `sacre: [ juive ]` gardé | Rashi dit ce que le septième jour apporte au monde (le repos qui achève l'œuvre), non ce que dit le nom (AGENTS.md §4.7 : la tradition lit le mot) ; `sacre` dit où le mot est sacré, non qui l'a lu (relecture) | à relire |
| *sabbat* : verset du texte d'origine | Genèse 2, 3, sens « il cessa » (et non « cesser ») | 2, 2 lie déjà le jour au verbe (« il cessa, le septième jour ») ; 2, 3 donne la forme nue שבת, aux consonnes du nom, comme raison de la bénédiction du jour ; le sens est la forme du texte, comme « il passa par-dessus » pour *Pâque* | à relire |
| *alléluia* | « louez Yah » gardé, confirmé par le Brown-Driver-Briggs (הָלַל², piel « louer », impératif הַלְלוּ ; יָהּ, forme contractée du Nom), cité en source avec le Littré et le TLFi ; ouvrage `brown-driver-briggs` écrit à la main, `a-verifier` | au degré 2, le sens vient d'un lexique de la langue sacrée (relecture) ; la BnF n'a pas de notice d'œuvre pour le BDB : même cas que `lewis-short` | à relire |
| Lecture du Talmud sur *alléluia* (Pesahim 117a) | signée du Talmud seul, sans `auteur` | Rabbi Yehoshua ben Levi, qui la prononce, n'a pas de notice à la BnF : pas de fiche d'auteur écrite à la main | à relire |
| Rabban Gamliel | « de Yavné » retiré (nom complet et description) ; la description dit les deux maîtres de ce nom et l'attribution discutée ; fiche toujours `a-verifier`, sans source | aucune notice BnF (ni Gamaliel l'Ancien ni Gamaliel II) ; la Michna dit seulement « Rabban Gamliel » | à relire |
| Lecture de la Michna (*Pâque*) | citation étendue à l'obligation (« qui n'a pas dit ces trois choses… ») ; le texte ne dit plus que la citation | la lecture redisait le texte d'origine, et ajoutait une phrase absente de la citation | à relire |
| Citations étendues | *Pâque* et *Pâques* : Exode 12, 27 jusqu'à « quand il frappa l'Égypte » ; Isidore (*Pâques*) jusqu'à Jean 13, 1 | le texte de la lecture disait ces deux faits sans que la citation les porte | à relire |

## 2026-10-04 — Décisions déléguées après la relecture critique

Thibault a délégué ces décisions à l'agent, y compris la modification d'AGENTS.md.

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Voie « de mémoire » (AGENTS.md §2.1, §2.6, §6.1, §6.5, §10) | supprimée : une fiche ne s'écrit que d'après son dossier ; plus de passage en `brouillon` par concordance avec le Littré ; `a-verifier` ne reste que pour d'anciennes fiches | la concordance ne voit que l'étymon, pas le sens ni l'explication ; la méthode rédige déjà d'après les sources | à relire |
| Sources (§5, README) | le TLFi devient source de faits (usage, étapes datées, étymologie admise), jamais de rédaction recopiée ; pour le latin, Lewis & Short (Perseus) ou Georges (1913), le Gaffiot restant autorisé mais non consulté par script ; pour l'hébreu, Gesenius et Brown-Driver-Briggs ; README corrigé | c'est la pratique des lots ; gaffiot.fr ne se consulte pas par script ; le README promettait une relecture que l'affichage des fiches non validées contredit | à relire |
| Mots sacrés, degré 3 (§3.3 bis, cas-epreuve-sacre.md) | quand les traditions divergent sur le sens même du texte d'origine, un sens par tradition, chacun signé de sa lecture `premier` ; *manne* en est le cas (Septante et Vulgate : « qu'est-ce que c'est ? » ; Rashi : « c'est une préparation de nourriture ») ; le code suivra | Rashi sur Exode 16, 15 (corpus de réflexe) ; la phrase « pas sur le texte d'origine » était fausse pour *manne* | à relire |
| Composés (§3.2, §3.4) | du tout vers les parties quand la forme composée existe ; sinon le sens littéral des éléments, affiché comme tel (« littéralement »), jamais comme une forme attestée | les deux paragraphes se contredisaient sur *schizophrénie* | à relire |
| Nom divin (§3.3 bis) | « le Seigneur » admis dans le texte d'une lecture, comme substitut traditionnel de יהוה ; citations telles quelles ; « Dieu », « Jéhovah », « Yahvé » refusés pour le Nom | usage juif et chrétien de ne pas prononcer le Nom ; ce n'est pas une traduction | à relire |
| Exemples d'AGENTS.md (§1, §3.4) | *étonner* et *ennui* alignés sur leurs fiches ; exemple de *religion* : « *religio* nommait d'abord le scrupule qui retient d'agir » | l'ancienne phrase était contredite par le TLFi (*religio* : scrupule, mais aussi culte, croyance) | à relire |
| Travail en cours (§11) | mis à jour : prochaine étape, reprendre par la méthode actuelle les fiches antérieures à elle, puis continuer par lots | l'ancien texte datait du premier pilote | à relire |
| Petites incohérences | « quatre principes » (§6.1) ; lot d'une dizaine de mots (§6.5, comme la méthode) ; l'agent décide et note au lieu de poser une question, sauf ce qui est réservé à Thibault ; `sacre` dans l'index | constat de la relecture critique | à relire |
| Relecture (consignes) | le relecteur confronte le dossier à l'étymologie brute (`npm run dossier -- --consulter <mot>`) ; une infidélité du dossier est une remarque « dossier » ; le texte d'une lecture ne dit rien de plus que sa citation | le relecteur ne lisait que le dossier : une erreur du dossier passait dans la fiche sans être vue | à relire |
| La Quête | facultative, désactivée par défaut, activée dans les paramètres ; « toutes les traditions relevées s'accordent » remplacé par une formule exacte ; constructions de l'agent marquées « proposition de l'agent, non une lecture traditionnelle » ; le fond reste à Thibault | quatre traditions sur sept n'ont rien de sûr au premier rang ; *tao-42* est signé de mémoire | à relire |
| Candidats | ajoutés en `a-faire` : lire, énergumène, possession, péché, amen, messie, zèle, patient, mot | mots importants absents ; *énergumène* et *possession* sont visés par la tradition (§4.7) | à relire |

## 2026-10-04 — Lot hospes, amicus, potio, captif

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Gaffiot (gaffiot.fr répond, mais ne sert que le dictionnaire entier, 21 Mo) | non consulté ; la décision du second pilote s'applique (sens latins glosés par le Littré ou le TLFi) | le télécharger serait l'extraction que AGENTS.md §5 interdit ; le scan d'archive.org est l'édition de 1935 augmentée par Blaise, non libre | à relire |
| Sens d'*amicus* (*ami*) | « ami », d'après le Littré (à *ennemi* : « amicus, ami ») ; fiche rédigée avec le drapeau `doute` | le validateur exige un sens au maillon premier, et aucune autre glose n'est accessible ; le rapprochement avec *amare* (même radical, Littré) n'est pas une dérivation | à relire |
| Doublets du lot | déclarés sur *hôtel* (→ *hôpital*), *poison* (→ *potion*) et *captif* (→ *chétif*) ; la fiche *chétif* n'est pas touchée | un doublet se déclare d'un seul côté ; *chétif* garde *captif* dans sa famille, ce que le validateur accepte | à relire |
| Mots étrangers hors chaîne (*hostis* pour *ennemi*, *amare* pour *ami*) | non cités dans l'explication, dits en français | un mot étranger cité est une forme de la chaîne ; ni l'un ni l'autre n'en est un maillon | à relire |
| Lecture d'Isidore sur *potio* (*Étymologies* XX, 3, 1) | posée sur *poison* et sur *potion* | elle lit l'étymon commun aux deux doublets, et un `tradition.renvois` ne vaut que pour un mot qui ne lit pas le même étymon | à relire |
| Explication d'*hospitalité* | proposition du relecteur adoptée, moins « et protégés » | elle dépassait de huit caractères la limite de 300 | à relire |

## 2026-09-25 — Second pilote

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Tradition de Platon (*enthousiasme*) | « grecque » gardée dans `data/traditions.json` | AGENTS.md §5 compte Platon parmi les lectures traditionnelles ; nom parallèle à « juive », « chrétienne » | à relire |
| Nature de *panique* | `nom féminin, adjectif`, contre le Littré (adjectif seul) | le nom est l'usage courant depuis le XIXe siècle (TLFi) ; la nature dit l'usage d'aujourd'hui | à relire |
| Gaffiot inaccessible aux agents | on accepte les sens latins glosés par le Littré ou le TLFi ; un maillon latin qu'aucun des deux ne glose reste sans sens | gaffiot.fr refuse les scripts ; une source n'est citée que consultée | à relire |
| Croisement (*chétif* : *captivus* × gaulois *\*cactos*) | pas de changement du modèle ; le croisement n'est pas dit | un seul cas, et le TLFi ne donne pas de sens à *\*cactos* ; on attend un deuxième cas | à relire |
| *captif* | ajouté aux candidats (`a-faire`) | doublet de *chétif* (Littré), mot important | à relire |
| « Littré nommé sans référence » (*ennui*, écartée *noxa*) | laissé | Littré est le tenant qui écarte, déjà cité en source ; même cas qu'*algorithme* | à relire |
| Ajustements de méthode relevés au journal de méthode (corpus noté au dossier, dates BnF incertaines, consignes régénérées, repli Stella) | faits à l'affinage, avant le prochain lot | méthode §6 : on ajuste entre deux lots | à relire |

## 2026-10-04 — Reprise lot A

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Ordre des hypothèses de *religio* | *religare* en premier, *relegere* ensuite | le Lewis & Short (1879) donne *religare* pour l'avis de la plupart des modernes ; Littré et le TLFi ne tranchent pas | à relire |
| Lewis & Short | ouvrage `lewis-short` à créer d'après la BnF, source des sens latins du lot | décision du 2026-09 (sources) : dictionnaire latin du domaine public consultable par script | à relire |
| Croisement (*algorithme*) | dit dans l'explication ; ἀριθμός gardé dans `ecartees` comme étymon, la raison nommant le croisement | deuxième cas après *chétif* : le modèle reste en l'état, le point est signalé | à relire |
| Fiche d'ouvrage `lewis-short` | écrite sans notice BnF, en `a-verifier`, sans auteur | la BnF n'a pas de notice d'œuvre pour ce dictionnaire, comme pour le Gaffiot et le Bailly (AGENTS.md §6.1) ; deux auteurs, dont un sans notice | à relire |

## 2026-10-04 — Reprise lot B (passe 1)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Date de *Schizophrenie* | `forge.date` : 1908, sans `ouvrage` | la bibliographie de Bleuler (*Dementia praecox*, 1911, n° 73) cite son article de 1908 « Die Prognose der Dp. (Schizophreniegruppe) » ; le TLFi date du livre de 1911 ; l'article n'a pas de fiche d'ouvrage | à relire |
| Chaîne d'*altruisme* | sans découpage : maillon français de forme *altruisme* (forgé, sur le modèle d'*égoïsme*), puis *alter* ; *autrui* dans la famille | aucune source consultée ne glose *-isme*, et le schéma veut deux éléments sourcés (relecture : un sens tiré du tout ne vaut pas pour la partie) | à relire |
| Sens de *Utopia* | « ce qui ne se rencontre en aucun lieu » (Littré) sur le maillon latin | le validateur veut un maillon porteur de sens, et un jeu d'alternatives n'en tient pas lieu | à relire |

## 2026-10-05 — Lot 4 (passe 1 : esprit, souffle, inspirer, respirer, âme, animal, génie, ingénieur, ingénu)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chemin de *génie* | `ordinaire`, non `sacre` | *genius* est un dieu de la religion romaine, qui n'est pas une tradition de data/traditions.json ; le mot n'est sacré dans aucune tradition reçue par l'app | à relire |
| Chaîne de *génie* | arrêtée à *genius*, sans `premier` (passe 2, proposition du relecteur adoptée ; d'abord *gignere* et `premier`) | le Lewis & Short rattache *genius* à la racine GEN de *gigno*, non au verbe ; *gignere* n'ajoute pas de sens ; la parenté est dans `famille` | à relire |
| Maillon français d'*ingénieur* | *engigneor*, dérivé d'*engin* (TLFi), non *ingeniatorem* (Littré) | le TLFi est plus récent ; les deux remontent à *ingenium* | à relire |
| Éléments d'*ingenuus* | *in*, « dans » (Littré), et *gignere*, « engendrer » (Lewis & Short) ; le *genuus* du Littré non retenu | le Lewis & Short dérive *ingenuus* de *ingigno* et ne donne pas *genuus* | à relire |
| *ingenium* (*ingénieur*) | non découpé | la composition est dite sur *ingénu* ; le sens « nature innée » la porte déjà, et la chaîne a trois maillons | à relire |
| Chaîne d'*esprit* | arrêtée à *spiritus* | *spirare*, « souffler », n'ajoute rien à « souffle » ; la parenté avec *inspirer* et *respirer* est dans `famille` | à relire |
| *esprit*, *âme* | chemin `consacre` | profanes en latin (souffle), reçus en français d'abord par des textes chrétiens (TLFi) ; rédigés comme les autres (§3.3 bis) | à relire |
| Racine de *souffle* | le fait reste au dossier ; l'explication ne compare pas *souffle* et *esprit* ; renvoi *souffle* → *respirer* (sans racine commune) | les sources donnent deux étymons distincts (*sufflare*, de *sub* et *flare* ; *spiritus*, de *spirare*) mais ne les comparent pas en toutes lettres | à relire |
| Sens d'*anima* | « souffle de vie » sur *animal*, « souffle, air » sur *âme* | chaque fiche suit la glose de son entrée (TLFi à *animal* ; Littré, TLFi, Lewis & Short à *âme*) | à relire |
| Corpus de réflexe des lectures | noté au dossier en passe 2, avec les lectures ; pistes d'Isidore notées dès la passe 1 | la passe 1 ne rédige pas les lectures ; le drapeau `tradition` est posé d'après les passages lus | à relire |

## 2026-10-05 — Lot 5 (passe 1 : lire, lecture, élire, élégant, intelligence, collègue, diligence, légende)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Origine de *collega* (*collègue*) | chemin `debattu`, `incertain: true` (passe 2) : *colligere*, « recueillir, rassembler » (Littré), en premier ; *legare*, « envoyer avec une mission, députer » (Lewis & Short, de *lex*), ensuite ; **ordre non établi** | une source pour chaque hypothèse, le TLFi ne tranche pas, et aucune ne dit laquelle est la plus suivie ; le Georges (zeno.org) reste injoignable (script et curl), le Gaffiot ne se lit pas par script ; faute de mieux, la source la plus ancienne d'abord (consigne du coordinateur), l'ordre revient à Thibault | à relire |
| Tenants de *collega* | `selon: [emile-littre]` pour *colligere* ; `selon: [charlton-t-lewis]` pour *legare* (fiche d'auteur créée d'après la notice BnF cb16606079r) ; Charles Short, coauteur, sans fiche | Short n'a pas de notice BnF, et une fiche d'auteur ne s'écrit jamais à la main | à relire |
| Varron et Isidore sur *collega* | lectures traditionnelles (passe 2), non tenants | Varron tire *collegae* de *legere* (« qui una lecti »), non de *colligere* ; Isidore de *conligatio* : aucun des deux ne défend une des deux hypothèses telle que les dictionnaires la donnent | à relire |
| Participe intermédiaire | *diligens* est un maillon de *diligence* ; *intelligens* n'en est pas un d'*intelligence* | le Littré place à *diligens* le passage de « qui aime » à « soigneux » ; le TLFi dérive *intelligentia* directement d'*intellegere* | à relire |
| *élégant* | `incertain: true` ; chaîne *elegans* puis *eligere* | le Lewis & Short dit le rattachement probable (« prob. »), le Littré l'attribue aux étymologistes latins | à relire |
| Sens de *legere* selon le composé | « cueillir » dans *eligere* (Littré, *élire*), « choisir » dans *intellegere* et *diligere* (Littré, *intelligent*, *dilection*), « ramasser, recueillir » seul (TLFi, *lire*) | chaque élément suit l'entrée de son composé (consigne de rédaction) | à relire |
| *légende* | chemin `ordinaire`, non `consacre` | *legenda* est formé sur un verbe profane et son sens premier, « ce qui doit être lu », n'a rien de sacré, même si le mot naît dans l'usage liturgique | à relire |
| *religion* et le lot | ni renvoi ni famille vers *religion* | *relegere* n'est qu'une des deux hypothèses de *religio* (une famille l'affirmerait) ; un renvoi suppose l'absence de racine commune | à relire |

## 2026-10-05 — Lot 6 (passe 1 : liberté, libéral, libertin, franc, esclave, servir, servitude, vassal)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaîne de *liberté* | arrêtée à *libertas* ; la parenté de *liber* avec *libet* (Littré, Lewis & Short) n'est pas dite | c'est une racine commune, non une filiation, et le TLFi ne la donne pas ; *liber*, « libre », n'ajoute pas de sens | à relire |
| Chaîne de *franc* | *Francus* (latin médiéval, « homme libre »), *Franci* (bas latin, « les Francs »), *\*frank* (francique, sans sens) ; sens premier : « les Francs » | le TLFi tire l'adjectif du nom du peuple, attesté en latin médiéval au sens d'homme libre ; l'origine du nom des Francs est obscure (Littré) : la chaîne s'y arrête | à relire |
| Nature de *franc* | `nature: [adjectif]` écrite dans la fiche | la première entrée du Littré écrite *franc* est le nom du peuple (s. m.) ; le script en aurait tiré « nom masculin » | à relire |
| Chaîne d'*esclave* | arrêtée à *sclavus*, « Slave » ; circonstances selon le TLFi (Balkans, Germains et Byzantins), non selon le Littré (guerres d'Othon le Grand) | *\*slovēninŭ* a le même sens et la formation de *sclavus* n'est que probable ; le TLFi est plus récent | à relire |
| Étymon de *servitude* | *servitudo* (TLFi), non *servitus* (Littré) | le TLFi est plus récent et rend compte de *servitus* par la forme *servitute* | à relire |
| Chaînes de *servir* et *servitude* | arrêtées à *servire* et *servitudo* ; *servus* dans la famille (*serf*) | *servus*, « esclave », n'ajoute pas de sens à « être esclave » ni à « esclavage » | à relire |
| Chaîne de *vassal* | *vassalus*, puis *vassus*, « serviteur » ; l'origine celtique n'est pas un maillon | les formes bretonne, irlandaise et galloise sont apparentées, non ancêtres ; aucune langue celtique n'est dans la liste, et elle n'ajouterait pas de sens | à relire |
| Lectures de *servitude* (passe 2) | drapeau `tradition` posé ; Isidore et Augustin lisent *servitus* et *servus*, non *servitudo* : à trancher avec les lectures | lecture du mot voisin ou de sa racine ; *esclave* y renvoie (`tradition.renvois`) | à relire |

## 2026-10-05 — Lot 6 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Lectures sur *servus* et *servitus* (Isidore, *Étymologies*, V, 27, 32 et IX, 4, 43 ; Augustin, *La Cité de Dieu*, XIX, 15) | non retenues sur *servitude* ni sur *servir* ; notées au corpus de *servitude* | aucune de ces formes n'est un maillon des chaînes (*servitudo*, *servire*) ; *servus* n'y ajouterait pas de sens (§3.2) | à relire |
| *serf* | ajouté aux candidats (`a-faire`) ; `tradition.renvois` d'*esclave* : *serf* (au lieu de *servitude*) | héritier direct de *servus*, que lisent Isidore et Augustin : c'est là que leurs lectures se placeront | à relire |
| Jérôme, *Noms hébreux* (« Libertinorum, facientium paleas ») | non retenu pour *libertin* | Jérôme dit lui-même les noms de la lettre L presque tous « violenter usurpata » | à relire |
| Isidore, *Différences*, I, 324 | non retenu (*liberté*, *libéral*) | pour *libertas*, il dit ce que dit l'histoire du mot ; *liberalitas* n'est pas dans la chaîne de *libéral* | à relire |
| Tradition « romaine » | ajoutée à data/traditions.json (passe 2), pour Varron | AGENTS.md §5 compte Varron parmi les sources des lectures ; aucune tradition existante ne lui convient ; une tradition de trop se retire plus aisément qu'elle ne s'ajoute | à relire |
| Varron | fiche d'auteur `varron` (BnF cb119277168, tradition romaine) et ouvrage `de-la-langue-latine` (BnF cb12425965t, texte : thelatinlibrary.com) ; lectures sur *lire*, *collègue*, *diligence* (VI, 66) | ses étymologies, lues texte sous les yeux, lisent les mots eux-mêmes ; l'identifiant suit le titre français que le validateur exige | à relire |
| Reprises de la relecture (*élire*, *intelligence*) | propositions adoptées, sauf « sens courant » et « ne garde que » (*élire*) et « surtout » (*intelligence*), retirés | le dossier ne dit ni quel sens est courant ni quel emploi domine | à relire |

## 2026-10-05 — Lot 7 (passe 1 : homme, humain, humble, humilité, cœur, courage, accord, vertu, virtuel)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| *humus* dans la chaîne d'*homme* | maillon *humus*, « terre », après *homo*, avec `incertain: true` ; `premier: true` sur *homo*, « être humain » | le Lewis & Short met la racine de *homo* dans *humus*, le Littré n'y voit qu'une conjecture, le TLFi s'arrête à *homo* : la filiation n'est pas sûre, le sens en tête ne doit pas être « terre » | à relire |
| Bopp (*bhūman*) pour *homo* | non retenu dans les écartées | le Littré le rejette d'une ligne (« on aurait eu fumon ») ; il faudrait une langue (sanscrit) et un auteur absents, pour un fait qui n'éclaire pas le mot | à relire |
| *vir* dans l'explication d'*homme* | « en supplantant le mot dont vient *vertu* » | une forme citée dans un texte doit être de la chaîne ; *vir* ne l'est pas, *vertu* (fiche du lot) mène à lui | à relire |
| *humus* dans *humble* et *humilité* | maillon *humus*, « terre », sens en tête (par défaut) | le Littré, le TLFi et le Lewis & Short tirent *humilis* de *humus* : c'est une filiation, non une conjecture | à relire |
| Chaîne d'*humilité* | *humilitas*, *humilis*, *humus* | maillon par maillon, comme le Littré et le TLFi la donnent ; chemin `consacre` (sens chrétien de *humilitas*) | à relire |
| Chaîne de *courage* | *cœur* (français), puis *cor*, « cœur » ; le *coraticum* du Littré n'est pas un maillon | le TLFi, plus récent, y voit un dérivé français de *cœur* en -age | à relire |
| Sens de *cor* | « cœur, siège de la vie, des sentiments et de l'intelligence » sur *cœur* ; « cœur » sur *courage* et *accord* | chaque fiche suit son entrée : conception antique (TLFi, *cœur* ; Lewis & Short, *cor*) ; glose simple du Littré à *courage* et *accorder* | à relire |
| Chaîne d'*accord* | *accorder*, *\*accordare* (sur le modèle de *concordare*, « être d'accord »), *cor* ; *chorda* dans les écartées, sans tenant | le TLFi (après Ernout) et le Littré tirent *accorder* de *cor* ; le sens de *\*accordare*, reconstruit, n'est pas attesté ; Ménage n'a pas de fiche d'auteur | à relire |
| Sens en tête de *vertu* | `premier: true` sur *virtus*, « virilité ; vigueur, courage, valeur » ; *vir*, « homme, par opposition à la femme », en maillon | « homme » seul, en tête, se lirait « être humain » ; *virtus* dit ce que *vir* apporte | à relire |
| Chaîne de *virtuel* | *virtualis* (latin médiéval, « potentiel »), puis *virtus*, « force, puissance » ; *vir* non repris | le sens utile à *virtuel* est la force (Littré, Lewis & Short) ; *vir* n'ajoute rien | à relire |
| *humilité*, *humain*, *courage*, *accord*, *virtuel* | drapeau `tradition` non posé | aucun passage du corpus ne lit *humilitas*, *humanus*, *coraticum*, *accordare* ni *virtualis* (Isidore lit *humilis*, X, 115 ; Thomas d'Aquin emploie *virtualis* sans le lire) | à relire |

## 2026-10-05 — Lot 8 (passe 1 : savoir, savant, saveur, sage, sagesse, sens, sentir, sentiment, sensible)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Sens premier de *sapere* | « avoir de la saveur » (*savoir*, *savant*, *saveur*) ; « avoir du discernement, être sage » et « comprendre, savoir » dits dans l'explication de *savoir* | le TLFi, le Littré et le Lewis & Short placent d'abord le sens propre (des choses) ; le TLFi dit le sens transitif venu « ensuite » ; l'ordre entre la saveur et le discernement n'est pas daté, la fiche ne l'ordonne pas | à relire |
| *scire* (*savoir*) | dans `ecartees` (graphie *sçavoir*, Littré), sans tenant ni `populaire` ; nommé aussi dans l'explication, comme verbe que *sapere* a remplacé (TLFi) | c'est une fausse étymologie savante, des scribes ; une seule forme sert aux deux mentions, l'app la met en italique | à relire |
| Chaîne de *sage* | *\*sabius*, *\*sabidus*, *sapidus* (TLFi) ; le *\*sapius* du Littré non repris ; *sapiens* dans `ecartees` (Littré) | le TLFi est plus récent ; le Littré n'écarte pas sa propre forme, et le TLFi ne la discute pas : ce n'est ni une écartée ni une hypothèse débattue avec tenants | à relire |
| Chaîne de *sagesse* et *savant* | le dérivé ouvre la chaîne (*sage*, *savoir*, langue `français`), puis toute la chaîne du mot de base, formes reconstruites comprises | comme *travail* et *ennui* ; « de *sage*, du latin *sapidus* » sauterait deux maillons | à relire |
| *saveur* | *sapor* sans sens ; sens premier sur *sapere* | « goût, saveur » n'apprend rien sur *saveur* ; *sapere* porte le lien avec *savoir*, que dit l'explication | à relire |
| *sens* « direction » | une seule fiche, *sens* (*sensus*) ; le sens de direction dit en une phrase, selon le TLFi (croisement avec un mot germanique, *sensus* n'ayant pas la notion de direction) ; pas de fiche homonyme | le TLFi en fait un article distinct, le Littré une extension du sens primitif : le TLFi, plus récent, est suivi ; la forme *sen* n'est pas citée (elle n'est pas dans la chaîne) ; une fiche *sens-2* ne remplirait le §3.3 que pour Thibault | à relire |
| Famille de *sens* | *forcené*, *assener* exclus | ils viennent de *sen*, non de *sensus* (TLFi, Littré) | à relire |
| Chaîne de *sentiment* | *sentement* (ancien français, sans sens), *sentir*, *sentire* | le TLFi en fait une réfection de *sentement*, dérivé de *sentir* | à relire |
| *philosophie* | ni renvoi ni famille depuis *sage* ou *sagesse* | le Lewis & Short dit *sapio* apparenté à σοφός et le Littré rapporte qu'on rattache *sapere* à σοφός : racine commune possible (un renvoi la suppose absente), non établie (une famille l'affirmerait) | à relire |
| Drapeau `tradition` | posé sur *sage*, *sagesse*, *sens* ; non posé sur les six autres | Isidore lit *sapiens* (X, 240) et *sensus* (XI, 1, 19), Thomas d'Aquin *sapientia* (I, q. 43, a. 5) ; *sapiens* et *sapientia* ne sont pas des maillons de *sage* et *sagesse* : à trancher en passe 2, comme *servitus* au lot 6 | à relire |

## 2026-10-05 — Lot 7 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Sens en tête de *vertu* | `premier: true` retiré : le sens en tête est celui de *vir*, « homme, par opposition à la femme » (remplace la décision de passe 1) | proposition du relecteur : *vir* est un maillon sûr, et c'est la règle par défaut (§3.1), comme pour *humus* dans *humble* | à relire |
| *\*accordare* | langue `latin`, non `latin populaire` | le TLFi dit « empr. au lat. » sans préciser (relecteur) | à relire |
| Isidore, *Étymologies*, X, 37 (*concors*) et III, 6 (*chordas a corde*) | non retenus pour *accord* | *concors* et *chorda* ne sont pas des maillons (*chorda* est écartée) ; même règle qu'au lot 6 pour *servus* | à relire |
| Thomas d'Aquin, IIa-IIae, q. 161, a. 1, ad 1 | retenu pour *humilité*, lu au Corpus Thomisticum (la Secunda secundae manque au corpus local) | il lit *humilis* (maillon d'*humilité*) et distingue l'humilité subie, peine, de l'humilité vertu : cela complète l'histoire du mot | à relire |
| Thomas d'Aquin, Ia-IIae, q. 55, a. 1 | retenu pour *vertu* | « virtus nominat quandam potentiae perfectionem » lit le nom ; il complète l'histoire (force, pouvoir) | à relire |
| Drapeau `tradition` d'*humain* et d'*humilité* | posé en passe 2 | Isidore lit *humanus* (X, 116), Thomas lit *humilis* à propos de l'humilité ; la décision de passe 1 (aucun passage) est donc revue | à relire |

## 2026-10-05 — Lot 8 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Lectures de *sens* | Isidore, *Étymologies*, XI, 1, 19, et Augustin, *La Cité de Dieu*, XI, 3, retenus ; Isidore, XI, 1, 13 non retenu | XI, 1, 13 redit Augustin (l'esprit appelé *sensus*, d'où *sententia*) : une voix suffit, la plus ancienne | à relire |
| Isidore (*sapiens a sapore*, X, 240) et Thomas d'Aquin (*sapientia, quasi sapida scientia*, I, q. 43, a. 5, ad 2) | non retenus sur *sage* et *sagesse* ; notés au corpus ; *sapience* ajouté aux candidats (`a-faire`) pour les accueillir | *sapiens* et *sapientia* ne sont pas des formes des chaînes (une lecture ne porte que sur le mot ou une forme de sa chaîne) | à relire |

## 2026-10-05 — Lot 9 (passe 1 : croire, crédit, foi, fidèle, confiance, dette, devoir, payer, paix)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Sens premier de *credere* (*croire*) | « confier en prêt », seul maillon | le TLFi (« proprement ») et le Lewis & Short (« orig. belonging to the lang. of business ») s'accordent ; le sens religieux vient du latin chrétien (chemin `consacre`) | à relire |
| Darmesteter (*çrad*, « cœur », et *do*, « je donne ») | non repris, ni maillon ni écartée | rapporté par le Littré (1878) ; le Lewis & Short glose *crad* « trust » ; le TLFi s'arrête à *credere* : un maillon indo-européen serait mal établi | à relire |
| Mot de base latin sans sens (*credere* dans *crédit*, *fides* dans *fidèle*, *pax* dans *payer*, *debita* et *debitum* dans *dette*) | maillon nommé sans `sens` ; le sens en tête est celui du maillon qui apprend quelque chose (*creditum*, *fidelis*, *pacare*, *debere*) | le maillon montre la filiation avec la fiche voisine du lot (*croire*, *foi*, *paix*) sans répéter son sens, et le sens en tête reste celui qui éclaire le mot | à relire |
| Chaîne de *confiance* | *confidentia*, puis *confidere* (sens en tête : « se fier pleinement ») ; *confiant* (Littré) non suivi ; la francisation d'après *fiance* (TLFi) non représentée | le TLFi, plus récent, en fait un emprunt à *confidentia* ; *fiance* n'est pas un étymon, et le modèle (`modele`) se lirait comme une formation latine | à relire |
| Composition de *debere* (*devoir*) | *de* et *habere*, sens du Lewis & Short (« to have or keep from some one ») ; le « ne pas avoir » du Littré non suivi | les deux s'accordent sur la composition, non sur son sens ; le Lewis & Short l'appuie sur Cicéron (*qui autem debet, aes retinet alienum*) | à relire |
| *devoir* verbe et nom | une seule fiche | le nom est l'infinitif substantivé (Littré, TLFi) | à relire |
| Sens premier de *pax* (*paix*) | « accord, traité » | le Lewis & Short : « orig. an agreement, contract, treaty » ; le Littré le met au radical de *pacisci* ; la racine *pac-*, *pag-* n'est pas un maillon | à relire |
| Chemins | `consacre` pour *croire* et *foi* ; `ordinaire` pour les sept autres | le TLFi dit le sens religieux de *credere* et de *fides* venu du latin chrétien ; il ne le dit pas de *fidelis* ni de *pax* | à relire |
| Drapeau `tradition` | posé sur *croire*, *foi*, *fidèle*, *confiance*, *paix* ; non posé sur *crédit*, *dette*, *devoir*, *payer* | Isidore lit *fides* (V, 17 ; VIII, 4), *fidelis* (X, 98), *confidentia* (Différences) ; Thomas d'Aquin lit *credere* (IIa-IIae, q. 2, a. 2, hors corpus local) ; Festus (Sinnius Capito) lit *pax* ; Isidore (V, 18) lit *pactum*, non *pacare* | à relire |
| Renvois | *croire* → *foi* ; *crédit* → *dette* ; *payer* → *dette* | notions voisines sans racine commune ; *payer* → *merci* non retenu (*merci* dit aujourd'hui le remerciement, non le paiement) | à relire |

## 2026-10-05 — Lot 9 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Maillons latins sans sens en fin de chaîne (*credere* dans *crédit*, *fides* dans *fidèle*, *pax* dans *payer*) | retirés (propositions du relecteur), ce qui remplace la décision de passe 1 ; *debita* et *debitum* restent dans *dette*, avant *debere*, qui porte le sens | règle d'arrêt (§3.2) : un dernier maillon sans sens n'ajoute rien ; le lien avec la fiche voisine est dans la famille | à relire |
| Explication de *foi* | phrase du relecteur adoptée ; la fin (« foi dit aujourd'hui la confiance assurée et la croyance religieuse ») retirée | sans cela l'explication dépassait 300 caractères ; le sens d'engagement « vieilli, ou dans des locutions » dit déjà ce qui a changé | à relire |
| Lecture de *foi* | Isidore, *Étymologies*, VIII, 2, 4 retenu ; V, 24, 17 non retenu | V, 24, 17 redit la même étymologie, à propos du fidéicommis ; une voix, un passage | à relire |
| Cicéron, *De officiis*, I, 23 (« quia fiat, quod dictum est appellatam fidem ») | non retenu ; ni fiche d'ouvrage ni tradition ajoutée à `ciceron` | la notice d'œuvre BnF (cb12134897m, « Les devoirs ») existe, mais l'API SRU échoue à la rendre en UNIMARC, et `npm run bnf` la refuse (« pas une notice d'œuvre ») ; pas de fiche écrite à la main | à relire |
| Festus (Sinnius Capito, *pacem a pactione conditionum*) | non retenu | parole rapportée de Sinnius Capito, sans notice BnF ; le texte de Festus n'a pas été trouvé en ligne | à relire |
| Augustin, *La Cité de Dieu*, XIX, 11 | retenu pour *paix* | il lit le nom (*pacis nomen*), employé aussi des choses mortelles, et lui préfère pour cela la vie éternelle comme nom de la fin de la cité | à relire |
| Thomas d'Aquin, IIa-IIae, q. 2, a. 2 | retenu pour *croire*, lu au Corpus Thomisticum | il distingue *credere Deum*, *credere Deo*, *credere in Deum*, un seul acte de foi sous trois rapports : cela complète l'histoire du verbe | à relire |
| Famille de *payer* | *paye* au lieu de *paie* | graphie du Littré (contrôle de famille) | à relire |

## 2026-10-05 — Lot 10 (passe 1 : roi, règle, régime, droit, loi, légal, légitime, ordre, ordinaire)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Sens en tête de *roi* | *regere*, « mener droit, diriger » ; *rex* sans sens | le Lewis & Short tire *rex* de *rego* et glose *rego* « to keep straight […], to lead straight; to guide » ; le TLFi s'arrête à *rex* (« souverain ») sans le contredire ; « souverain » n'apprend rien | à relire |
| *regere* dans *règle* et *régime* | maillon sans sens ; sens en tête sur *regula* (« pièce de bois droite, servant à mettre droit ») et *regimen* (« action de guider ») | règle du lot 9 (mot de base sans sens) : le maillon montre la famille de *roi* sans répéter son sens ; pour *règle*, l'instrument concret éclaire mieux que *regere* | à relire |
| Chaîne de *droit* | *directum* (bas latin, sans sens ; la justice dite dans l'explication), puis *directus*, « sans courbure, en ligne droite » ; *dirigere* non repris | le TLFi tire le nom de *directum* et l'adjectif de *directus*, participe de *dirigere* ; *dirigere* (« mettre en ligne droite ») n'ajoute pas de sens à *directus* (§3.2) | à relire |
| *droit* adjectif et nom | une seule fiche, chaîne du nom | le nom est l'adjectif substantivé (Littré, TLFi), comme *devoir* au lot 9 ; *directum* précède *directus*, que l'adjectif rejoint | à relire |
| Origine de *lex* (*loi*) | alternatives débattues : *ligare*, « lier » (selon le Lewis & Short, en premier), *legere*, « choisir » (selon Cicéron, *Des lois*, I, 19) ; `incertain: true` | le Littré rapporte *ligare* aux étymologistes latins, juge les deux difficiles et l'origine obscure ; le Lewis & Short propose *ligo* (« perh. ») ; le TLFi ne discute pas | à relire |
| Varron (*leges, quae lectae*, VI, 66) et Isidore (*lex a legendo, quia scripta est*) | non tenants de *legere* dans la chaîne ; pistes de lectures (passe 2) | chez Varron, *lectae* peut se lire « lues » ou « choisies » ; Isidore tire *lex* de « lire » ; le sens « choisir » n'est explicite que chez Cicéron (*delectus*) | à relire |
| Sens en tête de *loi* | *lex*, « proposition de loi faite au peuple » | sens propre au Lewis & Short (« a proposition or motion for a law made to the people by a magistrate »), puis la loi adoptée (« Transf. ») | à relire |
| *collègue*, *lire*, *élire* depuis *loi* | ni famille ni renvoi | apparentés à *lex* par une hypothèse seulement (*legare*, de *lex*, au Lewis & Short ; *legere*) : un renvoi supposerait la racine absente, une famille l'affirmerait (comme *philosophie* depuis *sage*, lot 8) | à relire |
| *loyal* (*légal*) | en famille, non en doublet | doublet signalé par le Littré et le TLFi, mais *loyal* n'a pas de fiche (candidat) ; même règle que *féal* au lot 9 | à relire |
| Mots de base latins sans sens | *lex* dans *légal* et *légitime*, *ordo* dans *ordinaire* | règle du lot 9 : la filiation avec *loi* et *ordre* sans répéter leur sens | à relire |
| Racine de *ordo* | non reprise (Corssen, *oriri*, rapporté par le Littré et le Lewis & Short) | le TLFi s'arrête à *ordo* ; une racine n'est pas un maillon (comme *pac-* pour *paix*) | à relire |
| Drapeau `tradition` | posé sur *roi*, *règle*, *loi*, *légitime*, *ordinaire* ; non posé sur *régime*, *droit*, *légal*, *ordre* | Isidore lit *rex* (IX, 3, 4 ; I, 29, 3), Augustin aussi (*Cité de Dieu*, V, 12) ; Isidore lit *regula* (VI, 16, 1 ; XIX, 18, 2), *lex* (V, 3, 2), *ordinarius* (IX, 3, 33) ; Thomas d'Aquin lit *lex* (Ia-IIae, q. 90, a. 1) ; Varron lit *leges* et *legitima* (VI, 66) ; Isidore (*Différences*, I, 176) distingue *directum* et *derectum* sans rien ajouter ; Augustin (XIX, 13) définit l'ordre, non le mot | à relire |
| Renvois | *roi* → *souverain*, *prince* ; *règle* → *loi* ; *droit* → *loi*, *justice* ; *légitime* → *juste* | notions voisines sans racine commune ; *légal* et *légitime* ne renvoient pas à *loi* (même racine : famille) | à relire |

## 2026-10-05 — Lot 9 (seconde relecture)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Thomas d'Aquin, IIa-IIae, q. 88, a. 3, co. (*foi*) | écarté, noté au corpus | il rapporte Augustin (*fides dicitur ex hoc quod fiunt dicta*), qui redit Isidore, VIII, 2, 4, déjà retenu | à relire |
| Thomas d'Aquin, IIa-IIae, q. 174, a. 2, ad 3 (*foi*) | retenu | il lit le nom (*nomen fidei importat imperfectionem cognitionis*) : ce que le nom emporte complète l'histoire du mot | à relire |
| Isidore, *Différences*, I, 207 (*fidèle*) | retenu, avec le texte du relecteur | il lit *fidelis*, qu'il distingue de l'autre mot (dit de l'ami) : un emploi propre au mot, comme I, 217 pour *confiance* | à relire |
| Thomas d'Aquin, IIa-IIae, q. 29, a. 1, co. (*paix*) | retenu | il lit le nom pris au sens propre (*si nomen pacis proprie sumatur*) et le distingue de la concorde, premier sens de *paix* en français | à relire |

## 2026-10-05 — Lot 10 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Dernier maillon sans sens (*regere* dans *règle* et *régime* ; *lex* dans *légal* et *légitime* ; *ordo* dans *ordinaire*) | retiré (remplace la décision de passe 1) | règle du lot 9 (passe 2), rappelée par le relecteur : la filiation est dans la famille | à relire |
| Thèmes | *roi* : politique ; *régime* : politique, santé ; *ordre* : société, politique | le thème `politique` existe ; l'ordre garde `société` (classes, ordre social) | à relire |
| Ouvrage de Cicéron | `traite-des-lois` (titre retenu de la notice BnF cb12446337k, « Traité des lois »), non `des-lois` | identifiant tiré du titre de la notice | à relire |
| Lectures de *loi* | Varron (VI, 66), Isidore (V, 3, 2), Thomas d'Aquin (Ia-IIae, q. 90, a. 1) ; *lectae* rendu par « choisies » chez Varron | même lecture de *legere* que pour *collègue* (« qui una lecti », choisis ensemble) | à relire |
| Lecture de *légitime* | Varron, VI, 66 (*legitima*) retenu | *legitima* est le pluriel neutre de *legitimus*, forme de la chaîne ; Varron le tire de *legere*, non de *lex* : cela diffère de l'histoire | à relire |
| Lecture d'*ordinaire* | Isidore, IX, 3, 33, retenu | il lit *ordinarius* (le soldat du rang, sans grade), ce qui complète l'histoire du sens « commun, moyen » | à relire |
| Lectures de *roi* | Isidore (IX, 3, 4) et Augustin (*La Cité de Dieu*, V, 12) | Isidore lie le nom à la conduite droite ; Augustin oppose la discipline de celui qui dirige à l'orgueil de celui qui domine : deux apports distincts | à relire |

## 2026-10-05 — Lot 11 (passe 1 : œuvre, ouvrage, ouvrier, opulent, loisir, oisif, négoce, école)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaîne de *œuvre* | *opera* seul, « peine prise à un travail, service » ; *opus* non repris | le TLFi fait d'*opera* un ancien pluriel d'*opus* (« ouvrage, travail ») : ce sens n'ajoute rien à celui d'*opera* (§3.2) ; le Lewis & Short distingue *opera*, peine prise de plein gré, d'*opus*, travail surtout mécanique : c'est ce qu'*œuvre* a quitté | à relire |
| Chaîne de *ouvrage* | *œuvre* (français, sans sens), puis *opera* | le TLFi le dérive d'*œuvre* (suffixe *-age*) ; le Littré (*operaticum*, de *operari*) est plus ancien | à relire |
| Chaîne de *ouvrier* | *operarius* seul, « homme de peine, travailleur » | *opera*, dernier maillon, n'y porterait pas de sens nouveau (règle du lot 9) ; la parenté avec *œuvre* est dans la famille | à relire |
| *opulent* et *opus* | aucune parenté écrite (ni chaîne, ni famille) | le Lewis & Short renvoie d'*opus* à *ops* (« v. ops ») sans l'affirmer ; le Littré et le TLFi ne la disent pas | à relire |
| Sens en tête de *opulent* | *ops*, « puissance, ressources, secours » ; *opulentus* sans sens | le Lewis & Short tire *opulentus* de *ops* et range ses sens : puissance, moyens et richesses, aide | à relire |
| Chaîne de *loisir* | ancien français *loisir* (verbe, sans sens), puis *licere*, « être permis » | substantivation du verbe (TLFi, Littré) ; le sens du verbe français redirait celui de *licere* | à relire |
| Chaîne de *oisif* | *oisdif* (croisé avec *oiseux*), *oisdive*, *oiseux*, *otiosus*, *otium* (« loisir, temps libre des affaires ») ; le couple *voisos*–*voisdie* non repris | la fiche suit le TLFi, plus récent que le Littré (*otiivus*) ; le modèle *voisdie* dit le procédé de dérivation, non un sens | à relire |
| *négoce* | *negotium* découpé en *nec*, « ne pas », et *otium*, « loisir » ; *oisif* en famille, et réciproquement | le Littré et le Lewis & Short (Paul Diacre d'après Festus) donnent la composition ; même racine *otium* | à relire |
| Sens en tête de *école* | *σχολή*, « arrêt, repos, loisir » ; *schola*, « loisir studieux, leçon » | le Bailly : « proprement arrêt, d'où repos, loisir » ; le TLFi : « proprement arrêt de travail » | à relire |
| Drapeau `tradition` | posé sur *opulent* (Varron, V, 92), *négoce* (Isidore, XVIII, 15, 3), *loisir* (Cicéron, *Philippiques*, XIII, 14, à juger) ; non posé sur *œuvre*, *ouvrage*, *ouvrier*, *oisif*, *école* | le corpus n'a pour ces derniers que des emplois ; Isidore, XX, 4, lit *opulentia*, hors de la chaîne d'*opulent* | à relire |
| Renvois | *œuvre* → *travail* ; *opulent* → *riche* ; *loisir* → *repos*, *vacances* ; *oisif* → *paresse* ; *négoce* → *commerce* | notions voisines sans racine commune ; *riche*, *repos*, *vacances*, *paresse*, *commerce* sont des candidats | à relire |

## 2026-10-05 — Lot 12 (passe 1 : monde, cosmos, univers, nature, naître, planète, désastre, considérer)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Sens en tête de *monde* | *mundus*, « parure, toilette d'une femme », avec `modele` *κόσμος* (« ordre, parure », relation `calque`) | sens propre au Lewis & Short (*mundus2*, Tite-Live 34, 7) ; le sens d'univers traduit *κόσμος* (Littré, Lewis & Short, Pline, Cicéron) ; `calque` est la relation la plus proche d'un calque de sens | à relire |
| Adjectif *mundus* (« propre, net ») | non repris en maillon ; *immonde* hors famille | le sens premier du nom est la parure ; l'adjectif n'éclaire pas *monde* et ferait passer « propre » en tête | à relire |
| Chaîne de *cosmos* | ouverte par le grec *κόσμος*, « ordre, bon ordre » ; Humboldt dans l'explication seulement | le TLFi le donne emprunté au grec, la première attestation étant le titre de la traduction du *Kosmos* (allemand) | à relire |
| Chaîne d'*univers* | *universum* (sans sens), puis *universus*, « tout entier, rassemblé en un », éléments *unus* et *versus* | le TLFi tire le nom de *universum*, neutre substantivé de *universus* ; « rassemblé, mis en un » est la glose du Littré | à relire |
| Sens en tête de *nature* | *natura*, « naissance » | sens propre au Lewis & Short et au TLFi (« le fait de la naissance ») ; « l'engendrante » du Littré repose sur une lecture du suffixe que les deux autres ne suivent pas | à relire |
| Chaîne de *naître* | *nascere* (latin, sans sens), puis *nasci*, « être engendré, naître » | le TLFi donne *nascere* chez Caton (latin), le Littré en bas latin : on suit le TLFi ; « être engendré » : Littré (*gnascor*), Lewis & Short (« to be begotten ») | à relire |
| Chaîne de *planète* | *planeta*, puis *πλάνης*, « errant » ; *πλανάω* non repris | le TLFi tire *planeta* du pluriel *πλάνητες*, de *πλάνης* ; le Bailly range *πλάνητες ἀστέρες* sous *πλάνης* ; « égarer » n'ajoute pas à « errant » | à relire |
| Chaîne de *désastre* | italien *disastro*, « mauvais astre », éléments *dis-* (« mauvais ») et *astro* ; pas de *astrum* | le TLFi (emprunt à l'italien) dépasse le Littré (formation française *dés-* et *astre*) ; *astrum* n'ajoute pas de sens | à relire |
| Origine de *considerare* | *considerare*, « examiner attentivement » (`premier`), puis *sidus*, « astre, constellation » ; `incertain: true`, sans alternatives | le Littré affirme le rattachement à *sidus* ; le Lewis & Short le donne « selon Corssen » et Festus ; le TLFi n'en dit rien ; aucune autre hypothèse dans les sources consultées ; même forme que *homme* (*humus*) et *élégant* | à relire |
| *désirer* depuis *considérer* | ni famille ni renvoi | apparenté par la même hypothèse seulement (« cf. desidero », Lewis & Short) ; règle du lot 10 | à relire |
| Renvois | *monde* → *univers* ; *cosmos* → *monde*, *univers* ; *désastre* → *catastrophe*, *malheur* ; *considérer* → *contempler*, *estimer* | notions voisines sans racine commune, déclarées d'un seul côté | à relire |
| Drapeau `tradition` | posé sur *monde*, *cosmos*, *nature*, *planète*, *considérer* ; non posé sur *univers*, *naître*, *désastre* | Isidore lit *mundus* (III, 29, 1 ; XIII, 1), *natura* (XI, 1, 1), *planetae* (III, 71, 20), *sidera* par *considerare* (III, 71, 4) ; Thomas d'Aquin lit *natura* (Ia q. 29 a. 1 ad 4 ; IIIa q. 2 a. 1) ; pour *cosmos*, pistes hors corpus (Platon, *Gorgias* ; Plutarque) ; rien qui lise *universus*, *nasci* ou *disastro* | à relire |

## 2026-10-05 — Lot 11 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| *œuvre*, *négoce* | propositions du relecteur adoptées : explication d'*œuvre* (« Opera supposait la libre volonté et le désir de servir ») ; renvois *travail* et *commerce* retirés | le sens affiché n'est plus redit ; un mot nommé dans l'explication n'est pas aussi un renvoi | à relire |
| *oisif* | `croisement` avec *oiseux* gardé | le TLFi : « issu, sous l'influence de *oiseux*, de l'ancien français *oisdif* » | à relire |
| Cicéron, *Philippiques*, XIII, 14 (*loisir*) | retenu ; `traditions: [ romaine ]` ajouté à `ciceron` (champ seul, la fiche existait) ; ouvrage `philippiques` créé d'après la BnF (cb120322781) | Cicéron définit *licere*, forme de la chaîne : est permis ce qu'accordent les lois, la coutume et les institutions, non ce que chacun peut ; `npm run bnf` refuse de réécrire une fiche existante | à relire |
| Varron, V, 92 (*opulent*) | retenu | il lit *opulentus* et le rattache à *inops* et à *copiosus*, ce que la fiche ne dit pas ; V, 64 (*Ops*, la déesse) non retenu | à relire |
| Isidore, XVIII, 15, 3 (*négoce*) | retenu, sans répéter *nec otium* | il distingue les sens du mot (affaire, procès) et le réserve aux procès, le commerce ayant son mot propre | à relire |

## 2026-10-05 — Lot 12 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Festus (*Desiderare et considerare a sideribus dici certum est*, abrégé de Paul Diacre) | pas de lecture sur *considérer* ; ni auteur ni ouvrage créés | le passage redit l'histoire que donnent le Littré et le Lewis & Short, dont il est la source ancienne, sans rien y ajouter pour *considérer* ; le seul texte en ligne est une reconnaissance optique (archive.org, éd. Thewrewk de Ponor, 1889), fautive pour l'autre passage (p. 42 Müller) | à relire |
| *κόσμος* dans les lectures de *cosmos* | Platon (*Gorgias*, 507e-508a, tradition grecque) et Isidore (*Étymologies*, XIII, 1, 2) | Platon tire le nom de l'ordre moral du tout (amitié, mesure, justice), Isidore de l'ornement : deux lectures qui complètent l'histoire | à relire |
| Lecture de *planète* | Isidore, III, 71, 20, retenu | outre *ab errore*, il décrit l'errance (vers le sud, le nord, contre le mouvement du monde ou avec lui) : il complète l'histoire | à relire |
| Lecture de *considérer* | Isidore, III, 71, 4, retenu | il lit *sidus*, forme de la chaîne, dans l'autre sens (les astres nommés d'après ceux qui les considèrent) | à relire |

## 2026-10-05 — Lot 13 (passe 1 : passion, patience, patient, compassion, souffrir, peine, pénible, pénitence, tourment)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chemin de *passion* | `consacre` | *passio* est profane en latin (« fait de subir, de souffrir », Apulée) ; le latin patristique l'applique aux souffrances du Christ et des martyrs, et le français le reçoit d'abord ainsi (TLFi) | à relire |
| Chaîne de *passion* | *passio* seul, « fait de subir, de souffrir », sans `modele` ; *pati* non repris | *passio* n'a pas été fait sur *πάθος* : seul son emploi pour les affections de l'âme le traduit (Lewis & Short), calque de sens que le modèle n'a pas (le `modele` de *monde* a été retiré pour cette raison au lot 12, passe 2) ; *pati* n'ajoute rien au sens de *passio* (règle du dernier maillon) | à relire |
| Chaînes de *patience* et *patient* | *patience* : *patientia* seul, « action de supporter, de souffrir, d'endurer » ; *patient* : *patiens*, « qui supporte, endurant », puis *pati*, « souffrir, supporter, endurer » | pour *patience*, le sens de *patientia* (TLFi, Lewis & Short) contient déjà celui du verbe ; pour *patient*, seul le verbe explique le nom (celui qui subit, le malade) | à relire |
| Chaîne de *compassion* | *compassio* (latin ecclésiastique, sans sens), puis *compati* (bas latin), « souffrir avec », éléments *cum* et *pati* | le TLFi dérive *compassio* de *compatior* (un déverbal passe par son verbe) ; le Littré donne *cum* et *passio* ; le Lewis & Short date *compatior* du latin tardif (Tertullien) | à relire |
| Chaîne de *souffrir* | *\*sufferire* (latin populaire, sans sens), puis *sufferre*, « porter sous, soutenir, endurer », éléments *sub* et *ferre* | TLFi pour la forme populaire ; Littré pour la composition ; Lewis & Short pour le sens propre, « porter sous » (Plaute) | à relire |
| Chaîne de *peine* et de *pénible* | *poena*, « réparation, expiation, châtiment », puis *ποινή*, « prix du sang, rançon » ; pour *pénible*, *peine* (français, sans sens) en tête | le Bailly (2020) dit *poena* emprunté à *ποινή* ; le TLFi ne glose *ποινή* que « id. », le Bailly en donne le sens propre ; *pénible* suit le modèle d'*ouvrage* (lot 11) et garde la chaîne entière de *peine* | à relire |
| Origine de *pénitence* (*poena* ou *paenitere*) | *paenitentia* (sans sens) ; *paenitet*, « ne pas être satisfait de » (`premier`) ; dernier maillon à alternatives débattues, *paene*, « presque, à peine » (sans tenant écrit), puis *poena*, « châtiment » (`selon: [lewis-short]`) ; `incertain: true` ; ni `croisement` ni `ecartees` (passe 2) | le TLFi (d'après Ernout et Meillet, non consultés, sans fiche) tire *paenitet* « probablement » de *paene* et explique la graphie *poenitentia* par un rapprochement avec *poena* ; le Lewis & Short (1879) met la racine de *paeniteo* dans *poena* ; aucune source n'abandonne *poena* : origine débattue, sur le modèle de *loi* ; le croisement ne vaudrait que dans une hypothèse | à relire |
| Chemin de *pénitence* | `consacre` | *paenitentia*, « regret », est profane ; le latin chrétien en fait le regret du péché, la pénitence publique, le sacrement (TLFi) | à relire |
| *repentir* | dans la famille de *pénitence* | le TLFi (*repentir*) le tire de *repoenitere*, de *paenitet* | à relire |
| Chaîne de *tourment* | *tormentum*, « machine de guerre, treuil, instrument de torture », puis *torquere*, « tordre » | TLFi et Lewis & Short pour *tormentum* ; Littré : « proprement engin à tordre, de *torquere* » | à relire |
| Renvois | *passion* → *émotion*, *désir* ; *compassion* → *miséricorde* ; *peine* → *chagrin* ; *tourment* → *supplice* | notions voisines sans racine commune ; *sentiment* → *passion* existe déjà, non redéclaré | à relire |
| Drapeau `tradition` | posé sur *passion*, *patience*, *patient*, *peine*, *pénitence*, *tourment* ; non posé sur *compassion*, *souffrir*, *pénible* | Augustin lit *passio* (*La Cité de Dieu*, VIII, 17 ; IX, 4), Thomas aussi (Ia-IIae q. 22) ; Isidore lit *patiens* (X, 201), *poena* (V, 27, 2), *poenitentia* (VI, 19, 71), *tormenta* (XIX) ; *patience* : Cicéron (*De l'invention*, II, 54, 163), à juger ; rien qui lise *compassio*, *sufferre* ou *pénible* | à relire |

## 2026-10-05 — Lot 13 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Verdicts | propositions du relecteur adoptées telles quelles : *passion* (`modele` retiré, explication sans *πάθος*), *compassion* (renvoi *pitié* retiré), *souffrir* (renvoi *douleur* retiré), *peine*, *pénible*, *tourment* (explications : ce qui s'est perdu), *pénitence* (alternatives débattues, `croisement` et `ecartees` retirés) | toutes justes ; un mot nommé dans l'explication n'est pas aussi un renvoi | à relire |


## 2026-10-05 — Lot 14 (passe 1 : temps, heure, moment, instant, saison, siècle, éternel, occasion)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaîne de *temps* | *tempus*, « portion de temps, moment » (`premier`), puis la racine *\*tem-* (indo-européen), « couper » ; `incertain: true` | le Lewis & Short : « etym. dub. ; perh. root tem- ; Gr. τέμνω ; prop. a section » ; le TLFi et le Littré ne remontent pas au-delà de *tempus* ; « couper » est le sens de *τέμνω* (Bailly) ; même forme que *considérer* (*sidus*) | à relire |
| Chaîne d'*heure* | *hora* seul, sans *ὥρα* | le Lewis & Short le dit apparenté à *ὥρα* (« kindred »), non emprunté ; le TLFi et le Littré s'arrêtent à *hora* ; Isidore le dit grec (V, 29) : piste de lecture, non fait d'histoire | à relire |
| Chaîne de *moment* | *momentum*, « mouvement, impulsion », sans *movere* ni *\*movimentum* | « mouvoir » n'ajoute rien à « mouvement » (dernier maillon sans sens retiré) | à relire |
| Chaîne d'*instant* | *instans*, puis *instare*, « se tenir sur, serrer de près », éléments *in-* (« sur ») et *stare* (« se tenir debout ») ; pas de maillon français pour l'adjectif | le nom est la substantivation de l'adjectif (TLFi), et la fiche porte les deux natures ; Littré donne la composition | à relire |
| Origine de *saison* | *satio*, « action de semer, semailles » ; *statio* en `ecartees`, selon Scheler (auteur `auguste-scheler` à créer) | le TLFi et le Littré suivent *satio* ; le Littré rapporte le doute de Scheler et l'écarte (*stagione*, *estacion* viennent de *stationem*) | à relire |
| Chemin de *siècle* | `ordinaire`, non `consacre` | *saeculum* n'est pas pris dans l'ordre sacré comme *église* ou *ange* : la langue chrétienne en fait le monde profane, opposé à l'éternité ; le traitement serait de toute façon le même | à relire |
| Rapprochement de *saeculum* avec *sequi* | pas dans `ecartees` : lecture d'Isidore (V, 38, 1), pour la passe 2 | le Littré l'écarte sans nommer de tenant ; c'est l'étymologie d'Isidore, qui relève des lectures (AGENTS.md §3.2) | à relire |
| Chaîne d'*éternel* | *aeternalis* (latin ecclésiastique), *aeternus* (sans sens), *aevum*, « temps sans fin ; durée de la vie, âge » | « lat. chrét. » du TLFi rendu par `latin ecclésiastique`, comme pour *manne* ; *aeternus* ne dit rien de plus qu'éternel ; *aevum* porte les deux sens (Lewis & Short, Littré) | à relire |
| Chaîne d'*occasion* | *occasio*, « moment favorable », puis *occidere*, « tomber » ; sans éléments | le Littré : « advenir, proprement tomber, de ob, et cadere » ; il ne donne pas de sens à *ob* ; *occident*, de *occidere*, en famille (Littré) | à relire |
| Familles | *horloge* non mis avec *heure* ; *sempiternel* non mis avec *éternel* | *horloge* vient du grec par *horologium*, *sempiternus* du suffixe *-ternus* et non de *aeternus* : aucun fait du dossier ne les rattache | à relire |
| Renvois | *moment* → *instant* ; *occasion* → *opportun* | notions voisines sans racine commune ; *opportun* est un candidat | à relire |
| Drapeau `tradition` | posé sur *temps*, *heure*, *moment*, *siècle*, *éternel*, *occasion* ; non posé sur *instant*, *saison* | Isidore lit *tempora* (V, 35), *hora* (V, 29), *momentum* (V), *saecula* (V, 38, 1), *aevum* (V, 38, 4), et distingue *occasio* d'*opportunitas* (*Différences*) ; Varron, VI, 2, lit *tempus* ; rien qui lise *instans* ou *satio* | à relire |
| Lectures retenues | *passion* : Augustin, *La Cité de Dieu*, VIII, 17, et Thomas d'Aquin, Ia-IIae, q. 22, a. 2 ; *patient* : Isidore, X, 201, et Thomas, IIa-IIae, q. 136, a. 4, ad 2 ; *peine* : Isidore, V, 27, 1-2 ; *pénitence* : Isidore, VI, 19, 71 ; *patience* : Cicéron, *De l'invention*, II, 163 ; *tourment* : Isidore, XIX, 4, 4 | chacune lit le mot ou une forme de sa chaîne (*passio*, *patiens*, *poena*, *poenitentia*, *patientia*, *tormentum*) et complète l'histoire ou s'en écarte ; Thomas, Ia-IIae, q. 22, a. 1, lit *pati*, retiré de la chaîne de *passion* : non retenu ; IX, 4 d'Augustin redit VIII, 17 | à relire |
| Ouvrage *de-l-invention* | créé d'après la BnF (cb13169332m), auteur `ciceron` | citable pour la lecture de *patience* | à relire |
| *compassion*, « chez Augustin » | laissé, malgré le contrôle « auteur nommé sans référence » | fait du Lewis & Short (*compatior*, Augustin, *Lettres* et *Confessions*) ; même cas que Littré dans *ennui* | à relire |


## 2026-10-05 — Lot 14 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| *temps*, *moment*, *instant*, *éternel* | propositions du relecteur adoptées telles quelles (explications) | justes : le sens de durée était déjà latin ; la mécanique a repris *momentum* en 1634, elle ne l'a pas gardé ; *instare* relié au nom par « imminent » ; figure « élevé au-dessus de tout temps » retirée | à relire |
| Raison de l'écartée de *saison* | « Les mots italien et espagnol qui l'appuyaient viennent de *statio* » ; ni Littré, ni *stagione*, ni *estacion* nommés | Littré, dictionnaire des sources, n'est pas cité dans un champ de la fiche (`npm run verifier`) ; un mot étranger cité doit être une forme de la chaîne | à relire |
| Lectures de *siècle* | Isidore, V, 38, 1 (*sequi*) et Varron, VI, 11 (*seclum*, d'après *senex*) ; non retenus : *Différences*, I, 67, Augustin, *La Cité de Dieu*, XII, Thomas d'Aquin, Ia q. 10 | les deux premières lisent le mot et s'écartent de l'histoire ; les autres disent l'emploi (*saecula saeculorum*, *periodus*) sans en donner le nom ; la qualité, non la quantité | à relire |
| Lectures d'*éternel* | Isidore, V, 38, 4 (*aevum*) et Varron, VI, 11 (*aevum* tiré de l'âge ; *aeternus* en vient) | toutes deux lisent une forme de la chaîne ; Varron tire *aevum* de l'âge, Isidore l'âge de *aevum* | à relire |
| Lecture de *temps* | Varron, VI, 2, et Isidore, V, 35, 1 ; Cicéron, *De l'invention*, I, 26, 39, non retenu | Varron et Isidore tirent le nom du cours tempéré des astres, ou du tempérament des saisons ; Cicéron définit le temps sans rien dire de son nom | à relire |
| Lecture d'*occasion* | Cicéron, *De l'invention*, I, 27, 40 ; *Différences*, I, 399, non retenu | Cicéron distingue *occasio* de *tempus* (une opportunité jointe à l'espace de temps) ; Isidore ne dit qu'une tournure (*occasio arrisit*) | à relire |
| Lectures de *heure* et de *moment* | Isidore, V, 29, 2 (*hora*) et V, 29, 1-2 (*momentum*) | Isidore tient *hora* pour grec et y lit la limite du temps ; il nomme *momentum* d'après le mouvement des astres | à relire |
| Mots étrangers dans les textes des lectures | *tempestiva*, *ora*, *αἰών*, *aeviternum*, *aetas* paraphrasés, non cités | règle : un mot étranger cité dans un texte est une forme de la chaîne ; la citation les garde | à relire |
| Renvois numériques de Varron | « VI, 2 » et « VI, 11 », d'après le Lewis & Short (numérotation de Müller) | le texte en ligne (The Latin Library) n'a que des chapitres | à relire |

## 2026-10-05 — Lot 15 (passe 1 : vérité, mensonge, mentir, erreur, illusion, évidence, preuve, doute, certitude)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaîne de *vérité* | *veritas* seul, « le vrai, la réalité » ; *verus* non repris | « vrai » n'ajoute rien au sens de *veritas* (dernier maillon sans sens retiré) ; *vrai*, *véritable*, *véridique*, *vérifier* en famille (Littré) | à relire |
| Origine de *mensonge* | *\*mentionica*, *mentio* (bas latin, « mensonge »), *mentio* (latin, « action de rappeler, mention ») ; `incertain: true` ; *mentiri* en `ecartees`, raison : le TLFi la juge moins probable | le TLFi : *mentio* « mensonge » « paraît plutôt continuer » *mentio* « mention » (mention mensongère) « qu'être issu par haplologie de *\*mentitio* », de *mentiri* ; aucun tenant nommé pour l'autre hypothèse ; en `alternatives`, le sens premier serait tombé sur le bas latin *mentio*, « mensonge », qui n'apprend rien ; le Littré (« dérivation irrégulière du verbe mentir ») n'est pas tenant de *\*mentitio* | à relire |
| Chaîne de *mentir* | *mentiri* (sans sens), puis *mens*, « esprit, imagination » ; `incertain: true` | le Littré (« de mens […] parce que mentir c'est imaginer ») et le Lewis & Short (« prob. from root men- […] Original meaning, to invent ») ; le TLFi n'en dit rien ; les sens latins de *mentiri* (se tromper, contrefaire) vont dans l'explication | à relire |
| Famille de *mentir* | *mensonge* et *mental* y figurent | même racine *men-* : *mentio* (Lewis & Short) et *mens* (Littré, *mental*), quelle que soit l'hypothèse retenue pour *mensonge* | à relire |
| Chaîne d'*erreur* | *error* seul, « action d'errer çà et là » | *errare*, « errer », n'ajoute rien (dernier maillon sans sens retiré) | à relire |
| Chaîne d'*illusion* | *illusio* (sans sens), puis *illudere*, « jouer avec, se jouer de », éléments *in* (« dans ») et *ludere* (« jouer ») | le Lewis & Short tire *illusio* de *illudo* (*in-ludo*) ; le Littré donne *in*, « dans », et *ludere*, « jouer » ; les sens latins d'*illusio* (ironie, moquerie, tromperie) vont dans l'explication | à relire |
| Chaîne d'*évidence* | *evidentia* (sans sens), puis *evidens*, « visible, manifeste », éléments *ex* (« hors de ») et *videre* (« voir ») | TLFi (*évident*) et Littré pour la composition, Lewis & Short pour les sens ; *ἐνάργεια*, que Cicéron rendait par *evidentia*, non repris (calque de sens, voir lots 12 et 13) | à relire |
| Chaîne de *preuve* | *prouver* (français, sans sens), puis *probare*, « éprouver, vérifier ; trouver bon » ; ni *proba* ni *probus* | le TLFi en fait le déverbal de *prouver*, le Littré le tire de *proba*, « échantillon, essai » : la fiche suit le TLFi, plus récent ; « trouver bon » dit ce qu'apporterait *probus* | à relire |
| Chaîne de *doute* | *douter* (français), *dubitare*, « osciller d'un parti à l'autre, hésiter », *duo*, « deux » ; formes intermédiaires non reprises | le Lewis & Short passe par *\*duhibeo* (*duo* + *habeo*, « tenir pour deux »), le Littré par un radical *dub*, « double » : ils s'accordent sur « deux », non sur la formation | à relire |
| Chaîne de *certitude* | *certitudo* (bas latin, sans sens), *certus*, « décidé, fixé », *cernere*, « séparer, cribler ; discerner, décider » | TLFi (*certain* : « certus est le part. passé adjectivé de cernere ») ; Lewis & Short pour les sens propres ; *critique* (grec *κρίνω*, que le Lewis & Short rapproche de *cerno*) ni en famille ni en renvoi : parenté de racine, non de mot | à relire |
| Renvois | *vérité* → *mensonge* ; *erreur* → *illusion* ; *doute* → *certitude* ; *preuve* → *évidence* ; *certitude* → *évidence* ; `tradition.renvois` : *mensonge* → *mentir* | notions voisines sans racine commune ; la tradition parle du mensonge sous *mendacium*, rattaché à *mens* (Thomas d'Aquin), forme de la chaîne de *mentir*, non de *mensonge* | à relire |
| Drapeau `tradition` | posé sur *vérité*, *mentir*, *illusion*, *évidence*, *certitude* ; non posé sur *mensonge*, *erreur*, *preuve*, *doute* | Thomas d'Aquin lit *illusio* par *ludus* (IIa-IIae, q. 75, a. 1) et *mendacium* par *contra mentem* (q. 110, a. 1) ; Cicéron définit *veritas* (*De l'invention*, II, 162) et nomme *evidentia* (*Académiques*, II, 17) ; *certitudo* chez Thomas, à juger ; rien dans le corpus qui lise *error*, *probare* ou *dubitare* | à relire |


## 2026-10-05 — Lot 16 (passe 1 : famille, domestique, foyer, père, patrie, mariage, époux, enfant, orphelin)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaîne de *famille* | *familia* seul, « ensemble des esclaves d'une maison » ; *famulus* non retenu | le Lewis & Short : *familia*, formé sur *famulus*, « the slaves in a household […] not = family, i. e. wife and children » ; « serviteur » n'ajoute rien à l'ensemble des serviteurs (dernier maillon sans sens nouveau retiré) ; l'osque et le sanscrit du Littré ne sont pas repris par le TLFi | à relire |
| Chaîne de *domestique* | *domesticus* seul, « de la maison, de la famille » ; sans *domus* | « maison » n'ajoute rien à « de la maison » | à relire |
| Chaîne de *foyer* | *\*focarium* (latin populaire, sans sens), puis *focus*, « âtre, lieu où l'on fait le feu » ; *focarius* non retenu | *\*focarium* est la substantivation de *focarius* (TLFi) : un seul mot, non deux maillons | à relire |
| Sens de *pater* | « celui qui engendre ; fondateur » (TLFi) ; le chef de famille dit dans l'explication, par le lien vers *famille* | le Lewis & Short donne le chef de maison comme sens dérivé ; les rattachements sanscrits du Littré (*pā*, *pati*) ne sont pas repris par le TLFi | à relire |
| Chaîne de *patrie* | *patria*, « terre des pères, pays natal », puis *patrius*, « du père, paternel » : sens premier « du père, paternel » | le Lewis & Short : *patria* est l'adjectif *patrius* substantivé (*terra* sous-entendu) ; c'est le père qui éclaire le mot | à relire |
| Chaîne de *mariage* | *marier* (français), *maritare*, « donner en mariage », *maritus* (sans sens), *mas*, « mâle » : sens premier « mâle », par défaut | le TLFi : *mariage*, dérivé de *marier* ; *maritus* « lui-même dér. de *mas* » ; le Littré le rapporte aux étymologistes, le Lewis & Short le donne sans réserve ; *maritus* reste comme maillon (lien de *maritare* à *mas*, et forme lue par Isidore, IX, 7) | à relire |
| Chaîne d'*époux* | *sponsus*, « fiancé, promis », puis *spondere*, « promettre solennellement » ; sans *σπένδω* | le Lewis & Short ne dit *spondere* qu'apparenté (« akin ») à *σπένδω* ; le TLFi s'arrête à *spondere* ; même règle que *heure* (lot 14) | à relire |
| Chaîne d'*orphelin* | *orphanus* (latin ecclésiastique), puis *ὀρφανός* ; sans *orfene* ni *orfenin* | orphelin vient de *orfenin* par dissimilation, diminutif de *orfene* (TLFi) : formes seules, sans sens ; le premier maillon qui sort du français est *orphanus* | à relire |
| Famille d'*époux*, d'*enfant* | *répondre* (Littré : *respondere*, de *re* et *spondere*) ; *infanterie* (Littré : italien *fante*, apocope d'*infantem*) | apparentés selon le Littré | à relire |
| Renvois | *famille* → *foyer* ; *mariage* → *époux* ; *patrie* → *nation*, *pays* (candidats) | notions voisines sans racine commune | à relire |
| Lien de *domestique* vers *famille* | dans l'explication : l'ensemble des domestiques (1732), « ce que nommait en latin le mot d'où vient famille » | le nom latin de la famille nommait la domesticité ; le lien s'explique en une phrase | à relire |
| Drapeau `tradition` | posé sur *famille*, *père*, *foyer*, *mariage*, *époux*, *enfant* ; non posé sur *domestique*, *patrie*, *orphelin* | Isidore lit *pater* (IX, 5), *pater familias* et *familia* (IX, 5), *focus* (XX, 10, 1, d'après Varron ; *Différences*), *maritus* (IX, 7), *sponsus* (IX, 7, 3), *infans* (XI, 2, 9) ; Augustin, *La Cité de Dieu*, XIX, 16 (*patres familias*) ; rien qui lise *domesticus*, *patria* ou *orphanus* dans le corpus | à relire |
| Thèmes | `famille` pour sept ; *domestique* : `maison`, `travail` ; *foyer* : `maison`, `famille` ; *patrie* : `politique` | le domaine de l'usage d'aujourd'hui | à relire |

## 2026-10-05 — Lot 15 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Verdicts | propositions du relecteur adoptées telles quelles : *mensonge* (`ecartees` retiré ; maillon `alternatives` débattu, *mentio*, « action de rappeler, mention », puis *mentiri*, « ne pas dire la vérité », sans tenant), *mentir* et *certitude* (explications), *preuve* (faits du TLFi ajoutés au dossier : 1832 en distillerie, sens actuels du sucre et de l'alcool ; phrase gardée) | toutes justes ; le sens en tête de *mensonge* reste le bas latin *mentio*, « mensonge » (limite du modèle, signalée) | à relire |
| Lecture de *mentir* | Nigidius Figulus, rapporté par Aulu-Gelle, *Nuits attiques*, XI, 11, 1 ; auteurs `aulu-gelle` (sans tradition) et `nigidius-figulus` (`romaine`), ouvrage `nuits-attiques` créés d'après la BnF (cb11886402k, cb12406787d, cb120084087) | il lit *mentiri*, forme de la chaîne, et le distingue de *mendacium dicere* : qui ment cherche à tromper sans être trompé ; il complète l'explication (le latin disait aussi se tromper) | à relire |
| Thomas d'Aquin, IIa-IIae, q. 110, a. 1 (*mendacium … contra mentem*) | non retenu, ni pour *mentir* ni pour *mensonge* | il lit *mendacium*, forme voisine absente des deux chaînes (règle *servus* / *servitude*) | à relire |
| Lectures de *vérité* | Cicéron, *De l'invention*, II, 161 ; Thomas d'Aquin, Ia, q. 16, a. 1, co. | Cicéron fait de *veritas* une part du droit de nature, la vertu de dire les choses sans les altérer ; Thomas met la vérité d'abord dans l'intelligence, puis dans les choses : deux lectures qui complètent le sens de réalité | à relire |
| Lecture d'*illusion* | Thomas d'Aquin, IIa-IIae, q. 75, a. 2, co. (plutôt que a. 1, s. c., plus bref) | il tire le nom d'*illusio* du jeu où l'on tourne un mal tenu pour petit | à relire |
| Lecture d'*évidence* | Cicéron, *Académiques*, II, 6, 17 (*Lucullus*), texte de Wikisource (*Academica priora*) ; ouvrage `academiques` créé d'après la BnF (cb124305302) ; la voix est celle de l'œuvre (Cicéron), non du personnage | il lit *euidentia*, forme de la chaîne : mot choisi pour rendre le grec, qu'on ne définit pas tant il est clair ; le mot grec n'est pas nommé dans le texte de la lecture (il n'est pas dans la chaîne) | à relire |
| Lecture de *certitude* | Thomas d'Aquin, IIa-IIae, q. 18, a. 4, co. | certitude par essence dans la faculté de connaître, par participation dans ce qui est mû sans faillir vers sa fin : il complète l'histoire (du caractère de la chose à l'état de l'esprit) | à relire |


## 2026-10-05 — Lot 16 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Verdicts | propositions du relecteur adoptées telles quelles : *domestique* (proposition sur *famille* retirée, « l'ensemble des domestiques d'une maison »), *père* (« épithète de vénération » sans « aux dieux » ; Dieu le Père gardé dans l'usage), *patrie* (*patrius* retiré : sens premier « terre des pères, pays natal » ; première phrase retirée), *mariage*, *époux*, *enfant*, *orphelin* (explications) | toutes justes ; pas de renvoi *domestique* → *famille* : notions d'ordres différents | à relire |
| Lectures de *père* | Isidore, IX, 5, 3 (*pater*, de l'acte qui engendre) et Augustin, *La Cité de Dieu*, XIX, 16 (nom de père de famille) ; Isidore, IX, 5, 7, non retenu | IX, 5, 7 redit Augustin, XIX, 16 ; la qualité, non la quantité | à relire |
| Lecture de *famille* | Isidore, IX, 5, 11-12 : *familia* tirée de la cuisse (la lignée), dite des esclaves « par abus » | lit le mot et prend le contre-pied de l'histoire | à relire |
| Lectures de *foyer* | Isidore, XX, 10, 1 (du grec) et Varron rapporté par Isidore au même passage (`auteur: varron`) ; *Différences*, I, 307, non retenu | deux voix dans un passage, une lecture chacune ; les *Différences* redisent Varron | à relire |
| Lecture de *mariage* | Isidore, IX, 7, 1-2 (*maritus* dit l'époux même seul ; tiré de *mas*) | lit une forme de la chaîne et la distingue du nom de l'homme | à relire |
| Lecture d'*époux* | Isidore, IX, 7, 3-4 : le *sponsus* est celui qui promet et donne des garants, non celui qui est promis | lit le mot et s'écarte du sens « promis » | à relire |
| Lecture d'*enfant* | Isidore, XI, 2, 9 (dents encore mal rangées) ; *Différences* et Augustin, XVI, non retenus | Isidore complète l'histoire par la raison qu'il donne ; les deux autres la redisent | à relire |
| Mots étrangers des lectures | *femur*, *patratio*, *vir*, *sponsores*, *FOS* paraphrasés, non cités | règle : un mot étranger cité dans un texte est une forme de la chaîne | à relire |
| Seconde relecture | propositions adoptées telles quelles : textes des lectures de *famille*, *foyer*, *père*, *mariage*, *époux* nommant les mots tels que la citation les écrit (*femore*, *FOS*, *foveant*, *patratione*, *vir*, *eius*, *spondebant*…) ; citation de *père* allongée (« Patratio enim est rei veneriae consummatio. ») ; *patrie* : lecture d'Isidore, XIV, 5, 19, drapeau `tradition`, `corpus` corrigé ; *orphelin* : Isidore, XI, 2, 12, noté au `corpus` comme écarté (redit l'histoire) | justes ; le texte d'une lecture peut nommer le mot que l'auteur lit, tel que sa citation l'écrit | à relire |

## 2026-10-05 — Lot 17 (passe 1 : parole, parabole, verbe, mot, nom, discours, fable, récit)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Doublet *parole* / *parabole* | déclaré sur *parole* | le Littré (*parole* : « le même que le latin *parabola*, parabole » ; *parabole* : « comparez PAROLE ») et le TLFi (*parabole* : « Voir aussi parole ») | à relire |
| Chaîne de *parole* | *parabola* (latin ecclésiastique), « parabole, discours », puis *παραβολή*, « comparaison, rapprochement » ; sans *\*paraula* ni *παραβάλλω* | *\*paraula* n'est qu'une étape phonétique (TLFi) ; « comparaison » dit ce que *parole* doit à son étymon ; *παραβάλλω*, « mettre à côté », éclaire la parabole, non la parole : il va sur la fiche *parabole* | à relire |
| Chaîne de *parabole* | *parabola* (latin ecclésiastique, sans sens), *παραβολή*, « comparaison, rapprochement », *παραβάλλω*, « jeter auprès de, mettre à côté » (*παρά*, « auprès de » ; *βάλλω*, « lancer, jeter ») | le Littré et le TLFi dérivent *παραβολή* de *παραβάλλω* ; le sens ecclésiastique de *parabola* est celui du français | à relire |
| Une seule fiche *parabole* | récit allégorique et courbe dans la même fiche ; le sens géométrique daté dans l'explication | le TLFi les traite en une entrée, les deux viennent de *παραβολή* ; la courbe seule ne remplirait pas le §3.3 | à relire |
| Chemin de *parabole* | `consacre` ; *parole* et *verbe* : `ordinaire` | terme profane de rhétorique devenu le nom des paraboles de l'Évangile ; *parole* et *verbe* ont un sens religieux parmi d'autres | à relire |
| Lien de *parole* vers *verbe* | dans l'explication : *parabola* « a supplanté […] le mot latin d'où vient verbe, réservé au Verbe divin » | le Littré et le TLFi le disent ; le lien s'explique en une phrase ; *verbum* n'étant pas une forme de la chaîne de *parole*, il n'est pas nommé | à relire |
| Chaîne de *verbe* | *verbum* seul, « mot, parole » ; sans *εἴρω* | le Littré dit *verbum* « se rattache » à *εἴρω*, le Lewis & Short parle d'une racine commune ; le TLFi s'arrête à *verbum* | à relire |
| Chaîne de *mot* | *muttum* (bas latin), « grognement, murmure » ; *muttire* non retenu | *muttire*, « grommeler, marmonner », ne dirait rien de plus (règle *famulus*, lot 16) ; langue « bas latin » selon le TLFi, bien que le Lewis & Short cite Lucilius | à relire |
| Chaîne de *nom* | *nomen* seul, « nom, renom » ; rapprochement avec *gnoscere* non retenu | le Lewis & Short l'affirme (*gnomen*), le Littré le rapporte aux étymologistes sans le prendre à son compte, le TLFi n'en dit rien ; aucune source récente ne l'établit | à relire |
| Chaîne de *discours* | *discursus* seul, « action de courir çà et là » ; sans *discurrere* ; l'influence de *cours* (TLFi) non retenue en `croisement` | *discurrere* ne dirait rien de plus ; l'influence de *cours* porte sur la forme, sans apprendre un sens | à relire |
| Chaîne de *fable* | *fabula* seul, « propos, paroles » ; sans *fari* ; *enfant* en famille | *fari*, « parler », ne dirait rien de plus ; le Littré renvoie d'*enfant* à FABLE (*in-* et *fari*) | à relire |
| Chaîne de *récit* | *réciter* (français), puis *recitare*, « lire à haute voix » ; sans *citare* | *récit* est le déverbal de *réciter* (TLFi) ; *citare*, « appeler, convoquer », n'éclaire pas *récit* | à relire |
| Renvois | *parole* → *mot*, *langue* ; *mot* → *nom* ; *parabole* → *allégorie*, *fable* ; *fable* → *récit*, *mythe* ; *récit* → *histoire* ; *discours* → *éloquence* (candidats : *langue*, *allégorie*, *mythe*, *histoire*, *éloquence*) | notions voisines sans racine commune, déclarées d'un seul côté | à relire |
| Drapeau `tradition` | posé sur *parabole*, *verbe*, *nom*, *discours*, *fable* ; non posé sur *parole*, *mot*, *récit* | Isidore lit *parabola* (I, 37, 33 ; VI, 8, 13), *verbum* (I, 9, 1), *nomen* (I, 7, 1), *fabula* (I, 40, 1) ; Thomas d'Aquin lit *discursus* (Ia, q. 58, a. 3, ad 1) ; rien qui lise *parabola* au sens de parole, *muttum* ou *recitare* | à relire |
| Thèmes | `parole` pour tous ; *parabole* : `religion`, `parole` ; *verbe* : `parole`, `religion` | le domaine de l'usage d'aujourd'hui | à relire |

## 2026-10-05 — Lot 17 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Verdicts | propositions du relecteur adoptées telles quelles : explications de *parole*, *parabole*, *verbe*, *mot*, *nom*, *discours* ; langue de *muttum* : `latin` ; fait du TLFi ajouté au dossier de *nom* (sens vieilli : l'ensemble de ceux qui portent un même nom) | toutes justes et sourcées | à relire |
| Lectures | *verbe* : Isidore, I, 9, 1 ; Thomas d'Aquin, Ia, q. 34, a. 1, co. ; *nom* : Isidore, I, 7, 1 ; *fable* : Isidore, I, 40, 1 ; *discours* : Thomas d'Aquin, Ia, q. 58, a. 3, ad 1 ; *parabole* : Isidore, VI, 8, 13 | chaque passage lit une forme de la chaîne et dit autre chose que l'histoire, ou la complète | à relire |
| Non retenus | Isidore, I, 37, 33 (*parabola*, comparaison entre choses dissemblables : conforme à l'histoire) ; Augustin, *De la doctrine chrétienne*, I (*verbum quod corde gestamus*) ; Thomas, Ia, q. 1, a. 10, ad 3 (*parabolicus*, hors chaîne) | conforme ; œuvre sans fiche, et Thomas dit la même distinction ; forme absente de la chaîne | à relire |

## 2026-10-05 — Lot 18 (passe 1 : joie, plaisir, délice, volupté, désir, envie, jalousie, zèle, colère)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaîne de *joie* | *gaudia* (bas latin), puis *gaudium*, « joie intérieure, contentement » ; sans *gaudere* ni *γαίω* | le TLFi part du pluriel *gaudia* pris pour un féminin ; « joie intérieure » d'après le Lewis & Short (opposée à *laetitia*) ; le verbe n'ajoute rien | à relire |
| Chaîne de *plaisir* | *plaisir* (ancien français, infinitif), puis *placere*, « plaire, être agréable, agréer » | le TLFi et le Littré : emploi substantivé de l'ancien infinitif ; le « cf. placo » du Lewis & Short n'est pas une étymologie | à relire |
| Chaîne de *délice* | *deliciae*, puis *delicere*, « détourner du droit chemin par l'attrait » ; sans éléments ni *lacere* | le Lewis & Short (*deliciae* de *delicio*) et le Littré (*delicire*) ; aucune source ne glose *de-* pour ce composé ; *lacere*, « attirer », ne dit rien de plus | à relire |
| Nature de *délice* | `nom masculin` | absente du Littré local ; le TLFi la donne | à relire |
| Chaîne de *volupté* | *voluptas* seul, « plaisir, de l'âme comme du corps » | *volup* n'ajoute rien ; *ἔλπομαι* et *velle* (Littré, Lewis & Short) sont des apparentés, non des maillons, et aucune source récente ne les recoupe | à relire |
| Chaîne de *désir* | *désirer* (français), *desiderare*, « regretter l'absence de, souhaiter » (`premier`), *sidus*, « astre, constellation », `incertain: true` | cohérente avec *considérer* ; le Lewis & Short dit l'étymologie douteuse (« cf. considero ») ; Festus (Paul Diacre, p. 75 Müller) l'affirme ; le TLFi et le Littré s'arrêtent à *desiderare* ; rien n'est dit de ce que *desiderare* aurait signifié d'après *sidus* | à relire |
| Chaîne d'*envie* | *invidia*, puis *invidere*, « regarder d'un œil malveillant, jeter le mauvais œil » (*in*, « en » ; *videre*, « voir ») | le Littré (*in*, *videre*, « fixer les yeux sur ») et le Lewis & Short (sens propre d'*invideo*) ; *invidus* n'ajoute rien | à relire |
| *Jalousie* et *zèle* | famille et lien dans l'explication, pas de doublet | *zèle* vient de *zelus*, *jalousie* de *jaloux*, de *zelosus*, dérivé de *zelus* : pas le même étymon par deux voies | à relire |
| Sens de *ζῆλος* | « ardeur, émulation, jalousie », le même sur *jalousie* et *zèle* ; *zelus* sans sens | les trois premiers sens du Bailly ; *zelus* les redit | à relire |
| *ζέω* pour *zèle* | ni maillon, ni écartée | le Littré le donne ; le Bailly (2020) rattache *ζῆλος*, avec un « peut-être », à une autre racine, sans écarter expressément *ζέω* ; le TLFi s'arrête à *ζῆλος* | à relire |
| Sens premier de *colère* | *χολέρα*, « choléra » (le plus lointain maillon), après *cholera*, « maladie bilieuse, bile » ; sans *χολή* | le Bailly, le Littré et le TLFi s'accordent : *χολέρα* nomme le choléra ; *χολή* n'y est apparenté que « peut-être » (Bailly) | à relire |
| Familles | seulement les mots que les sources nomment (*plaire* ; *délecter*, *délectation* ; *désirer* ; *envier*, *envieux* ; *jaloux* ; *zélé*, *jaloux*, *jalousie*) | rien de mémoire | à relire |
| Renvois | *joie* → *plaisir*, *bonheur* ; *plaisir* → *volupté* ; *délice* → *plaisir* ; *volupté* → *luxure* ; *désir* → *envie*, *appétit* ; *envie* → *jalousie* ; *zèle* → *ferveur* ; *colère* → *fureur*, *rage* | notions voisines sans racine commune, déclarées d'un seul côté | à relire |
| Drapeau `tradition` | posé sur *joie*, *délice*, *désir*, *envie*, *jalousie*, *zèle*, *colère* ; non posé sur *plaisir*, *volupté* | Isidore (*Différences* : *gaudium*/*laetitia* ; X, 134 : *invidus* ; XX : *deliciae* ; IV : *cholera*), Thomas (Ia-IIae, q. 31, a. 3 : *gaudium* ; q. 28, a. 4 : *zelus*), Festus (*desiderare*) ; rien qui lise *placere* ou *voluptas* | à relire |
| Thèmes | `émotions` pour tous ; *volupté* : `émotions`, `corps` ; *envie* : `émotions`, `morale` ; *zèle* : `morale`, `religion` | le domaine de l'usage d'aujourd'hui | à relire |

## 2026-10-05 — Lot 18 (passe 2)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Verdicts | propositions du relecteur adoptées telles quelles : explications de *joie* (*gaudium* opposé, non réservé), *volupté* (ce qui a changé : la délectation de l'esprit seulement en 1588), *jalousie* (« entre 1181 et 1191 ») ; renvois retirés : *plaisir* → *volupté*, *délice* → *plaisir*, *désir* → *envie*, *envie* → *jalousie*, *zèle* → *ferveur* | justes : un mot nommé dans une explication n'est pas aussi un renvoi ; les dates et les sens suivent le dossier | à relire |
| Lectures | *joie* : Isidore, *Différences*, I, 265, et Thomas d'Aquin, Ia-IIae, q. 31, a. 3, co. ; *délice* : Isidore, XX, 2, 6 ; *envie* : Isidore, *Différences*, I, 610 ; *jalousie* : Thomas, Ia-IIae, q. 28, a. 4, co. (amour de convoitise) ; *zèle* : le même article (amour d'amitié, *zelare pro Deo*) ; *colère* : Isidore, IV, 5, 3-4 | chaque passage lit une forme de la chaîne et dit autre chose que l'histoire, ou la complète ; l'article de Thomas sur *zelus* partagé selon ses deux parties, une par fiche | à relire |
| Non retenus | Festus (Paul Diacre, p. 75 Müller) pour *désir* ; Isidore, X, 134 (*invidus*) ; Isidore, XIV, 3, 2 (*Eden*) ; Isidore, *Différences*, I, 610 pour *zèle* ; Thomas, Ia-IIae, q. 48, a. 2, ad 1 | Festus redit le rattachement à *sidus* sans rien dire du sens ; *invidus* et *Eden* sont hors chaîne ; le *zelus* en bonne part est l'histoire même ; Thomas y lit *ira*, non *cholera* | à relire |
| `data/candidats/z.yaml` | supprimé | `npm run rediger` l'a laissé vide après avoir retiré *zèle*, son seul candidat ; un fichier vide est refusé par la validation, et les initiales sans candidat n'ont pas de fichier | à relire |

## 2026-10-09 — Relecture de validation (lots 4 à 18, puis fiches hors lots)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Fiches relues | lots 4 à 18 (129 fiches) et 41 fiches hors lots ; conformes aux dossiers après les corrections ci-dessous | relecture contre le Littré local, l'étymologie du TLFi et la bibliothèque `sources` (Lewis & Short, Bailly) | à valider |
| *crédit* | renvoi *dette* retiré | « dette » est nommé dans l'explication : un mot déjà nommé n'est pas aussi un renvoi (règle du lot 18) | à relire |
| *considérer* | renvoi *estimer* retiré (*contempler* gardé) | l'explication dit « l'estime » : même règle | à relire |
| *moment* | l'explication ne rattache plus « moment d'une force » à 1634 : 1634 est le « produit d'un bras de levier par la force », l'expression datant de 1811 (TLFi) | exactitude du fait daté | à relire |
| *franc*, *opulent*, *homme*, *schizophrénie* | sans changement, après contrôle | dates de *franc* confirmées par l'article *adjectif* du TLFi ; énumération d'*opulent* tirée des exemples de Lewis & Short ; *humus* maillon voulu, `incertain` ; *Schizophrenie* 1908 = décision du lot B | à relire |
| *travail* | chaîne laissée à *trepalium*, sans *τριπάσσαλον* | le TLFi donne *τριπάσσαλον*, « trois pieux » (grec byzantin), comme calque **probable** de *trepalium* : l'ajouter changerait le sens premier et demande la langue « grec byzantin » — à trancher (§3.2) | à relire |

## 2026-10-09 — Lot « affection » (aimer, amour, affection, adorer, amateur, charité)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaînes d'*aimer*, *amour*, *amateur* | *amare*, *amor*, *amator* seuls, un maillon par fiche ; pas de maillon commun repris | règle d'arrêt (§3.2), comme *œuvre*/*ouvrier* (lot 11) | à relire |
| Chaîne d'*adorer* | *adorare*, « rendre un culte », décomposé de *ad*, « vers », et *orare*, « prier » | le Littré (*ad* + *orare*) et le TLFi (dér. de *orare*) ; la composition dit « adresser une prière » | à relire |
| Chaîne d'*affection* | *affectio* seul, « disposition de l'âme reçue d'une influence » | *affectio* est la source directe ; le sens médical français ne vient pas du maillon | à relire |
| Chaîne de *charité* | *caritas*, « cherté ; amour, tendresse », puis *carus*, « cher » | le Littré tire *caritas* de *carus* ; « cherté » éclaire le nom | à relire |
| Chemin de *charité* | `consacre` | *caritas* profane (cherté) devenu le nom de l'amour du prochain (agapè) | à relire |
| Renvois | *adorer* → *aimer* ; *charité* → *misericorde* | notions voisines, sans racine commune, d'un seul côté ; *amour* → *passion* retiré (« passion » nommé dans l'explication) | à relire |
| Lectures traditionnelles | ajoutées et vérifiées en ligne : *amour* (Augustin, *Cité de Dieu*, XIV, 28 : deux amours ont fait deux cités), *adorer* (Thomas, IIa-IIae q. 84 a. 1 : l'adoration est l'acte de la religion), *charité* (Thomas, IIa-IIae q. 23 a. 1 : la charité, amitié de l'homme pour Dieu) | `npm run verifier:en-ligne` : 3/3 citations trouvées | faites |

## 2026-10-09 — Lot « regard » (respect, suspect, soupçon, mépris, dédain, admirer)

| Sujet | Décision | Raison | Relecture |
|---|---|---|---|
| Chaînes de *respect*, *suspect*, *soupçon* | *respectus* (*re* + *specere*), *suspectus*/*suspicere* (*susum* + *specere*), *suspicio*/*suspicere* | même racine *specere* ; la composition se découpe du tout vers les parties (§3.2) | à relire |
| Chaîne de *mépris* | *mépriser* (*mes-* + *priser*), puis *pretium*, « prix » | *mépriser* = « priser mal » ; le sens premier est *pretium* : le mépris est un jugement porté sur un prix | à relire |
| Chaîne de *dédain* | *dédaigner* (*dé-* + *daigner*), puis *dignus*, « digne » | *dédaigner* = « ne plus juger digne » ; *daigner* vient de *dignari*, de *dignus* | à relire |
| Chaîne d'*admirer* | *admirari*, « admirer », puis *mirari*, « regarder » | *admirari* est une forme composée : son sens est attesté, non déduit des parties (§3.4) | à relire |
| Renvois | *suspect* → *doute* ; *mépris* → *dédain* ; *admirer* → *respect* | notions voisines sans racine commune, déclarées d'un seul côté | à relire |
| Lecture traditionnelle | *admirer* : *admiratio*, « désir de savoir », cause de plaisir (Thomas d'Aquin, Ia-IIae q. 32 a. 8) ; rien de net pour les autres | vérifiée en ligne (1/1) | faite |
