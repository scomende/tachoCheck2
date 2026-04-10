"use client";

import { Fragment, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { ArvViolationSeverity, ArvViolationStatus } from "@/domain/drivingTypes";
import type { ArvViolationDayGroup } from "@/mock/arvViolations";
import {
  getDriverNameById,
  aggregateViolationDayGroupStatus,
} from "@/mock/arvViolations";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import {
  SEVERITY_LABELS,
  STATUS_LABELS,
  STATUS_BG_COLORS,
  GLOBAL_TOOLBAR_DRIVER_NAME_HIGHLIGHT_CLASS,
} from "./constants";
import { ArvViolationDayGroupDetailContent } from "./ArvViolationDetail";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import { driverHighlightedByGlobalToolbar } from "@/lib/driverSearch";
import { cn } from "@/lib/utils";

const SELECTED_ROW_BG = "bg-[#FFF8E6]";
const SELECTED_ROW_BG_HOVER = "hover:bg-[#FFF2CC]";

type SortColumn = "driver" | "date" | "severity" | "status";
type SortDirection = "asc" | "desc";

const SEVERITY_ICON: Record<
  ArvViolationSeverity,
  React.ComponentType<{ className?: string }>
> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

const SEVERITY_RANK: Record<ArvViolationSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Reihenfolge für Sortierung Spalte Status (niedriger Index = dringlicher). */
const STATUS_SORT_ORDER: ArvViolationStatus[] = [
  "open",
  "acknowledged",
  "signed",
  "closed",
];

function maxSeverityInGroup(group: ArvViolationDayGroup): ArvViolationSeverity | null {
  let best: ArvViolationSeverity | null = null;
  for (const row of group.violations) {
    const p = row.corrected ?? row.original;
    const s = p?.severity;
    if (!s) continue;
    if (!best || SEVERITY_RANK[s] < SEVERITY_RANK[best]) best = s;
  }
  return best;
}

function severitySortKey(group: ArvViolationDayGroup): number {
  const m = maxSeverityInGroup(group);
  return m != null ? SEVERITY_RANK[m] : 99;
}

function statusSortKey(group: ArvViolationDayGroup): number {
  const s = aggregateViolationDayGroupStatus(group);
  if (!s) return 99;
  const i = STATUS_SORT_ORDER.indexOf(s);
  return i === -1 ? 99 : i;
}

function groupStatusCell(group: ArvViolationDayGroup) {
  const st = aggregateViolationDayGroupStatus(group);
  if (!st) {
    return (
      <td className="px-4 py-3 align-top">
        <span className="text-muted-foreground">–</span>
      </td>
    );
  }
  const anyCorrected = group.violations.some((r) => r.corrected != null);
  return (
    <td className="px-4 py-3 align-top">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          STATUS_BG_COLORS[st],
          anyCorrected && "font-bold"
        )}
      >
        {STATUS_LABELS[st]}
      </span>
    </td>
  );
}

function groupSeverityCell(group: ArvViolationDayGroup) {
  const maxSev = maxSeverityInGroup(group);
  const anyCorrected = group.violations.some((r) => r.corrected != null);
  if (!maxSev) {
    return (
      <td className="px-4 py-3 align-top">
        <span className="text-muted-foreground">–</span>
      </td>
    );
  }
  const Icon = SEVERITY_ICON[maxSev];
  return (
    <td className="px-4 py-3 align-top">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-foreground",
          anyCorrected && "font-bold"
        )}
      >
        <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
        {SEVERITY_LABELS[maxSev]}
      </span>
    </td>
  );
}

type ArvViolationTableProps = {
  groups: ArvViolationDayGroup[];
  selectedGroupKey: string | null;
  onToggleGroup: (groupKey: string) => void;
  onShowDayReport: (group: ArvViolationDayGroup) => void;
  className?: string;
};

