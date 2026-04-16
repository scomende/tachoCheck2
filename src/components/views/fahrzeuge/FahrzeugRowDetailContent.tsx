"use client";

import { useState, useCallback, useEffect } from "react";
import type { Vehicle, VehicleSymbolType } from "@/domain/vehicleTypes";
import { updateVehicleDetailFields } from "@/mock/vehicles";
import { formatValidityRange } from "@/lib/vehicleUi";
import { MatchingHint } from "./MatchingHint";
import { VehicleSymbolIcon, VEHICLE_SYMBOL_LABELS } from "./VehicleSymbolIcon";
import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<Vehicle["source"], string> = {
  imported: "Importiert",
  manual: "Manuell",
};

const SYMBOL_OPTIONS = Object.keys(VEHICLE_SYMBOL_LABELS) as VehicleSymbolType[];

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

/** Alle Stammdaten, die im Detail bearbeitet werden können (Fremdfahrzeuge). */
type VehicleStammDraft = Pick<
  Vehicle,
  | "assignedEmployee"
  | "validFrom"
  | "validUntil"
  | "licensePlate"
  | "vehicleCategory"
  | "vehicleModel"
  | "wspVehicleId"
  | "vehicleGroup"
  | "vin"
  | "internalNumber"
  | "masterNumber"
  | "vehicleNumber"
  | "mandant"
  | "costCenter"
  | "status"
  | "symbolType"
  | "displayName"
>;

