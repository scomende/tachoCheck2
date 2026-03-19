/**
 * Mock-Daten und -Logik für Betriebskontrolle-Export.
 * Kein Backend – Export „generieren“ fügt nur einen Eintrag in die Historie ein.
 */
import type {
  ControlExport,
  ExportConfig,
  ExportPart,
  ExportPartStatus,
  ExportPartType,
} from "@/domain/controlExportTypes";

/** Alle verfügbaren Exportbestandteile (Reihenfolge der Anzeige). */
export const ALL_EXPORT_PART_IDS: ExportPartType[] = [
  "driver_cards",
  "arv_reports",
  "avg_work_time",
  "personal_data",
  "mass_storage",
];

const EXPORT_PARTS: Omit<ExportPart, "status">[] = [
  { id: "driver_cards", label: "Fahrerkartendateien" },
  { id: "arv_reports", label: "ARV-Reports pro Fahrer:in" },
  { id: "avg_work_time", label: "Aufstellung durchschnittliche Arbeitszeit" },
  { id: "personal_data", label: "Personalien / Kontaktangaben" },
  { id: "mass_storage", label: "Massenspeicherdaten (Fahrzeug)", hint: "Wird von externem System geliefert" },
];

/** In-Memory-Export-Historie (Mock). */
let exportHistory: ControlExport[] = [
  {
    id: "exp-1",
    createdAt: "2025-05-20T14:30:00.000Z",
    dateFrom: "2025-05-12",
    dateTo: "2025-05-18",
    responsiblePerson: "Marcel Muster",
    filename: "Betriebskontrolle_2025-05-12_2025-05-18.xdt",
    status: "ready",
    driverIds: ["d1", "d2"],
    format: "xdt",
    parts: [
      { id: "driver_cards", label: "Fahrerkartendateien", status: "enthalten" },
      { id: "arv_reports", label: "ARV-Reports pro Fahrer:in", status: "enthalten" },
      { id: "avg_work_time", label: "Aufstellung durchschnittliche Arbeitszeit", status: "enthalten" },
      { id: "personal_data", label: "Personalien / Kontaktangaben", status: "enthalten" },
      { id: "mass_storage", label: "Massenspeicherdaten (Fahrzeug)", status: "extern", hint: "Wird von externem System geliefert" },
    ],
  },
];

/**
 * Bestandteile mit Status für die aktuelle Konfiguration.
 * Tacho Check liefert: Fahrerkarten, ARV-Reports, Arbeitszeit, Personalien = enthalten.
 * Massenspeicher = extern.
 */
export function getExportPartsWithStatus(_config: ExportConfig): ExportPart[] {
  const statusByPart: Record<ExportPart["id"], ExportPartStatus> = {
    driver_cards: "enthalten",
    arv_reports: "enthalten",
    avg_work_time: "enthalten",
    personal_data: "enthalten",
    mass_storage: "extern",
  };
  return EXPORT_PARTS.map((p) => ({
    ...p,
    status: statusByPart[p.id],
    hint: p.hint,
  }));
}

function generateExportId(): string {
  return `exp-${Date.now()}`;
}

function formatFilename(config: ExportConfig): string {
  const prefix = "Betriebskontrolle";
  const ext = config.format === "xdt" ? ".xdt" : ".ddd";
  return `${prefix}_${config.dateFrom}_${config.dateTo}${ext}`;
}

export type CreateExportResult = { success: true; export: ControlExport } | { success: false; error: string };

/**
 * Mock: „Exportpaket generieren“ – erzeugt keinen echten Download,
 * sondern fügt einen Eintrag in die Historie ein und liefert Erfolg.
 */
export function createExport(
  config: ExportConfig,
  responsiblePerson: string
): CreateExportResult {
  const allParts = getExportPartsWithStatus(config);
  const included = new Set(config.includedPartIds ?? ALL_EXPORT_PART_IDS);
  const parts = allParts.filter((p) => included.has(p.id));
  const exportEntry: ControlExport = {
    id: generateExportId(),
    createdAt: new Date().toISOString(),
    dateFrom: config.dateFrom,
    dateTo: config.dateTo,
    responsiblePerson,
    filename: formatFilename(config),
    status: "ready",
    driverIds: [...config.driverIds],
    format: config.format,
    parts,
  };
  exportHistory.push(exportEntry);
  return { success: true, export: exportEntry };
}

export function getExportHistory(): ControlExport[] {
  return [...exportHistory];
}

export function getExportById(id: string): ControlExport | undefined {
  return exportHistory.find((e) => e.id === id);
}
