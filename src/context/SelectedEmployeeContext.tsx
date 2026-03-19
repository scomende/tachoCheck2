"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Driver } from "@/domain/drivingTypes";
import { getMockDrivingData } from "@/mock/drivingData";
import { filterDriversBySearch } from "@/lib/driverSearch";

export type SelectedEmployeeState = {
  selectedEmployeeId: string | null;
  selectedDriver: Driver | null;
  drivers: Driver[];
  /** Suchbegriff aus der Toolbar; filtert die sichtbare Mitarbeitenden-Liste (z. B. Fahrerkarten). */
  searchQuery: string;
  setSelectedEmployee: (id: string | null, driver?: Driver | null) => void;
  setSearchQuery: (query: string) => void;
  clearSelection: () => void;
};

const SelectedEmployeeContext = createContext<SelectedEmployeeState | null>(null);

export function SelectedEmployeeProvider({ children }: { children: ReactNode }) {
  const { drivers } = getMockDrivingData();
  const [selectedEmployeeId, setSelectedEmployeeIdState] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState("");

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.id === selectedEmployeeId) ?? null,
    [drivers, selectedEmployeeId]
  );

  const setSelectedEmployee = useCallback(
    (id: string | null, driver?: Driver | null) => {
      setSelectedEmployeeIdState(id);
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedEmployeeIdState(null);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const value = useMemo<SelectedEmployeeState>(
    () => ({
      selectedEmployeeId,
      selectedDriver,
      drivers,
      searchQuery,
      setSelectedEmployee,
      setSearchQuery,
      clearSelection,
    }),
    [
      selectedEmployeeId,
      selectedDriver,
      drivers,
      searchQuery,
      setSelectedEmployee,
      setSearchQuery,
      clearSelection,
    ]
  );

  return (
    <SelectedEmployeeContext.Provider value={value}>
      {children}
    </SelectedEmployeeContext.Provider>
  );
}

export function useSelectedEmployee(): SelectedEmployeeState {
  const ctx = useContext(SelectedEmployeeContext);
  if (!ctx) {
    throw new Error(
      "useSelectedEmployee must be used within SelectedEmployeeProvider"
    );
  }
  return ctx;
}

/** Optionale Nutzung: liefert null, wenn außerhalb des Providers (z. B. Tests). */
export function useSelectedEmployeeOptional(): SelectedEmployeeState | null {
  return useContext(SelectedEmployeeContext);
}
