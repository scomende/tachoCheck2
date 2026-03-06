/**
 * Mock-Daten für Tacho Check (Daten-Schicht für Entwicklung).
 * Später durch API/Backend ersetzen.
 */
export {
  MOCK_DRIVERS,
  MOCK_DRIVER_WEEKS,
  getMockDrivingData,
  getArvViolationsForWeek,
} from "./drivingData";
export {
  MOCK_ARV_VIOLATIONS_REPORT,
  getArvViolationsReport,
  getArvReportFiltersDefault,
  getDriverNameById,
} from "./arvViolations";
export type { ArvReportFilters } from "./arvViolations";
