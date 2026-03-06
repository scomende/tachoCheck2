/**
 * Domain-Typen für Fahrzeuge (Tab Fahrzeuge).
 * Fahrzeuge aus Import (SAP/WSP/Flotte) oder manuell; Matching zur Ressourcenplanung über Fahrzeugnummer.
 */

/** Herkunft des Fahrzeugs. */
export type VehicleSource = "imported" | "manual";

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
  source: VehicleSource;
  isCoopVehicle: boolean;
  /** Aus Schnittstelle: nicht bearbeitbar; manuell: bearbeitbar */
  editable: boolean;
  qualifications?: VehicleQualification[];
};
