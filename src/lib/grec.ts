/** Lettres grecques et leur translittération, à la manière de bailly.app : η → ē, ω → ō, χ → ch. */
const LETTRES: Record<string, string> = {
  α: "a", β: "b", ϐ: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "ē", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m",
  ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "ph", χ: "ch", ψ: "ps", ω: "ō",
};
const VOYELLES = "αεηιοωυ";
const ESPRIT_RUDE = "̔";
const TREMA = "̈";

/**
 * Translittération d'un mot grec, telle que bailly.app la donne dans ses adresses :
 * accents et iota souscrit omis, esprit rude noté h (ῥ → rh), γ nasal noté n (γγ → ng),
 * υ noté u dans une diphtongue (αυ, ευ, ου) et y ailleurs, majuscule conservée.
 * ἁμαρτία → hamartia, φρήν → phrēn, εὐαγγέλιον → euangelion, Ὠκεανός → Ōkeanos.
 */
export function translitterer(mot: string): string {
  const lettres = [...mot.normalize("NFD")].reduce<{ base: string; signes: string }[]>((acc, c) => {
    if (/\p{M}/u.test(c)) acc.at(-1)!.signes += c;
    else acc.push({ base: c, signes: "" });
    return acc;
  }, []);
  // L'esprit rude se place sur la première voyelle, ou sur la seconde d'une diphtongue initiale (αὑτός).
  const initiale = lettres.findIndex((l) => !VOYELLES.includes(l.base.toLowerCase()));
  const rude = lettres.slice(0, initiale === -1 ? lettres.length : Math.max(initiale, 1)).some((l) => l.signes.includes(ESPRIT_RUDE));
  let sortie = "";
  lettres.forEach(({ base, signes }, i) => {
    const minuscule = base.toLowerCase();
    const suivante = lettres[i + 1]?.base.toLowerCase() ?? "";
    const precedente = lettres[i - 1]?.base.toLowerCase() ?? "";
    let t = LETTRES[minuscule] ?? minuscule;
    if (minuscule === "γ" && "γκξχ".includes(suivante) && suivante !== "") t = "n";
    if (minuscule === "υ" && "αεηο".includes(precedente) && precedente !== "" && !signes.includes(TREMA)) t = "u";
    if (i === 0 && minuscule === "ρ" && signes.includes(ESPRIT_RUDE)) t = "rh";
    if (i === 0 && rude && minuscule !== "ρ") t = `h${t}`;
    sortie += base !== minuscule ? t[0].toUpperCase() + t.slice(1) : t;
  });
  return sortie;
}
