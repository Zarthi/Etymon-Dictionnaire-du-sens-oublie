# Créer les fiches d'auteurs et d'ouvrages

> Généré par `npm run contrat` : ne pas modifier à la main. Rédaction autonome (docs/methode.md) ; AGENTS.md fait foi.

Pour chaque auteur ou ouvrage cité par une fiche du lot et qui n'a pas encore la sienne (`npm run rediger -- --essai` les dit « à créer ») :

1. Si `data/auteurs/<id>.yaml` (ou `data/ouvrages/<id>.yaml`) existe, rien à faire.
2. Cherche sa notice : `npm run bnf -- auteur "<nom> <année de naissance sur quatre chiffres>"` (`Augustin 0354`, `Bleuler 1857`) ; `npm run bnf -- ouvrage "<auteur> <titre>"`. Choisis la notice qui répond à ce que dit le dossier (dates, note).
3. Écris la fiche : `npm run bnf -- auteur --cb <cb> --id <id> --description "…" --modele "<ton modèle>" --reflexion "<ton niveau>"`, avec `--nom` si le nom usuel n'est pas « prénom nom » (Augustin, Cicéron), `--nom-complet` s'il diffère (Aurelius Augustinus), `--traditions` seulement pour un auteur qui parle dans une tradition (une tradition absente de la liste : `npm run liste -- traditions "<tradition>"` d'abord). Un ouvrage : `npm run bnf -- ouvrage --cb <cb> --id <id> --titre "<titre français>" --licence "<licence>" --description "…" --modele "…" --reflexion "…"`, avec `--auteur <id>` (l'auteur d'abord), `--abrege`, `--titre-original`.

## Règles

- Dates et forme d'entrée viennent de la notice : le script les pose, tu ne les écris pas.
- Description : 200 caractères au plus ; ce qui situe (époque, domaine, œuvre), pas une biographie, pas de jugement.
- Licence d'un ouvrage : domaine public, Licence ouverte, CC BY-SA, CC BY-NC-ND, non libre ; domaine public si l'auteur est mort depuis plus de soixante-dix ans.
- Sans notice qui réponde : la fiche du mot ne s'écrit pas ; signale-le. Jamais de fiche d'auteur écrite à la main.
