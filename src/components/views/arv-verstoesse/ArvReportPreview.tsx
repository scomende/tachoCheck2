"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ArvViolation } from "@/domain/drivingTypes";
import { getDriverNameById } from "@/mock/arvViolations";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import { Button } from "@/components/ui/button";
import { ArvViolationDayTimelineBar } from "./ArvViolationDayTimelineBar";
import { VIOLATION_TYPE_LABELS } from "./constants";
import { cn } from "@/lib/utils";

type ArvReportPreviewProps = {
  /** Ein Report pro Mitarbeiter:in und Tag – alle Verstösse des Tages. */
  driverId: string;
  date: string;
  violations: ArvViolation[];
  open: boolean;
  onClose: () => void;
  signed?: boolean;
  className?: string;
};

const REPORT_TIME_FALLBACK = { start: "00:00", end: "12:00" } as const;

export function ArvReportPreview({
  driverId,
  date,
  violations,
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

  const actualRanges = violations.map((v) => v.timeRange ?? REPORT_TIME_FALLBACK);

  const rangeCaptions = violations.map((v, i) => {
    const n = i + 1;
    const r = v.timeRange ?? REPORT_TIME_FALLBACK;
    const prefix = violations.length > 1 ? `${n}. ` : "";
    return `${prefix}Verstoss: ${r.start} – ${r.end}`;
  });

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
            Verstoss-Report (Tag)
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
        <div className="flex-1 overflow-auto p-5">
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Mitarbeiter:in</span>
            <span className="font-medium">
              {driverId ? getDriverNameById(driverId) : "–"}
            </span>
            <span className="text-muted-foreground">Datum</span>
            <span className="font-medium">{formatDayLabelLong(date)}</span>
            <span className="text-muted-foreground">Verstösse</span>
            <span className="font-medium">{violations.length}</span>
          </div>

          <p className="mb-2 text-xs font-medium text-muted-foreground">Verstösse im Detail</p>
          <ol className="mb-5 list-decimal space-y-2 border-b border-border/60 pb-5 pl-5 text-sm marker:text-muted-foreground">
            {violations.map((v, i) => (
              <li key={v.id ?? `${i}`} className="pl-1">
                <span className="font-medium text-foreground">
                  {v.violationType
                    ? VIOLATION_TYPE_LABELS[v.violationType]
                    : v.description}
                </span>
                {v.description && v.violationType ? (
                  <span className="mt-0.5 block text-muted-foreground">{v.description}</span>
                ) : null}
              </li>
            ))}
          </ol>

          <ArvViolationDayTimelineBar
            timeRanges={actualRanges}
            rangeCaptions={rangeCaptions}
          />

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
