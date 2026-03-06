"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import type { DrivingDay, DrivingSegment } from "@/domain/drivingTypes";
import { getMockDrivingData, getArvViolationsForWeek } from "@/mock/drivingData";
import { filterDriversBySearch } from "@/lib/driverSearch";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import { ArvViolationsPanel } from "@/components/views/arv-violations-panel";
import {
  formatDayLabel,
  formatDuration,
  formatWeekLabel,
  getSegmentDurationMinutes,
  getSegmentStartMinutes,
  minutesToPercent,
  SEGMENT_COLORS,
  SEGMENT_LABELS,
} from "@/lib/drivingUtils";
import { cn } from "@/lib/utils";

const SEARCH_PARAM = "search";
const DRIVER_ID_PARAM = "driverId";

/**
 * US-01: Wochenansicht Fahrerkartendaten.
 * Globale Mitarbeiter:innen-Auswahl (SelectedEmployeeContext): vorausgewählt im Dropdown.
 * Bei lokaler Änderung wird die globale Auswahl aktualisiert. URL driverId für Deep-Links.
 */
export const WeeklyDriverView = () => {
  const { drivers, driverWeeks } = getMockDrivingData();
  const { selectedEmployeeId, setSelectedEmployee } = useSelectedEmployee();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get(SEARCH_PARAM) ?? "";
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

  useEffect(() => {
    if (selectedDriverId && selectedDriverId !== urlDriverId) {
      const next = new URLSearchParams(searchParams.toString());
      next.set(DRIVER_ID_PARAM, selectedDriverId);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }
  }, [selectedDriverId, urlDriverId, pathname, searchParams, router]);

  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("");
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);

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

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    setHighlightedDate(null);
    const driver = filteredDrivers.find((d) => d.id === id);
    setSelectedEmployee(id, driver ?? undefined);
    const next = new URLSearchParams(searchParams.toString());
    next.set(DRIVER_ID_PARAM, id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    const firstWeek = driverWeeks.find((w) => w.driverId === id)?.weekStart;
    setSelectedWeekStart(firstWeek ?? "");
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeekStart(e.target.value);
    setHighlightedDate(null);
  };

  const violationsForWeek = useMemo(
    () =>
      currentWeekStart && selectedDriverId
        ? getArvViolationsForWeek(selectedDriverId, currentWeekStart)
        : [],
    [selectedDriverId, currentWeekStart]
  );

  const handleArvViolationSelectDate = (date: string) => {
    setHighlightedDate((prev) => (prev === date ? null : date));
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
        className="flex w-full flex-col gap-5 rounded border border-border bg-background p-6"
        role="region"
        aria-label="Wochenansicht Fahrerkarten"
      >
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="weekly-driver-select"
              className="text-xs font-medium text-muted-foreground"
            >
              Mitarbeitende
            </label>
            <select
              id="weekly-driver-select"
              value=""
              disabled
              aria-label="Mitarbeitende auswählen"
              className="h-9 min-w-[12rem] rounded border border-border bg-background px-3 text-sm text-muted-foreground"
            >
              <option value="">Keine Treffer</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Keine Treffer. Bitte Suche anpassen.
        </p>
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
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 overflow-auto">
      {/* Auswahl Mitarbeitende + Woche */}
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="weekly-driver-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Mitarbeitende
          </label>
          <select
            id="weekly-driver-select"
            value={selectedDriverId}
            onChange={handleDriverChange}
            aria-label="Mitarbeitende auswählen"
            className={cn(
              "h-9 min-w-[12rem] rounded border border-border bg-background px-3 text-sm text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            )}
          >
            {filteredDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
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
      </div>

      {/* Zeitachse 00:00–24:00 */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Achsenbeschriftung: Stunden */}
          <div className="mb-2 flex border-b border-border pb-1">
            <div className="w-20 shrink-0 text-xs text-muted-foreground" aria-hidden />
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

          {/* Pro Tag eine Zeile */}
          {days.map((day) => (
            <DayRow
              key={day.date}
              day={day}
              isHighlighted={day.date === highlightedDate}
            />
          ))}
        </div>
      </div>
      </div>

      <ArvViolationsPanel
        violations={violationsForWeek}
        highlightedDate={highlightedDate}
        onSelectDate={handleArvViolationSelectDate}
      />
    </div>
  );
};

type DayRowProps = {
  day: DrivingDay;
  isHighlighted?: boolean;
};

const DayRow = ({ day, isHighlighted = false }: DayRowProps) => {
  const [tooltip, setTooltip] = useState<{
    seg: DrivingSegment;
    left: number;
    top: number;
  } | null>(null);

  const dayLabel = formatDayLabel(day.date);
  const isEmpty = day.segments.length === 0;

  const handleSegmentMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    seg: DrivingSegment
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rowTimeline = e.currentTarget.parentElement;
    const rowRect = rowTimeline?.getBoundingClientRect();
    if (!rowRect) return;
    const left = rect.left - rowRect.left + rect.width / 2;
    const top = rect.top - rowRect.top;
    setTooltip({ seg, left, top });
  };

  const handleSegmentMouseLeave = () => setTooltip(null);

  return (
    <div
      className={cn(
        "flex items-stretch border-b border-border py-2 transition-colors last:border-b-0",
        isHighlighted && "bg-primary/5 border-l-4 border-l-primary"
      )}
    >
      <div
        className="flex w-20 shrink-0 items-center text-sm text-foreground"
        aria-hidden
      >
        {dayLabel}
      </div>
      <div className="relative flex flex-1 items-center py-1.5">
        {/* Hintergrund 00:00–24:00 */}
        <div
          className="absolute inset-0 rounded-sm bg-muted/20"
          aria-hidden
        />
        {isEmpty ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-sm text-xs text-muted-foreground"
            style={{ left: "0%", right: "0%", width: "100%" }}
          >
            Ruhezeit
          </div>
        ) : (
          day.segments.map((seg, i) => {
            const startMin = getSegmentStartMinutes(seg);
            const durationMin = getSegmentDurationMinutes(seg);
            const left = minutesToPercent(startMin);
            const width = minutesToPercent(durationMin);
            const colorClass = SEGMENT_COLORS[seg.type];
            const label = SEGMENT_LABELS[seg.type];
            const durationStr = formatDuration(durationMin);

            return (
              <div
                key={`${day.date}-${i}`}
                className={cn(
                  "absolute top-1 bottom-1 min-w-[4px] rounded-sm cursor-default opacity-95",
                  colorClass
                )}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 2)}%`,
                }}
                onMouseEnter={(e) => handleSegmentMouseEnter(e, seg)}
                onMouseLeave={handleSegmentMouseLeave}
                role="img"
                aria-label={`${label} ${seg.start} ${durationStr}`}
              />
            );
          })
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
