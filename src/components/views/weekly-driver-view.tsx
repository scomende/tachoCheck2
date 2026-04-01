"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { DrivingDay, DrivingSegment, ArvViolationSeverity, ArvViolation, SegmentType } from "@/domain/drivingTypes";
import { getMockDrivingData, getArvViolationsForWeek } from "@/mock/drivingData";
import { getVehicleById } from "@/mock/vehicles";
import { filterDriversBySearch } from "@/lib/driverSearch";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import { ArvViolationsPanel } from "@/components/views/arv-violations-panel";
import {
  formatDayLabel,
  formatDuration,
  formatDurationHHMM,
  formatWeekLabel,
  getSegmentDurationMinutes,
  getSegmentEndTimeString,
  getSegmentStartMinutes,
  minutesToPercent,
  timeStringToMinutes,
  SEGMENT_COLORS,
  SEGMENT_COLORS_MUTED,
  SEGMENT_LABELS,
} from "@/lib/drivingUtils";
import { cn } from "@/lib/utils";

const DRIVER_ID_PARAM = "driverId";
const HIGHLIGHT_DATE_PARAM = "date";

/** Reihenfolge für Legende und Tätigkeitsart-Dropdown in der Detailtabelle. */
const SEGMENT_TYPE_OPTIONS: SegmentType[] = ["driving", "break", "work", "availability", "other"];

/** Montag (YYYY-MM-DD) der Woche, in der das gegebene Datum liegt. */
function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const daysToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - daysToMonday);
  return d.toISOString().slice(0, 10);
}

const SEVERITY_ICON: Record<
  ArvViolationSeverity,
  React.ComponentType<{ className?: string }>
> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

const SEVERITY_ORDER: ArvViolationSeverity[] = ["high", "medium", "low"];
function highestSeverity(severities: (ArvViolationSeverity | undefined)[]): ArvViolationSeverity | null {
  for (const s of SEVERITY_ORDER) {
    if (severities.includes(s)) return s;
  }
  return null;
}

/**
 * Tag ausgrauen: Es gibt Lenksegmente mit Fahrzeug, aber keines ist Coop-Fahrzeug.
 * Nur Arbeit/Ruhe ohne zugeordnetes Lenkfahrzeug → false.
 */
function dayHasNoCoopDriving(
  segments: DrivingSegment[],
  getVehicleById: (id: string) => { isCoopVehicle?: boolean } | undefined
): boolean {
  const drivingWithVehicle = segments.filter(
    (s): s is DrivingSegment & { vehicleId: string } =>
      s.type === "driving" && Boolean(s.vehicleId)
  );
  if (drivingWithVehicle.length === 0) return false;
  return !drivingWithVehicle.some((s) => getVehicleById(s.vehicleId)?.isCoopVehicle === true);
}

/**
 * US-01: Wochenansicht Fahrerkartendaten.
 * Globale Mitarbeiter:innen-Auswahl (SelectedEmployeeContext): vorausgewählt in der Liste.
 * Bei lokaler Änderung wird die globale Auswahl aktualisiert. URL driverId für Deep-Links.
 */
