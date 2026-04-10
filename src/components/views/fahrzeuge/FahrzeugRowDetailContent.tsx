"use client";

import { useState, useCallback, useEffect } from "react";
import { Info } from "lucide-react";
import type { Vehicle } from "@/domain/vehicleTypes";
import { updateVehicleDetailFields } from "@/mock/vehicles";
import { formatValidityRange } from "@/lib/vehicleUi";
import { MatchingHint } from "./MatchingHint";
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
  const [orgDraft, setOrgDraft] = useState({ mandant: "", costCenter: "" });

  useEffect(() => {
    setEditing(false);
    setEmployeeDraft("");
    setOrgDraft({ mandant: "", costCenter: "" });
  }, [vehicle.id]);

  const startEdit = useCallback(() => {
    setEmployeeDraft(vehicle.assignedEmployee);
    setOrgDraft({ mandant: vehicle.mandant, costCenter: vehicle.costCenter });
    setEditing(true);
  }, [vehicle.assignedEmployee, vehicle.mandant, vehicle.costCenter]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEmployeeDraft("");
    setOrgDraft({ mandant: "", costCenter: "" });
  }, []);

  const finishEdit = useCallback(() => {
    const updated = updateVehicleDetailFields(vehicle.id, {
      assignedEmployee: employeeDraft,
      mandant: orgDraft.mandant,
      costCenter: orgDraft.costCenter,
    });
    if (updated) {
      onUpdated(updated);
      setEditing(false);
    }
  }, [vehicle.id, employeeDraft, orgDraft.mandant, orgDraft.costCenter, onUpdated]);

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

      {!vehicle.editable ? (
        <div
          className={cn(
            "mb-4 flex gap-2 rounded-md border px-3 py-2.5 text-xs",
            contrastOnCream
              ? "border-border bg-white text-foreground shadow-sm dark:border-border dark:bg-card"
              : "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/25 dark:text-sky-100"
          )}
        >
          <Info className="mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden />
          <p className={contrastOnCream ? "text-muted-foreground" : "text-sky-900 dark:text-sky-100/90"}>
            Weitere Stammdaten stammen aus dem Import.{" "}
            <span className="font-medium text-foreground">Mitarbeiter:in</span> und{" "}
            <span className="font-medium text-foreground">Organisation</span> können Sie über „Editieren“
            anpassen.
          </p>
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
            Fahrzeug &amp; Nummern
          </h4>
          <p className="mb-3 text-sm text-foreground">
            <span className="text-muted-foreground">Fahrzeuggruppe: </span>
            {vehicle.vehicleGroup.trim() || "–"}
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DlItem label="VIN / Chassisnummer">{vehicle.vin.trim() || "–"}</DlItem>
            <DlItem label="Interne Nummer">{vehicle.internalNumber.trim() || "–"}</DlItem>
            <DlItem label="Stammnummer">{vehicle.masterNumber.trim() || "–"}</DlItem>
            <DlItem label="Fahrzeugnummer (Matching)">
              <span className="font-mono">{vehicle.vehicleNumber}</span>
            </DlItem>
          </dl>
        </section>

        <section className={pc} aria-labelledby={`fv-org-${vehicle.id}`}>
          <h4
            id={`fv-org-${vehicle.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Organisation
          </h4>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`fv-mand-inp-${vehicle.id}`} className="text-xs font-medium text-muted-foreground">
                  Mandant (Zuweisungsgruppe)
                </label>
                <input
                  id={`fv-mand-inp-${vehicle.id}`}
                  type="text"
                  value={orgDraft.mandant}
                  onChange={(e) => setOrgDraft((d) => ({ ...d, mandant: e.target.value }))}
                  className={detailInputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`fv-kst-inp-${vehicle.id}`} className="text-xs font-medium text-muted-foreground">
                  Kostenstelle
                </label>
                <input
                  id={`fv-kst-inp-${vehicle.id}`}
                  type="text"
                  value={orgDraft.costCenter}
                  onChange={(e) => setOrgDraft((d) => ({ ...d, costCenter: e.target.value }))}
                  className={detailInputClass}
                />
              </div>
            </div>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <DlItem label="Mandant (Zuweisungsgruppe)">{vehicle.mandant.trim() || "–"}</DlItem>
              <DlItem label="Kostenstelle">{vehicle.costCenter.trim() || "–"}</DlItem>
            </dl>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Gültigkeit: {formatValidityRange(vehicle.validFrom, vehicle.validUntil)}
          {!vehicle.validUntil.trim() ? " (leeres Enddatum = unbefristet)" : null}
        </p>

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
