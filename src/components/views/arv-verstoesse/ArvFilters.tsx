"use client";

import type { Driver } from "@/domain/drivingTypes";
import type { ArvReportFilters } from "@/mock/arvViolations";
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from "./constants";
import { cn } from "@/lib/utils";

type ArvFiltersProps = {
  filters: ArvReportFilters;
  drivers: Driver[];
  onFiltersChange: (f: ArvReportFilters) => void;
  className?: string;
};

export function ArvFilters({
  filters,
  drivers,
  onFiltersChange,
  className,
}: ArvFiltersProps) {
  const update = (patch: Partial<ArvReportFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-5 border-b border-border bg-muted/30 px-5 py-3",
        className
      )}
      role="search"
      aria-label="Filter Verstösse"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="arv-date-from" className="text-xs font-medium text-muted-foreground">
          Von
        </label>
        <input
          id="arv-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="arv-date-to" className="text-xs font-medium text-muted-foreground">
          Bis
        </label>
        <input
          id="arv-date-to"
          type="date"
          value={filters.dateTo}
          onChange={(e) => update({ dateTo: e.target.value })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="arv-driver" className="text-xs font-medium text-muted-foreground">
          Mitarbeiter:in
        </label>
        <select
          id="arv-driver"
          value={filters.driverId}
          onChange={(e) => update({ driverId: e.target.value })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">Alle</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="arv-severity" className="text-xs font-medium text-muted-foreground">
          Schweregrad
        </label>
        <select
          id="arv-severity"
          value={filters.severity}
          onChange={(e) =>
            update({ severity: e.target.value as ArvReportFilters["severity"] })
          }
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">Alle</option>
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="arv-status" className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <select
          id="arv-status"
          value={filters.status}
          onChange={(e) =>
            update({ status: e.target.value as ArvReportFilters["status"] })
          }
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">Alle</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
