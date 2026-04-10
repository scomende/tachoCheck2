"use client";

import { Fragment } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ControlExport } from "@/domain/controlExportTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExportHistoryRowDetailContent } from "./ExportHistoryRowDetailContent";

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

const COL_COUNT = 6;

/** Wie Tab Fahrzeuge (`FahrzeugTable`). */
const SELECTED_ROW_BG = "bg-[#FFF8E6]";
const SELECTED_ROW_BG_HOVER = "hover:bg-[#FFF2CC]";

type ExportHistoryTableProps = {
  exports: ControlExport[];
  expandedId: string | null;
  onRowActivate: (id: string) => void;
  className?: string;
};

export function ExportHistoryTable({
  exports,
  expandedId,
  onRowActivate,
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
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
              <tr>
                <th
                  className="w-10 px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  aria-hidden
                />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Datum / Uhrzeit
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Zeitraum
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Verantwortliche Person
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dateiname / Export-ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={COL_COUNT} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Noch keine Exporte erzeugt
                  </td>
                </tr>
              ) : (
                exports.map((exp) => {
                  const isExpanded = expandedId === exp.id;
                  const rowSummary = `${formatDateTime(exp.createdAt)}, ${exp.filename}`;
                  return (
                    <Fragment key={exp.id}>
                      <tr
                        className={cn(
                          "border-b border-border min-h-[2.75rem] transition-colors",
                          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                          isExpanded
                            ? cn(SELECTED_ROW_BG, SELECTED_ROW_BG_HOVER)
                            : "hover:bg-muted/20"
                        )}
                        onClick={() => onRowActivate(exp.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowActivate(exp.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={isExpanded}
                        aria-pressed={isExpanded}
                        aria-label={
                          isExpanded
                            ? `${rowSummary}. Details ausgeklappt. Ausgewählt (gelbe Markierung).`
                            : `${rowSummary}. Details einblenden.`
                        }
                      >
                        <td className="px-2 py-3 align-middle text-muted-foreground" aria-hidden>
                          {isExpanded ? (
                            <ChevronDown className="mx-auto size-4 shrink-0 opacity-70" />
                          ) : (
                            <ChevronRight className="mx-auto size-4 shrink-0 opacity-70" />
                          )}
                        </td>
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
                      {isExpanded ? (
                        <tr className={cn("border-b border-border", SELECTED_ROW_BG)}>
                          <td colSpan={COL_COUNT} className="p-0 align-top">
                            <ExportHistoryRowDetailContent exportEntry={exp} contrastOnCream />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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
