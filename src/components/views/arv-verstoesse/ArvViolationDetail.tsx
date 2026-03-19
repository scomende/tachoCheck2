"use client";

import Link from "next/link";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { ArvViolation, ArvViolationSeverity } from "@/domain/drivingTypes";
import { getDriverNameById } from "@/mock/arvViolations";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SEVERITY_LABELS, STATUS_LABELS } from "./constants";
import { cn } from "@/lib/utils";

const SEVERITY_ICON: Record<
  ArvViolationSeverity,
  React.ComponentType<{ className?: string }>
> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

type ArvViolationDetailProps = {
  violation: ArvViolation | null;
  onShowReport: (v: ArvViolation) => void;
  className?: string;
};

function formatTimeRange(range: { start: string; end: string }): string {
  return `${range.start} – ${range.end}`;
}

export function ArvViolationDetail({
  violation,
  onShowReport,
  className,
}: ArvViolationDetailProps) {
  if (!violation) {
    return (
      <aside
        className={cn(
          "flex w-96 shrink-0 flex-col border-l border-border bg-muted/10 p-5",
          className
        )}
        role="complementary"
        aria-label="Detail Verstoss"
      >
        <p className="text-sm text-muted-foreground">
          Wählen Sie einen Verstoss aus der Liste.
        </p>
      </aside>
    );
  }

  const SeverityIcon = violation.severity
    ? SEVERITY_ICON[violation.severity]
    : null;

  const fahrerkartenHref = violation.driverId
    ? `/fahrerkarten?driverId=${encodeURIComponent(violation.driverId)}&date=${encodeURIComponent(violation.date)}`
    : "/fahrerkarten";

  return (
    <aside
      className={cn(
        "flex w-96 shrink-0 flex-col overflow-auto border-l border-border bg-muted/10",
        className
      )}
      role="complementary"
      aria-label="Detail Verstoss"
    >
      <Card className="m-4 border-0 shadow-none">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Verstoss-Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 p-5 pt-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Mitarbeiter:in
            </span>
            <p className="text-sm font-medium text-foreground">
              {violation.driverId
                ? getDriverNameById(violation.driverId)
                : "–"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Datum / Zeitraum
            </span>
            <p className="text-sm text-foreground">
              {formatDayLabelLong(violation.date)}
              {violation.timeRange && (
                <> · {formatTimeRange(violation.timeRange)}</>
              )}
            </p>
          </div>
          {violation.rule && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Betroffene Regel
              </span>
              <p className="text-sm text-foreground">{violation.rule}</p>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Kurzbeschreibung
            </span>
            <p className="text-sm text-foreground">{violation.description}</p>
          </div>
          {violation.severity && SeverityIcon && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Schweregrad
              </span>
              <p className="flex items-center gap-1.5 text-sm text-foreground">
                <SeverityIcon className="size-4" aria-hidden />
                {SEVERITY_LABELS[violation.severity]}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Datenbasis
            </span>
            <p className="text-sm text-foreground">
              {violation.useCorrectedData
                ? "Korrigierte Daten"
                : "Originaldaten"}
            </p>
          </div>
          {violation.status && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <p className="text-sm">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {STATUS_LABELS[violation.status]}
                </span>
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={fahrerkartenHref}>Zur Fahrerkartenansicht</Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={() => onShowReport(violation)}
            >
              Report anzeigen
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
