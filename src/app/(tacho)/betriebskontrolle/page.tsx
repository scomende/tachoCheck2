"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { getMockDrivingData } from "@/mock/drivingData";
import {
  ALL_EXPORT_PART_IDS,
  getExportPartsWithStatus,
  createExport,
  getExportHistory,
} from "@/mock/controlExports";
import type { ExportPartType } from "@/domain/controlExportTypes";
import { DEFAULT_USER_DISPLAY_NAME } from "@/config/layout";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import type { ControlExport, ExportConfig } from "@/domain/controlExportTypes";
import {
  BetriebskontrolleFilters,
  ExportConfigCard,
  ExportPartsCard,
  DataSourceInfo,
  ExportHistoryTable,
  ExportDetailPanel,
} from "@/components/views/betriebskontrolle";

function getDefaultConfig(initialDriverId?: string | null): ExportConfig {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    dateFrom: weekAgo,
    dateTo: today,
    driverIds: initialDriverId ? [initialDriverId] : [],
    format: "xdt",
    includedPartIds: [...ALL_EXPORT_PART_IDS],
  };
}

export default function BetriebskontrollePage() {
  const { drivers, selectedEmployeeId } = useSelectedEmployee();
  const [config, setConfig] = useState<ExportConfig>(() => getDefaultConfig(null));
  const [history, setHistory] = useState<ControlExport[]>(() => getExportHistory());
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEmployeeId) {
      setConfig((prev) => ({
        ...prev,
        driverIds: prev.driverIds.includes(selectedEmployeeId)
          ? prev.driverIds
          : [selectedEmployeeId, ...prev.driverIds],
        includedPartIds:
          prev.includedPartIds?.length > 0 ? prev.includedPartIds : [...ALL_EXPORT_PART_IDS],
      }));
    } else {
      setConfig((prev) => ({ ...prev, driverIds: [] }));
    }
  }, [selectedEmployeeId]);

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
        <ExportPartsCard
          parts={parts}
          includedPartIds={config.includedPartIds ?? ALL_EXPORT_PART_IDS}
          onTogglePart={(id: ExportPartType) => {
            setConfig((prev) => {
              const current = prev.includedPartIds ?? [...ALL_EXPORT_PART_IDS];
              const next = current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id];
              return { ...prev, includedPartIds: next };
            });
          }}
        />
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
