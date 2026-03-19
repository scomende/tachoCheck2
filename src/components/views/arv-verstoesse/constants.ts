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

/** Sehr helle Hintergrundfarben für Status-Badges (z. B. in Original/Korrigiert-Spalten). */
export const STATUS_BG_COLORS: Record<ArvViolationStatus, string> = {
  open: "bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200",
  acknowledged: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  signed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  closed: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
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
