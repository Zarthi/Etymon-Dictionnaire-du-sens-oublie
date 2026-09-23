/**
 * Préfixe de découpage d'une fiche : ses deux premières lettres (« etonner » → « et »).
 * Il range les fiches YAML (`data/fiches/e/et/`) et les lots JSON de l'app (`fiches/et.json`).
 */
export function prefixe(id: string): string {
  return id.slice(0, 2);
}
