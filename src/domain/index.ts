/**
 * Domain-Typen und -Konzepte für Tacho Check.
 * Re-Export aller Typen aus drivingTypes für zentrale Imports.
 */
export type {
  TimeString,
  DurationMinutes,
  SegmentType,
  SegmentDataSource,
  DrivingSegment,
  DrivingDay,
  Driver,
  DriverWeek,
  ArvViolationSeverity,
  ArvViolationStatus,
  ArvViolationType,
  ArvViolation,
} from "./drivingTypes";
export type {
  ExportFormat,
  ExportPartStatus,
  ExportPartType,
  ExportPart,
  ControlExportStatus,
  ControlExport,
  ExportConfig,
} from "./controlExportTypes";
export type { VehicleSource, VehicleQualification, Vehicle, VehicleSymbolType } from "./vehicleTypes";
