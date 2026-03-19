/**
 * Typen für Betriebskontrolle-Export (ARV/ArG, Polizei).
 * Kein Backend – nur Mock-State.
 */

/** Geforderte Dateiformate (z.B. Region Polizei). */
export type ExportFormat = "xdt" | "ddd";

/** Status eines Exportbestandteils. */
export type ExportPartStatus = "enthalten" | "fehlt" | "extern";

/** Art des Bestandteils. */
export type ExportPartType =
  | "driver_cards"
  | "arv_reports"
  | "avg_work_time"
  | "personal_data"
  | "mass_storage";

export type ExportPart = {
  id: ExportPartType;
  label: string;
  status: ExportPartStatus;
  /** Kurzhinweis, z.B. „Wird von externem System geliefert“. */
  hint?: string;
};

/** Status eines erzeugten Exportpakets. */
export type ControlExportStatus = "pending" | "ready" | "failed";

/** Ein erzeugtes Exportpaket (Eintrag in der Historie). */
export type ControlExport = {
  id: string;
  /** Erstellungszeitpunkt (ISO-String). */
  createdAt: string;
  dateFrom: string;
  dateTo: string;
  /** Anzeigename der verantwortlichen Person. */
  responsiblePerson: string;
  /** Dateiname oder Export-ID. */
  filename: string;
  status: ControlExportStatus;
  /** Ausgewählte Fahrer:innen-IDs. */
  driverIds: string[];
  format: ExportFormat;
  /** Bestandteile zum Zeitpunkt des Exports. */
  parts: ExportPart[];
};

/** Konfiguration für einen neuen Export (Formular-State). */
export type ExportConfig = {
  dateFrom: string;
  dateTo: string;
  driverIds: string[];
  /** Optionale Region/Kostenstelle. */
  region?: string;
  format: ExportFormat;
  /** Welche Exportbestandteile im Paket enthalten sein sollen. */
  includedPartIds: ExportPartType[];
};