export const WeeklyDriverView = () => {
  const { drivers, driverWeeks } = getMockDrivingData();
  const { selectedEmployeeId, setSelectedEmployee, searchQuery } = useSelectedEmployee();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlDriverId = searchParams.get(DRIVER_ID_PARAM) ?? "";

  const filteredDrivers = useMemo(
    () => filterDriversBySearch(drivers, searchQuery),
    [drivers, searchQuery]
  );

  const selectedDriverId = useMemo(() => {
    const fromGlobal = selectedEmployeeId && filteredDrivers.some((d) => d.id === selectedEmployeeId) ? selectedEmployeeId : null;
    const fromUrl = urlDriverId && filteredDrivers.some((d) => d.id === urlDriverId) ? urlDriverId : null;
    return fromGlobal ?? fromUrl ?? filteredDrivers[0]?.id ?? "";
  }, [selectedEmployeeId, urlDriverId, filteredDrivers]);

  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [expandAllDays, setExpandAllDays] = useState(false);
  const [editedDaySegments, setEditedDaySegments] = useState<Record<string, DrivingSegment[]>>({});
  /** Nicht-Coop-Tage: pro Datum Opt-in „ausnahmsweise übermitteln“ (nur UI-State, kein Backend). */
  const [nonCoopSubmitExceptions, setNonCoopSubmitExceptions] = useState<Record<string, boolean>>({});
  const [hoveredTableSegment, setHoveredTableSegment] = useState<{ date: string; segmentIndex: number } | null>(null);
  /** Gelber Hintergrund (#FFF8E6) nur für per Klick gewählte Zeile; bei „Details einblenden“ aus bis zur nächsten Klickwahl. */
  const [yellowHighlightDate, setYellowHighlightDate] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDriverId && selectedDriverId !== urlDriverId) {
      const next = new URLSearchParams(searchParams.toString());
      next.set(DRIVER_ID_PARAM, selectedDriverId);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }
  }, [selectedDriverId, urlDriverId, pathname, searchParams, router]);

  const urlHighlightDate = searchParams.get(HIGHLIGHT_DATE_PARAM);

  const availableWeeks = useMemo(() => {
    return driverWeeks
      .filter((w) => w.driverId === selectedDriverId)
      .map((w) => w.weekStart)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [driverWeeks, selectedDriverId]);

  const currentWeekStart = selectedWeekStart || (availableWeeks[0] ?? null);
  const driverWeek = useMemo(() => {
    if (!currentWeekStart) return null;
    return driverWeeks.find(
      (w) => w.driverId === selectedDriverId && w.weekStart === currentWeekStart
    ) ?? null;
  }, [driverWeeks, selectedDriverId, currentWeekStart]);

  const weekOptions = useMemo(() => {
    return availableWeeks.map((ws) => ({
      value: ws,
      label: formatWeekLabel(ws),
    }));
  }, [availableWeeks]);

  useEffect(() => {
    if (!urlHighlightDate || !selectedDriverId) return;
    const weekStart = getWeekStart(urlHighlightDate);
    if (availableWeeks.includes(weekStart)) {
      setSelectedWeekStart(weekStart);
      setYellowHighlightDate(urlHighlightDate);
    }
  }, [urlHighlightDate, selectedDriverId, availableWeeks]);

  const handleDriverSelect = useCallback(
    (id: string) => {
      if (!id) return;
      setExpandedDate(null);
      setYellowHighlightDate(null);
      setEditedDaySegments({});
      setNonCoopSubmitExceptions({});
      const driver = filteredDrivers.find((d) => d.id === id);
      setSelectedEmployee(id, driver ?? undefined);
      const next = new URLSearchParams(searchParams.toString());
      next.set(DRIVER_ID_PARAM, id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      const firstWeek = driverWeeks.find((w) => w.driverId === id)?.weekStart;
      setSelectedWeekStart(firstWeek ?? "");
    },
    [filteredDrivers, driverWeeks, pathname, router, searchParams, setSelectedEmployee]
  );

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeekStart(e.target.value);
    setExpandedDate(null);
    setYellowHighlightDate(null);
    setEditedDaySegments({});
    setNonCoopSubmitExceptions({});
  };

  const violationsForWeek = useMemo(
    () =>
      currentWeekStart && selectedDriverId
        ? getArvViolationsForWeek(selectedDriverId, currentWeekStart)
        : [],
    [selectedDriverId, currentWeekStart]
  );

  /** Gleiche gelbe Auswahl wie Tageszeile; klappt den Tag auf (sofern nicht „Details einblenden“). */
  const handleArvViolationSelectDate = (date: string) => {
    const turningOff = yellowHighlightDate === date;
    const nextYellow = turningOff ? null : date;
    setYellowHighlightDate(nextYellow);
    if (!expandAllDays) {
      if (turningOff) {
        setExpandedDate((e) => (e === date ? null : e));
      } else {
        setExpandedDate(date);
      }
    }
  };

  if (drivers.length === 0) {
    return (
      <div
        className="flex min-h-[20rem] items-center justify-center border border-border bg-background p-8 text-sm text-muted-foreground"
        role="region"
        aria-label="Wochenansicht Fahrerkarten"
      >
        Keine Mitarbeitenden vorhanden.
      </div>
    );
  }

  const hasNoSearchResults = filteredDrivers.length === 0;

  if (currentWeekStart && !driverWeek) {
    return (
      <div
        className="flex min-h-[20rem] items-center justify-center border border-border bg-background p-8 text-sm text-muted-foreground"
        role="region"
        aria-label="Wochenansicht Fahrerkarten"
      >
        Keine Daten für diese Woche.
      </div>
    );
  }

  if (!driverWeek && availableWeeks.length === 0) {
    return (
      <div
        className="flex min-h-[20rem] items-center justify-center border border-border bg-background p-8 text-sm text-muted-foreground"
        role="region"
        aria-label="Wochenansicht Fahrerkarten"
      >
        Keine Daten für diese Woche.
      </div>
    );
  }

  if (hasNoSearchResults) {
    return (
      <div
        className="flex w-full flex-1 gap-0 overflow-hidden rounded border border-border bg-background"
        role="region"
        aria-label="Wochenansicht Fahrerkarten"
      >
        <aside
          className="flex w-72 shrink-0 flex-col border-r border-border bg-muted/5"
          aria-label="Mitarbeitende auswählen"
        >
          <h2 className="px-3 py-3 text-xs font-medium text-muted-foreground">
            Mitarbeitende
          </h2>
          <div className="flex-1 overflow-y-auto">
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Keine Treffer
            </p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 overflow-auto">
          <p className="text-sm text-muted-foreground">
            Keine Treffer. Bitte Suche anpassen.
          </p>
        </div>
        <ArvViolationsPanel
          violations={[]}
          highlightedDate={null}
          onSelectDate={handleArvViolationSelectDate}
          driverId={selectedDriverId || undefined}
        />
      </div>
    );
  }

  const days = driverWeek?.days ?? [];

  return (
    <div
      className="flex w-full flex-1 gap-0 overflow-hidden rounded border border-border bg-background"
      role="region"
      aria-label="Wochenansicht Fahrerkarten"
    >
      {/* Sidebar: selektierbare Mitarbeitenden-Liste */}
      <aside
        className="flex w-72 shrink-0 flex-col border-r border-border bg-muted/5"
        aria-label="Mitarbeitende auswählen"
      >
        <h2 className="px-3 py-3 text-xs font-medium text-muted-foreground">
          Mitarbeitende
        </h2>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ul
            role="listbox"
            aria-label="Mitarbeitende"
            aria-activedescendant={selectedDriverId ? `driver-${selectedDriverId}` : undefined}
            className="py-1"
          >
            {filteredDrivers.map((d) => {
              const isSelected = d.id === selectedDriverId;
              return (
                <li key={d.id} id={`driver-${d.id}`} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleDriverSelect(d.id)}
                    className={cn(
                      "w-full cursor-pointer text-left px-3 py-2.5 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                      isSelected
                        ? "border-l-2 border-l-primary bg-primary/10 font-medium text-foreground"
                        : "border-l-2 border-l-transparent hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <span className="block truncate">{d.name}</span>
                    {(d.kostenstelle ?? d.personalNumber) && (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {[d.kostenstelle, d.personalNumber].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 overflow-auto">
      {/* Auswahl Woche + Switch Details einblenden */}
      <div className="flex w-full flex-wrap items-end gap-6">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="weekly-week-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Woche
          </label>
          <select
            id="weekly-week-select"
            value={currentWeekStart ?? ""}
            onChange={handleWeekChange}
            aria-label="Woche auswählen"
            className={cn(
              "h-9 min-w-[16rem] rounded border border-border bg-background px-3 text-sm text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            )}
          >
            {weekOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 self-end pb-1" id="expand-all-days-desc">
          <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border bg-muted transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 has-[:checked]:bg-primary has-[:checked]:border-primary">
            <input
              type="checkbox"
              checked={expandAllDays}
              onChange={(e) => {
                const checked = e.target.checked;
                setExpandAllDays(checked);
                setYellowHighlightDate(null);
                if (!checked) setExpandedDate(null);
              }}
              aria-describedby="expand-all-days-desc"
              className="sr-only peer"
            />
            <span className="pointer-events-none absolute left-0.5 top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-muted-foreground shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:bg-primary-foreground" />
          </span>
          <span className="text-sm text-foreground">Details einblenden</span>
        </label>
        <div className="ml-auto flex max-w-full flex-wrap items-end justify-end gap-x-4 gap-y-2 self-end pb-0.5">
          {Object.keys(editedDaySegments).length > 0 && (
            <button
              type="button"
              onClick={() => setEditedDaySegments({})}
              className="shrink-0 cursor-pointer rounded border border-[#e6c022] bg-[#F7D526] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[#e6c022] active:bg-[#d4be20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Speichern und übermitteln
            </button>
          )}
          <div
            className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1"
            role="list"
            aria-label="Tätigkeitsarten: Farbe und Name"
          >
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
              Legende
            </span>
            {SEGMENT_TYPE_OPTIONS.filter((type) => type !== "other").map((type) => (
              <div
                key={type}
                role="listitem"
                className="flex items-center gap-1.5 text-xs text-foreground"
              >
                <span
                  className={cn(
                    "size-3 shrink-0 rounded-sm ring-1 ring-border/50",
                    SEGMENT_COLORS_MUTED[type]
                  )}
                  aria-hidden
                />
                <span>{SEGMENT_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zeitachse 00:00–24:00 (nutzt verfügbare Breite, kein horizontaler Scroll) */}
      <div className="min-w-0">
        <div className="w-full">
          {/* Achsenbeschriftung: Stunden */}
          <div className="mb-2 flex border-b border-border pb-1">
            <div className="w-24 shrink-0 text-xs text-muted-foreground" aria-hidden />
            <div className="relative flex flex-1">
              {[0, 4, 8, 12, 16, 20, 24].map((h) => (
                <span
                  key={h}
                  className="absolute text-xs text-muted-foreground"
                  style={{ left: `${(h / 24) * 100}%`, transform: "translateX(-50%)" }}
                >
                  {h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}
                </span>
              ))}
            </div>
          </div>

          {/* Pro Tag eine Zeile + optional Detailtabelle */}
          {days.map((day) => {
            const isExpanded = expandAllDays || day.date === expandedDate;
            const isCreamHighlight = yellowHighlightDate === day.date;
            const segmentsForCoopCheck = editedDaySegments[day.date] ?? day.segments;
            const isNonCoopVehicleDay = dayHasNoCoopDriving(segmentsForCoopCheck, getVehicleById);
            return (
              <div key={day.date}>
                <DayRow
                  day={day}
                  isExpanded={isExpanded}
                  isCreamHighlight={isCreamHighlight}
                  isNonCoopVehicleDay={isNonCoopVehicleDay}
                  hoveredSegmentIndex={hoveredTableSegment?.date === day.date ? hoveredTableSegment.segmentIndex : null}
                  dayViolations={violationsForWeek.filter((v) => v.date === day.date)}
                  onDayClick={() => {
                    setExpandedDate((prev) => {
                      const next = prev === day.date ? null : day.date;
                      if (expandAllDays) {
                        setYellowHighlightDate(day.date);
                      } else {
                        setYellowHighlightDate(next);
                      }
                      return next;
                    });
                  }}
                  onSegmentEnter={(date, index) => setHoveredTableSegment({ date, segmentIndex: index })}
                  onSegmentLeave={() => setHoveredTableSegment(null)}
                />
                {isExpanded && (
                  <DayDetailTable
                    day={day}
                    segments={editedDaySegments[day.date] ?? day.segments}
                    onSave={(date, segs) => setEditedDaySegments((prev) => ({ ...prev, [date]: segs }))}
                    onSegmentEnter={(date, index) => setHoveredTableSegment({ date, segmentIndex: index })}
                    onSegmentLeave={() => setHoveredTableSegment(null)}
                    highlightedSegmentIndex={hoveredTableSegment?.date === day.date ? hoveredTableSegment.segmentIndex : null}
                    getVehicleById={getVehicleById}
                    isSelectedDay={isCreamHighlight}
                    isNonCoopVehicleDay={isNonCoopVehicleDay}
                    nonCoopSubmitException={nonCoopSubmitExceptions[day.date] ?? false}
                    onNonCoopSubmitExceptionChange={(checked) =>
                      setNonCoopSubmitExceptions((prev) => ({ ...prev, [day.date]: checked }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      <ArvViolationsPanel
        violations={violationsForWeek}
        highlightedDate={yellowHighlightDate}
        onSelectDate={handleArvViolationSelectDate}
        driverId={selectedDriverId || undefined}
      />
    </div>
  );
};

const DATA_SOURCE_LABEL: Record<"digital" | "manual", string> = {
  digital: "Fahrerkarte automatisch",
  manual: "Fahrerkarte manuell",
};

function segmentTypeDirty(cur: DrivingSegment, orig: DrivingSegment): boolean {
  return cur.type !== orig.type;
}

function segmentStartDirty(cur: DrivingSegment, orig: DrivingSegment): boolean {
  return cur.start.slice(0, 5) !== orig.start.slice(0, 5);
}

function segmentEndDirty(cur: DrivingSegment, orig: DrivingSegment): boolean {
  return getSegmentEndTimeString(cur).slice(0, 5) !== getSegmentEndTimeString(orig).slice(0, 5);
}

function segmentCommentDirty(cur: DrivingSegment, orig: DrivingSegment): boolean {
  return (cur.comment ?? "") !== (orig.comment ?? "");
}

function isSegmentRowDirty(cur: DrivingSegment, orig: DrivingSegment | undefined): boolean {
  if (!orig) return false;
  return (
    segmentTypeDirty(cur, orig) ||
    segmentStartDirty(cur, orig) ||
    segmentEndDirty(cur, orig) ||
    segmentCommentDirty(cur, orig)
  );
}

/** Schmale Spalten für Start/Ende/Dauer (HH:mm); links wie die Tageszeile (w-24) eingerückt. */
const DETAIL_TABLE_INDENT = "pl-24";
const TIME_COL = "w-[4.25rem] min-w-[4.25rem] max-w-[4.5rem] whitespace-nowrap px-2 tabular-nums";

/** Ausgewählte Datums-Zeile + zugehörige Detailtabelle (nur wenn aufgeklappt). */
const SELECTED_DAY_BG = "bg-[#FFF8E6]";
const SELECTED_DAY_BG_HOVER = "hover:bg-[#FFF2CC]";
/** Auswahl + kein Coop-Fahrzeug: etwas matteres Gelb. */
const SELECTED_NON_COOP_DAY_BG = "bg-[#e8e4da]";
const SELECTED_NON_COOP_DAY_BG_HOVER = "hover:bg-[#e2ddd2]";

type DayRowProps = {
  day: DrivingDay;
  isExpanded?: boolean;
  /** Gelber Hintergrund (#FFF8E6) nur wenn diese Zeile per Klick gewählt ist (sync mit „Verstösse dieser Woche“). */
  isCreamHighlight?: boolean;
  /** Kein Coop-Fahrzeug an diesem Tag (Lenksegmente nur Nicht-Coop): Zeile ausgegraut. */
  isNonCoopVehicleDay?: boolean;
  hoveredSegmentIndex?: number | null;
  dayViolations?: ArvViolation[];
  onDayClick: () => void;
  onSegmentEnter?: (date: string, index: number) => void;
  onSegmentLeave?: () => void;
};

const DayRow = ({
  day,
  isExpanded = false,
  isCreamHighlight = false,
  isNonCoopVehicleDay = false,
  hoveredSegmentIndex = null,
  dayViolations = [],
  onDayClick,
  onSegmentEnter,
  onSegmentLeave,
}: DayRowProps) => {
  const [tooltip, setTooltip] = useState<{
    seg: DrivingSegment;
    left: number;
    top: number;
  } | null>(null);

  const dayLabel = formatDayLabel(day.date);
  const isEmpty = day.segments.length === 0;
  const severity = dayViolations.length > 0
    ? highestSeverity(dayViolations.map((v) => v.severity).filter(Boolean) as ArvViolationSeverity[])
    : null;
  const SeverityIcon = severity ? SEVERITY_ICON[severity] : null;

  const handleSegmentMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    seg: DrivingSegment,
    index: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rowTimeline = e.currentTarget.parentElement;
    const rowRect = rowTimeline?.getBoundingClientRect();
    if (!rowRect) return;
    const left = rect.left - rowRect.left + rect.width / 2;
    const top = rect.top - rowRect.top;
    setTooltip({ seg, left, top });
    onSegmentEnter?.(day.date, index);
  };

  const handleSegmentMouseLeave = () => {
    setTooltip(null);
    onSegmentLeave?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDayClick();
    }
  };

  const dayRowLabel = [
    dayLabel,
    isExpanded ? "Details ausblenden" : "Details anzeigen",
    isNonCoopVehicleDay ? "Kein Coop-Fahrzeug" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={dayRowLabel}
      title={isNonCoopVehicleDay ? "An diesem Tag wurde kein Coop-Fahrzeug gefahren" : undefined}
      onClick={onDayClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex min-h-10 cursor-pointer items-stretch border-b border-border py-2 transition-colors last:border-b-0",
        isNonCoopVehicleDay && "opacity-[0.88] saturate-[0.48] contrast-[0.97]",
        !isCreamHighlight && !isNonCoopVehicleDay && "hover:bg-muted/30",
        isCreamHighlight && !isNonCoopVehicleDay && cn(SELECTED_DAY_BG, SELECTED_DAY_BG_HOVER),
        isCreamHighlight && isNonCoopVehicleDay && cn(SELECTED_NON_COOP_DAY_BG, SELECTED_NON_COOP_DAY_BG_HOVER),
        !isCreamHighlight && isNonCoopVehicleDay && "bg-muted/40 hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex w-24 min-w-24 shrink-0 items-center gap-1.5 text-sm whitespace-nowrap",
          isNonCoopVehicleDay ? "text-muted-foreground" : "text-foreground"
        )}
        aria-hidden
      >
        {dayLabel}
        {SeverityIcon && (
          <span
            title={severity === "high" ? "Verstoss (Hoch)" : severity === "medium" ? "Verstoss (Mittel)" : "Verstoss (Gering)"}
            aria-label={severity === "high" ? "Verstoss: Hoch" : severity === "medium" ? "Verstoss: Mittel" : "Verstoss: Gering"}
            className="inline-flex"
          >
            <SeverityIcon
              className={cn(
                "size-4 shrink-0",
                severity === "high" && "text-destructive",
                severity === "medium" && "text-amber-600",
                severity === "low" && "text-muted-foreground"
              )}
              aria-hidden
            />
          </span>
        )}
      </div>
      <div className="relative flex min-h-[2rem] flex-1 items-center py-1.5">
        {/* Hintergrund 00:00–24:00 */}
        <div
          className="absolute inset-0 rounded-sm bg-muted/20"
          aria-hidden
        />
        {isEmpty ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-sm text-xs text-muted-foreground whitespace-nowrap"
            style={{ left: "0%", right: "0%", width: "100%" }}
          >
            Ruhezeit
          </div>
        ) : (
          <>
            {/* Segmente in matteren Farben */}
            {day.segments.map((seg, i) => {
              const startMin = getSegmentStartMinutes(seg);
              const durationMin = getSegmentDurationMinutes(seg);
              const left = minutesToPercent(startMin);
              const width = minutesToPercent(durationMin);
              const isHovered = hoveredSegmentIndex === i;
              const colorClass = isHovered ? SEGMENT_COLORS[seg.type] : SEGMENT_COLORS_MUTED[seg.type];
              const label = SEGMENT_LABELS[seg.type];
              const durationStr = formatDuration(durationMin);

              return (
                <div
                  key={`${day.date}-${i}`}
                  className={cn(
                    "absolute top-1 bottom-1 min-w-[4px] rounded-sm cursor-default transition-colors",
                    colorClass
                  )}
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 2)}%`,
                  }}
                  onMouseEnter={(e) => handleSegmentMouseEnter(e, seg, i)}
                  onMouseLeave={handleSegmentMouseLeave}
                  role="img"
                  aria-label={`${label} ${seg.start} ${durationStr}`}
                />
              );
            })}
            {/* Verstoss-Zeiträume: nur dünner dunkelroter Rahmen, Zeitfarben bleiben sichtbar */}
            {dayViolations
              .filter((v): v is ArvViolation & { timeRange: { start: string; end: string } } => !!v.timeRange)
              .map((v, i) => {
                const startMin = timeStringToMinutes(v.timeRange!.start);
                let endMin = timeStringToMinutes(v.timeRange!.end);
                if (endMin <= startMin) endMin = 24 * 60;
                const left = minutesToPercent(startMin);
                const width = minutesToPercent(Math.max(0, endMin - startMin));
                return (
                  <div
                    key={`violation-${day.date}-${i}`}
                    className="absolute top-1 bottom-1 min-w-[4px] rounded-sm border-2 border-destructive pointer-events-none"
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 2)}%`,
                    }}
                    role="img"
                    aria-label={`Verstoss: ${v.description}, ${v.timeRange!.start} bis ${v.timeRange!.end}`}
                    title={`Verstoss: ${v.description} (${v.timeRange!.start} – ${v.timeRange!.end})`}
                  />
                );
              })}
          </>
        )}
        {tooltip && (
          <Tooltip
            segment={tooltip.seg}
            left={tooltip.left}
            top={tooltip.top}
            onClose={() => setTooltip(null)}
          />
        )}
      </div>
    </div>
  );
};

type TooltipProps = {
  segment: DrivingSegment;
  left: number;
  top: number;
  onClose: () => void;
};

const Tooltip = ({ segment, left, top, onClose }: TooltipProps) => {
  const label = SEGMENT_LABELS[segment.type];
  const durationMin = getSegmentDurationMinutes(segment);
  const durationStr = formatDuration(durationMin);

  return (
    <div
      className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
      style={{ left, top: top - 4 }}
      role="tooltip"
    >
      <div className="font-medium">{label}</div>
      <div>Start: {segment.start}</div>
      <div>Dauer: {durationStr}</div>
    </div>
  );
};

type DayDetailTableProps = {
  day: DrivingDay;
  segments: DrivingSegment[];
  onSave: (date: string, segments: DrivingSegment[]) => void;
  onSegmentEnter?: (date: string, segmentIndex: number) => void;
  onSegmentLeave?: () => void;
  highlightedSegmentIndex?: number | null;
  getVehicleById: (id: string) => { licensePlate: string; vehicleNumber: string } | undefined;
  /** Gleiche Hintergrundfarbe wie die aufgeklappte Datums-Zeile (#FFF8E6). */
  isSelectedDay?: boolean;
  /** Gleiche Logik wie Tageszeile: kein Coop-Fahrzeug → ausgegraut. */
  isNonCoopVehicleDay?: boolean;
  /** Opt-in: Tageszeiten trotzdem zur Übermittlung vorsehen (nur bei Nicht-Coop-Tag). */
  nonCoopSubmitException?: boolean;
  onNonCoopSubmitExceptionChange?: (checked: boolean) => void;
};

const NON_COOP_SUBMIT_HINT_ID = "non-coop-submit-hint";

const DayDetailTable = ({
  day,
  segments,
  onSave,
  onSegmentEnter,
  onSegmentLeave,
  highlightedSegmentIndex = null,
  getVehicleById,
  isSelectedDay = false,
  isNonCoopVehicleDay = false,
  nonCoopSubmitException = false,
  onNonCoopSubmitExceptionChange,
}: DayDetailTableProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftSegments, setDraftSegments] = useState<DrivingSegment[]>([]);
  /** Snapshot beim Öffnen des Edit-Modus – für „Original:“-Vergleich und Zeilenmarkierung. */
  const [baselineSegments, setBaselineSegments] = useState<DrivingSegment[]>([]);

  const startEditing = () => {
    const snap = segments.map((s) => ({ ...s }));
    setBaselineSegments(snap);
    setDraftSegments(snap.map((s) => ({ ...s })));
    setIsEditing(true);
  };

  const finishEditing = () => {
    onSave(day.date, draftSegments);
    setBaselineSegments([]);
    setIsEditing(false);
  };

  const updateSegment = (index: number, patch: Partial<DrivingSegment>) => {
    setDraftSegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, ...patch } : seg))
    );
  };

  if (segments.length === 0) {
    return (
      <div
        className={cn(
          "border-b border-border py-3 pr-4 text-sm text-muted-foreground",
          DETAIL_TABLE_INDENT,
          isNonCoopVehicleDay && "opacity-90 saturate-[0.48]",
          isSelectedDay && !isNonCoopVehicleDay && SELECTED_DAY_BG,
          isSelectedDay && isNonCoopVehicleDay && SELECTED_NON_COOP_DAY_BG,
          !isSelectedDay && !isNonCoopVehicleDay && "bg-muted/10",
          !isSelectedDay && isNonCoopVehicleDay && "bg-muted/35"
        )}
      >
        Keine Segmentdaten für diesen Tag.
      </div>
    );
  }

  const displaySegments = isEditing ? draftSegments : segments;

  const nonCoopSubmitHintId = `${NON_COOP_SUBMIT_HINT_ID}-${day.date}`;

  return (
    <div
      className={cn(
        "border-b border-border",
        isNonCoopVehicleDay && "opacity-[0.9] saturate-[0.48]",
        isSelectedDay && !isNonCoopVehicleDay && SELECTED_DAY_BG,
        isSelectedDay && isNonCoopVehicleDay && SELECTED_NON_COOP_DAY_BG,
        !isSelectedDay && !isNonCoopVehicleDay && "bg-muted/10",
        !isSelectedDay && isNonCoopVehicleDay && "bg-muted/35"
      )}
    >
      {isNonCoopVehicleDay && onNonCoopSubmitExceptionChange && (
        <div className={cn("border-b border-border/70 px-4 py-3", DETAIL_TABLE_INDENT)}>
          <div className="rounded-md border border-border bg-background/90 px-3 py-2.5 shadow-sm">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={nonCoopSubmitException}
                onChange={(e) => onNonCoopSubmitExceptionChange(e.target.checked)}
                aria-describedby={nonCoopSubmitHintId}
                className="mt-1 size-4 shrink-0 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Die Zeiten werden ausnahmsweise übermittelt
                </span>
                <span
                  id={nonCoopSubmitHintId}
                  className="mt-1 block text-xs leading-snug text-muted-foreground"
                >
                  Tage ohne Coop-Fahrzeug werden standardmässig nicht übermittelt. Setzen Sie diese Option, wenn die
                  Zeiten dieses Tags dennoch übermittelt werden sollen.
                </span>
              </span>
            </label>
          </div>
        </div>
      )}
      <div className={cn("overflow-x-auto py-3 pr-4", DETAIL_TABLE_INDENT)}>
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead
            className={cn(
              "sticky top-0 z-10 border-b border-border",
              isSelectedDay && !isNonCoopVehicleDay && SELECTED_DAY_BG,
              isSelectedDay && isNonCoopVehicleDay && SELECTED_NON_COOP_DAY_BG,
              !isSelectedDay && !isNonCoopVehicleDay && "bg-muted/50",
              !isSelectedDay && isNonCoopVehicleDay && "bg-muted/40"
            )}
          >
            <tr>
              <th colSpan={7} className="px-4 py-3 text-right">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Tabelle editieren
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finishEditing}
                    className="rounded border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Fertig
                  </button>
                )}
              </th>
            </tr>
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tätigkeitsart</th>
              <th className={cn("py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", TIME_COL)}>Startzeit</th>
              <th className={cn("py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", TIME_COL)}>Endzeit</th>
              <th className={cn("py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", TIME_COL)}>Dauer</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fahrzeug</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datenherkunft</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kommentar</th>
            </tr>
          </thead>
          <tbody>
            {displaySegments.map((seg, i) => {
              const vehicle = seg.vehicleId ? getVehicleById(seg.vehicleId) : undefined;
              const vehicleLabel = vehicle
                ? `${vehicle.licensePlate}, Nr. ${vehicle.vehicleNumber}`
                : "–";
              const dataSourceLabel =
                seg.dataSource != null ? DATA_SOURCE_LABEL[seg.dataSource] : "–";
              /** Ansicht: Mock-Original (`day.segments`); Edit: Snapshot beim Öffnen des Edit-Modus. */
              const compareBase = isEditing ? (baselineSegments[i] ?? seg) : (day.segments[i] ?? seg);
              const rowDirty = isSegmentRowDirty(seg, compareBase);
              return (
                <tr
                  key={`${day.date}-${i}`}
                  className={cn(
                    "border-b border-border/60 last:border-b-0",
                    rowDirty && "bg-amber-50/55 dark:bg-amber-950/30",
                    highlightedSegmentIndex === i && !rowDirty && "bg-muted/40"
                  )}
                  onMouseEnter={() => onSegmentEnter?.(day.date, i)}
                  onMouseLeave={() => onSegmentLeave?.()}
                >
                  {!isEditing ? (
                    <>
                      <td className="align-top py-2 pr-4">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              "text-foreground",
                              segmentTypeDirty(seg, compareBase) && "font-bold"
                            )}
                          >
                            {SEGMENT_LABELS[seg.type]}
                          </span>
                          {segmentTypeDirty(seg, compareBase) && (
                            <span className="text-[10px] leading-tight text-muted-foreground">
                              {SEGMENT_LABELS[compareBase.type]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("align-top py-2", TIME_COL)}>
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              "text-foreground",
                              segmentStartDirty(seg, compareBase) && "font-bold"
                            )}
                          >
                            {seg.start.slice(0, 5)}
                          </span>
                          {segmentStartDirty(seg, compareBase) && (
                            <span className="text-[10px] leading-tight text-muted-foreground">
                              {compareBase.start.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("align-top py-2", TIME_COL)}>
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              "text-foreground",
                              segmentEndDirty(seg, compareBase) && "font-bold"
                            )}
                          >
                            {getSegmentEndTimeString(seg)}
                          </span>
                          {segmentEndDirty(seg, compareBase) && (
                            <span className="text-[10px] leading-tight text-muted-foreground">
                              {getSegmentEndTimeString(compareBase).slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("py-2 text-foreground", TIME_COL)}>
                        {formatDurationHHMM(getSegmentDurationMinutes(seg))}
                      </td>
                      <td className="py-2 pr-4 text-foreground">{vehicleLabel}</td>
                      <td className="py-2 pr-4 text-foreground">{dataSourceLabel}</td>
                      <td className="align-top py-2">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              "text-foreground",
                              segmentCommentDirty(seg, compareBase) && "font-bold"
                            )}
                          >
                            {seg.comment ?? "–"}
                          </span>
                          {segmentCommentDirty(seg, compareBase) && (
                            <span
                              className="line-clamp-2 break-words text-[10px] leading-tight text-muted-foreground"
                              title={compareBase.comment?.trim() ? compareBase.comment : undefined}
                            >
                              {compareBase.comment?.trim() ? compareBase.comment : "–"}
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="align-top py-1 pr-4">
                        <div className="flex flex-col gap-0.5">
                          <select
                            value={seg.type}
                            onChange={(e) => updateSegment(i, { type: e.target.value as SegmentType })}
                            className={cn(
                              "w-full min-w-[10rem] rounded border border-border bg-background px-2 py-1 text-foreground",
                              segmentTypeDirty(seg, compareBase) && "font-bold"
                            )}
                          >
                            {SEGMENT_TYPE_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {SEGMENT_LABELS[t]}
                              </option>
                            ))}
                          </select>
                          {segmentTypeDirty(seg, compareBase) && (
                            <span className="text-[10px] leading-tight text-muted-foreground">
                              {SEGMENT_LABELS[compareBase.type]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("align-top py-1", TIME_COL)}>
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="time"
                            value={seg.start.slice(0, 5)}
                            onChange={(e) => updateSegment(i, { start: e.target.value })}
                            className={cn(
                              "w-full min-w-0 max-w-[4.25rem] rounded border border-border bg-background px-1 py-1 text-foreground",
                              segmentStartDirty(seg, compareBase) && "font-bold"
                            )}
                          />
                          {segmentStartDirty(seg, compareBase) && (
                            <span className="text-[10px] leading-tight text-muted-foreground">
                              {compareBase.start.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("align-top py-1", TIME_COL)}>
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="time"
                            value={getSegmentEndTimeString(seg).slice(0, 5)}
                            onChange={(e) =>
                              updateSegment(i, { end: e.target.value, duration: undefined })
                            }
                            className={cn(
                              "w-full min-w-0 max-w-[4.25rem] rounded border border-border bg-background px-1 py-1 text-foreground",
                              segmentEndDirty(seg, compareBase) && "font-bold"
                            )}
                          />
                          {segmentEndDirty(seg, compareBase) && (
                            <span className="text-[10px] leading-tight text-muted-foreground">
                              {getSegmentEndTimeString(compareBase).slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("align-top py-1 text-muted-foreground", TIME_COL)}>
                        {formatDurationHHMM(getSegmentDurationMinutes(seg))}
                      </td>
                      <td className="align-top py-1 pr-4 text-muted-foreground">{vehicleLabel}</td>
                      <td className="align-top py-1 pr-4 text-muted-foreground">
                        {seg.dataSource != null ? DATA_SOURCE_LABEL[seg.dataSource] : "–"}
                      </td>
                      <td className="align-top py-1">
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="text"
                            value={seg.comment ?? ""}
                            onChange={(e) => updateSegment(i, { comment: e.target.value || undefined })}
                            placeholder="Kommentar"
                            className={cn(
                              "w-full min-w-[8rem] rounded border border-border bg-background px-2 py-1 text-foreground placeholder:text-muted-foreground",
                              segmentCommentDirty(seg, compareBase) && "font-bold"
                            )}
                          />
                          {segmentCommentDirty(seg, compareBase) && (
                            <span
                              className="line-clamp-2 break-words text-[10px] leading-tight text-muted-foreground"
                              title={compareBase.comment?.trim() ? compareBase.comment : undefined}
                            >
                              {compareBase.comment?.trim() ? compareBase.comment : "–"}
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
