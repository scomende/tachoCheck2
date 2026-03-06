"use client";

import { Check, X, Database } from "lucide-react";
import type { ControlExport, ExportPart } from "@/domain/controlExportTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const STATUS_LABEL: Record<ExportPart["status"], string> = {
  enthalten: "Enthalten",
  fehlt: "Fehlt",
  extern: "Extern",
};

const PART_STATUS_ICON: Record<ExportPart["status"], React.ComponentType<{ className?: string }>> = {
  enthalten: Check,
  fehlt: X,
  extern: Database,
};

type ExportDetailPanelProps = {
  exportEntry: ControlExport | null;
  className?: string;
};

export function ExportDetailPanel({ exportEntry, className }: ExportDetailPanelProps) {
  if (!exportEntry) {
    return (
      <aside
        className={cn(
          "flex w-80 shrink-0 flex-col border-l border-border bg-muted/10 p-5",
          className
        )}
        role="complementary"
        aria-label="Export-Details"
      >
        <p className="text-sm text-muted-foreground">
          Wählen Sie einen Export aus der Liste.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex w-80 shrink-0 flex-col overflow-auto border-l border-border bg-muted/10",
        className
      )}
      role="complementary"
      aria-label="Export-Details"
    >
      <Card className="m-4 border-0 shadow-none">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Export-Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 p-5 pt-0 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Datum / Uhrzeit</span>
            <p className="text-foreground">{formatDateTime(exportEntry.createdAt)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Zeitraum</span>
            <p className="text-foreground">
              {formatDate(exportEntry.dateFrom)} – {formatDate(exportEntry.dateTo)}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Verantwortliche Person</span>
            <p className="text-foreground">{exportEntry.responsiblePerson}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Dateiname / Export-ID</span>
            <p className="font-mono text-xs text-foreground">{exportEntry.filename}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Format</span>
            <p className="text-foreground">.{exportEntry.format}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Anzahl Mitarbeitende</span>
            <p className="text-foreground">{exportEntry.driverIds.length}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Bestandteile</span>
            <ul className="mt-1 flex flex-col gap-2">
              {exportEntry.parts.map((part) => {
                const Icon = PART_STATUS_ICON[part.status];
                return (
                  <li
                    key={part.id}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    {part.label}: {STATUS_LABEL[part.status]}
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
