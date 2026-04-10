"use client";

import { useState, useCallback, useEffect } from "react";
import type { Vehicle } from "@/domain/vehicleTypes";
import { updateVehicleDetailFields } from "@/mock/vehicles";
import { formatValidityRange } from "@/lib/vehicleUi";
import { MatchingHint } from "./MatchingHint";
import { VehicleSymbolIcon, VEHICLE_SYMBOL_LABELS } from "./VehicleSymbolIcon";
import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<Vehicle["source"], string> = {
  imported: "Importiert",
  manual: "Manuell",
};

const detailEditBtnClass =
  "shrink-0 rounded border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted";
const detailDoneBtnClass =
  "shrink-0 rounded border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90";
const detailCancelBtnClass =
  "shrink-0 rounded border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted";

const detailInputClass =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0";

function panelClass(contrastOnCream: boolean) {
  return cn(
    "rounded-lg border p-4 shadow-sm",
    contrastOnCream
      ? "border-border bg-white dark:border-border dark:bg-card"
      : "border-border/70 bg-background/90 dark:bg-muted/20"
  );
}

function DlItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

type FahrzeugRowDetailContentProps = {
  vehicle: Vehicle;
  onUpdated: (v: Vehicle) => void;
  contrastOnCream?: boolean;
  className?: string;
};

