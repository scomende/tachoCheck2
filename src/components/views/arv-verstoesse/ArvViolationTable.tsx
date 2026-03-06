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
            <th className="px-4 py-2 font-semibold text-foreground">Mitarbeiter:in</th>
            <th className="px-4 py-2 font-semibold text-foreground">Datum</th>
            <th className="px-4 py-2 font-semibold text-foreground">Verstosstyp</th>
            <th className="px-4 py-2 font-semibold text-foreground">Schweregrad</th>
            <th className="px-4 py-2 font-semibold text-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {violations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
                    "border-b border-border transition-colors",
                    "hover:bg-muted/30 cursor-pointer",
                    isSelected && "bg-primary/10"
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
                  <td className="px-4 py-2 font-medium text-foreground">
                    {v.driverId ? getDriverNameById(v.driverId) : "–"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDayLabelLong(v.date)}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {v.violationType
                      ? VIOLATION_TYPE_LABELS[v.violationType]
                      : "–"}
                  </td>
                  <td className="px-4 py-2">
                    {v.severity && SeverityIcon ? (
                      <span className="flex items-center gap-1.5">
                        <SeverityIcon className="size-4 text-muted-foreground" aria-hidden />
                        {SEVERITY_LABELS[v.severity]}
                      </span>
                    ) : (
                      "–"
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {v.status ? STATUS_LABELS[v.status] : "–"}
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
