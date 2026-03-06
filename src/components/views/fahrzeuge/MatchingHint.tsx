"use client";

import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MatchingHintProps = {
  className?: string;
};

export function MatchingHint({ className }: MatchingHintProps) {
  return (
    <Card className={cn("border-border bg-muted/20", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Info className="size-5 text-primary" aria-hidden />
          Matching / Schnittstelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-5 pt-0 text-sm text-muted-foreground">
        <p>
          Die <strong className="text-foreground">Fahrzeugnummer</strong> ist der
          zentrale Schlüssel für das Matching mit der Ressourcenplanung.
        </p>
        <p>
          Das Matching zur Ressourcenplanung ist für eine spätere Version
          vorgesehen. Die genaue Matching-Logik steht noch offen.
        </p>
      </CardContent>
    </Card>
  );
}
