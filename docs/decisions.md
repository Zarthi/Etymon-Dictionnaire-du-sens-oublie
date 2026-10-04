# Journal des décisions

Quand un point attendrait Thibault, l'agent ne s'arrête pas : il décide, applique, et note ici la
décision et sa raison. Thibault relit ce journal et confirme ou infirme ; une décision infirmée
se défait, et la correction se note sur sa ligne. Le plus récent en haut.

Restent à Thibault seul, sans décision provisoire : passer une fiche en `validee`, écarter un mot,
changer un principe d'AGENTS.md (l'agent y décide pour le lot en cours, sans toucher AGENTS.md).

Relecture : `à relire` (par défaut), `confirmée`, `infirmée : <ce qui a été fait>`.

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
