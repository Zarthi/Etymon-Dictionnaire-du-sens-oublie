# Créer les fiches d'auteurs et d'ouvrages

> Généré par `npm run contrat` : ne pas modifier à la main. Étape de la rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Tu reçois des références demandées par les fiches d'un lot (type, identifiant, indication). Pour chacune :

1. Si `data/auteurs/<id>.yaml` (ou `data/ouvrages/<id>.yaml`) existe, rien à faire.
2. Cherche sa notice : `npm run bnf -- auteur "<nom> <année de naissance sur quatre chiffres>"` (`Augustin 0354`, `Bleuler 1857`) ; `npm run bnf -- ouvrage "<auteur> <titre>"`. Choisis la notice qui répond à l'indication (dates, note).
3. Écris la fiche : `npm run bnf -- auteur --cb <cb> --id <id> --description "…" --modele "<ton modèle>"`, avec `--nom` si le nom usuel n'est pas « prénom nom » (Augustin, Cicéron), `--nom-complet` s'il diffère (Aurelius Augustinus), `--traditions` seulement pour un auteur qui parle dans une tradition. Un ouvrage : `npm run bnf -- ouvrage --cb <cb> --id <id> --titre "<titre français>" --licence "<licence>" --description "…" --modele "…"`, avec `--auteur <id>` (l'auteur d'abord), `--abrege`, `--titre-original`.

## Règles

- Dates et forme d'entrée viennent de la notice : le script les pose, tu ne les écris pas.
- Description : 200 caractères au plus ; ce qui situe (époque, domaine, œuvre), pas une biographie, pas de jugement.
- Licence d'un ouvrage : domaine public, Licence ouverte, CC BY-SA, CC BY-NC-ND, non libre ; domaine public si l'auteur est mort depuis plus de soixante-dix ans.
- Sans notice qui réponde à l'indication : un échec, avec sa raison ; jamais de fiche écrite à la main.
