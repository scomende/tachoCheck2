"use client";

import type { ExportConfig } from "@/domain/controlExportTypes";
import { getDriverNameById } from "@/mock/arvViolations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExportConfigCardProps = {
  config: ExportConfig;
  className?: string;
};

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export function ExportConfigCard({ config, className }: ExportConfigCardProps) {
  const driverNames =
    config.driverIds.length > 0
      ? config.driverIds.map(getDriverNameById).join(", ")
      : "Keine Auswahl";

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Export-Konfiguration</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">Zeitraum:</dt>
          <dd>{formatDate(config.dateFrom)} – {formatDate(config.dateTo)}</dd>
          <dt className="text-muted-foreground">Mitarbeitende:</dt>
          <dd>{config.driverIds.length > 0 ? `${config.driverIds.length} (${driverNames})` : "–"}</dd>
          {config.region && (
            <>
              <dt className="text-muted-foreground">Region/Kostenstelle:</dt>
              <dd>{config.region}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Format:</dt>
          <dd>.{config.format}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