export function FahrzeugRowDetailContent({
  vehicle,
  onUpdated,
  contrastOnCream = false,
  className,
}: FahrzeugRowDetailContentProps) {
  const [editing, setEditing] = useState(false);
  const [employeeDraft, setEmployeeDraft] = useState("");
  const [validityDraft, setValidityDraft] = useState({ validFrom: "", validUntil: "" });

  useEffect(() => {
    setEditing(false);
    setEmployeeDraft("");
    setValidityDraft({ validFrom: "", validUntil: "" });
  }, [vehicle.id]);

  const startEdit = useCallback(() => {
    setEmployeeDraft(vehicle.assignedEmployee);
    setValidityDraft({
      validFrom: vehicle.validFrom,
      validUntil: vehicle.validUntil,
    });
    setEditing(true);
  }, [vehicle.assignedEmployee, vehicle.validFrom, vehicle.validUntil]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEmployeeDraft("");
    setValidityDraft({ validFrom: "", validUntil: "" });
  }, []);

  const finishEdit = useCallback(() => {
    const updated = updateVehicleDetailFields(vehicle.id, {
      assignedEmployee: employeeDraft,
      validFrom: validityDraft.validFrom,
      validUntil: validityDraft.validUntil,
    });
    if (updated) {
      onUpdated(updated);
      setEditing(false);
    }
  }, [vehicle.id, employeeDraft, validityDraft.validFrom, validityDraft.validUntil, onUpdated]);

  const pc = panelClass(contrastOnCream);

  return (
    <div
      className={cn("border-t border-border/60 px-4 py-4 text-sm", className)}
      role="region"
      aria-label="Zusatzinformationen und Bearbeitung"
    >
      <div className="mb-4 flex justify-end">
        {!editing ? (
          <button type="button" className={detailEditBtnClass} onClick={startEdit}>
            Editieren
          </button>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={detailDoneBtnClass} onClick={finishEdit}>
              Fertig
            </button>
            <button type="button" className={detailCancelBtnClass} onClick={cancelEdit}>
              Abbrechen
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <section className={pc} aria-labelledby={`fv-emp-${vehicle.id}`}>
          <h4
            id={`fv-emp-${vehicle.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Mitarbeiter:in
          </h4>
          {editing ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`fv-emp-inp-${vehicle.id}`} className="sr-only">
                Mitarbeiter:in
              </label>
              <input
                id={`fv-emp-inp-${vehicle.id}`}
                type="text"
                value={employeeDraft}
                onChange={(e) => setEmployeeDraft(e.target.value)}
                placeholder="Name oder leer (1:1)"
                className={detailInputClass}
              />
            </div>
          ) : (
            <p className="text-foreground">{vehicle.assignedEmployee.trim() || "–"}</p>
          )}
        </section>

        <section className={pc} aria-labelledby={`fv-grp-${vehicle.id}`}>
          <h4 id={`fv-grp-${vehicle.id}`} className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fahrzeug
          </h4>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <VehicleSymbolIcon type={vehicle.symbolType} className="text-foreground" />
            <span className="text-sm text-muted-foreground">{VEHICLE_SYMBOL_LABELS[vehicle.symbolType]}</span>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DlItem label="Kennzeichen">{vehicle.licensePlate.trim() || "–"}</DlItem>
            <DlItem label="Fahrzeugart">{vehicle.vehicleCategory.trim() || "–"}</DlItem>
            <DlItem label="Fahrzeugtyp">{vehicle.vehicleModel.trim() || "–"}</DlItem>
            <DlItem label="Fahrzeug-ID">
              <span className="font-mono text-xs">{vehicle.wspVehicleId.trim() || "–"}</span>
            </DlItem>
            <DlItem label="Fahrzeuggruppe">{vehicle.vehicleGroup.trim() || "–"}</DlItem>
            <DlItem label="VIN / Chassisnummer">{vehicle.vin.trim() || "–"}</DlItem>
            <DlItem label="Interne Nummer">{vehicle.internalNumber.trim() || "–"}</DlItem>
            <DlItem label="Stammnummer">{vehicle.masterNumber.trim() || "–"}</DlItem>
            <DlItem label="Fahrzeugnummer (Matching)">
              <span className="font-mono">{vehicle.vehicleNumber}</span>
            </DlItem>
          </dl>
        </section>

        <section className={pc} aria-labelledby={`fv-val-${vehicle.id}`}>
          <h4
            id={`fv-val-${vehicle.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Gültigkeit
          </h4>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`fv-von-inp-${vehicle.id}`} className="text-xs font-medium text-muted-foreground">
                  Gültig ab
                </label>
                <input
                  id={`fv-von-inp-${vehicle.id}`}
                  type="date"
                  value={validityDraft.validFrom}
                  onChange={(e) => setValidityDraft((d) => ({ ...d, validFrom: e.target.value }))}
                  className={detailInputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`fv-bis-inp-${vehicle.id}`} className="text-xs font-medium text-muted-foreground">
                  Gültig bis (leer = unbefristet)
                </label>
                <input
                  id={`fv-bis-inp-${vehicle.id}`}
                  type="date"
                  value={validityDraft.validUntil}
                  onChange={(e) => setValidityDraft((d) => ({ ...d, validUntil: e.target.value }))}
                  className={detailInputClass}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-foreground tabular-nums">
                {formatValidityRange(vehicle.validFrom, vehicle.validUntil)}
              </p>
              {!vehicle.validUntil.trim() ? (
                <p className="mt-1 text-xs text-muted-foreground">Leeres Enddatum = unbefristet</p>
              ) : null}
            </>
          )}
        </section>

        {vehicle.qualifications && vehicle.qualifications.length > 0 ? (
          <section className={pc} aria-labelledby={`fv-qual-${vehicle.id}`}>
            <h4 id={`fv-qual-${vehicle.id}`} className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Qualifikationen / Eigenschaften
            </h4>
            <ul className="list-inside list-disc space-y-1 text-foreground">
              {vehicle.qualifications.map((q) => (
                <li key={q.id}>
                  {q.type}
                  {q.value != null && `: ${q.value}`}
                  {q.validUntil != null && ` (gültig bis ${q.validUntil})`}
                  {q.notes != null && ` – ${q.notes}`}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className={cn(pc, "text-xs text-muted-foreground")}>
          <span className="font-medium text-foreground">System: </span>
          Quelle {SOURCE_LABEL[vehicle.source]}
          {vehicle.editable ? ", manuell erfasst" : ", Import"}
          {vehicle.editable ? " (weitere Stammdaten bei Neuanlage im Dialog „Fahrzeug erfassen“)." : "."}
        </div>
      </div>

      <div className="mt-4">
        <MatchingHint compact whiteSurface={contrastOnCream} />
      </div>
    </div>
  );
}