function draftFromVehicle(v: Vehicle): VehicleStammDraft {
  return {
    assignedEmployee: v.assignedEmployee,
    validFrom: v.validFrom,
    validUntil: v.validUntil,
    licensePlate: v.licensePlate,
    vehicleCategory: v.vehicleCategory,
    vehicleModel: v.vehicleModel,
    wspVehicleId: v.wspVehicleId,
    vehicleGroup: v.vehicleGroup,
    vin: v.vin,
    internalNumber: v.internalNumber,
    masterNumber: v.masterNumber,
    vehicleNumber: v.vehicleNumber,
    mandant: v.mandant,
    costCenter: v.costCenter,
    status: v.status,
    symbolType: v.symbolType,
    displayName: v.displayName,
  };
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
  const canEdit = !vehicle.isCoopVehicle;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VehicleStammDraft>(() => draftFromVehicle(vehicle));

  useEffect(() => {
    setEditing(false);
    setDraft(draftFromVehicle(vehicle));
  }, [vehicle.id]); // eslint-disable-line react-hooks/exhaustive-deps -- nur bei Zeilenwechsel; `vehicle` dort aktuell

  const startEdit = useCallback(() => {
    setDraft(draftFromVehicle(vehicle));
    setEditing(true);
  }, [vehicle]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(draftFromVehicle(vehicle));
  }, [vehicle]);

  const finishEdit = useCallback(() => {
    const updated = updateVehicleDetailFields(vehicle.id, draft);
    if (updated) {
      onUpdated(updated);
      setEditing(false);
    }
  }, [vehicle.id, draft, onUpdated]);

  const setField = useCallback(<K extends keyof VehicleStammDraft>(key: K, value: VehicleStammDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const pc = panelClass(contrastOnCream);

  return (
    <div
      className={cn("border-t border-border/60 px-4 py-4 text-sm", className)}
      role="region"
      aria-label="Zusatzinformationen und Bearbeitung"
    >
      {canEdit ? (
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
      ) : null}

      <div className="space-y-4">
        <section className={pc} aria-labelledby={`fv-emp-${vehicle.id}`}>
          <h4
            id={`fv-emp-${vehicle.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Mitarbeiter:in
          </h4>
          {editing && canEdit ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`fv-emp-inp-${vehicle.id}`} className="sr-only">
                Mitarbeiter:in
              </label>
              <input
                id={`fv-emp-inp-${vehicle.id}`}
                type="text"
                value={draft.assignedEmployee}
                onChange={(e) => setField("assignedEmployee", e.target.value)}
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
          {editing && canEdit ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <VehicleSymbolIcon type={draft.symbolType} className="text-foreground" />
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor={`fv-sym-${vehicle.id}`} className="mb-1 block text-xs font-medium text-muted-foreground">
                    Symbol
                  </label>
                  <select
                    id={`fv-sym-${vehicle.id}`}
                    value={draft.symbolType}
                    onChange={(e) => setField("symbolType", e.target.value as VehicleSymbolType)}
                    className={detailInputClass}
                  >
                    {SYMBOL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {VEHICLE_SYMBOL_LABELS[opt]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">Kurzbezeichnung (Anzeige)</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.displayName}
                      onChange={(e) => setField("displayName", e.target.value)}
                      className={detailInputClass}
                      aria-label="Kurzbezeichnung"
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Kennzeichen</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.licensePlate}
                      onChange={(e) => setField("licensePlate", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.status}
                      onChange={(e) => setField("status", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Fahrzeugart</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.vehicleCategory}
                      onChange={(e) => setField("vehicleCategory", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Fahrzeugtyp</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.vehicleModel}
                      onChange={(e) => setField("vehicleModel", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Fahrzeug-ID</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.wspVehicleId}
                      onChange={(e) => setField("wspVehicleId", e.target.value)}
                      className={cn(detailInputClass, "font-mono text-xs")}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Fahrzeuggruppe</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.vehicleGroup}
                      onChange={(e) => setField("vehicleGroup", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">VIN / Chassisnummer</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.vin}
                      onChange={(e) => setField("vin", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Interne Nummer</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.internalNumber}
                      onChange={(e) => setField("internalNumber", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Stammnummer</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.masterNumber}
                      onChange={(e) => setField("masterNumber", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">Fahrzeugnummer (Matching)</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.vehicleNumber}
                      onChange={(e) => setField("vehicleNumber", e.target.value)}
                      className={cn(detailInputClass, "font-mono")}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Mandant</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.mandant}
                      onChange={(e) => setField("mandant", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Kostenstelle</dt>
                  <dd className="mt-0.5">
                    <input
                      type="text"
                      value={draft.costCenter}
                      onChange={(e) => setField("costCenter", e.target.value)}
                      className={detailInputClass}
                    />
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <VehicleSymbolIcon type={vehicle.symbolType} className="text-foreground" />
                <span className="text-sm text-muted-foreground">{VEHICLE_SYMBOL_LABELS[vehicle.symbolType]}</span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DlItem label="Kurzbezeichnung">{vehicle.displayName.trim() || "–"}</DlItem>
                <DlItem label="Kennzeichen">{vehicle.licensePlate.trim() || "–"}</DlItem>
                <DlItem label="Status">{vehicle.status.trim() || "–"}</DlItem>
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
                <DlItem label="Mandant">{vehicle.mandant.trim() || "–"}</DlItem>
                <DlItem label="Kostenstelle">{vehicle.costCenter.trim() || "–"}</DlItem>
              </dl>
            </>
          )}
        </section>

        <section className={pc} aria-labelledby={`fv-val-${vehicle.id}`}>
          <h4
            id={`fv-val-${vehicle.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Gültigkeit
          </h4>
          {editing && canEdit ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`fv-von-inp-${vehicle.id}`} className="text-xs font-medium text-muted-foreground">
                  Gültig ab
                </label>
                <input
                  id={`fv-von-inp-${vehicle.id}`}
                  type="date"
                  value={draft.validFrom}
                  onChange={(e) => setField("validFrom", e.target.value)}
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
                  value={draft.validUntil}
                  onChange={(e) => setField("validUntil", e.target.value)}
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
          {vehicle.isCoopVehicle
            ? ". Coop-Fahrzeug: Stammdaten sind schreibgeschützt."
            : ". Fremdfahrzeug: Stammdaten können über „Editieren“ angepasst werden."}
          {vehicle.editable ? " Manuell erfasst." : " Importiert."}
        </div>
      </div>

      <div className="mt-4">
        <MatchingHint compact whiteSurface={contrastOnCream} />
      </div>
    </div>
  );
}
