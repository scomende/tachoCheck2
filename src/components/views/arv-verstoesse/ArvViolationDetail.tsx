"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { ArvViolation, ArvViolationSeverity, ArvViolationStatus } from "@/domain/drivingTypes";
import type { ArvViolationDayGroup, MergedArvRow } from "@/mock/arvViolations";
import { getDriverNameById } from "@/mock/arvViolations";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import { Button } from "@/components/ui/button";
import {
  SEVERITY_LABELS,
  STATUS_LABELS,
  STATUS_BG_COLORS,
  VIOLATION_TYPE_LABELS,
  VIOLATION_TYPE_COLORS,
  GLOBAL_TOOLBAR_DRIVER_NAME_HIGHLIGHT_CLASS,
} from "./constants";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import { driverHighlightedByGlobalToolbar } from "@/lib/driverSearch";
import { ArvViolationDayTimelineBar } from "./ArvViolationDayTimelineBar";
import { cn } from "@/lib/utils";

function formatTimeRange(range: { start: string; end: string }): string {
  return `${range.start} – ${range.end}`;
}

/** Fliesstext zu den Originaldaten (Tab Verletzungen, aufgeklappter Bereich). */
export function originalDataNarrative(v: ArvViolation): string {
  const parts: string[] = [];
  const sev = v.severity ? SEVERITY_LABELS[v.severity] : "Vorhanden";
  parts.push(`Schweregrad ${sev}`);
  if (v.status) parts.push(`Status ${STATUS_LABELS[v.status]}`);
  if (v.violationType) parts.push(`Verletzungstyp ${VIOLATION_TYPE_LABELS[v.violationType]}`);
  if (v.timeRange) {
    parts.push(`Zeitraum ${formatTimeRange(v.timeRange)}`);
  }
  if (v.rule) parts.push(`Regel ${v.rule}`);
  parts.push(v.description);
  return parts.join(". ") + ".";
}

const SEVERITY_ICON: Record<
  ArvViolationSeverity,
  React.ComponentType<{ className?: string }>
> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

function SubSeverity({ violation, bold }: { violation: ArvViolation | null; bold?: boolean }) {
  if (!violation?.severity) return <span className="text-muted-foreground">–</span>;
  const Icon = SEVERITY_ICON[violation.severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", bold && "font-bold")}>
      <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
      {SEVERITY_LABELS[violation.severity]}
    </span>
  );
}

