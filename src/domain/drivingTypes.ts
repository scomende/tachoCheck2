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

/** Herkunft der Segmentdaten (Tachograph vs. manuelle Erfassung). */
export type SegmentDataSource = "digital" | "manual";

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
  /** Optional: zugeordnetes Fahrzeug (ID aus Fahrzeug-Register). */
  vehicleId?: string;
  /** Datenherkunft: digital (Tacho) oder manuell vom Fahrer:in. */
  dataSource?: SegmentDataSource;
  /** Optionaler Kommentar (z.B. manuelle Ergänzung). */
  comment?: string;
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

/** US-05: ARV-Verletzung (Arbeits- und Ruhezeitverordnung). */
export type ArvViolationSeverity = "low" | "medium" | "high";

/** Status für den ARV-Verletzungsreport (offen, bestätigt, unterschrieben, abgeschlossen). */
export type ArvViolationStatus = "open" | "acknowledged" | "signed" | "closed";

/** Kategorie der Verletzung (Pause, Ruhezeit, Arbeitszeit, Lenkzeit, …). */
export type ArvViolationType =
  | "pause"
  | "rest"
  | "work"
  | "driving"
  | "weekly_rest"
  | "other";

export type ArvViolation = {
  /** Eindeutige ID für Liste/Detail (Report-Ansicht). */
  id?: string;
  /** Tag der Verletzung (YYYY-MM-DD). */
  date: string;
  /** Kurzbeschreibung (z.B. „Maximale Tagesarbeitszeit überschritten“). */
  description: string;
  /** Optionale Schwere (z.B. für Icon/Label). */
  severity?: ArvViolationSeverity;
  /** Fahrer:in (für Report-Ansicht). */
  driverId?: string;
  /** Verletzungstyp (Pause, Ruhezeit, …). */
  violationType?: ArvViolationType;
  /** Betroffene Regel (z.B. „ARV Art. 9 Abs. 2“). */
  rule?: string;
  /** Zeitraum der Verletzung (z. B. 06:00–12:00). */
  timeRange?: { start: TimeString; end: TimeString };
  /** true = Auswertung auf korrigierten Daten. */
  useCorrectedData?: boolean;
  /** Status im Report. */
  status?: ArvViolationStatus;
};
