"use client";

import { Fragment } from "react";
import { Check, X, Lock, Pencil, ChevronRight, ChevronDown } from "lucide-react";
import type { Vehicle } from "@/domain/vehicleTypes";
import {
  formatValidityRange,
  formatAssignedEmployee,
  vehicleStatusBadgeClass,
} from "@/lib/vehicleUi";
import { cn } from "@/lib/utils";
import { FahrzeugRowDetailContent } from "./FahrzeugRowDetailContent";
import { VehicleSymbolIcon, VEHICLE_SYMBOL_LABELS } from "./VehicleSymbolIcon";

const SELECTED_ROW_BG = "bg-[#FFF8E6]";
const SELECTED_ROW_BG_HOVER = "hover:bg-[#FFF2CC]";
const EXPANDED_NEUTRAL_ROW = "hover:bg-muted/25";

const COL_COUNT = 11;

type FahrzeugTableProps = {
  vehicles: Vehicle[];
  expandAllDetails: boolean;
  expandedId: string | null;
  highlightedId: string | null;
  onRowActivate: (vehicleId: string) => void;
  onVehicleUpdated: (v: Vehicle) => void;
  className?: string;
};

export function FahrzeugTable({
  vehicles,
  expandAllDetails,
  expandedId,
  highlightedId,
  onRowActivate,
  onVehicleUpdated,
  className,
}: FahrzeugTableProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-auto", className)}
      role="list"
      aria-label="Fahrzeugliste"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
          <tr>
            <th
              className="w-10 px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              aria-hidden
            />
            <th className="w-[4.25rem] px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Symbol
            </th>
            <th className="min-w-[6.5rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Kennzeichen
            </th>
            <th className="min-w-[7rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="min-w-[10rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Art · Typ
            </th>
            <th className="min-w-[6rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fahrzeug-ID
            </th>
            <th className="min-w-[9rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Gültigkeit
            </th>
            <th className="min-w-[8rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mitarbeiter:in
            </th>
            <th className="min-w-[5rem] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Coop
            </th>
            <th className="w-12 px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="sr-only">Quelle und Bearbeitbarkeit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={COL_COUNT} className="px-4 py-12 text-center text-sm text-muted-foreground">
                Keine Fahrzeuge gefunden
              </td>
            </tr>
          ) : (
            vehicles.map((v) => {
              const isExpanded = expandAllDetails || expandedId === v.id;
              const isYellow = highlightedId === v.id;
              const artTyp = [v.vehicleCategory, v.vehicleModel].filter(Boolean).join(" · ") || "–";
              const { display: empDisplay, title: empTitle } = formatAssignedEmployee(v.assignedEmployee);
              const symbolLabel = VEHICLE_SYMBOL_LABELS[v.symbolType];
              const rowSummary = `${symbolLabel}, ${v.licensePlate}, ${v.status}, ${artTyp}`;
              return (
                <Fragment key={v.id}>
                  <tr
                    className={cn(
                      "border-b border-border transition-colors min-h-[2.75rem]",
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                      !v.editable && !isExpanded && "bg-muted/10",
                      isYellow
                        ? cn(SELECTED_ROW_BG, SELECTED_ROW_BG_HOVER)
                        : isExpanded
                          ? cn("bg-background", EXPANDED_NEUTRAL_ROW)
                          : "hover:bg-muted/20"
                    )}
                    onClick={() => onRowActivate(v.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowActivate(v.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    aria-pressed={isYellow}
                    aria-label={
                      expandAllDetails
                        ? isYellow
                          ? `${rowSummary}. Ausgewählt (gelbe Markierung).`
                          : `${rowSummary}. Zur Auswahl antippen.`
                        : isExpanded
                          ? `${rowSummary}. Details ausgeklappt.`
                          : `${rowSummary}. Details einblenden.`
                    }
                  >
                    <td className="px-2 py-3 align-middle text-muted-foreground" aria-hidden>
                      {isExpanded ? (
                        <ChevronDown className="mx-auto size-4 shrink-0 opacity-70" />
                      ) : (
                        <ChevronRight className="mx-auto size-4 shrink-0 opacity-70" />
                      )}
                    </td>
                    <td className="px-1 py-2 align-middle" title={symbolLabel}>
                      <div className="flex justify-center">
                        <VehicleSymbolIcon type={v.symbolType} className="text-foreground" />
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">{v.licensePlate}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium",
                          vehicleStatusBadgeClass(v.status)
                        )}
                        title={v.status}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      <span className="line-clamp-2" title={artTyp}>
                        {artTyp}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-foreground">{v.wspVehicleId}</td>
                    <td className="px-3 py-3 tabular-nums text-foreground text-xs leading-snug">
                      {formatValidityRange(v.validFrom, v.validUntil)}
                    </td>
                    <td className="px-3 py-3 text-foreground" title={empTitle || undefined}>
                      {empDisplay}
                    </td>
                    <td className="px-3 py-3">
                      {v.isCoopVehicle ? (
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Check className="size-4 shrink-0 text-primary" aria-hidden />
                          Ja
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <X className="size-4 shrink-0" aria-hidden />
                          Nein
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center text-muted-foreground">
                      {v.editable ? (
                        <Pencil className="mx-auto size-4" aria-label="Manuell, bearbeitbar" />
                      ) : (
                        <Lock className="mx-auto size-4" aria-label="Import, nicht bearbeitbar" />
                      )}
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr
                      className={cn(
                        "border-b border-border",
                        isYellow ? SELECTED_ROW_BG : "bg-muted/15 dark:bg-muted/10"
                      )}
                    >
                      <td colSpan={COL_COUNT} className="p-0 align-top">
                        <FahrzeugRowDetailContent
                          vehicle={v}
                          onUpdated={onVehicleUpdated}
                          contrastOnCream={isYellow}
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
