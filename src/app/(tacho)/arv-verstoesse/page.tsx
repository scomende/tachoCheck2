"use client";

import { useMemo, useState, useCallback } from "react";
import { getMockDrivingData } from "@/mock/drivingData";
import {
  getArvViolationsReport,
  getArvReportFiltersDefault,
} from "@/mock/arvViolations";
import type { ArvViolation } from "@/domain/drivingTypes";
import {
  ArvFilters,
  ArvViolationTable,
  ArvViolationDetail,
  ArvReportPreview,
} from "@/components/views/arv-verstoesse";

export default function ARVVerstoessePage() {
  const { drivers } = getMockDrivingData();
  const [filters, setFilters] = useState(getArvReportFiltersDefault);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportViolation, setReportViolation] = useState<ArvViolation | null>(
    null
  );

  const violations = useMemo(
    () => getArvViolationsReport(filters),
    [filters]
  );

  const selectedViolation = useMemo(
    () =>
      violations.find((v) => (v.id ?? v.date) === selectedId) ?? null,
    [violations, selectedId]
  );

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
      <h1 className="sr-only">ARV-Verstösse</h1>
      <ArvFilters
        filters={filters}
        drivers={drivers}
        onFiltersChange={setFilters}
      />
      <div className="flex flex-1 min-h-0">
        <ArvViolationTable
          violations={violations}
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
