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
export {
  getExportPartsWithStatus,
  createExport,
  getExportHistory,
  getExportById,
} from "./controlExports";
export type { CreateExportResult } from "./controlExports";
export {
  getVehiclesFiltered,
  getVehicleById,
  createVehicle,
  updateVehicle,
  getVehiclesList,
} from "./vehicles";
export type { VehicleFilters, CreateVehicleInput, UpdateVehicleInput } from "./vehicles";
