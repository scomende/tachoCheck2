/**
 * US-01: Hilfsfunktionen für die Wochenansicht Fahrerkarten.
 */
import type { DrivingSegment, SegmentType } from "@/domain/drivingTypes";

const MINUTES_PER_DAY = 24 * 60;

/** "HH:mm" oder "HH:mm:ss" → Minuten seit Mitternacht (0–1439). */
export const timeStringToMinutes = (s: string): number => {
  const part = s.slice(0, 5);
  const [h, m] = part.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Dauer eines Segments in Minuten (aus end oder duration). */
export const getSegmentDurationMinutes = (seg: DrivingSegment): number => {
  if (seg.duration != null) return seg.duration;
  if (seg.end != null) {
    const startMin = timeStringToMinutes(seg.start);
    const endMin = timeStringToMinutes(seg.end);
    return Math.max(0, endMin - startMin);
  }
  return 0;
};

/** Start des Segments in Minuten seit Mitternacht. */
export const getSegmentStartMinutes = (seg: DrivingSegment): number =>
  timeStringToMinutes(seg.start);

/** Endzeit als "HH:mm" (aus seg.end oder aus Start + Dauer). */
export const getSegmentEndTimeString = (seg: DrivingSegment): string => {
  if (seg.end != null) return seg.end.slice(0, 5);
  const startMin = timeStringToMinutes(seg.start);
  const durationMin = getSegmentDurationMinutes(seg);
  const endMin = startMin + durationMin;
  const h = Math.floor(endMin / 60) % 24;
  const m = endMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Prozent der Tageslänge (0–100) für Position/Breite. */
export const minutesToPercent = (minutes: number): number =>
  (minutes / MINUTES_PER_DAY) * 100;

/** Segmenttyp → Farbe (Tailwind-Klassen). Akzeptanzkriterien US-01. */
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  driving: "bg-red-500",       // Lenkzeit = Rot
  work: "bg-blue-500",         // Arbeitszeit = Blau
  availability: "bg-yellow-400", // Bereitschaftszeit = Gelb
  break: "bg-green-500",       // Ruhezeit = Grün
  other: "bg-green-400",       // Ruhezeit = Grün
};

/** Mattere Segmentfarben für Wochenansicht (bessere Lesbarkeit, Verletzungen heben sich ab). */
export const SEGMENT_COLORS_MUTED: Record<SegmentType, string> = {
  driving: "bg-red-300/70",
  work: "bg-blue-300/70",
  availability: "bg-amber-200/80",
  break: "bg-green-300/70",
  other: "bg-green-200/70",
};

/** Segmenttyp → Anzeigename. */
export const SEGMENT_LABELS: Record<SegmentType, string> = {
  driving: "Lenkzeit",
  work: "Arbeitszeit",
  availability: "Bereitschaftszeit",
  break: "Ruhezeit",
  other: "Sonstiges",
};

/** Datum YYYY-MM-DD → "Mo 19.05." */
export const formatDayLabel = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const mon = d.getMonth();
  const date = d.getDate();
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const dayName = weekdays[day];
  const mm = String(mon + 1).padStart(2, "0");
  const dd = String(date).padStart(2, "0");
  return `${dayName} ${dd}.${mm}.`;
};

/** Datum YYYY-MM-DD → "Mo, 19.05.2024" (für ARV-Panel US-05). */
export const formatDayLabelLong = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const dayName = weekdays[day];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dayName}, ${dd}.${mm}.${yyyy}`;
};

/** Kalenderwoche aus Montags-Datum (ISO). */
export const getWeekNumber = (mondayDateStr: string): number => {
  const d = new Date(mondayDateStr + "T12:00:00");
  d.setHours(0, 0, 0, 0);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

/** Montag YYYY-MM-DD → "KW 21 / 19.05.2025 – 25.05.2025" */
export const formatWeekLabel = (weekStart: string): string => {
  const kw = getWeekNumber(weekStart);
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (x: Date) =>
    `${String(x.getDate()).padStart(2, "0")}.${String(x.getMonth() + 1).padStart(2, "0")}.${x.getFullYear()}`;
  return `KW ${kw} / ${fmt(start)} – ${fmt(end)}`;
};

/** Dauer in Minuten → "2h 30min" */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
};

/** Dauer in Minuten → "hh:mm" (z.B. 165 → "02:45") für Tagesdetail-Tabelle. */
export const formatDurationHHMM = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
