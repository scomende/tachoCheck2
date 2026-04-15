/**
 * Mock-Daten für den ARV-Verletzungsreport (Tab „Verletzungen“ / ARV).
 * Filterbar nach Zeitraum und Mitarbeiter (Mock).
 */
import type {
  ArvViolation,
  ArvViolationSeverity,
  ArvViolationStatus,
  ArvViolationType,
} from "@/domain/drivingTypes";
import { MOCK_DRIVERS } from "./drivingData";

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const WEEK_START = "2025-05-19";

/** Alle Verletzungen für den Report (mit Original- und Korrigiert-Varianten). */
export const MOCK_ARV_VIOLATIONS_REPORT: ArvViolation[] = [
  {
    id: "arv-1",
    driverId: "d1",
    date: addDays(WEEK_START, 1),
    description: "Maximale Tagesarbeitszeit überschritten",
    severity: "high",
    violationType: "work",
    rule: "ArG Art. 9 Abs. 1",
    timeRange: { start: "06:00", end: "20:30" },
    useCorrectedData: false,
    status: "open",
  },
  {
    id: "arv-1-c",
    driverId: "d1",
    date: addDays(WEEK_START, 1),
    description: "Maximale Tagesarbeitszeit überschritten (korrigiert)",
    severity: "high",
    violationType: "work",
    rule: "ArG Art. 9 Abs. 1",
    timeRange: { start: "06:00", end: "19:45" },
    useCorrectedData: true,
    status: "acknowledged",
  },
  {
    id: "arv-2",
    driverId: "d1",
    date: addDays(WEEK_START, 4),
    description: "Mindestruhezeit unterschritten",
    severity: "medium",
    violationType: "rest",
    rule: "ARV Art. 10 Abs. 1",
    timeRange: { start: "22:00", end: "05:00" },
    useCorrectedData: false,
    status: "signed",
  },
  {
    id: "arv-2-c",
    driverId: "d1",
    date: addDays(WEEK_START, 4),
    description: "Mindestruhezeit unterschritten",
    severity: "medium",
    violationType: "rest",
    rule: "ARV Art. 10 Abs. 1",
    timeRange: { start: "22:00", end: "05:30" },
    useCorrectedData: true,
    status: "closed",
  },
  {
    id: "arv-3",
    driverId: "d2",
    date: addDays(WEEK_START, 0),
    description: "Maximale Lenkzeit pro Tag überschritten",
    severity: "high",
    violationType: "driving",
    rule: "ARV Art. 6 Abs. 1",
    timeRange: { start: "06:00", end: "12:30" },
    useCorrectedData: false,
    status: "open",
  },
  {
    id: "arv-3-c",
    driverId: "d2",
    date: addDays(WEEK_START, 0),
    description: "Maximale Lenkzeit pro Tag überschritten",
    severity: "high",
    violationType: "driving",
    rule: "ARV Art. 6 Abs. 1",
    timeRange: { start: "06:00", end: "12:00" },
    useCorrectedData: true,
    status: "acknowledged",
  },
  {
    id: "arv-4",
    driverId: "d2",
    date: addDays(WEEK_START, 3),
    description: "Ununterbrochene Fahrtzeit zu lang",
    severity: "medium",
    violationType: "driving",
    rule: "ARV Art. 7",
    timeRange: { start: "09:00", end: "12:00" },
    useCorrectedData: false,
    status: "open",
  },
  {
    id: "arv-5",
    driverId: "d2",
    date: addDays(WEEK_START, 5),
    description: "Wöchentliche Ruhezeit verkürzt",
    severity: "low",
    violationType: "weekly_rest",
    rule: "ARV Art. 11",
    timeRange: { start: "00:00", end: "23:59" },
    useCorrectedData: false,
    status: "closed",
  },
  {
    id: "arv-6",
    driverId: "d3",
    date: addDays(WEEK_START, 2),
    description: "Pausenunterbrechung zu kurz",
    severity: "medium",
    violationType: "pause",
    rule: "ARV Art. 9 Abs. 2",
    timeRange: { start: "12:00", end: "12:30" },
    useCorrectedData: false,
    status: "acknowledged",
  },
  /** Zweite Verletzung am selben Tag wie arv-1 (d1) – Demo Gruppierung. */
  {
    id: "arv-1b",
    driverId: "d1",
    date: addDays(WEEK_START, 1),
    description: "Lenkzeit ohne ausreichende Pause",
    severity: "medium",
    violationType: "driving",
    rule: "ARV Art. 8",
    timeRange: { start: "13:00", end: "15:30" },
    useCorrectedData: false,
    status: "open",
  },
  /** Zweite Verletzung am selben Tag wie arv-3 (d2) – Demo Gruppierung. */
  {
    id: "arv-3b",
    driverId: "d2",
    date: addDays(WEEK_START, 0),
    description: "Pausenzeit zu kurz (zweite Verletzung)",
    severity: "low",
    violationType: "pause",
    rule: "ARV Art. 9 Abs. 2",
    timeRange: { start: "14:00", end: "14:45" },
    useCorrectedData: false,
    status: "open",
  },
];

export type ArvReportFilters = {
  dateFrom: string;
  dateTo: string;
  driverId: string;
  /** Nicht mehr genutzt bei Variante „beide Datenbasen gleichzeitig“; bleibt für Kompatibilität. */
  useCorrectedData?: boolean;
};