function ariaGroupSummary(group: ArvViolationDayGroup): string {
  const n = group.violations.length;
  const maxSev = maxSeverityInGroup(group);
  const sev = maxSev ? SEVERITY_LABELS[maxSev] : "–";
  const agg = aggregateViolationDayGroupStatus(group);
  const st = agg ? STATUS_LABELS[agg] : "–";
  return `${n} Verstoss${n === 1 ? "" : "e"}, höchster Schweregrad ${sev}, angezeigter Status ${st}.`;
}

export function ArvViolationTable({
  groups,
  selectedGroupKey,
  onToggleGroup,
  onShowDayReport,
  className,
}: ArvViolationTableProps) {
  const { selectedEmployeeId, searchQuery, drivers } = useSelectedEmployee();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDirection("asc");
      return column;
    });
  }, []);

  const sortedGroups = useMemo(() => {
    if (!sortColumn) return groups;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...groups].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "driver") {
        cmp = getDriverNameById(a.driverId).localeCompare(getDriverNameById(b.driverId));
      } else if (sortColumn === "date") {
        cmp = a.date.localeCompare(b.date);
      } else if (sortColumn === "severity") {
        cmp = severitySortKey(a) - severitySortKey(b);
      } else {
        cmp = statusSortKey(a) - statusSortKey(b);
      }
      return cmp * dir;
    });
  }, [groups, sortColumn, sortDirection]);

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
      className={cn("flex flex-1 flex-col overflow-auto", className)}
      role="list"
      aria-label="Liste Verstösse nach Mitarbeiter:in und Tag"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
          <tr>
            <th
              className="w-10 px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              aria-hidden
            />
            <SortHeader column="driver" label="Mitarbeiter:in" />
            <SortHeader column="date" label="Datum" />
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Verstösse
            </th>
            <SortHeader column="severity" label="Schweregrad" />
            <SortHeader column="status" label="Status" />
          </tr>
        </thead>
        <tbody>
          {sortedGroups.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Keine Verstösse für die gewählten Filter
              </td>
            </tr>
          ) : (
            sortedGroups.map((group) => {
              const isExpanded = group.key === selectedGroupKey;
              const n = group.violations.length;
              const countLabel = n === 1 ? "1 Verstoss" : `${n} Verstösse`;
              const rowLabel = `${getDriverNameById(group.driverId)}, ${formatDayLabelLong(group.date)}. ${ariaGroupSummary(group)}`;
              const nameHighlight = driverHighlightedByGlobalToolbar(
                group.driverId,
                selectedEmployeeId,
                searchQuery,
                drivers
              );
              const driverName = getDriverNameById(group.driverId) || "–";

              return (
                <Fragment key={group.key}>
                  <tr
                    className={cn(
                      "border-b border-border transition-colors min-h-[2.75rem]",
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                      isExpanded
                        ? cn(SELECTED_ROW_BG, SELECTED_ROW_BG_HOVER)
                        : "hover:bg-muted/20"
                    )}
                    onClick={() => onToggleGroup(group.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggleGroup(group.key);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    aria-pressed={isExpanded}
                    aria-label={
                      isExpanded
                        ? `${rowLabel} Details ausgeklappt.`
                        : `${rowLabel} Details einblenden.`
                    }
                  >
                    <td className="px-2 py-3 align-middle text-muted-foreground" aria-hidden>
                      {isExpanded ? (
                        <ChevronDown className="mx-auto size-4 shrink-0 opacity-70" />
                      ) : (
                        <ChevronRight className="mx-auto size-4 shrink-0 opacity-70" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {nameHighlight ? (
                        <mark className={GLOBAL_TOOLBAR_DRIVER_NAME_HIGHLIGHT_CLASS}>
                          {driverName}
                        </mark>
                      ) : (
                        driverName
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDayLabelLong(group.date)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{countLabel}</td>
                    {groupSeverityCell(group)}
                    {groupStatusCell(group)}
                  </tr>
                  {isExpanded ? (
                    <tr className={cn("border-b border-border", SELECTED_ROW_BG)}>
                      <td colSpan={6} className="p-0 align-top">
                        <ArvViolationDayGroupDetailContent
                          group={group}
                          onShowDayReport={onShowDayReport}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
