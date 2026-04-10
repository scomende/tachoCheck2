/**
 * Mock-Daten und -Logik für Fahrzeuge (Tab Fahrzeuge).
 * Importierte und manuell angelegte Fahrzeuge; kein Backend.
 */
import type { Vehicle, VehicleSource } from "@/domain/vehicleTypes";

let nextId = 100;
function generateVehicleId(): string {
  return `v-${nextId++}`;
}

function baseVehicle(p: Partial<Vehicle> & Pick<Vehicle, "id" | "licensePlate" | "vehicleNumber">): Vehicle {
  const cat = p.vehicleCategory ?? "Lastwagen";
  const mod = p.vehicleModel ?? "";
  return {
    id: p.id,
    wspVehicleId: p.wspVehicleId ?? "VEC00000",
    status: p.status ?? "In Benutzung",
    vehicleGroup: p.vehicleGroup ?? "",
    vehicleCategory: cat,
    vehicleModel: mod,
    licensePlate: p.licensePlate,
    vin: p.vin ?? "",
    mandant: p.mandant ?? "",
    costCenter: p.costCenter ?? "",
    internalNumber: p.internalNumber ?? p.vehicleNumber,
    masterNumber: p.masterNumber ?? "",
    vehicleNumber: p.vehicleNumber,
    displayName: p.displayName ?? `${cat} ${mod}`.trim(),
    symbolType: p.symbolType ?? "box",
    assignedEmployee: p.assignedEmployee?.trim() ?? "",
    validFrom: p.validFrom ?? "2024-01-01",
    validUntil: p.validUntil ?? "",
    source: p.source ?? "imported",
    editable: p.editable ?? false,
    isCoopVehicle: p.isCoopVehicle ?? false,
    qualifications: p.qualifications,
  };
}

/** In-Memory-Fahrzeugliste: importierte und manuell angelegte. */
export const MOCK_VEHICLES: Vehicle[] = [
  baseVehicle({
    id: "v-1",
    wspVehicleId: "VEC17104",
    status: "In Benutzung",
    vehicleGroup: "LKW 4x2",
    vehicleCategory: "Lastwagen",
    vehicleModel: "TGS 18.430",
    licensePlate: "ZH 123 456",
    vehicleNumber: "FZ-10001",
    displayName: "Lastwagen TGS 18.430",
    vin: "YS2P4X20005371230",
    mandant: "601",
    costCenter: "11733",
    internalNumber: "5063",
    masterNumber: "684.826.670",
    symbolType: "electric",
    assignedEmployee: "Müller Anna",
    validFrom: "2024-01-15",
    validUntil: "2028-12-31",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [
      { id: "q-1", type: "Tacho", value: "Digital", validUntil: "2026-12-31" },
    ],
  }),
  baseVehicle({
    id: "v-2",
    wspVehicleId: "VEC17105",
    status: "Parkplatz",
    vehicleGroup: "Mietfahrzeug",
    vehicleCategory: "Lastwagen",
    vehicleModel: "TGX 26.520",
    licensePlate: "GE 789 012",
    vehicleNumber: "FZ-10002",
    displayName: "Lastwagen TGX 26.520",
    vin: "WDB9066331N123456",
    mandant: "601",
    costCenter: "11800",
    internalNumber: "4256",
    masterNumber: "684.826.671",
    symbolType: "liquid",
    assignedEmployee: "De Luca Robert",
    validFrom: "2023-09-01",
    validUntil: "",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [
      { id: "q-2", type: "ADR", validUntil: "2025-06-30", notes: "Klasse 3" },
    ],
  }),
  baseVehicle({
    id: "v-3",
    wspVehicleId: "MAN-v3",
    status: "In Benutzung",
    vehicleGroup: "Linienverkehr",
    vehicleCategory: "Personenwagen",
    vehicleModel: "P360",
    licensePlate: "BE 345 678",
    vehicleNumber: "FZ-20001",
    displayName: "Personenwagen P360",
    vin: "",
    mandant: "602",
    costCenter: "22001",
    internalNumber: "FZ-20001",
    masterNumber: "",
    symbolType: "box",
    assignedEmployee: "",
    validFrom: "2025-03-01",
    validUntil: "",
    source: "manual",
    editable: true,
    isCoopVehicle: false,
    qualifications: [],
  }),
  baseVehicle({
    id: "V-101",
    wspVehicleId: "VEC101",
    status: "In Benutzung",
    vehicleGroup: "LKW 4x2",
    vehicleCategory: "Lastwagen",
    vehicleModel: "TGS 26.440",
    licensePlate: "ZH 400 101",
    vehicleNumber: "101",
    displayName: "Lastwagen TGS 26.440",
    vin: "YS2P4X20005371231",
    mandant: "601",
    costCenter: "11733",
    internalNumber: "101",
    masterNumber: "684.100.101",
    symbolType: "eco",
    assignedEmployee: "Fischer Petra",
    validFrom: "2024-06-01",
    validUntil: "",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [],
  }),
  baseVehicle({
    id: "V-102",
    wspVehicleId: "VEC102",
    status: "In Benutzung",
    vehicleGroup: "Transporter",
    vehicleCategory: "Lastwagen",
    vehicleModel: "Atego 1224 L",
    licensePlate: "ZH 400 102",
    vehicleNumber: "102",
    displayName: "Lastwagen Atego 1224 L",
    vin: "WDB9066331N654321",
    mandant: "601",
    costCenter: "11733",
    internalNumber: "102",
    masterNumber: "684.100.102",
    symbolType: "articulated",
    assignedEmployee: "Keller Bruno",
    validFrom: "2025-01-10",
    validUntil: "2026-06-30",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [],
  }),
];

