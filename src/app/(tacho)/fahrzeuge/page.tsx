"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  getVehiclesFiltered,
  createVehicle as createVehicleMock,
} from "@/mock/vehicles";
import type { Vehicle } from "@/domain/vehicleTypes";
import type { VehicleFilters } from "@/mock/vehicles";
import { FahrzeugeFilters, FahrzeugTable, CreateVehicleModal } from "@/components/views/fahrzeuge";

const defaultFilters: VehicleFilters = {
  search: "",
  source: "",
  editable: "",
  isCoopVehicle: "",
};

export default function FahrzeugePage() {
  const [filters, setFilters] = useState<VehicleFilters>(defaultFilters);
  const [expandAllDetails, setExpandAllDetails] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const vehicles = useMemo(
    () => getVehiclesFiltered(filters),
    [filters, refreshKey]
  );

  useEffect(() => {
    if (expandedId != null && !vehicles.some((v) => v.id === expandedId)) {
      setExpandedId(null);
    }
    if (highlightedId != null && !vehicles.some((v) => v.id === highlightedId)) {
      setHighlightedId(null);
    }
  }, [vehicles, expandedId, highlightedId]);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleExpandAllDetailsChange = useCallback((checked: boolean) => {
    setExpandAllDetails(checked);
    setExpandedId(null);
    setHighlightedId(null);
  }, []);

  const handleRowActivate = useCallback(
    (id: string) => {
      if (expandAllDetails) {
        setHighlightedId((h) => (h === id ? null : id));
        return;
      }
      if (expandedId === id) {
        setExpandedId(null);
        setHighlightedId(null);
      } else {
        setExpandedId(id);
        setHighlightedId(id);
      }
    },
    [expandAllDetails, expandedId]
  );

  const handleUpdated = useCallback((v: Vehicle) => {
    setRefreshKey((k) => k + 1);
    setExpandedId(v.id);
    setHighlightedId(v.id);
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="sr-only">Fahrzeuge</h1>
      <FahrzeugeFilters
        filters={filters}
        onFiltersChange={setFilters}
        onOpenCreate={() => setCreateModalOpen(true)}
        expandAllDetails={expandAllDetails}
        onExpandAllDetailsChange={handleExpandAllDetailsChange}
      />
      <div className="flex min-h-0 flex-1">
        <FahrzeugTable
          vehicles={vehicles}
          expandAllDetails={expandAllDetails}
          expandedId={expandedId}
          highlightedId={highlightedId}
          onRowActivate={handleRowActivate}
          onVehicleUpdated={handleUpdated}
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
