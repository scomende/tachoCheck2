"use client";

import { useMemo, useState, useCallback } from "react";
import {
  getVehiclesFiltered,
  createVehicle as createVehicleMock,
  getVehicleById,
} from "@/mock/vehicles";
import type { Vehicle } from "@/domain/vehicleTypes";
import type { VehicleFilters } from "@/mock/vehicles";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import {
  FahrzeugeFilters,
  FahrzeugTable,
  FahrzeugDetailPanel,
  CreateVehicleModal,
} from "@/components/views/fahrzeuge";

const defaultFilters: VehicleFilters = {
  search: "",
  source: "",
  editable: "",
  isCoopVehicle: "",
};

export default function FahrzeugePage() {
  const { selectedEmployeeId } = useSelectedEmployee();
  const [filters, setFilters] = useState<VehicleFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const vehicles = useMemo(
    () => getVehiclesFiltered(filters),
    [filters, refreshKey]
  );

  const selectedVehicle = useMemo(
    () => (selectedId ? getVehicleById(selectedId) ?? null : null),
    [selectedId, refreshKey]
  );

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSelect = useCallback((v: Vehicle) => {
    setSelectedId(v.id);
  }, []);

  const handleUpdated = useCallback((v: Vehicle) => {
    setRefreshKey((k) => k + 1);
    setSelectedId(v.id);
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="sr-only">Fahrzeuge</h1>
      <FahrzeugeFilters
        filters={filters}
        onFiltersChange={setFilters}
        onOpenCreate={() => setCreateModalOpen(true)}
      />
      <div className="flex flex-1 min-h-0">
        <FahrzeugTable
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <FahrzeugDetailPanel
          vehicle={selectedVehicle}
          onUpdated={handleUpdated}
        />
      </div>
      <CreateVehicleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreated}
        createVehicle={createVehicleMock}
      />
    </div>
  );
}
