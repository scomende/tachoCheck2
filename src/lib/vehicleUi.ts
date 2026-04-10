/** Deutsche Kurzdatumsanzeige YYYY-MM-DD → TT.MM.JJJJ */
export function formatIsoDateDe(iso: string): string {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

/** Eine Tabellenspalte: gültig ab – gültig bis (leer = unbefristet). */
export function formatValidityRange(validFrom: string, validUntil: string): string {
  const from = formatIsoDateDe(validFrom);
  const until = validUntil.trim() ? formatIsoDateDe(validUntil) : "unbefristet";
  return `${from} – ${until}`;
}

/** Tabellen-/Kurzanzeige für genau eine Zuweisung (1:1 Fahrzeug ↔ Mitarbeitende:r). */
export function formatAssignedEmployee(name: string): { display: string; title: string } {
  const t = name.trim();
  if (!t) return { display: "–", title: "" };
  return { display: t, title: t };
}

/** Dezfarbung für Status-Badge (heuristisch). */
export function vehicleStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("benutzung") || s.includes("aktiv")) {
    return "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100";
  }
  if (s.includes("park")) {
    return "bg-sky-100 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100";
  }
  if (s.includes("ausser") || s.includes("still") || s.includes("abgang")) {
    return "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100";
  }
  return "bg-muted text-foreground";
}
