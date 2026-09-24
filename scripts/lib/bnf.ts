/**
 * Notices d'autorité de la BnF (Licence ouverte), lues par l'API SRU du catalogue au format
 * UNIMARC : forme retenue, variantes, dates, note. Source des faits des fiches d'auteurs et
 * d'ouvrages (noms, dates).
 */
const SRU = "https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&recordSchema=unimarcxchange";

export interface Notice {
  cb: string;
  type: "personne" | "oeuvre";
  /** Élément d'entrée (Bleuler, Cicéron) ou titre de l'œuvre. */
  entree: string;
  /** Prénom ou partie rejetée (Eugen), pour une personne. */
  rejet?: string;
  /** Auteur d'une œuvre, tel que la notice le nomme. */
  auteur?: string;
  naissance?: string;
  mort?: string;
  /** Date d'une œuvre. */
  date?: string;
  variantes: string[];
  note?: string;
}

/** Sous-zones d'une zone UNIMARC : code → valeurs. */
function sousZones(zone: string): Map<string, string[]> {
  const valeurs = new Map<string, string[]>();
  for (const [, code, valeur] of zone.matchAll(/code="(\w)">([^<]*)</g)) valeurs.set(code, [...(valeurs.get(code) ?? []), valeur.trim()]);
  return valeurs;
}

/** Année d'une date codée (zone 103) : « 18570430 » → 1857, « -01060103 » → 106 av. J.-C. ; incomplète (« 19.. ») : rien. */
export function annee(code: string | undefined): string | undefined {
  const m = /^(-?)(\d{4})/.exec(code ?? "");
  if (!m) return undefined;
  const n = Number(m[2]);
  return m[1] ? `${n} av. J.-C.` : String(n);
}

/** Notices d'une réponse SRU. */
export function lireNotices(xml: string): Notice[] {
  const notices: Notice[] = [];
  for (const [, cb, corps] of xml.matchAll(/id="ark:\/12148\/(cb\w+)"[^>]*>([\s\S]*?)<\/mxc:record>/g)) {
    const zones = new Map<string, Map<string, string[]>[]>();
    for (const [, tag, zone] of corps.matchAll(/<mxc:datafield tag="(\d+)"[^>]*>([\s\S]*?)<\/mxc:datafield>/g)) {
      zones.set(tag, [...(zones.get(tag) ?? []), sousZones(zone)]);
    }
    const premiere = (tag: string, code: string) => zones.get(tag)?.[0]?.get(code)?.[0];
    const [naissance, mort] = (premiere("103", "a") ?? "").trim().split(/\s+/);
    const note = premiere("300", "a");
    const commun = { cb, variantes: [] as string[], ...(note ? { note } : {}) };
    if (zones.has("200")) {
      notices.push({
        ...commun,
        type: "personne",
        entree: premiere("200", "a") ?? "",
        ...(premiere("200", "b") ? { rejet: premiere("200", "b") } : {}),
        ...(annee(naissance) ? { naissance: annee(naissance) } : {}),
        ...(annee(mort) ? { mort: annee(mort) } : {}),
        variantes: (zones.get("400") ?? []).map((z) => [z.get("a")?.[0], z.get("b")?.[0]].filter(Boolean).join(", ")),
      });
    } else if (zones.has("230") || zones.has("240")) {
      // 230 : titre d'une œuvre anonyme (Talmud) ; 240 : auteur et titre (Thomas More, Utopia).
      // Leurs variantes : 430 $a, ou 440 $t (le titre, sans l'auteur).
      const anonyme = zones.has("230");
      notices.push({
        ...commun,
        type: "oeuvre",
        entree: (anonyme ? premiere("230", "a") : premiere("240", "t")) ?? "",
        ...(premiere("240", "a") ? { auteur: premiere("240", "a") } : {}),
        ...(annee(naissance) ? { date: annee(naissance) } : {}),
        variantes: (zones.get(anonyme ? "430" : "440") ?? []).map((z) => z.get(anonyme ? "a" : "t")?.[0] ?? "").filter((v) => v !== ""),
      });
    }
  }
  return notices;
}

async function interroger(requete: string, nombre: number): Promise<Notice[]> {
  const reponse = await fetch(`${SRU}&maximumRecords=${nombre}&query=${encodeURIComponent(requete)}`);
  if (!reponse.ok) throw new Error(`BnF : HTTP ${reponse.status}`);
  return lireNotices(await reponse.text());
}

/**
 * Notices de personnes ou d'œuvres dont un point d'accès contient tous les mots cherchés, les plus
 * probables d'abord : l'API ne classe pas, on met devant la forme retenue égale à un mot cherché,
 * puis les notices riches en variantes (Cicéron en a cent, un homonyme obscur aucune).
 */
export async function chercherNotices(type: Notice["type"], texte: string): Promise<Notice[]> {
  const echappe = texte.replaceAll('"', "");
  const requete = type === "personne" ? `aut.accesspoint all "${echappe}" and aut.type all "PEP"` : `aut.accesspoint all "${echappe}"`;
  const mots = new Set(echappe.toLowerCase().split(/\s+/));
  const exacte = (n: Notice) => (mots.has(n.entree.toLowerCase()) ? 1 : 0);
  return (await interroger(requete, 50))
    .filter((n) => n.type === type)
    .sort((a, b) => exacte(b) - exacte(a) || b.variantes.length - a.variantes.length)
    .slice(0, 5);
}

export async function noticeDe(cb: string): Promise<Notice | undefined> {
  return (await interroger(`aut.persistentid all "ark:/12148/${cb}"`, 1))[0];
}
