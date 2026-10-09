# Export des données (contrat pour un autre projet)

`npm run export` écrit `export/etymon.json` : un **instantané stable et versionné** des données
d'Étymon, destiné à un consommateur hors de l'app — aujourd'hui le jeu **Sphynx**, qui en fait un
mod hors ligne (`etymon:`, voir `projet-sphynx/docs/questions/0045-dictionnaire-etymon-dependance-hors-ligne.md`).

Ce n'est pas un fichier de l'app : il ne se régénère **pas** au build, il se **publie**. Sa forme
est un contrat ; son champ `version` s'incrémente quand elle change (ajout, retrait ou
changement de sens d'un champ).

## Forme

```jsonc
{
  "version": 2,
  "fiches": [ /* FicheIdentifiee : le schéma de src/lib/schema.ts, + id */ ],
  "racines": [ /* RacineIdentifiee : le schéma de src/lib/schema.ts, + id */ ],
  "ouvrages": [ /* Ouvrage : pour l'attribution, que la licence CC BY-SA exige */ ],
  "langues": [ "latin", "grec ancien", … ],
  "themes": [ "esprit", … ]
}
```

- **Toutes** les fiches sont exportées, `a-verifier`, `brouillon` et `validee`, avec leur `statut` :
  c'est le consommateur qui décide ce qu'il publie (le jeu peut n'afficher que les `validee`, ou
  signaler les autres comme l'app le fait).
- `racines` : les racines grecques et latines (`data/racines`), entrées de plein droit du
  dictionnaire. Comme les autres données, elles sont exportées brutes : la liste des mots issus
  d'elles se recalcule à partir des fiches (même forme à la translittération près, même famille de
  langue), comme l'app le fait à l'assemblage.
- `fiches`, `racines` et `ouvrages` sont **triés par `id`** : l'export est déterministe, quel que
  soit l'ordre des fichiers sur le disque.
- Aucun dérivé n'est recalculé (doublets symétriques, adresses d'entrées, mots issus d'une racine) :
  le consommateur applique le même calcul s'il en a besoin, ou s'en passe.

## Droits

Les fiches et les ouvrages sont sous **CC BY-SA 4.0** (voir `data/LICENSE.md`). Qui réutilise
l'export doit **créditer Étymon** et placer ses dérivés sous la même licence. C'est pourquoi le
côté Sphynx range l'export dans un **mod à part**, porteur de sa propre licence.
