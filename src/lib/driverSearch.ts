/**
 * US-03: Suche nach Mitarbeitenden.
 * Case-insensitive Teilstring-Suche auf Name (Vorname, Nachname) und optional Personalnummer.
 */
import type { Driver } from "@/domain/drivingTypes";

export const filterDriversBySearch = (
  drivers: Driver[],
  query: string
): Driver[] => {
  const q = query.trim().toLowerCase();
  if (!q) return drivers;
  return drivers.filter((d) => {
    const nameMatch = d.name.toLowerCase().includes(q);
    const personalMatch =
      d.personalNumber != null &&
      d.personalNumber.toLowerCase().includes(q);
    return nameMatch || personalMatch;
  });
};
