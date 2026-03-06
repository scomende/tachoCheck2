"use client";

import { Check, X, Lock, Pencil } from "lucide-react";
import type { Vehicle } from "@/domain/vehicleTypes";
import { cn } from "@/lib/utils";

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
            <th className="px-4 py-2 font-semibold text-foreground">Kennzeichen</th>
            <th className="px-4 py-2 font-semibold text-foreground">Fahrzeugnummer</th>
            <th className="px-4 py-2 font-semibold text-foreground">Bezeichnung / Typ</th>
            <th className="px-4 py-2 font-semibold text-foreground">Quelle</th>
            <th className="px-4 py-2 font-semibold text-foreground">Coop-Fahrzeug</th>
            <th className="px-4 py-2 font-semibold text-foreground">Editierbar</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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
                    "border-b border-border transition-colors",
                    "hover:bg-muted/30 cursor-pointer",
                    !v.editable && "bg-muted/20",
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
                  aria-label={`${v.licensePlate} ${v.vehicleNumber} ${v.displayName}`}
                >
                  <td className="px-4 py-2 font-medium text-foreground">
                    {v.licensePlate}
                  </td>
                  <td className="px-4 py-2 font-mono text-foreground">
                    {v.vehicleNumber}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {v.displayName}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {SOURCE_LABEL[v.source]}
                  </td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
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
