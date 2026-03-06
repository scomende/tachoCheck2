"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ArvViolation } from "@/domain/drivingTypes";
import { getDriverNameById } from "@/mock/arvViolations";
import { formatDayLabelLong, timeStringToMinutes, minutesToPercent } from "@/lib/drivingUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ArvReportPreviewProps = {
  violation: ArvViolation;
  open: boolean;
  onClose: () => void;
  signed?: boolean;
  className?: string;
};

export function ArvReportPreview({
  violation,
  open,
  onClose,
  signed = false,
  className,
}: ArvReportPreviewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  const timeRange = violation.timeRange ?? { start: "00:00", end: "12:00" };
  const startMin = timeStringToMinutes(timeRange.start);
  const endMin = timeStringToMinutes(timeRange.end);
  const left = minutesToPercent(startMin);
  const width = minutesToPercent(Math.max(0, endMin - startMin));

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        className
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arv-report-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="arv-report-title" className="text-lg font-semibold text-foreground">
            ARV-Verstoss-Report
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Schliessen"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Mitarbeiter:in</span>
            <span className="font-medium">
              {violation.driverId ? getDriverNameById(violation.driverId) : "–"}
            </span>
            <span className="text-muted-foreground">Datum</span>
            <span className="font-medium">{formatDayLabelLong(violation.date)}</span>
            <span className="text-muted-foreground">Verstoss</span>
            <span className="font-medium">{violation.description}</span>
          </div>

          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Tageszeit (00:00 – 24:00)
          </p>
          <div className="relative h-12 w-full rounded border border-border bg-muted/30">
            {/* Hintergrund: ganzer Tag */}
            <div className="absolute inset-0 flex">
              <div
                className="bg-muted/50"
                style={{ width: `${left}%` }}
                title="Vor Verstoss"
              />
              <div
                className="bg-destructive/80"
                style={{ width: `${width}%` }}
                title="Verstoss-Zeitraum"
              />
              <div
                className="bg-muted/50"
                style={{ width: `${100 - left - width}%` }}
                title="Nach Verstoss"
              />
            </div>
            {/* Stunde-Marken (optional): 6, 12, 18 */}
            <div className="absolute left-0 top-0 flex h-full w-full pointer-events-none">
              {[6, 12, 18].map((h) => (
                <div
                  key={h}
                  className="absolute top-0 h-full w-px bg-border"
                  style={{ left: `${(h / 24) * 100}%` }}
                  aria-hidden
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Verstoss: {timeRange.start} – {timeRange.end}
          </p>

          <div className="mt-6 rounded border border-border bg-muted/20 px-3 py-2 text-sm">
            <span className="font-medium text-muted-foreground">Unterschrift: </span>
            <span className={signed ? "text-primary" : "text-muted-foreground"}>
              {signed ? "Unterschrieben" : "Nicht unterschrieben"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