/** Laufende Liste (wird bei createVehicle erweitert). */
let vehiclesList: Vehicle[] = [...MOCK_VEHICLES];

export type VehicleFilters = {
  search: string;
  source: VehicleSource | "";
  editable: boolean | "";
  isCoopVehicle: boolean | "";
};

function matchesSearch(v: Vehicle, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const emp = v.assignedEmployee.trim().toLowerCase();
  const hay = [
    v.licensePlate,
    v.wspVehicleId,
    v.vehicleNumber,
    v.displayName,
    v.vin,
    v.internalNumber,
    v.masterNumber,
    v.mandant,
    v.costCenter,
    v.status,
    v.vehicleGroup,
    v.vehicleCategory,
    v.vehicleModel,
    emp,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function getVehiclesFiltered(filters: VehicleFilters): Vehicle[] {
  return vehiclesList.filter((v) => {
    if (!matchesSearch(v, filters.search)) return false;
    if (filters.source && v.source !== filters.source) return false;
    if (filters.editable !== "" && v.editable !== filters.editable) return false;
    if (filters.isCoopVehicle !== "" && v.isCoopVehicle !== filters.isCoopVehicle) return false;
    return true;
  });
}

export function getVehicleById(id: string): Vehicle | undefined {
  return vehiclesList.find((v) => v.id === id);
}

export type CreateVehicleInput = {
  licensePlate: string;
  vehicleNumber: string;
  vehicleCategory: string;
  vehicleModel: string;
  /** Optional; höchstens eine Person (1:1). */
  assignedEmployee?: string;
  isCoopVehicle: boolean;
};

export function createVehicle(input: CreateVehicleInput): Vehicle {
  const today = new Date().toISOString().slice(0, 10);
  const id = generateVehicleId();
  const cat = input.vehicleCategory.trim();
  const model = input.vehicleModel.trim();
  const num = input.vehicleNumber.trim();
  const vehicle: Vehicle = {
    id,
    wspVehicleId: `MAN-${id}`,
    status: "In Benutzung",
    vehicleGroup: "",
    vehicleCategory: cat || "Lastwagen",
    vehicleModel: model,
    licensePlate: input.licensePlate.trim(),
    vin: "",
    mandant: "",
    costCenter: "",
    internalNumber: num,
    masterNumber: "",
    vehicleNumber: num,
    displayName: `${cat} ${model}`.trim() || input.licensePlate.trim(),
    symbolType: "box",
    assignedEmployee: (input.assignedEmployee ?? "").trim(),
    validFrom: today,
    validUntil: "",
    source: "manual",
    editable: true,
    isCoopVehicle: input.isCoopVehicle,
    qualifications: [],
  };
  vehiclesList.push(vehicle);
  return vehicle;
}

export type UpdateVehicleInput = Partial<
  Pick<
    Vehicle,
    | "licensePlate"
    | "vehicleNumber"
    | "displayName"
    | "isCoopVehicle"
    | "qualifications"
    | "symbolType"
    | "assignedEmployee"
    | "validFrom"
    | "validUntil"
    | "wspVehicleId"
    | "status"
    | "vehicleGroup"
    | "vehicleCategory"
    | "vehicleModel"
    | "vin"
    | "mandant"
    | "costCenter"
    | "internalNumber"
    | "masterNumber"
  >
>;

export function updateVehicle(id: string, input: UpdateVehicleInput): Vehicle | null {
  const index = vehiclesList.findIndex((v) => v.id === id);
  if (index === -1) return null;
  const current = vehiclesList[index];
  if (!current.editable) return null;
  vehiclesList[index] = { ...current, ...input };
  return vehiclesList[index];
}

export type VehicleDetailFieldsPatch = Partial<
  Pick<Vehicle, "assignedEmployee" | "mandant" | "costCenter">
>;

/** Mitarbeiter:in und Organisation – für alle Fahrzeuge (auch Import), unabhängig von `editable`. */
export function updateVehicleDetailFields(
  id: string,
  patch: VehicleDetailFieldsPatch
): Vehicle | null {
  const index = vehiclesList.findIndex((v) => v.id === id);
  if (index === -1) return null;
  const current = vehiclesList[index];
  const next = { ...current };
  if (patch.assignedEmployee !== undefined) {
    next.assignedEmployee = patch.assignedEmployee.trim();
  }
  if (patch.mandant !== undefined) {
    next.mandant = patch.mandant.trim();
  }
  if (patch.costCenter !== undefined) {
    next.costCenter = patch.costCenter.trim();
  }
  vehiclesList[index] = next;
  return next;
}

/** Für Seite: aktuelle Liste auslesen (nach create/update). */
export function getVehiclesList(): Vehicle[] {
  return [...vehiclesList];
}
