/**
 * US-03: Suche nach Mitarbeitenden.
 * Case-insensitive Teilstring-Suche auf Name (Vorname, Nachname) und optional Personalnummer.
 */
import type { Driver } from "@/domain/drivingTypes";

export function driverMatchesSearch(driver: Driver, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const nameMatch = driver.name.toLowerCase().includes(q);
  const personalMatch =
    driver.personalNumber != null && driver.personalNumber.toLowerCase().includes(q);
  return nameMatch || personalMatch;
}

/** Globale Toolbar: ausgewählte Person oder laufende Suche (ohne Auswahl). */
export function driverHighlightedByGlobalToolbar(
  driverId: string,
  selectedEmployeeId: string | null,
  searchQuery: string,
  drivers: Driver[]
): boolean {
  if (selectedEmployeeId != null && selectedEmployeeId === driverId) return true;
  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return false;
  return driverMatchesSearch(driver, searchQuery);
}

export const filterDriversBySearch = (
  drivers: Driver[],
  query: string
): Driver[] => {
  const q = query.trim().toLowerCase();
  if (!q) return drivers;
  return drivers.filter((d) => driverMatchesSearch(d, query));
};
