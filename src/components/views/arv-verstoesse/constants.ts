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

export const VIOLATION_TYPE_LABELS: Record<ArvViolationType, string> = {
  pause: "Pause",
  rest: "Ruhezeit",
  work: "Arbeitszeit",
  driving: "Lenkzeit",
  weekly_rest: "Wochenruhe",
  other: "Sonstiges",
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
