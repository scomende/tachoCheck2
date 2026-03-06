"use client";

import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { ArvViolation, ArvViolationSeverity } from "@/domain/drivingTypes";
import { getDriverNameById } from "@/mock/arvViolations";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import { SEVERITY_LABELS, STATUS_LABELS, VIOLATION_TYPE_LABELS } from "./constants";
import { cn } from "@/lib/utils";

const SEVERITY_ICON: Record<
  ArvViolationSeverity,
  React.ComponentType<{ className?: string }>
> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

type ArvViolationTableProps = {
  violations: ArvViolation[];
  selectedId: string | null;
  onSelect: (v: ArvViolation) => void;
  className?: string;
};

export function ArvViolationTable({
  violations,
  selectedId,
  onSelect,
  className,
}: ArvViolationTableProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-auto border-r border-border", className)}
      role="list"
      aria-label="Liste ARV-Verstösse"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mitarbeiter:in</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datum</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verstosstyp</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schweregrad</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {violations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Keine Verstösse für die gewählten Filter
              </td>
            </tr>
          ) : (
            violations.map((v) => {
              const isSelected = (v.id ?? v.date) === selectedId;
              const SeverityIcon = v.severity ? SEVERITY_ICON[v.severity] : null;
              return (
                <tr
                  key={v.id ?? `${v.driverId}-${v.date}-${v.description}`}
                  className={cn(
                    "border-b border-border transition-colors min-h-[2.75rem]",
                    "hover:bg-muted/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                    isSelected && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                  onClick={() => onSelect(v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(v);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${getDriverNameById(v.driverId ?? "")}, ${formatDayLabelLong(v.date)}, ${v.description}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {v.driverId ? getDriverNameById(v.driverId) : "–"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDayLabelLong(v.date)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {v.violationType
                      ? VIOLATION_TYPE_LABELS[v.violationType]
                      : "–"}
                  </td>
                  <td className="px-4 py-3">
                    {v.severity && SeverityIcon ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                        <SeverityIcon className="size-3.5 text-muted-foreground" aria-hidden />
                        {SEVERITY_LABELS[v.severity]}
                      </span>
                    ) : (
                      "–"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v.status ? (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                        {STATUS_LABELS[v.status]}
                      </span>
                    ) : (
                      "–"
                    )}
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
