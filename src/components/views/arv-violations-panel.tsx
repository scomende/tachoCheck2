"use client";

import Link from "next/link";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import type { ArvViolation, ArvViolationSeverity } from "@/domain/drivingTypes";
import { formatDayLabelLong } from "@/lib/drivingUtils";
import { cn } from "@/lib/utils";

type ArvViolationsPanelProps = {
  violations: ArvViolation[];
  highlightedDate: string | null;
  onSelectDate: (date: string) => void;
  /** Aktueller Fahrer (für Link „Details“ → Verstösse-Tab). */
  driverId?: string;
  className?: string;
};

const SEVERITY_ICON: Record<ArvViolationSeverity, React.ComponentType<{ className?: string }>> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

const SEVERITY_LABEL: Record<ArvViolationSeverity, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Gering",
};

export const ArvViolationsPanel = ({
  violations,
  highlightedDate,
  onSelectDate,
  driverId,
  className,
}: ArvViolationsPanelProps) => {
  return (
    <aside
      className={cn(
        "flex w-80 shrink-0 flex-col border-l border-border bg-muted/10",
        className
      )}
      role="complementary"
      aria-label="Verstösse dieser Woche"
    >
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
        Verstösse dieser Woche
      </h2>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {violations.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Keine Verstösse in dieser Woche
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {violations.map((v, i) => {
              const isHighlighted = v.date === highlightedDate;
              const SeverityIcon = v.severity ? SEVERITY_ICON[v.severity] : null;
              const detailsHref =
                driverId != null
                  ? `/arv-verstoesse?driverId=${encodeURIComponent(driverId)}&date=${encodeURIComponent(v.date)}`
                  : "/arv-verstoesse";
              return (
                <li key={`${v.date}-${i}`}>
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 rounded border px-3 py-2.5 text-sm transition-colors",
                      isHighlighted
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectDate(v.date)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 text-left",
                        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded"
                      )}
                      aria-pressed={isHighlighted}
                      aria-label={`Verstoss ${formatDayLabelLong(v.date)}: ${v.description}. Tag hervorheben.`}
                    >
                      <span className="font-medium text-foreground">
                        {formatDayLabelLong(v.date)}
                      </span>
                      <span className="text-muted-foreground">
                        {v.description}
                      </span>
                      {v.severity && SeverityIcon && (
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <SeverityIcon className="size-3.5" aria-hidden />
                          {SEVERITY_LABEL[v.severity]}
                        </span>
                      )}
                    </button>
                    <Link
                      href={detailsHref}
                      className="mt-1.5 self-start text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded"
                      aria-label={`Details zu Verstoss ${formatDayLabelLong(v.date)} anzeigen`}
                    >
                      Details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};
