"use client";

import { timeStringToMinutes, minutesToPercent } from "@/lib/drivingUtils";
import { cn } from "@/lib/utils";

export type ViolationDayTimeRange = { start: string; end: string };

const MINUTES_DAY = 24 * 60;

/** Beschriftung unter dem Balken (Stunden seit Mitternacht, alle 2 h). */
const SCALE_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] as const;

/**
 * Segmente für den Verstoss-Balken (00:00–24:00).
 * Über Mitternacht: zwei Bereiche (z. B. 22:00–24:00 und 00:00–05:00).
 */
function segmentsForViolationRange(
  range: ViolationDayTimeRange
): { leftPct: number; widthPct: number }[] {
  const startMin = timeStringToMinutes(range.start);
  const endMin = timeStringToMinutes(range.end);
  if (endMin > startMin) {
    return [
      {
        leftPct: minutesToPercent(startMin),
        widthPct: minutesToPercent(endMin - startMin),
      },
    ];
  }
  if (endMin < startMin) {
    return [
      {
        leftPct: minutesToPercent(startMin),
        widthPct: minutesToPercent(MINUTES_DAY - startMin),
      },
      { leftPct: 0, widthPct: minutesToPercent(endMin) },
    ];
  }
  const hairline = Math.max(minutesToPercent(2), 0.35);
  return [{ leftPct: minutesToPercent(startMin), widthPct: hairline }];
}

/** Mindestbreite in %, damit der Verstoss-Balken auf schmalen Viewports lesbar bleibt. */
const MIN_SEGMENT_WIDTH_PCT = 0.45;

type FlatSegment = {
  leftPct: number;
  widthPct: number;
  /** Index des Verstosses in der Tagesliste (Karten-Reihenfolge). */
  primaryIndex: number;
};

function flattenSegments(
  ranges: ViolationDayTimeRange[],
  primaryIndices?: number[]
): FlatSegment[] {
  return ranges.flatMap((range, i) => {
    const primaryIndex = primaryIndices?.[i] ?? i;
    return segmentsForViolationRange(range).map((seg) => ({
      leftPct: seg.leftPct,
      widthPct: Math.max(seg.widthPct, MIN_SEGMENT_WIDTH_PCT),
      primaryIndex,
    }));
  });
}

function defaultRangeCaptions(ranges: ViolationDayTimeRange[]): string[] {
  return ranges.map(
    (r, i) =>
      `${ranges.length > 1 ? `${i + 1}. ` : ""}Verstoss: ${r.start} – ${r.end}`
  );
}

type ArvViolationDayTimelineBarProps = {
  /** Ein oder mehrere Verstoss-Zeiträume am selben Tag (übereinander gezeichnet). */
  timeRanges: ViolationDayTimeRange[];
  /**
   * Gleiche Länge wie `timeRanges`: Primärindex in der Verstossliste (Karten).
   * Erforderlich, wenn `selectedPrimaryIndex` gesetzt ist.
   */
  primaryIndices?: number[];
  /** Hervorgehobener Verstoss im Raster (übrige Bereiche abgeschwächt). */
  selectedPrimaryIndex?: number | null;
  className?: string;
  /** Höhe: `default` wie Report-Dialog, `compact` für eingebettete Detailansicht */
  size?: "default" | "compact";
  /** Zeilen unter dem Raster; Standard aus `timeRanges` nummeriert. */
  rangeCaptions?: string[];
  /**
   * Optional: Hervorhebung der Beschriftungszeile (Index = Kartenindex, nicht nur Balken).
   * Länge typischerweise Anzahl aller Verstösse des Tags.
   */
  captionPrimaryIndices?: number[];
};

/**
 * Tageszeit 00:00–24:00: Stundenraster + Achse.
 * Mehrere Verstösse = mehrere rote Bereiche am selben Balken.
 */
