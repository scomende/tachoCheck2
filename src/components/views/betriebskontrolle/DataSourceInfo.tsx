"use client";

import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataSourceInfoProps = {
  className?: string;
};

export function DataSourceInfo({ className }: DataSourceInfoProps) {
  return (
    <Card className={cn("border-border bg-muted/20", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Info className="size-5 text-primary" aria-hidden />
          Datenherkunft
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Daten aus Tacho Check:</strong>{" "}
          Fahrerkartendaten, ARV-Reports, Aufstellungen zur Arbeitszeit sowie
          Personalien und Kontaktangaben werden in diesem Modul erzeugt und dem
          Exportpaket beigefügt.
        </p>
        <p>
          <strong className="text-foreground">Daten aus externem Massenspeicher-System:</strong>{" "}
          Alle fahrzeugbezogenen Daten und Massenspeicherinhalte stammen aus einem
          anderen System. Das Exportpaket enthält hierfür einen Verweis; die
          eigentlichen Dateien müssen dort angefordert und dem Paket beigefügt werden.
        </p>
      </CardContent>
    </Card>
  );
}
