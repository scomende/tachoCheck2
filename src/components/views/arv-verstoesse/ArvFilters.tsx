"use client";

import type { Driver } from "@/domain/drivingTypes";
import type { ArvReportFilters } from "@/mock/arvViolations";
import { cn } from "@/lib/utils";

type ArvFiltersProps = {
  filters: ArvReportFilters;
  drivers: Driver[];
  onFiltersChange: (f: ArvReportFilters) => void;
  hideClosedGroups: boolean;
  onHideClosedGroupsChange: (value: boolean) => void;
  className?: string;
};

export function ArvFilters({
  filters,
  drivers,
  onFiltersChange,
  hideClosedGroups,
  onHideClosedGroupsChange,
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
      aria-label="Filter Verletzungen"
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

      <div
        className={cn(
          "flex min-h-9 items-center gap-3 rounded-md border border-border/80 bg-background/80 px-3 py-2",
          "sm:ml-auto"
        )}
      >
        <span
          id="arv-hide-closed-label"
          className="text-xs font-medium leading-snug text-foreground"
        >
          Abgeschlossene ausblenden
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={hideClosedGroups}
          aria-labelledby="arv-hide-closed-label"
          onClick={() => onHideClosedGroupsChange(!hideClosedGroups)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            hideClosedGroups ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "pointer-events-none mt-0.5 block size-5 rounded-full bg-background shadow-sm ring-1 ring-border/40 transition-transform",
              hideClosedGroups ? "translate-x-[1.375rem]" : "translate-x-0.5"
            )}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
