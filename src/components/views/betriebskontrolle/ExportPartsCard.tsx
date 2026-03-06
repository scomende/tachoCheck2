"use client";

import { Check, X, Database } from "lucide-react";
import type { ExportPart } from "@/domain/controlExportTypes";
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
  className?: string;
};

export function ExportPartsCard({ parts, className }: ExportPartsCardProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold">Exportbestandteile</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <ul className="flex flex-col gap-2">
          {parts.map((part) => {
            const Icon = STATUS_ICON[part.status];
            return (
              <li
                key={part.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded border px-3 py-2.5 text-sm",
                  STATUS_STYLE[part.status]
                )}
              >
                <span className="font-medium">{part.label}</span>
                <div className="flex items-center gap-2">
                  {part.hint && (
                    <span className="text-xs text-muted-foreground">{part.hint}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Icon className="size-4" aria-hidden />
                    {STATUS_LABEL[part.status]}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
