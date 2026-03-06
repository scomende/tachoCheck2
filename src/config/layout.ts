/**
 * US-04: Konfiguration für App-Shell (Tabs, Dropdowns).
 * Tabs ergänzen/umbenennen: TABS-Array anpassen.
 * Kostenstelle/Rayon mit echten Daten: Optionen aus API/Context laden und hier einspeisen.
 */

export const APP_TITLE = "Tacho Check" as const;

export const TABS = [
  { label: "Fahrerkarten", href: "/fahrerkarten" },
  { label: "ARV-Verstoesse", href: "/arv-verstoesse" },
  { label: "Betriebskontrolle", href: "/betriebskontrolle" },
  { label: "Fahrzeuge", href: "/fahrzeuge" },
] as const;

/** Mock – später durch API/Context ersetzen */
export const KOSTENSTELLE_OPTIONS = [
  "9976 Zürich",
  "2849 Genf Rive",
  "2850 Bern Wankdorf",
] as const;

/** Mock – später durch API/Context ersetzen */
export const RAYON_OPTIONS = ["Alle PEEs", "PEE Nord", "PEE Süd", "PEE West"] as const;

export const LANG_OPTIONS = ["DE", "FR", "IT"] as const;

/** Mock – später durch Auth/Context ersetzen */
export const DEFAULT_USER_DISPLAY_NAME = "Marcel Muster" as const;
