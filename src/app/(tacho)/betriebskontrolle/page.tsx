"use client";

import { useCallback, useState, useMemo } from "react";
import { getMockDrivingData } from "@/mock/drivingData";
import {
  getExportPartsWithStatus,
  createExport,
  getExportHistory,
} from "@/mock/controlExports";
import { DEFAULT_USER_DISPLAY_NAME } from "@/config/layout";
import type { ControlExport, ExportConfig } from "@/domain/controlExportTypes";
import {
  BetriebskontrolleFilters,
  ExportConfigCard,
  ExportPartsCard,
  DataSourceInfo,
  ExportHistoryTable,
  ExportDetailPanel,
} from "@/components/views/betriebskontrolle";

function getDefaultConfig(): ExportConfig {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    dateFrom: weekAgo,
    dateTo: today,
    driverIds: [],
    format: "xdt",
  };
}

export default function BetriebskontrollePage() {
  const { drivers } = getMockDrivingData();
  const [config, setConfig] = useState<ExportConfig>(getDefaultConfig);
  const [history, setHistory] = useState<ControlExport[]>(() => getExportHistory());
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const parts = useMemo(() => getExportPartsWithStatus(config), [config]);

  const selectedExport = useMemo(
    () => history.find((e) => e.id === selectedExportId) ?? null,
    [history, selectedExportId]
  );

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setSuccessMessage(null);
    const result = createExport(config, DEFAULT_USER_DISPLAY_NAME);
    setHistory(getExportHistory());
    setIsGenerating(false);
    if (result.success) {
      setSuccessMessage(
        `Exportpaket wurde erstellt: ${result.export.filename}`
      );
      setSelectedExportId(result.export.id);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [config]);

  return (
    <div className="flex flex-col">
      <h1 className="sr-only">Betriebskontrolle</h1>
      <BetriebskontrolleFilters
        config={config}
        drivers={drivers}
        onConfigChange={setConfig}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
      {successMessage && (
        <div
          role="status"
          className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground"
        >
          {successMessage}
        </div>
      )}
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <ExportConfigCard config={config} />
        <ExportPartsCard parts={parts} />
      </div>
      <div className="px-4 pb-4">
        <DataSourceInfo className="mb-4" />
      </div>
      <div className="flex flex-1 min-h-0 px-4 pb-4">
        <div className="flex-1 min-w-0">
          <ExportHistoryTable
            exports={history}
            selectedId={selectedExportId}
            onSelect={(exp) => setSelectedExportId(exp.id)}
          />
        </div>
        <ExportDetailPanel exportEntry={selectedExport} />
      </div>
    </div>
  );
}
