"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CreateVehicleInput } from "@/mock/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CreateVehicleModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  createVehicle: (input: CreateVehicleInput) => void;
  className?: string;
};

const defaultForm: CreateVehicleInput = {
  licensePlate: "",
  vehicleNumber: "",
  vehicleCategory: "",
  vehicleModel: "",
  assignedEmployee: "",
  isCoopVehicle: false,
};

export function CreateVehicleModal({
  open,
  onClose,
  onCreated,
  createVehicle,
  className,
}: CreateVehicleModalProps) {
  const [form, setForm] = useState<CreateVehicleInput>({ ...defaultForm });

  const reset = () => setForm({ ...defaultForm });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.licensePlate.trim() ||
      !form.vehicleNumber.trim() ||
      !form.vehicleCategory.trim() ||
      !form.vehicleModel.trim()
    )
      return;
    createVehicle(form);
    reset();
    onClose();
    onCreated();
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        className
      )}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-vehicle-title"
    >
      <Card className="w-full max-w-md border-border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="create-vehicle-title" className="text-lg font-semibold text-foreground">
            Fahrzeug erfassen
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Schliessen">
            <X className="size-5" />
          </Button>
        </div>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Quelle wird automatisch auf „Manuell“ gesetzt. Eine WSP-Fahrzeug-ID wird vergeben. Das Fahrzeug
              wird als Fremdfahrzeug erfasst und kann anschließend im Detail bearbeitet werden.
            </p>
            <div>
              <label htmlFor="cv-license" className="text-xs font-medium text-muted-foreground">
                Kennzeichen *
              </label>
              <input
                id="cv-license"
                type="text"
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                required
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="cv-number" className="text-xs font-medium text-muted-foreground">
                Fahrzeugnummer (Matching) *
              </label>
              <input
                id="cv-number"
                type="text"
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                required
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm font-mono"
              />
            </div>
            <div>
              <label htmlFor="cv-art" className="text-xs font-medium text-muted-foreground">
                Fahrzeugart *
              </label>
              <input
                id="cv-art"
                type="text"
                value={form.vehicleCategory}
                onChange={(e) => setForm({ ...form, vehicleCategory: e.target.value })}
                required
                placeholder="Lastwagen oder Personenwagen"
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="cv-typ" className="text-xs font-medium text-muted-foreground">
                Fahrzeugtyp *
              </label>
              <input
                id="cv-typ"
                type="text"
                value={form.vehicleModel}
                onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                required
                placeholder="z. B. TGS 18.430 oder P360"
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="cv-emp" className="text-xs font-medium text-muted-foreground">
                Mitarbeiter:in (optional, 1:1)
              </label>
              <input
                id="cv-emp"
                type="text"
                value={form.assignedEmployee ?? ""}
                onChange={(e) => setForm({ ...form, assignedEmployee: e.target.value })}
                placeholder="Höchstens eine Person"
                className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
