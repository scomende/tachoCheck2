"use client";

import type { ControlExport } from "@/domain/controlExportTypes";
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

const STATUS_LABEL: Record<ControlExport["status"], string> = {
  pending: "In Bearbeitung",
  ready: "Bereit",
  failed: "Fehlgeschlagen",
};

type ExportHistoryTableProps = {
  exports: ControlExport[];
  selectedId: string | null;
  onSelect: (exp: ControlExport) => void;
  className?: string;
};

export function ExportHistoryTable({
  exports,
  selectedId,
  onSelect,
  className,
}: ExportHistoryTableProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold">Bisher erzeugte Exporte</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datum / Uhrzeit</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zeitraum</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verantwortliche Person</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dateiname / Export-ID</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Noch keine Exporte erzeugt
                  </td>
                </tr>
              ) : (
                exports.map((exp) => {
                  const isSelected = exp.id === selectedId;
                  return (
                    <tr
                      key={exp.id}
                      className={cn(
                        "border-b border-border cursor-pointer transition-colors min-h-[2.75rem]",
                        "hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                        isSelected && "bg-primary/5 border-l-4 border-l-primary"
                      )}
                      onClick={() => onSelect(exp)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(exp);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                    >
                      <td className="px-4 py-3">{formatDateTime(exp.createdAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(exp.dateFrom)} – {formatDate(exp.dateTo)}
                      </td>
                      <td className="px-4 py-3">{exp.responsiblePerson}</td>
                      <td className="px-4 py-3 font-mono text-xs">{exp.filename}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {STATUS_LABEL[exp.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
