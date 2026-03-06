/**
 * US-02: Datenmodell für Fahrerkartensegmente.
 *
 * Weitere Segmenttypen ergänzen:
 * - In SegmentType einen neuen Literal-Typ hinzufügen (z.B. "pause" | "arbeit").
 * - In den Mockdaten (src/mock/drivingData.ts) Segmente mit type: "neuerTyp" anlegen.
 * - In der UI (z.B. Wochenansicht) ggf. Darstellung/Farbe pro type abbilden.
 */

/** Zeitspanne als ISO-8601 oder "HH:mm" (lokal). */
export type TimeString = string;

/** Dauer in Minuten. */
export type DurationMinutes = number;

export type SegmentType =
  | "driving"
  | "break"
  | "work"
  | "availability"
  | "other";

export type DrivingSegment = {
  /** Startzeit (z.B. "08:00" oder ISO-String). */
  start: TimeString;
  /**
   * Endzeit (z.B. "12:00"). Optional wenn duration gesetzt ist.
   * Es gilt: end ODER duration muss gesetzt sein.
   */
  end?: TimeString;
  /** Dauer in Minuten. Optional wenn end gesetzt ist. */
  duration?: DurationMinutes;
  type: SegmentType;
  /** Optional: zugeordnetes Fahrzeug. */
  vehicleId?: string;
};

export type DrivingDay = {
  /** Datum im Format YYYY-MM-DD. */
  date: string;
  segments: DrivingSegment[];
};

export type Driver = {
  id: string;
  name: string;
  /** Optional, z.B. "9976 Zürich". */
  kostenstelle?: string;
  /** Optional, z.B. "Alle PEEs". */
  rayon?: string;
  /** Optional, für Suche US-03 (z.B. "12345"). */
  personalNumber?: string;
};

/** Eine Woche pro Fahrer:in: 7 DrivingDays (Mo–So). */
export type DriverWeek = {
  driverId: string;
  /** Erster Tag der Woche (Montag) im Format YYYY-MM-DD. */
  weekStart: string;
  days: DrivingDay[];
};

/** US-05: ARV-Verstoss (Arbeits- und Ruhezeitverordnung). */
export type ArvViolationSeverity = "low" | "medium" | "high";

export type ArvViolation = {
  /** Tag des Verstosses (YYYY-MM-DD). */
  date: string;
  /** Kurzbeschreibung (z.B. „Maximale Tagesarbeitszeit überschritten“). */
  description: string;
  /** Optionale Schwere (z.B. für Icon/Label). */
  severity?: ArvViolationSeverity;
};
