/**
 * Labels und Optionen für ARV-Verstoss-Report (Schweregrad, Status, Verstosstyp).
 */
import type {
  ArvViolationSeverity,
  ArvViolationStatus,
  ArvViolationType,
} from "@/domain/drivingTypes";

export const SEVERITY_LABELS: Record<ArvViolationSeverity, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Gering",
};

export const STATUS_LABELS: Record<ArvViolationStatus, string> = {
  open: "Offen",
  acknowledged: "Bestätigt",
  signed: "Unterschrieben",
  closed: "Abgeschlossen",
};

/**
 * Status-Badges: immer Light-Mode-Farben (auch bei dunklem App-Theme), für einheitliche Lesbarkeit.
 */
export const STATUS_BG_COLORS: Record<ArvViolationStatus, string> = {
  open: "bg-amber-50 text-amber-950",
  acknowledged: "bg-emerald-50 text-emerald-950",
  signed: "bg-slate-100 text-slate-900",
  closed: "bg-sky-50 text-sky-950",
};

export const VIOLATION_TYPE_LABELS: Record<ArvViolationType, string> = {
  pause: "Pause",
  rest: "Ruhezeit",
  work: "Arbeitszeit",
  driving: "Lenkzeit",
  weekly_rest: "Wochenruhe",
  other: "Sonstiges",
};

/** Hintergrundfarbe für den Verstosstyp-Tag (kleiner farbiger Punkt/Badge). */
export const VIOLATION_TYPE_COLORS: Record<ArvViolationType, string> = {
  driving: "bg-red-500",      // Lenkzeit = Rot
  work: "bg-blue-500",       // Arbeitszeit = Blau
  rest: "bg-green-500",      // Ruhezeit = Grün
  pause: "bg-emerald-400",   // Pause = Grün-Ton
  weekly_rest: "bg-green-600", // Wochenruhe = Dunkelgrün
  other: "bg-muted-foreground/40",
};

export const SEVERITY_OPTIONS: { value: ArvViolationSeverity; label: string }[] = [
  { value: "high", label: SEVERITY_LABELS.high },
  { value: "medium", label: SEVERITY_LABELS.medium },
  { value: "low", label: SEVERITY_LABELS.low },
];

export const STATUS_OPTIONS: { value: ArvViolationStatus; label: string }[] = [
  { value: "open", label: STATUS_LABELS.open },
  { value: "acknowledged", label: STATUS_LABELS.acknowledged },
  { value: "signed", label: STATUS_LABELS.signed },
  { value: "closed", label: STATUS_LABELS.closed },
];

/** Hervorhebung Mitarbeitername bei globaler Toolbar-Suche oder -Auswahl (Tab Verstösse). */
export const GLOBAL_TOOLBAR_DRIVER_NAME_HIGHLIGHT_CLASS =
  "rounded px-1.5 py-0.5 font-semibold bg-amber-200/95 text-foreground shadow-sm not-italic dark:bg-amber-500/35 dark:text-amber-50";
