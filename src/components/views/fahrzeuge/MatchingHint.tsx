"use client";

import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MatchingHintProps = {
  className?: string;
  /** Kompakte Darstellung für eingebettete Bereiche (z. B. aufgeklappte Tabellenzeile). */
  compact?: boolean;
  /** Weiße Fläche für Lesbarkeit auf cremefarbenem Tabellen-Highlight (Tab Fahrzeuge). */
  whiteSurface?: boolean;
};

export function MatchingHint({ className, compact, whiteSurface }: MatchingHintProps) {
  const body = (
    <>
      <p>
        Die <strong className="text-foreground">Fahrzeugnummer</strong> ist der zentrale Schlüssel
        für das Matching mit der Ressourcenplanung.
      </p>
      <p>
        Das Matching zur Ressourcenplanung ist für eine spätere Version vorgesehen. Die genaue
        Matching-Logik steht noch offen.
      </p>
    </>
  );

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border/80 px-3 py-3 shadow-sm",
          whiteSurface ? "bg-white dark:bg-card" : "bg-muted/25 dark:bg-muted/15",
          className
        )}
        role="note"
      >
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground">
          <Info className="size-4 shrink-0 text-primary" aria-hidden />
          Matching / Schnittstelle
        </p>
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">{body}</div>
      </div>
    );
  }

  return (
    <Card className={cn("border-border bg-muted/20", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Info className="size-5 text-primary" aria-hidden />
          Matching / Schnittstelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-5 pt-0 text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}
