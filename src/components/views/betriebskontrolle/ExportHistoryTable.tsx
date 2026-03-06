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
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Bisher erzeugte Exporte</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 font-semibold text-foreground">Datum / Uhrzeit</th>
                <th className="px-3 py-2 font-semibold text-foreground">Zeitraum</th>
                <th className="px-3 py-2 font-semibold text-foreground">Verantwortliche Person</th>
                <th className="px-3 py-2 font-semibold text-foreground">Dateiname / Export-ID</th>
                <th className="px-3 py-2 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
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
                        "border-b border-border cursor-pointer transition-colors hover:bg-muted/30",
                        isSelected && "bg-primary/10"
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
                      <td className="px-3 py-2">{formatDateTime(exp.createdAt)}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatDate(exp.dateFrom)} – {formatDate(exp.dateTo)}
                      </td>
                      <td className="px-3 py-2">{exp.responsiblePerson}</td>
                      <td className="px-3 py-2 font-mono text-xs">{exp.filename}</td>
                      <td className="px-3 py-2">{STATUS_LABEL[exp.status]}</td>
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