function SubStatusPill({ status, bold }: { status: ArvViolationStatus | undefined; bold?: boolean }) {
  if (!status) return <span className="text-muted-foreground">–</span>;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_BG_COLORS[status],
        bold && "font-bold"
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function primaryViolation(row: MergedArvRow): ArvViolation | null {
  return row.corrected ?? row.original;
}

type ArvViolationDayGroupDetailContentProps = {
  group: ArvViolationDayGroup;
  onShowDayReport: (group: ArvViolationDayGroup) => void;
  className?: string;
};

/**
 * Aufgeklappter Bereich: alle Verletzungen des Tages, gemeinsames Tagesraster, ein Report pro Tag.
 */
export function ArvViolationDayGroupDetailContent({
  group,
  onShowDayReport,
  className,
}: ArvViolationDayGroupDetailContentProps) {
  const { selectedEmployeeId, searchQuery, drivers } = useSelectedEmployee();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const primaries = group.violations
    .map(primaryViolation)
    .filter((v): v is ArvViolation => v != null);

  useEffect(() => {
    setSelectedCardIndex(primaries.length > 0 ? 0 : null);
  }, [group.key, primaries.length]);

  const barEntries = primaries
    .map((p, primaryIndex) =>
      p.timeRange ? { range: p.timeRange, primaryIndex } : null
    )
    .filter((e): e is { range: { start: string; end: string }; primaryIndex: number } => e != null);

  const barTimeRanges = barEntries.map((e) => e.range);
  const barPrimaryIndices = barEntries.map((e) => e.primaryIndex);

  const rangeCaptions = primaries.map((p, i) => {
    const n = i + 1;
    if (p.timeRange) {
      return `${primaries.length > 1 ? `${n}. ` : ""}Verletzung: ${formatTimeRange(p.timeRange)}`;
    }
    return `${primaries.length > 1 ? `${n}. ` : ""}Verletzung: kein Uhrzeitraum hinterlegt`;
  });

  const fahrerkartenHref = group.driverId
    ? `/fahrerkarten?driverId=${encodeURIComponent(group.driverId)}&date=${encodeURIComponent(group.date)}`
    : "/fahrerkarten";

  const driverDisplayName = getDriverNameById(group.driverId);
  const nameToolbarHighlight = driverHighlightedByGlobalToolbar(
    group.driverId,
    selectedEmployeeId,
    searchQuery,
    drivers
  );

  const fieldClass = "flex min-w-0 flex-col gap-0.5";

  return (
    <div
      className={cn("border-t border-border/60 px-4 py-4 text-sm", className)}
      role="region"
      aria-label={`Verletzungen ${formatDayLabelLong(group.date)}`}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Verletzungen an diesem Tag ({primaries.length})
      </h3>

      <ul
        className="mb-6 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label={`${primaries.length === 1 ? "Eine Verletzung" : `${primaries.length} Verletzungen`} als Karten`}
      >
        {group.violations.map((row, index) => {
          const v = primaryViolation(row);
          const orig = row.corrected ? row.original : null;
          if (!v) return null;
          return (
            <li key={row.key} className="min-w-0">
              <article
                tabIndex={0}
                role="button"
                aria-pressed={selectedCardIndex === index}
                aria-label={`Verletzung ${index + 1} von ${primaries.length}. Karte wählen, um den Zeitraum im Tagesraster hervorzuheben.`}
                onClick={() => setSelectedCardIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCardIndex(index);
                  }
                }}
                className={cn(
                  "flex h-full cursor-pointer flex-col rounded-xl border border-border/90 bg-white p-4 shadow-sm outline-none transition-shadow hover:shadow-md dark:border-border dark:bg-card",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  selectedCardIndex === index
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-[#FFF8E6] shadow-md dark:ring-offset-background"
                    : "ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
                )}
              >
                <header className="mb-3 flex gap-3 border-b border-border/60 pb-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    {row.violationType ? (
                      <p className="inline-flex items-center gap-2 text-sm font-semibold leading-snug text-foreground">
                        <span
                          className={cn(
                            "inline-block size-2.5 shrink-0 rounded-full",
                            VIOLATION_TYPE_COLORS[row.violationType]
                          )}
                          aria-hidden
                        />
                        {VIOLATION_TYPE_LABELS[row.violationType]}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold leading-snug text-foreground">{row.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <SubSeverity violation={v} bold={row.corrected != null} />
                      <SubStatusPill status={v.status} bold={row.corrected != null} />
                    </div>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-3 text-xs">
                  <div className={fieldClass}>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Verletzungszeitraum
                    </span>
                    {v.timeRange ? (
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatTimeRange(v.timeRange)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Kein Uhrzeitraum hinterlegt</span>
                    )}
                  </div>
                  {v.rule ? (
                    <div className={fieldClass}>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Betroffene Regel
                      </span>
                      <span className="text-foreground">{v.rule}</span>
                    </div>
                  ) : null}
                  {row.violationType && v.description ? (
                    <div className={fieldClass}>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Kurzbeschreibung
                      </span>
                      <span className="leading-relaxed text-foreground">{v.description}</span>
                    </div>
                  ) : null}
                  <div className={fieldClass}>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Datenbasis
                    </span>
                    <span className="text-foreground">
                      {v.useCorrectedData ? "Korrigierte Daten" : "Originaldaten"}
                    </span>
                  </div>
                </div>
                {orig ? (
                  <footer className="mt-auto border-t border-border/50 pt-3">
                    <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-xs leading-snug dark:bg-muted/20">
                      <span className="font-semibold text-foreground">Original:</span>{" "}
                      <span className="text-muted-foreground">{originalDataNarrative(orig)}</span>
                    </div>
                  </footer>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mb-5 rounded-md border border-border/80 bg-background/80 p-3 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tagesraster (alle Verletzungen)
        </p>
        <ArvViolationDayTimelineBar
          timeRanges={barTimeRanges}
          primaryIndices={barPrimaryIndices}
          selectedPrimaryIndex={selectedCardIndex}
          size="compact"
          rangeCaptions={rangeCaptions}
          captionPrimaryIndices={primaries.map((_, i) => i)}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4">
        <Button asChild variant="outline" size="sm">
          <Link href={fahrerkartenHref}>
            Zur Fahrerkartenansicht (
            {nameToolbarHighlight ? (
              <mark className={GLOBAL_TOOLBAR_DRIVER_NAME_HIGHLIGHT_CLASS}>{driverDisplayName}</mark>
            ) : (
              driverDisplayName
            )}
            )
          </Link>
        </Button>
        <Button variant="default" size="sm" onClick={() => onShowDayReport(group)}>
          Report zum Tag anzeigen
        </Button>
      </div>
    </div>
  );
}
