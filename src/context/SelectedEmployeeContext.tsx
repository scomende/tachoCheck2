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
  setSelectedEmployee: (id: string | null, driver?: Driver | null) => void;
  clearSelection: () => void;
};

const SelectedEmployeeContext = createContext<SelectedEmployeeState | null>(null);

export function SelectedEmployeeProvider({ children }: { children: ReactNode }) {
  const { drivers } = getMockDrivingData();
  const [selectedEmployeeId, setSelectedEmployeeIdState] = useState<string | null>(null);

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

  const value = useMemo<SelectedEmployeeState>(
    () => ({
      selectedEmployeeId,
      selectedDriver,
      drivers,
      setSelectedEmployee,
      clearSelection,
    }),
    [
      selectedEmployeeId,
      selectedDriver,
      drivers,
      setSelectedEmployee,
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
