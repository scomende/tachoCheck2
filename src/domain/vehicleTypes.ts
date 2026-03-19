/**
 * Domain-Typen für Fahrzeuge (Tab Fahrzeuge).
 * Fahrzeuge aus Import (SAP/WSP/Flotte) oder manuell; Matching zur Ressourcenplanung über Fahrzeugnummer.
 */

/** Herkunft des Fahrzeugs. */
export type VehicleSource = "imported" | "manual";

/**
 * LKW-Symbol für die Spalte „Symbole“ (analog Symbolpalette: Pritsche, Elektro, Flüssigkeit, Öko, Koffer, Sattel).
 */
export type VehicleSymbolType =
  | "flatbed"
  | "electric"
  | "liquid"
  | "eco"
  | "box"
  | "articulated";

/** Optionale Qualifikation / Eigenschaft eines Fahrzeugs. */
export type VehicleQualification = {
  id: string;
  type: string;
  value?: string;
  validUntil?: string;
  notes?: string;
};

export type Vehicle = {
  id: string;
  /** Kennzeichen */
  licensePlate: string;
  /** Fahrzeugnummer – zentraler Schlüssel für Matching/Ressourcenplanung */
  vehicleNumber: string;
  /** Bezeichnung / Typ */
  displayName: string;
  /** Symbol in der Fahrzeugliste (LKW-Icon). */
  symbolType: VehicleSymbolType;
  /** Zugeordnete Mitarbeitende (Anzeigenamen). */
  assignedEmployees: string[];
  /** Gültig ab (YYYY-MM-DD). */
  validFrom: string;
  source: VehicleSource;
  isCoopVehicle: boolean;
  /** Aus Schnittstelle: nicht bearbeitbar; manuell: bearbeitbar */
  editable: boolean;
  qualifications?: VehicleQualification[];
};
