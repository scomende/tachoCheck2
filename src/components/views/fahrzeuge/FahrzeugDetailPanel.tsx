"use client";

import { useState, useCallback } from "react";
import { Check, X, Lock, Pencil } from "lucide-react";
import type { Vehicle } from "@/domain/vehicleTypes";
import { updateVehicle } from "@/mock/vehicles";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchingHint } from "./MatchingHint";
import { cn } from "@/lib/utils";

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
          "flex w-96 shrink-0 flex-col border-l border-border bg-muted/20 p-4",
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
        "flex w-96 shrink-0 flex-col overflow-auto border-l border-border bg-background",
        className
      )}
      role="complementary"
      aria-label="Fahrzeug-Details"
    >
      <Card className="m-4 border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fahrzeug-Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!vehicle.editable && (
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="flex items-center gap-2 font-medium">
                <Lock className="size-4" aria-hidden />
                Nicht bearbeitbar
              </span>
              <p className="mt-1 text-muted-foreground">
                Dieses Fahrzeug stammt aus einer Schnittstelle (Import). Aus
                Bearbeitungsregeln darf es hier nicht geändert werden.
              </p>
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-muted-foreground">Kennzeichen</span>
            {isEditing && form ? (
              <input
                type="text"
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-foreground">{vehicle.licensePlate}</p>
            )}
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Fahrzeugnummer</span>
            {isEditing && form ? (
              <input
                type="text"
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm font-mono"
              />
            ) : (
              <p className="text-sm font-mono text-foreground">{vehicle.vehicleNumber}</p>
            )}
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Quelle</span>
            <p className="text-sm text-foreground">{SOURCE_LABEL[vehicle.source]}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Coop-Fahrzeug</span>
            {isEditing && form ? (
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="coop"
                    checked={form.isCoopVehicle}
                    onChange={() => setForm({ ...form, isCoopVehicle: true })}
                  />
                  Ja
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="coop"
                    checked={!form.isCoopVehicle}
                    onChange={() => setForm({ ...form, isCoopVehicle: false })}
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
          <div>
            <span className="text-xs font-medium text-muted-foreground">Editierbar</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              {vehicle.editable ? <Pencil className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
              {vehicle.editable ? "Ja" : "Nein"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Bezeichnung / Typ</span>
            {isEditing && form ? (
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            ) : (
              <p className="text-sm text-foreground">{vehicle.displayName}</p>
            )}
          </div>

          {vehicle.qualifications && vehicle.qualifications.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Qualifikationen / Eigenschaften</span>
              <ul className="mt-1 list-inside list-disc text-sm text-foreground">
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
                  <Pencil className="size-4 mr-1" aria-hidden />
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
