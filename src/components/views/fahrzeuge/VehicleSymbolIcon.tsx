"use client";

import type { VehicleSymbolType } from "@/domain/vehicleTypes";
import { cn } from "@/lib/utils";

const base = "block h-7 w-[3.25rem] shrink-0 text-foreground";

/** Minimal-LKW-Silhouetten analog zu den Symbolen (Chassis, Elektro, Flüssigkeit, Öko, Koffer, Sattel). */
export const VEHICLE_SYMBOL_LABELS: Record<VehicleSymbolType, string> = {
  flatbed: "Fahrgestell / Pritsche",
  electric: "Elektro-LKW",
  liquid: "Tank / Flüssigkeit",
  eco: "Umwelt / Öko",
  box: "Koffer-LKW",
  articulated: "Sattelzug mit Auflieger",
};

function Cab() {
  return (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16V9h5l2 3h6v4H4z M6 16v-3 M11 12h3"
    />
  );
}

export function VehicleSymbolIcon({
  type,
  className,
  title,
}: {
  type: VehicleSymbolType;
  className?: string;
  title?: string;
}) {
  const label = title ?? VEHICLE_SYMBOL_LABELS[type];
  const common = { className: cn(base, className), role: "img" as const, "aria-label": label };

  switch (type) {
    case "flatbed":
      return (
        <svg viewBox="0 0 52 22" {...common}>
          <Cab />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            d="M17 16h28V11H17v5z M17 11h28"
          />
          <circle cx="10" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="38" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "electric":
      return (
        <svg viewBox="0 0 52 22" {...common}>
          <Cab />
          <rect x="17" y="8" width="28" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path fill="#EAB308" stroke="#CA8A04" strokeWidth="0.5" d="M30 9.5l-3 5h2l-1 3.5 4-6h-2.5l1.5-2.5z" />
          <circle cx="10" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="38" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "liquid":
      return (
        <svg viewBox="0 0 52 22" {...common}>
          <Cab />
          <rect x="17" y="8" width="28" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path
            fill="#3B82F6"
            d="M31 9.5c0 0-1.5 2-1.5 3.2a1.5 1.5 0 003 0c0-1.2-1.5-3.2-1.5-3.2z"
          />
          <circle cx="10" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="38" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "eco":
      return (
        <svg viewBox="0 0 52 22" {...common}>
          <Cab />
          <rect x="17" y="8" width="28" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="31" cy="12" r="2.2" fill="#22C55E" stroke="#15803D" strokeWidth="0.5" />
          <circle cx="10" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="38" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "articulated":
      return (
        <svg viewBox="0 0 60 22" {...common}>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
            d="M3 16V9h5l2 3h5v4H3z M6 16v-3"
          />
          <rect x="12" y="9" width="16" height="7" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <rect x="30" y="10" width="22" height="6" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="9" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="22" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="46" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "box":
    default:
      return (
        <svg viewBox="0 0 52 22" {...common}>
          <Cab />
          <rect x="17" y="8" width="28" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <line x1="22" y1="10" x2="40" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <circle cx="10" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="38" cy="17" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}
