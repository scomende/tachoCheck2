"use client";

import { Suspense, useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getArvViolationsReportMerged,
  getArvReportFiltersDefault,
  groupMergedRowsByDriverAndDay,
  aggregateViolationDayGroupStatus,
} from "@/mock/arvViolations";
import type { ArvViolation } from "@/domain/drivingTypes";
import type { ArvViolationDayGroup } from "@/mock/arvViolations";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import {
  ArvFilters,
  ArvViolationTable,
  ArvReportPreview,
} from "@/components/views/arv-verstoesse";

function primaryViolationsFromGroup(group: ArvViolationDayGroup): ArvViolation[] {
  return group.violations
    .map((r) => r.corrected ?? r.original)
    .filter((v): v is ArvViolation => v != null);
}

function ARVVerstoessePageContent() {
  const searchParams = useSearchParams();
  const { drivers, setSelectedEmployee } = useSelectedEmployee();
  const [filters, setFilters] = useState(getArvReportFiltersDefault);
  const [hideClosedGroups, setHideClosedGroups] = useState(false);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [reportDay, setReportDay] = useState<{
    driverId: string;
    date: string;
    violations: ArvViolation[];
  } | null>(null);

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

  const dayGroups = useMemo(
    () => groupMergedRowsByDriverAndDay(mergedRows),
    [mergedRows]
  );

  const visibleGroups = useMemo(() => {
    if (!hideClosedGroups) return dayGroups;
    return dayGroups.filter(
      (g) => aggregateViolationDayGroupStatus(g) !== "closed"
    );
  }, [dayGroups, hideClosedGroups]);

  useEffect(() => {
    if (!urlDriverId || !urlDate || dayGroups.length === 0) return;
    const group = dayGroups.find(
      (g) => g.driverId === urlDriverId && g.date === urlDate
    );
    if (group) setSelectedGroupKey(group.key);
  }, [urlDriverId, urlDate, dayGroups]);

  useEffect(() => {
    if (
      selectedGroupKey != null &&
      !visibleGroups.some((g) => g.key === selectedGroupKey)
    ) {
      setSelectedGroupKey(null);
    }
  }, [visibleGroups, selectedGroupKey]);

  const handleToggleGroup = useCallback((groupKey: string) => {
    setSelectedGroupKey((prev) => (prev === groupKey ? null : groupKey));
  }, []);

  const handleShowDayReport = useCallback((group: ArvViolationDayGroup) => {
    setReportDay({
      driverId: group.driverId,
      date: group.date,
      violations: primaryViolationsFromGroup(group),
    });
  }, []);

  const handleCloseReport = useCallback(() => {
    setReportDay(null);
  }, []);

  const reportSigned =
    reportDay != null &&
    reportDay.violations.length > 0 &&
    reportDay.violations.every(
      (v) => v.status === "signed" || v.status === "closed"
    );

  return (
    <div className="flex h-full flex-col">
      <h1 className="sr-only">Verstösse</h1>
      <ArvFilters
        filters={filters}
        drivers={drivers}
        onFiltersChange={handleFiltersChange}
        hideClosedGroups={hideClosedGroups}
        onHideClosedGroupsChange={setHideClosedGroups}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <ArvViolationTable
          groups={visibleGroups}
          selectedGroupKey={selectedGroupKey}
          onToggleGroup={handleToggleGroup}
          onShowDayReport={handleShowDayReport}
        />
      </div>
      {reportDay && (
        <ArvReportPreview
          driverId={reportDay.driverId}
          date={reportDay.date}
          violations={reportDay.violations}
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