/** Eine Zeile in der kombinierten Tabelle: eine logische Verletzung mit optional Original- und Korrigiert-Eintrag. */
export type MergedArvRow = {
  /** Eindeutiger Schlüssel (driverId|date|violationType). */
  key: string;
  driverId: string;
  date: string;
  violationType: ArvViolationType | undefined;
  /** Kurzbeschreibung (von Original oder Korrigiert). */
  description: string;
  /** Verletzung in Originaldaten, falls vorhanden. */
  original: ArvViolation | null;
  /** Verletzung in korrigierten Daten, falls vorhanden. */
  corrected: ArvViolation | null;
};

const defaultFilters = (): ArvReportFilters => ({
  dateFrom: WEEK_START,
  dateTo: addDays(WEEK_START, 6),
  driverId: "",
});

/** Vergleicht zwei Datumsstrings YYYY-MM-DD. */
const dateInRange = (date: string, from: string, to: string): boolean =>
  date >= from && date <= to;

export const getArvReportFiltersDefault = (): ArvReportFilters => defaultFilters();

/**
 * Liefert die gefilterte Liste der ARV-Verletzungen für den Report.
 * Zeitraum, Mitarbeiter und optional Original/Korrigiert.
 */
export const getArvViolationsReport = (
  filters: ArvReportFilters
): ArvViolation[] => {
  return MOCK_ARV_VIOLATIONS_REPORT.filter((v) => {
    if (!dateInRange(v.date, filters.dateFrom, filters.dateTo)) return false;
    if (filters.driverId && v.driverId !== filters.driverId) return false;
    if (filters.useCorrectedData != null && v.useCorrectedData !== filters.useCorrectedData) return false;
    return true;
  });
};

/**
 * Liefert Verletzungen als zusammengeführte Zeilen: pro logischer Verletzung (driverId + date + violationType)
 * je ein Eintrag mit optional Original- und optional Korrigiert-Variante.
 * Filter: Zeitraum, Mitarbeiter.
 */
export const getArvViolationsReportMerged = (
  filters: ArvReportFilters
): MergedArvRow[] => {
  const filtered = MOCK_ARV_VIOLATIONS_REPORT.filter((v) => {
    if (!dateInRange(v.date, filters.dateFrom, filters.dateTo)) return false;
    if (filters.driverId && v.driverId !== filters.driverId) return false;
    return true;
  });

  const byKey = new Map<string, { original: ArvViolation | null; corrected: ArvViolation | null; driverId: string; date: string; violationType: ArvViolationType | undefined; description: string }>();
  for (const v of filtered) {
    const key = `${v.driverId}|${v.date}|${v.violationType ?? v.description}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        driverId: v.driverId ?? "",
        date: v.date,
        violationType: v.violationType,
        description: v.description,
        original: v.useCorrectedData ? null : v,
        corrected: v.useCorrectedData ? v : null,
      });
    } else {
      if (v.useCorrectedData) {
        existing.corrected = v;
      } else {
        existing.original = v;
      }
    }
  }

  let rows = Array.from(byKey.entries())
    .map(([key, { original, corrected, driverId, date, violationType, description }]) => ({
      key,
      driverId,
      date,
      violationType,
      description: original?.description ?? corrected?.description ?? description,
      original,
      corrected,
    }));

  return rows.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.driverId ?? "").localeCompare(b.driverId ?? "");
  });
};

/** Driver-Name zu ID (für Anzeige in Tabelle/Detail). */
export const getDriverNameById = (driverId: string): string => {
  const d = MOCK_DRIVERS.find((x) => x.id === driverId);
  return d?.name ?? driverId;
};

/** Gruppe: eine Person an einem Kalendertag, mehrere logische Verletzungen (`MergedArvRow`). */
export type ArvViolationDayGroup = {
  /** `driverId|date` */
  key: string;
  driverId: string;
  date: string;
  violations: MergedArvRow[];
};

/**
 * Fasst zusammengeführte Zeilen nach Mitarbeiter:in und Datum (ein Report pro Person/Tag).
 */
export const groupMergedRowsByDriverAndDay = (
  rows: MergedArvRow[]
): ArvViolationDayGroup[] => {
  const map = new Map<string, MergedArvRow[]>();
  for (const row of rows) {
    const k = `${row.driverId}|${row.date}`;
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }
  const groups: ArvViolationDayGroup[] = [];
  for (const [key, violations] of map) {
    violations.sort((a, b) => {
      const ta = (a.corrected ?? a.original)?.timeRange?.start ?? "";
      const tb = (b.corrected ?? b.original)?.timeRange?.start ?? "";
      const c = ta.localeCompare(tb);
      if (c !== 0) return c;
      const la = a.violationType ? String(a.violationType) : a.description;
      const lb = b.violationType ? String(b.violationType) : b.description;
      return la.localeCompare(lb);
    });
    groups.push({
      key,
      driverId: violations[0].driverId,
      date: violations[0].date,
      violations,
    });
  }
  groups.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return getDriverNameById(a.driverId).localeCompare(getDriverNameById(b.driverId));
  });
  return groups;
};

/** Priorität für aggregierten Gruppen-Status (Tabellen-Spalte). */
const GROUP_STATUS_AGGREGATION_ORDER: ArvViolationStatus[] = [
  "open",
  "acknowledged",
  "signed",
  "closed",
];

/**
 * Ein Status pro Person/Tag: dringlichster zuerst (offen → bestätigt → unterschrieben → abgeschlossen).
 */
export function aggregateViolationDayGroupStatus(
  group: ArvViolationDayGroup
): ArvViolationStatus | null {
  const present = new Set(
    group.violations
      .map((r) => (r.corrected ?? r.original)?.status)
      .filter((s): s is ArvViolationStatus => s != null)
  );
  if (present.size === 0) return null;
  for (const st of GROUP_STATUS_AGGREGATION_ORDER) {
    if (present.has(st)) return st;
  }
  return null;
}
