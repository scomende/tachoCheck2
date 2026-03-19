"use client";

import { useMemo, useState, useCallback } from "react";
import { AlertTriangle, AlertCircle, Info, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ArvViolation, ArvViolationSeverity } from "@/domain/drivingTypes";
import type { MergedArvRow } from "@/mock/arvViolations";
import { getDriverNameById } from "@/mock/arvViolations";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import { SEVERITY_LABELS, STATUS_LABELS, STATUS_BG_COLORS, VIOLATION_TYPE_LABELS, VIOLATION_TYPE_COLORS } from "./constants";
import { cn } from "@/lib/utils";

type SortColumn = "driver" | "date" | "violationType";
type SortDirection = "asc" | "desc";

const SEVERITY_ICON: Record<
  ArvViolationSeverity,
  React.ComponentType<{ className?: string }>
> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

type ArvViolationTableProps = {
  /** Zusammengeführte Zeilen (Original + Korrigiert pro logischem Verstoss). */
  rows: MergedArvRow[];
  selectedId: string | null;
  onSelect: (v: ArvViolation) => void;
  className?: string;
};

function CellBadge({
  violation,
  useGray = false,
}: {
  violation: ArvViolation | null;
  /** Wenn true (z. B. Original bei vorhandener Korrektur): Badge in Grau. */
  useGray?: boolean;
}) {
  if (!violation) return <span className="text-muted-foreground">–</span>;
  const SeverityIcon = violation.severity ? SEVERITY_ICON[violation.severity] : null;
  const statusBg =
    useGray || !violation.status
      ? "bg-muted text-muted-foreground"
      : STATUS_BG_COLORS[violation.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        statusBg
      )}
    >
      {SeverityIcon && <SeverityIcon className="size-3.5 opacity-80" aria-hidden />}
      {violation.severity ? SEVERITY_LABELS[violation.severity] : "Vorhanden"}
      {violation.status && <> · {STATUS_LABELS[violation.status]}</>}
    </span>
  );
}

export function ArvViolationTable({
  rows,
  selectedId,
  onSelect,
  className,
}: ArvViolationTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn | null>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDirection("asc");
      return column;
    });
  }, []);

  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "driver") {
        cmp = getDriverNameById(a.driverId).localeCompare(getDriverNameById(b.driverId));
      } else if (sortColumn === "date") {
        cmp = a.date.localeCompare(b.date);
      } else {
        const labelA = a.violationType ? VIOLATION_TYPE_LABELS[a.violationType] : a.description;
        const labelB = b.violationType ? VIOLATION_TYPE_LABELS[b.violationType] : b.description;
        cmp = (labelA ?? "").localeCompare(labelB ?? "");
      }
      return cmp * dir;
    });
  }, [rows, sortColumn, sortDirection]);

  const SortHeader = ({
    column,
    label,
  }: {
    column: SortColumn;
    label: string;
  }) => {
    const isActive = sortColumn === column;
    return (
      <th
        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        aria-sort={isActive ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
      >
        <button
          type="button"
          onClick={() => handleSort(column)}
          className="inline-flex items-center gap-1.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded"
          aria-label={`Nach ${label} sortieren${isActive ? `, ${sortDirection === "asc" ? "aufsteigend" : "absteigend"}` : ""}`}
        >
          {label}
          {isActive ? (
            sortDirection === "asc" ? (
              <ArrowUp className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <ArrowDown className="size-3.5 shrink-0" aria-hidden />
            )
          ) : (
            <ArrowUpDown className="size-3.5 shrink-0 opacity-50" aria-hidden />
          )}
        </button>
      </th>
    );
  };

  return (
    <div
      className={cn("flex flex-1 flex-col overflow-auto border-r border-border", className)}
      role="list"
      aria-label="Liste Verstösse (Original und Korrigiert)"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
          <tr>
            <SortHeader column="driver" label="Mitarbeiter:in" />
            <SortHeader column="date" label="Datum" />
            <SortHeader column="violationType" label="Verstosstyp" />
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Original
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Korrigiert
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Keine Verstösse für die gewählten Filter
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const primary = row.corrected ?? row.original;
              const isSelected = primary && (primary.id ?? primary.date) === selectedId;
              return (
                <tr
                  key={row.key}
                  className={cn(
                    "border-b border-border transition-colors min-h-[2.75rem]",
                    "hover:bg-muted/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                    isSelected && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                  onClick={() => primary && onSelect(primary)}
                  onKeyDown={(e) => {
                    if (primary && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSelect(primary);
                    }
                  }}
                  tabIndex={primary ? 0 : undefined}
                  role="button"
                  aria-pressed={!!isSelected}
                  aria-label={`${getDriverNameById(row.driverId)}, ${formatDayLabelLong(row.date)}, ${row.description}. Original: ${row.original ? "vorhanden" : "–"}, Korrigiert: ${row.corrected ? "vorhanden" : "–"}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {getDriverNameById(row.driverId) || "–"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDayLabelLong(row.date)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {row.violationType ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-block size-2.5 shrink-0 rounded-full",
                            VIOLATION_TYPE_COLORS[row.violationType]
                          )}
                          aria-hidden
                          title={VIOLATION_TYPE_LABELS[row.violationType]}
                        />
                        {VIOLATION_TYPE_LABELS[row.violationType]}
                      </span>
                    ) : (
                      row.description || "–"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CellBadge
                      violation={row.original}
                      useGray={!!row.corrected}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CellBadge violation={row.corrected} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
