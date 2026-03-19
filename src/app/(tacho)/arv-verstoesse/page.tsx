"use client";

import { Suspense, useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getArvViolationsReportMerged,
  getArvReportFiltersDefault,
} from "@/mock/arvViolations";
import type { ArvViolation } from "@/domain/drivingTypes";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import {
  ArvFilters,
  ArvViolationTable,
  ArvViolationDetail,
  ArvReportPreview,
} from "@/components/views/arv-verstoesse";

function ARVVerstoessePageContent() {
  const searchParams = useSearchParams();
  const { drivers, setSelectedEmployee } = useSelectedEmployee();
  const [filters, setFilters] = useState(getArvReportFiltersDefault);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportViolation, setReportViolation] = useState<ArvViolation | null>(
    null
  );

  const urlDriverId = searchParams.get("driverId") ?? "";
  const urlDate = searchParams.get("date") ?? "";

  useEffect(() => {
    if (!urlDriverId) return;
    const driver = drivers.find((d) => d.id === urlDriverId);
    setFilters((prev) => ({ ...prev, driverId: urlDriverId }));
    setSelectedEmployee(urlDriverId, driver ?? undefined);
  }, [urlDriverId, drivers, setSelectedEmployee]);

  const handleFiltersChange = useCallback(
    (next: typeof filters) => {
      setFilters(next);
      if (next.driverId) {
        const driver = drivers.find((d) => d.id === next.driverId);
        setSelectedEmployee(next.driverId, driver ?? undefined);
      } else {
        setSelectedEmployee(null);
      }
    },
    [drivers, setSelectedEmployee]
  );

  const mergedRows = useMemo(
    () => getArvViolationsReportMerged(filters),
    [filters]
  );

  useEffect(() => {
    if (!urlDriverId || !urlDate || mergedRows.length === 0) return;
    const row = mergedRows.find(
      (r) => r.driverId === urlDriverId && r.date === urlDate
    );
    if (row) {
      const primary = row.corrected ?? row.original;
      if (primary) setSelectedId(primary.id ?? primary.date);
    }
  }, [urlDriverId, urlDate, mergedRows]);

  const selectedViolation = useMemo(() => {
    if (!selectedId) return null;
    for (const row of mergedRows) {
      if (row.original && (row.original.id ?? row.original.date) === selectedId)
        return row.original;
      if (row.corrected && (row.corrected.id ?? row.corrected.date) === selectedId)
        return row.corrected;
    }
    return null;
  }, [mergedRows, selectedId]);

  const handleSelect = useCallback((v: ArvViolation) => {
    setSelectedId(v.id ?? v.date);
  }, []);

  const handleShowReport = useCallback((v: ArvViolation) => {
    setReportViolation(v);
  }, []);

  const handleCloseReport = useCallback(() => {
    setReportViolation(null);
  }, []);

  const reportSigned = reportViolation?.status === "signed" || reportViolation?.status === "closed";

  return (
    <div className="flex h-full flex-col">
      <h1 className="sr-only">Verstösse</h1>
      <ArvFilters
        filters={filters}
        drivers={drivers}
        onFiltersChange={handleFiltersChange}
      />
      <div className="flex flex-1 min-h-0">
        <ArvViolationTable
          rows={mergedRows}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <ArvViolationDetail
          violation={selectedViolation}
          onShowReport={handleShowReport}
        />
      </div>
      {reportViolation && (
        <ArvReportPreview
          violation={reportViolation}
          open={true}
          onClose={handleCloseReport}
          signed={reportSigned}
        />
      )}
    </div>
  );
}

export default function ARVVerstoessePage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Laden…</div>}>
      <ARVVerstoessePageContent />
    </Suspense>
  );
}
