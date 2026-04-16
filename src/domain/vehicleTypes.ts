/**
 * Domain-Typen für Fahrzeuge (Tab Fahrzeuge).
 * Stammdaten gemäss WSP/Schnittstelle; Matching zur Ressourcenplanung über Fahrzeugnummer.
 */

/** Herkunft des Fahrzeugs. */
export type VehicleSource = "imported" | "manual";

/**
 * LKW-Symbol (Legacy / erweiterte Ansichten).
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
  /** Fahrzeug-ID WSP (z. B. VEC17104). */
  wspVehicleId: string;
  /** z. B. In Benutzung, Parkplatz. */
  status: string;
  /** z. B. Mietfahrzeug, LKW 4x2. */
  vehicleGroup: string;
  /** Fahrzeugart: Lastwagen oder Personenwagen. */
  vehicleCategory: string;
  /** Fahrzeugtyp (z. B. TGS 18.430, P360). */
  vehicleModel: string;
  /** Kennzeichen. */
  licensePlate: string;
  /** VIN / Chassisnummer. */
  vin: string;
  /** Mandant (Zuweisungsgruppe). */
  mandant: string;
  /** Kostenstelle. */
  costCenter: string;
  /** Interne Nummer. */
  internalNumber: string;
  /** Stammnummer. */
  masterNumber: string;
  /**
   * Fahrzeugnummer – zentraler Schlüssel für Matching/Ressourcenplanung
   * (oft identisch mit interner Nummer).
   */
  vehicleNumber: string;
  /** Kurzbezeichnung für kompakte Anzeigen (z. B. Fahrerkarten-Tooltip). */
  displayName: string;
  symbolType: VehicleSymbolType;
  /** Höchstens eine zugewiesene Person pro Fahrzeug (1:1 zur Zuweisung). Leer = keine Zuweisung. */
  assignedEmployee: string;
  /** Gültig ab (YYYY-MM-DD). */
  validFrom: string;
  /** Gültig bis (YYYY-MM-DD); leer = unbefristet. */
  validUntil: string;
  source: VehicleSource;
  /** Eigenes Coop-Fuhrparkfahrzeug (true) vs. Fremdfahrzeug (false). Detailbearbeitung nur bei Fremdfahrzeugen. */
  isCoopVehicle: boolean;
  /** Herkunft: Import vs. manuell (Filter/Mock); Detail-Edit folgt `!isCoopVehicle`. */
  editable: boolean;
  qualifications?: VehicleQualification[];
};
