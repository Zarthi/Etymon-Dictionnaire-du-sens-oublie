import { describe, expect, it } from "vitest";
import { translitterer } from "./grec.ts";

describe("translitterer (adresses de bailly.app)", () => {
  it.each([
    ["κριτικός", "kritikos"],
    ["φρήν", "phrēn"],
    ["σχίζω", "schizō"],
    ["ἀγών", "agōn"],
    ["ἄσυλον", "asylon"],
    ["αὐστηρός", "austēros"],
    ["ἀποκάλυψις", "apokalypsis"],
    ["ἐλεημοσύνη", "eleēmosynē"],
    ["ἁμαρτία", "hamartia"],
    ["ὁδός", "hodos"],
    ["ἱερός", "hieros"],
    ["ῥήτωρ", "rhētōr"],
    ["ῥυθμός", "rhythmos"],
    ["ψυχή", "psychē"],
    ["ξένος", "xenos"],
    ["εὐαγγέλιον", "euangelion"],
    ["ἄγκυρα", "ankyra"],
    ["ἐγκύκλιος", "enkyklios"],
    ["συμπάθεια", "sympatheia"],
    ["οὐσία", "ousia"],
    ["μοῦσα", "mousa"],
    ["ὑγίεια", "hygieia"],
    ["ζῷον", "zōon"],
    ["ζώϊον", "zōion"],
    ["ᾠδή", "ōdē"],
    ["ἦθος", "ēthos"],
    ["Ὠκεανός", "Ōkeanos"],
    ["αὑτός", "hautos"],
    ["ὑβρίζω", "hybrizō"],
  ])("%s → %s", (grec, attendu) => expect(translitterer(grec)).toBe(attendu));
});
