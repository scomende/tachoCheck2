/**
 * Mock-Daten und -Logik für Fahrzeuge (Tab Fahrzeuge).
 * Importierte und manuell angelegte Fahrzeuge; kein Backend.
 */
import type { Vehicle, VehicleSource } from "@/domain/vehicleTypes";

let nextId = 100;
function generateVehicleId(): string {
  return `v-${nextId++}`;
}

/** In-Memory-Fahrzeugliste: importierte und manuell angelegte. */
export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v-1",
    licensePlate: "ZH 123 456",
    vehicleNumber: "FZ-10001",
    displayName: "LKW RailCare 12",
    symbolType: "electric",
    assignedEmployees: ["Müller Anna", "Keller Bruno"],
    validFrom: "2024-01-15",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [
      { id: "q-1", type: "Tacho", value: "Digital", validUntil: "2026-12-31" },
    ],
  },
  {
    id: "v-2",
    licensePlate: "GE 789 012",
    vehicleNumber: "FZ-10002",
    displayName: "Transgourmet Kühl 3",
    symbolType: "liquid",
    assignedEmployees: ["De Luca Robert"],
    validFrom: "2023-09-01",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [
      { id: "q-2", type: "ADR", validUntil: "2025-06-30", notes: "Klasse 3" },
    ],
  },
  {
    id: "v-3",
    licensePlate: "BE 345 678",
    vehicleNumber: "FZ-20001",
    displayName: "TwoSpice Lieferwagen",
    symbolType: "box",
    assignedEmployees: [],
    validFrom: "2025-03-01",
    source: "manual",
    editable: true,
    isCoopVehicle: false,
    qualifications: [],
  },
  /** Fahrzeuge für Fahrerkarten-Mock (Segmente vehicleId V-101, V-102). */
  {
    id: "V-101",
    licensePlate: "ZH 400 101",
    vehicleNumber: "101",
    displayName: "LKW RailCare 12",
    symbolType: "eco",
    assignedEmployees: ["Müller Anna"],
    validFrom: "2024-06-01",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [],
  },
  {
    id: "V-102",
    licensePlate: "ZH 400 102",
    vehicleNumber: "102",
    displayName: "Transporter Kurz",
    symbolType: "articulated",
    assignedEmployees: ["Keller Bruno", "De Luca Robert"],
    validFrom: "2025-01-10",
    source: "imported",
    editable: false,
    isCoopVehicle: true,
    qualifications: [],
  },
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
  const employees = v.assignedEmployees.join(" ").toLowerCase();
  return (
    v.licensePlate.toLowerCase().includes(q) ||
    v.vehicleNumber.toLowerCase().includes(q) ||
    v.displayName.toLowerCase().includes(q) ||
    employees.includes(q)
  );
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
  displayName: string;
  isCoopVehicle: boolean;
};

export function createVehicle(input: CreateVehicleInput): Vehicle {
  const today = new Date().toISOString().slice(0, 10);
  const vehicle: Vehicle = {
    id: generateVehicleId(),
    licensePlate: input.licensePlate.trim(),
    vehicleNumber: input.vehicleNumber.trim(),
    displayName: input.displayName.trim(),
    symbolType: "box",
    assignedEmployees: [],
    validFrom: today,
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
    | "assignedEmployees"
    | "validFrom"
  >
>;

export function updateVehicle(id: string, input: UpdateVehicleInput): Vehicle | null {
  const index = vehiclesList.findIndex((v) => v.id === id);
  if (index === -1) return null;
  const current = vehiclesList[index];
  if (!current.editable) return null;
  vehiclesList[index] = {
    ...current,
    ...input,
    licensePlate: input.licensePlate ?? current.licensePlate,
    vehicleNumber: input.vehicleNumber ?? current.vehicleNumber,
    displayName: input.displayName ?? current.displayName,
    isCoopVehicle: input.isCoopVehicle ?? current.isCoopVehicle,
    qualifications: input.qualifications ?? current.qualifications,
    symbolType: input.symbolType ?? current.symbolType,
    assignedEmployees: input.assignedEmployees ?? current.assignedEmployees,
    validFrom: input.validFrom ?? current.validFrom,
  };
  return vehiclesList[index];
}

/** Für Seite: aktuelle Liste auslesen (nach create/update). */
export function getVehiclesList(): Vehicle[] {
  return [...vehiclesList];
}