export function ArvViolationDayTimelineBar({
  timeRanges,
  primaryIndices,
  selectedPrimaryIndex = null,
  className,
  size = "default",
  rangeCaptions: rangeCaptionsProp,
  captionPrimaryIndices,
}: ArvViolationDayTimelineBarProps) {
  const segments = flattenSegments(timeRanges, primaryIndices);
  const heightClass = size === "compact" ? "h-10" : "h-12";
  const captions =
    rangeCaptionsProp && rangeCaptionsProp.length > 0
      ? rangeCaptionsProp
      : defaultRangeCaptions(timeRanges);

  const hasSegmentForSelection =
    selectedPrimaryIndex == null ||
    segments.some((s) => s.primaryIndex === selectedPrimaryIndex);

  const selectionActive =
    selectedPrimaryIndex != null &&
    primaryIndices != null &&
    primaryIndices.length === timeRanges.length &&
    hasSegmentForSelection;

  const ariaParts = timeRanges.map(
    (r) => `${r.start} bis ${r.end}`.replace(" bis ", " – ")
  );
  const ariaLabel =
    timeRanges.length === 0
      ? "Keine Verstoss-Zeiträume am Tag hinterlegt."
      : `Tageszeit von Mitternacht bis Mitternacht. ${timeRanges.length} Verstoss-Bereich${timeRanges.length === 1 ? "" : "e"}: ${ariaParts.join("; ")}.`;

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Tageszeit (00:00 – 24:00)
      </p>
      <div className="w-full">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-md border border-border bg-muted/30",
            heightClass
          )}
          role="img"
          aria-label={ariaLabel}
        >
          <div className="absolute inset-0 bg-muted/40" aria-hidden />
          <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
            {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => {
              const major = h % 6 === 0;
              return (
                <div
                  key={h}
                  className={cn(
                    "absolute top-0 h-full w-px",
                    major ? "bg-border/60" : "bg-border/25"
                  )}
                  style={{ left: `${(h / 24) * 100}%` }}
                />
              );
            })}
          </div>
          {timeRanges.length === 0 ? (
            <div className="absolute inset-0 z-[2] flex items-center justify-center px-2 text-center text-[10px] text-muted-foreground sm:text-xs">
              Kein Zeitraum hinterlegt
            </div>
          ) : (
            segments.map((seg, i) => {
              const isSel =
                !selectionActive || seg.primaryIndex === selectedPrimaryIndex;
              return (
                <div
                  key={i}
                  className={cn(
                    "pointer-events-none absolute top-1 bottom-1 min-w-[4px] rounded-sm border transition-[opacity,box-shadow,background-color] duration-150",
                    isSel
                      ? "z-[3] border-destructive bg-destructive/85 shadow-md ring-2 ring-foreground/25"
                      : "z-[2] border-destructive/50 bg-destructive/40 opacity-55"
                  )}
                  style={{ left: `${seg.leftPct}%`, width: `${seg.widthPct}%` }}
                  title="Verstoss-Zeitraum"
                  aria-hidden
                />
              );
            })
          )}
        </div>
        <div className="relative mt-1.5 h-5 w-full select-none text-[10px] leading-none tabular-nums text-muted-foreground sm:text-xs">
          {SCALE_HOURS.map((h) => {
            if (h === 0) {
              return (
                <span key={h} className="absolute left-0 top-0">
                  {h}
                  <span className="sr-only"> Uhr</span>
                </span>
              );
            }
            if (h === 24) {
              return (
                <span key={h} className="absolute right-0 top-0">
                  {h}
                  <span className="sr-only"> Uhr</span>
                </span>
              );
            }
            return (
              <span
                key={h}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                {h}
                <span className="sr-only"> Uhr</span>
              </span>
            );
          })}
        </div>
      </div>
      {captions.length > 0 ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {captions.map((line, i) => {
            const capIdx = captionPrimaryIndices?.[i] ?? i;
            const capSel =
              selectedPrimaryIndex != null && capIdx === selectedPrimaryIndex;
            const capDim =
              selectedPrimaryIndex != null && !capSel;
            return (
              <p
                key={i}
                className={cn(
                  "rounded px-1 py-0.5 text-sm font-semibold tabular-nums transition-colors",
                  capSel && "bg-primary/10 text-foreground ring-2 ring-primary/40",
                  capDim && "font-medium text-muted-foreground",
                  !capSel && !capDim && "text-foreground"
                )}
              >
                {line}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
