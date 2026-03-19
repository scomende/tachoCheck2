"use client";

import { Check, X, Database } from "lucide-react";
import type { ExportPart, ExportPartType } from "@/domain/controlExportTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<ExportPart["status"], React.ComponentType<{ className?: string }>> = {
  enthalten: Check,
  fehlt: X,
  extern: Database,
};

const STATUS_LABEL: Record<ExportPart["status"], string> = {
  enthalten: "Enthalten",
  fehlt: "Fehlt",
  extern: "Extern",
};

const STATUS_STYLE: Record<ExportPart["status"], string> = {
  enthalten: "border-primary/50 bg-primary/5 text-foreground",
  fehlt: "border-destructive/50 bg-destructive/5 text-destructive",
  extern: "border-muted-foreground/50 bg-muted/30 text-muted-foreground",
};

type ExportPartsCardProps = {
  parts: ExportPart[];
  includedPartIds: ExportPartType[];
  onTogglePart: (id: ExportPartType) => void;
  className?: string;
};

/**
 * Exportbestandteile als durchgehende Liste (Checkbox + Name), kein Dropdown.
 * Dropdown-Mehrfachauswahl nur bei Mitarbeitenden in {@link BetriebskontrolleFilters}.
 */
export function ExportPartsCard({
  parts,
  includedPartIds,
  onTogglePart,
  className,
}: ExportPartsCardProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold">Exportbestandteile</CardTitle>
        <p className="text-xs font-normal text-muted-foreground">
          Aktivieren oder deaktivieren, ob der Bestandteil im Paket enthalten ist.
        </p>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <ul className="flex flex-col gap-2">
          {parts.map((part) => {
            const Icon = STATUS_ICON[part.status];
            const included = includedPartIds.includes(part.id);
            const checkboxId = `export-part-${part.id}`;
            return (
              <li
                key={part.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded border px-3 py-2.5 text-sm transition-opacity",
                  STATUS_STYLE[part.status],
                  !included && "opacity-60"
                )}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={included}
                    onChange={() => onTogglePart(part.id)}
                    className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                    aria-describedby={`${checkboxId}-meta`}
                  />
                  <div className="min-w-0 flex-1">
                    <label htmlFor={checkboxId} className="cursor-pointer font-medium">
                      {part.label}
                    </label>
                    <div
                      id={`${checkboxId}-meta`}
                      className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
                    >
                      {part.hint && <span>{part.hint}</span>}
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="size-3.5 shrink-0" aria-hidden />
                        {STATUS_LABEL[part.status]}
                      </span>
                      {!included && (
                        <span className="text-foreground/80">· nicht im Export</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
