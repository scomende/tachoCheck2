"use client";

import { useState, useCallback } from "react";
import { Check, X, Lock, Pencil } from "lucide-react";
import type { Vehicle } from "@/domain/vehicleTypes";
import { updateVehicle } from "@/mock/vehicles";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchingHint } from "./MatchingHint";
import { VehicleSymbolIcon } from "./VehicleSymbolIcon";
import { cn } from "@/lib/utils";

function formatValidFrom(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

const SOURCE_LABEL: Record<Vehicle["source"], string> = {
  imported: "Importiert",
  manual: "Manuell",
};

type FahrzeugDetailPanelProps = {
  vehicle: Vehicle | null;
  onUpdated: (v: Vehicle) => void;
  className?: string;
};

export function FahrzeugDetailPanel({
  vehicle,
  onUpdated,
  className,
}: FahrzeugDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Pick<Vehicle, "licensePlate" | "vehicleNumber" | "displayName" | "isCoopVehicle"> | null>(null);

  const startEdit = useCallback(() => {
    if (!vehicle?.editable) return;
    setForm({
      licensePlate: vehicle.licensePlate,
      vehicleNumber: vehicle.vehicleNumber,
      displayName: vehicle.displayName,
      isCoopVehicle: vehicle.isCoopVehicle,
    });
    setEditing(true);
  }, [vehicle]);

  const cancelEdit = useCallback(() => {
    setForm(null);
    setEditing(false);
  }, []);

  const saveEdit = useCallback(() => {
    if (!vehicle || !form) return;
    const updated = updateVehicle(vehicle.id, form);
    if (updated) {
      onUpdated(updated);
      setForm(null);
      setEditing(false);
    }
  }, [vehicle, form, onUpdated]);

  if (!vehicle) {
    return (
      <aside
        className={cn(
          "flex w-96 shrink-0 flex-col border-l border-border bg-muted/10 p-5",
          className
        )}
        role="complementary"
        aria-label="Fahrzeug-Details"
      >
        <p className="text-sm text-muted-foreground">
          Wählen Sie ein Fahrzeug aus der Liste.
        </p>
      </aside>
    );
  }

  const isEditing = editing && vehicle.editable && form !== null;

  return (
    <aside
      className={cn(
        "flex w-96 shrink-0 flex-col overflow-auto border-l border-border bg-muted/10",
        className
      )}
      role="complementary"
      aria-label="Fahrzeug-Details"
    >
      <Card className="m-4 border-0 shadow-none">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Fahrzeug-Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 p-5 pt-0">
          {!vehicle.editable && (
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="flex items-center gap-2 font-medium">
                <Lock className="size-3.5" aria-hidden />
                Nicht bearbeitbar
              </span>
              <p className="mt-0.5 text-muted-foreground">
                Dieses Fahrzeug stammt aus einer Schnittstelle (Import). Aus
                Bearbeitungsregeln darf es hier nicht geändert werden.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Kennzeichen</span>
            {isEditing && form ? (
              <input
                type="text"
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                className="h-9 w-full rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
            ) : (
              <p className="text-sm font-medium text-foreground">{vehicle.licensePlate}</p>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Fahrzeugnummer</span>
            {isEditing && form ? (
              <input
                type="text"
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="h-9 w-full rounded border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
            ) : (
              <p className="text-sm font-mono text-foreground">{vehicle.vehicleNumber}</p>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Quelle</span>
            <p className="text-sm text-foreground">{SOURCE_LABEL[vehicle.source]}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Coop-Fahrzeug</span>
            {isEditing && form ? (
              <div className="mt-1 flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="coop"
                    checked={form.isCoopVehicle}
                    onChange={() => setForm({ ...form, isCoopVehicle: true })}
                    className="focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  Ja
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="coop"
                    checked={!form.isCoopVehicle}
                    onChange={() => setForm({ ...form, isCoopVehicle: false })}
                    className="focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  Nein
                </label>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-foreground">
                {vehicle.isCoopVehicle ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                {vehicle.isCoopVehicle ? "Ja" : "Nein"}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Editierbar</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              {vehicle.editable ? <Pencil className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
              {vehicle.editable ? "Ja" : "Nein"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Bezeichnung / Typ</span>
            {isEditing && form ? (
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="h-9 w-full rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
            ) : (
              <p className="text-sm text-foreground">{vehicle.displayName}</p>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Symbole</span>
            <VehicleSymbolIcon type={vehicle.symbolType} className="mt-0.5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Mitarbeitende</span>
            <p className="text-sm text-foreground">
              {vehicle.assignedEmployees.length > 0 ? vehicle.assignedEmployees.join(", ") : "–"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Gültig ab</span>
            <p className="text-sm tabular-nums text-foreground">{formatValidFrom(vehicle.validFrom)}</p>
          </div>

          {vehicle.qualifications && vehicle.qualifications.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">Qualifikationen / Eigenschaften</span>
              <ul className="list-inside list-disc text-sm text-foreground">
                {vehicle.qualifications.map((q) => (
                  <li key={q.id}>
                    {q.type}
                    {q.value != null && `: ${q.value}`}
                    {q.validUntil != null && ` (gültig bis ${q.validUntil})`}
                    {q.notes != null && ` – ${q.notes}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vehicle.editable && (
            <div className="flex gap-2 pt-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={saveEdit}>
                    Speichern
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Abbrechen
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={startEdit}>
                  <Pencil className="mr-1 size-4" aria-hidden />
                  Bearbeiten
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="px-4 pb-4">
        <MatchingHint />
      </div>
    </aside>
  );
}
