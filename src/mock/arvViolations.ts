/**
 * Mock-Daten für den ARV-Verstoss-Report (Tab „ARV-Verstösse“).
 * Filterbar nach Zeitraum, Mitarbeiter, Schweregrad, Status, Original/Korrigierte Daten.
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

/** Alle Verstösse für den Report (mit Original- und Korrigiert-Varianten). */
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
];

export type ArvReportFilters = {
  dateFrom: string;
  dateTo: string;
  driverId: string;
  severity: ArvViolationSeverity | "";
  status: ArvViolationStatus | "";
  useCorrectedData: boolean;
};

const defaultFilters = (): ArvReportFilters => ({
  dateFrom: WEEK_START,
  dateTo: addDays(WEEK_START, 6),
  driverId: "",
  severity: "",
  status: "",
  useCorrectedData: true,
});

/** Vergleicht zwei Datumsstrings YYYY-MM-DD. */
const dateInRange = (date: string, from: string, to: string): boolean =>
  date >= from && date <= to;

export const getArvReportFiltersDefault = (): ArvReportFilters => defaultFilters();

/**
 * Liefert die gefilterte Liste der ARV-Verstösse für den Report.
 * Zeitraum, Mitarbeiter, Schweregrad, Status und Original/Korrigiert werden berücksichtigt.
 */
export const getArvViolationsReport = (
  filters: ArvReportFilters
): ArvViolation[] => {
  return MOCK_ARV_VIOLATIONS_REPORT.filter((v) => {
    if (!dateInRange(v.date, filters.dateFrom, filters.dateTo)) return false;
    if (filters.driverId && v.driverId !== filters.driverId) return false;
    if (filters.severity && v.severity !== filters.severity) return false;
    if (filters.status && v.status !== filters.status) return false;
    if (v.useCorrectedData !== filters.useCorrectedData) return false;
    return true;
  });
};

/** Driver-Name zu ID (für Anzeige in Tabelle/Detail). */
export const getDriverNameById = (driverId: string): string => {
  const d = MOCK_DRIVERS.find((x) => x.id === driverId);
  return d?.name ?? driverId;
};
