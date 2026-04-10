"use client";

import { Check, X, Database, Download } from "lucide-react";
import type { ControlExport, ExportPart } from "@/domain/controlExportTypes";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${h}:${min}`;
}

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

const EXPORT_STATUS_LABEL: Record<ControlExport["status"], string> = {
  pending: "In Bearbeitung",
  ready: "Bereit",
  failed: "Fehlgeschlagen",
};

const PART_STATUS_LABEL: Record<ExportPart["status"], string> = {
  enthalten: "Enthalten",
  fehlt: "Fehlt",
  extern: "Extern",
};

const PART_STATUS_ICON: Record<ExportPart["status"], React.ComponentType<{ className?: string }>> = {
  enthalten: Check,
  fehlt: X,
  extern: Database,
};

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

type ExportHistoryRowDetailContentProps = {
  exportEntry: ControlExport;
  /** Weiße Kartenfläche auf cremefarbener Zeilenmarkierung (wie Tab Fahrzeuge). */
  contrastOnCream?: boolean;
  className?: string;
};

export function ExportHistoryRowDetailContent({
  exportEntry: exp,
  contrastOnCream = false,
  className,
}: ExportHistoryRowDetailContentProps) {
  const pc = panelClass(contrastOnCream);

  return (
    <div
      className={cn("border-t border-border/60 px-4 py-4 text-sm", className)}
      role="region"
      aria-label="Export-Details"
    >
      <div className="space-y-4">
        <section className={pc} aria-labelledby={`ex-meta-${exp.id}`}>
          <h4
            id={`ex-meta-${exp.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Export
          </h4>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DlItem label="Erstellt am">{formatDateTime(exp.createdAt)}</DlItem>
            <DlItem label="Zeitraum">
              {formatDate(exp.dateFrom)} – {formatDate(exp.dateTo)}
            </DlItem>
            <DlItem label="Verantwortliche Person">{exp.responsiblePerson}</DlItem>
            <DlItem label="Anzahl Mitarbeitende">{exp.driverIds.length}</DlItem>
            <DlItem label="Dateiname">
              <span className="font-mono text-xs">{exp.filename}</span>
            </DlItem>
            <DlItem label="Export-ID">
              <span className="font-mono text-xs">{exp.id}</span>
            </DlItem>
            <DlItem label="Format">
              <span className="font-mono text-xs">.{exp.format}</span>
            </DlItem>
            <DlItem label="Status">{EXPORT_STATUS_LABEL[exp.status]}</DlItem>
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Download</dt>
              <dd className="mt-0.5">
                <span
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary underline decoration-dotted underline-offset-4"
                  title="In dieser Version kein echter Download – nur UI-Hinweis."
                >
                  <Download className="size-4 shrink-0 opacity-80" aria-hidden />
                  Paket herunterladen
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nur Platzhalter für die spätere Anbindung – Klick löst keinen Download aus.
                </p>
              </dd>
            </div>
          </dl>
        </section>

        <section className={pc} aria-labelledby={`ex-parts-${exp.id}`}>
          <h4
            id={`ex-parts-${exp.id}`}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Bestandteile
          </h4>
          <ul className="flex flex-col gap-2 text-foreground">
            {exp.parts.map((part) => {
              const Icon = PART_STATUS_ICON[part.status];
              return (
                <li key={part.id} className="flex items-start gap-2 text-sm">
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span>
                    <span className="font-medium">{part.label}</span>
                    <span className="text-muted-foreground">: {PART_STATUS_LABEL[part.status]}</span>
                    {part.hint != null && (
                      <span className="block text-xs text-muted-foreground">({part.hint})</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
