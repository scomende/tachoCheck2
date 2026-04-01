/**
 * US-02: Mockdaten für Fahrerkartensegmente.
 *
 * Weitere Mitarbeitende hinzufügen:
 * - In MOCK_DRIVERS einen neuen Eintrag mit id, name, optional kostenstelle, rayon ergänzen.
 * - In MOCK_DRIVER_WEEKS für die neue driverId mindestens einen Eintrag mit weekStart und days (7 Tage) anlegen.
 *
 * Weitere Wochen / Tage hinzufügen:
 * - Weitere Einträge in MOCK_DRIVER_WEEKS mit neuem weekStart (Montag der Woche, YYYY-MM-DD) und days (7 DrivingDay).
 * - Pro DrivingDay date auf den jeweiligen Wochentag setzen (z.B. Mo = weekStart, Di = +1 Tag, …).
 * - Für mehrere Fahrer:innen dieselbe Woche: pro driverId einen Eintrag mit gleichem weekStart.
 *
 * Leerwochen behandeln:
 * - Wenn eine Fahrer:in für eine gewählte Woche keinen Eintrag in MOCK_DRIVER_WEEKS hat,
 *   zeigt die Wochenansicht (US-01) „Keine Daten für diese Woche“.
 * - Optional: Für eine Woche explizit leere Tage liefern (days mit 7 Einträgen, segments: []),
 *   dann erscheinen die Zeilen als „Ruhezeit“ statt Meldung.
 */

import type { Driver, DriverWeek, DrivingDay, DrivingSegment, ArvViolation } from "@/domain/drivingTypes";

export const MOCK_DRIVERS: Driver[] = [
  { id: "d1", name: "Müller Anna", personalNumber: "10001", kostenstelle: "9976 Zürich", rayon: "PEE Nord" },
  { id: "d2", name: "Keller Bruno", personalNumber: "10002", kostenstelle: "9976 Zürich", rayon: "Alle PEEs" },
  { id: "d3", name: "De Luca Robert", personalNumber: "10003", kostenstelle: "2849 Genf Rive", rayon: "PEE Süd" },
];

/** Hilfsfunktion: Datum + N Tage (einfach, ohne Timezone-Logik). */
const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Ein typischer Arbeitstag mit Fahrt- und Pausensegmenten (Fahrzeug-ID wie in `vehicles.ts`). */
const daySegmentsWithVehicle = (vehicleId: string): DrivingSegment[] => [
  { start: "06:00", end: "09:30", type: "driving", vehicleId, dataSource: "digital" },
  { start: "09:30", end: "09:45", type: "break", dataSource: "digital" },
  { start: "09:45", end: "12:00", type: "driving", vehicleId, dataSource: "digital" },
  { start: "12:00", end: "12:45", type: "break", dataSource: "digital" },
  { start: "12:45", end: "15:00", type: "work", dataSource: "manual" },
  { start: "15:00", end: "17:30", type: "driving", vehicleId, dataSource: "digital" },
];

const daySegments = (_baseDate: string): DrivingSegment[] => daySegmentsWithVehicle("V-101");

/** Tag mit Bereitschaftszeit (Gelb) für US-01-Demo. */
const dayWithAvailability: DrivingSegment[] = [
  { start: "08:00", end: "10:00", type: "driving", vehicleId: "V-101", dataSource: "digital" },
  { start: "10:00", end: "12:00", type: "availability", dataSource: "manual" },
  { start: "12:00", end: "12:30", type: "break", dataSource: "digital" },
  { start: "12:30", end: "14:00", type: "work", dataSource: "manual" },
];

/** Weniger Segmente (z.B. kurzer Tag). */
const shortDaySegments: DrivingSegment[] = [
  { start: "08:00", end: "10:00", type: "driving", vehicleId: "V-102", dataSource: "digital" },
  { start: "10:00", end: "10:15", type: "break", dataSource: "digital" },
  { start: "10:15", end: "12:00", type: "work", dataSource: "manual" },
];

/** Woche ab Montag 2025-05-19: 7 Tage pro Fahrer:in. */
const WEEK_START = "2025-05-19";

const buildWeekForDriver = (
  driverId: string,
  weekStart: string,
  useShortDays?: (dayIndex: number) => boolean,
  useAvailabilityDay?: (dayIndex: number) => boolean,
  /** Optional: eigene Segmente für einen Wochentag (Index 0 = Mo). */
  segmentOverrideForDayIndex?: (dayIndex: number) => DrivingSegment[] | undefined
): DriverWeek => {
  const days: DrivingDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    let segments: DrivingSegment[];
    const overridden = segmentOverrideForDayIndex?.(i);
    if (overridden) segments = overridden;
    else if (useAvailabilityDay?.(i)) segments = dayWithAvailability;
    else if (useShortDays?.(i)) segments = shortDaySegments;
    else segments = daySegments(date);
    days.push({ date, segments });
  }
  return { driverId, weekStart, days };
};

export const MOCK_DRIVER_WEEKS: DriverWeek[] = [
  /** d1: Mi 21.5. (Index 2) = nicht-Coop BE 345 678 (`v-3`), sonst Coop ZH 400 101 (`V-101`). */
  buildWeekForDriver("d1", WEEK_START, undefined, undefined, (i) =>
    i === 2 ? daySegmentsWithVehicle("v-3") : undefined
  ),
  buildWeekForDriver("d2", WEEK_START, (i) => i === 2 || i === 5, (i) => i === 3),
  buildWeekForDriver("d3", WEEK_START),
];

/** Alle Mock-Daten: Fahrer:innen + Wochen. Für die Wochenansicht (US-01). */
export const getMockDrivingData = () => ({
  drivers: MOCK_DRIVERS,
  driverWeeks: MOCK_DRIVER_WEEKS,
});

/** US-05: ARV-Verstösse pro Fahrer:in und Woche (Mock). */
type ArvViolationsForWeek = {
  driverId: string;
  weekStart: string;
  violations: ArvViolation[];
};

const MOCK_ARV_VIOLATIONS: ArvViolationsForWeek[] = [
  {
    driverId: "d1",
    weekStart: WEEK_START,
    violations: [
      { date: addDays(WEEK_START, 1), description: "Maximale Tagesarbeitszeit überschritten", severity: "high", timeRange: { start: "06:00", end: "20:30" } },
      { date: addDays(WEEK_START, 4), description: "Mindestruhezeit unterschritten", severity: "medium", timeRange: { start: "22:00", end: "24:00" } },
    ],
  },
  {
    driverId: "d2",
    weekStart: WEEK_START,
    violations: [
      { date: addDays(WEEK_START, 0), description: "Maximale Lenkzeit pro Tag überschritten", severity: "high", timeRange: { start: "06:00", end: "12:30" } },
      { date: addDays(WEEK_START, 3), description: "Ununterbrochene Fahrtzeit zu lang", severity: "medium", timeRange: { start: "09:00", end: "12:00" } },
      { date: addDays(WEEK_START, 5), description: "Wöchentliche Ruhezeit verkürzt", severity: "low", timeRange: { start: "00:00", end: "23:59" } },
    ],
  },
  {
    driverId: "d3",
    weekStart: WEEK_START,
    violations: [],
  },
];

export const getArvViolationsForWeek = (
  driverId: string,
  weekStart: string
): ArvViolation[] => {
  const entry = MOCK_ARV_VIOLATIONS.find(
    (e) => e.driverId === driverId && e.weekStart === weekStart
  );
  return entry?.violations ?? [];
};
