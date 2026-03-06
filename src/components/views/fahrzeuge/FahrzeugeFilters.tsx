"use client";

import type { VehicleSource } from "@/domain/vehicleTypes";
import type { VehicleFilters } from "@/mock/vehicles";
import { cn } from "@/lib/utils";

type FahrzeugeFiltersProps = {
  filters: VehicleFilters;
  onFiltersChange: (f: VehicleFilters) => void;
  onOpenCreate: () => void;
  className?: string;
};

const SOURCE_OPTIONS: { value: VehicleFilters["source"]; label: string }[] = [
  { value: "", label: "Alle" },
  { value: "imported", label: "Importiert" },
  { value: "manual", label: "Manuell" },
];

export function FahrzeugeFilters({
  filters,
  onFiltersChange,
  onOpenCreate,
  className,
}: FahrzeugeFiltersProps) {
  const update = (patch: Partial<VehicleFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-5 border-b border-border bg-muted/30 px-5 py-3",
        className
      )}
      role="search"
      aria-label="Fahrzeuge filtern"
    >
      <div className="flex min-w-[200px] flex-col gap-1.5">
        <label htmlFor="fv-search" className="text-xs font-medium text-muted-foreground">
          Suche (Kennzeichen, Fahrzeugnummer, Bezeichnung)
        </label>
        <input
          id="fv-search"
          type="search"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Suchen…"
          className="h-10 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fv-source" className="text-xs font-medium text-muted-foreground">
          Quelle
        </label>
        <select
          id="fv-source"
          value={filters.source}
          onChange={(e) => update({ source: e.target.value as VehicleFilters["source"] })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fv-editable" className="text-xs font-medium text-muted-foreground">
          Editierbar
        </label>
        <select
          id="fv-editable"
          value={filters.editable === "" ? "" : filters.editable ? "yes" : "no"}
          onChange={(e) => {
            const v = e.target.value;
            update({ editable: v === "" ? "" : v === "yes" });
          }}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">Alle</option>
          <option value="yes">Ja</option>
          <option value="no">Nein</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fv-coop" className="text-xs font-medium text-muted-foreground">
          Coop-Fahrzeug
        </label>
        <select
          id="fv-coop"
          value={filters.isCoopVehicle === "" ? "" : filters.isCoopVehicle ? "yes" : "no"}
          onChange={(e) => {
            const v = e.target.value;
            update({ isCoopVehicle: v === "" ? "" : v === "yes" });
          }}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">Alle</option>
          <option value="yes">Ja</option>
          <option value="no">Nein</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">&nbsp;</span>
        <button
          type="button"
          onClick={onOpenCreate}
          className="h-9 rounded border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 hover:bg-primary/90"
        >
          Fahrzeug erfassen
        </button>
      </div>
    </div>
  );
}
