"use client";

import { Check, X, Lock, Pencil } from "lucide-react";
import type { Vehicle } from "@/domain/vehicleTypes";
import { cn } from "@/lib/utils";
import { VehicleSymbolIcon } from "./VehicleSymbolIcon";

function formatValidFrom(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

const SOURCE_LABEL: Record<Vehicle["source"], string> = {
  imported: "Importiert",
  manual: "Manuell",
};

type FahrzeugTableProps = {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (v: Vehicle) => void;
  className?: string;
};

export function FahrzeugTable({
  vehicles,
  selectedId,
  onSelect,
  className,
}: FahrzeugTableProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-auto border-r border-border", className)}
      role="list"
      aria-label="Fahrzeugliste"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kennzeichen</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fahrzeugnummer</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bezeichnung / Typ</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Symbole</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mitarbeitende</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gültig ab</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quelle</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coop-Fahrzeug</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Editierbar</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Keine Fahrzeuge gefunden
              </td>
            </tr>
          ) : (
            vehicles.map((v) => {
              const isSelected = v.id === selectedId;
              return (
                <tr
                  key={v.id}
                  className={cn(
                    "border-b border-border transition-colors min-h-[2.75rem]",
                    "hover:bg-muted/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                    !v.editable && "bg-muted/10",
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
                  aria-label={`${v.licensePlate} ${v.vehicleNumber} ${v.displayName}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {v.licensePlate}
                  </td>
                  <td className="px-4 py-3 font-mono text-foreground">
                    {v.vehicleNumber}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {v.displayName}
                  </td>
                  <td className="px-4 py-3">
                    <VehicleSymbolIcon type={v.symbolType} />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {v.assignedEmployees.length > 0 ? v.assignedEmployees.join(", ") : "–"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {formatValidFrom(v.validFrom)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {SOURCE_LABEL[v.source]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.isCoopVehicle ? (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Check className="size-4 text-primary" aria-hidden />
                        Ja
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <X className="size-4" aria-hidden />
                        Nein
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v.editable ? (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Pencil className="size-4" aria-hidden />
                        Ja
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground" title="Aus Schnittstelle – nicht bearbeitbar">
                        <Lock className="size-4" aria-hidden />
                        Nein
                      </span>
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
