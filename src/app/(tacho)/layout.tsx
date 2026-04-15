import { TachoLayoutClient } from "./TachoLayoutClient";

/**
 * US-04: App-Shell mit 2 Toolbars und Tabs.
 * Gilt für alle Routen unter (tacho): /, /fahrerkarten, /arv-verstoesse (Tab „Verletzungen“), …
 * SelectedEmployeeProvider wird in TachoLayoutClient gesetzt (globale Mitarbeiter:innen-Auswahl).
 */
export default function TachoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TachoLayoutClient>{children}</TachoLayoutClient>;
}
