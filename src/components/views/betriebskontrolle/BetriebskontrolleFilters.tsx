"use client";

import type { Driver } from "@/domain/drivingTypes";
import type { ExportConfig, ExportFormat } from "@/domain/controlExportTypes";
import { KOSTENSTELLE_OPTIONS } from "@/config/layout";
import { cn } from "@/lib/utils";

type BetriebskontrolleFiltersProps = {
  config: ExportConfig;
  drivers: Driver[];
  onConfigChange: (c: ExportConfig) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  className?: string;
};

export function BetriebskontrolleFilters({
  config,
  drivers,
  onConfigChange,
  onGenerate,
  isGenerating = false,
  className,
}: BetriebskontrolleFiltersProps) {
  const update = (patch: Partial<ExportConfig>) =>
    onConfigChange({ ...config, ...patch });

  const toggleDriver = (driverId: string) => {
    const next = config.driverIds.includes(driverId)
      ? config.driverIds.filter((id) => id !== driverId)
      : [...config.driverIds, driverId];
    update({ driverIds: next });
  };

  const selectAllDrivers = () => update({ driverIds: drivers.map((d) => d.id) });
  const clearDrivers = () => update({ driverIds: [] });

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-5 border-b border-border bg-muted/30 px-5 py-3",
        className
      )}
      role="form"
      aria-label="Export-Konfiguration"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bk-date-from" className="text-xs font-medium text-muted-foreground">
          Zeitraum von
        </label>
        <input
          id="bk-date-from"
          type="date"
          value={config.dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bk-date-to" className="text-xs font-medium text-muted-foreground">
          Zeitraum bis
        </label>
        <input
          id="bk-date-to"
          type="date"
          value={config.dateTo}
          onChange={(e) => update({ dateTo: e.target.value })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Mitarbeiter:in (Mehrfachauswahl)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllDrivers}
            className="h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 hover:bg-muted/50"
          >
            Alle
          </button>
          <button
            type="button"
            onClick={clearDrivers}
            className="h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 hover:bg-muted/50"
          >
            Keine
          </button>
          {drivers.map((d) => (
            <label
              key={d.id}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0",
                config.driverIds.includes(d.id)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/30"
              )}
            >
              <input
                type="checkbox"
                checked={config.driverIds.includes(d.id)}
                onChange={() => toggleDriver(d.id)}
                className="sr-only"
              />
              {d.name}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bk-region" className="text-xs font-medium text-muted-foreground">
          Region / Kostenstelle (optional)
        </label>
        <select
          id="bk-region"
          value={config.region ?? ""}
          onChange={(e) => update({ region: e.target.value || undefined })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">–</option>
          {KOSTENSTELLE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bk-format" className="text-xs font-medium text-muted-foreground">
          Dateiformat
        </label>
        <select
          id="bk-format"
          value={config.format}
          onChange={(e) => update({ format: e.target.value as ExportFormat })}
          className="h-9 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="xdt">.xdt</option>
          <option value="ddd">.ddd</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">&nbsp;</span>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || config.driverIds.length === 0}
          className="h-9 rounded border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isGenerating ? "Wird erstellt…" : "Exportpaket generieren"}
        </button>
      </div>
    </div>
  );
}
