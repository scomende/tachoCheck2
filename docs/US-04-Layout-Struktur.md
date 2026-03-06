# US-04: Komponentenstruktur Layout

## Vorschlag Dateien / Komponenten (nach Refactoring)

```
src/
├── app/
│   ├── layout.tsx                    # Root: html, body, globals, metadata
│   └── (tacho)/                      # Route-Group (kein URL-Segment)
│       ├── layout.tsx                # App-Shell: 2 Toolbars + Tabs + main
│       ├── page.tsx                  # Redirect / → /fahrerkarten
│       ├── fahrerkarten/page.tsx     # Wochenansicht (US-01)
│       ├── arv-verstoesse/page.tsx   # Platzhalter
│       ├── betriebskontrolle/page.tsx # Platzhalter
│       └── fahrzeuge/page.tsx        # Platzhalter
├── layout/                           # App-Shell (Layout-Komponenten)
│   ├── app-bar.tsx                   # Erste Toolbar
│   ├── second-toolbar.tsx            # Suchfeld + Filter-Platzhalter
│   └── tab-nav.tsx                   # Tab-Navigation (Client)
├── components/
│   ├── views/
│   │   ├── weekly-driver-view.tsx   # Fahrerkarten-Inhalt
│   │   ├── arv-violations-panel.tsx  # ARV-Verstösse (US-05)
│   │   └── placeholder-content.tsx  # Platzhalter für andere Tabs
│   ├── ui/                           # Shadcn-UI-Primitive
│   └── examples/
├── config/
│   └── layout.ts                     # Tabs, Dropdown-Optionen (Mock, später echte Daten)
└── lib/                              # Allgemeine Utils
```

## Verantwortlichkeiten

- **app/(tacho)/layout.tsx**: Rendert die App-Shell einmal; importiert aus `@/layout/`.
- **layout/**: Nur App-Shell (Toolbars, Tab-Nav); keine Domain- oder Mock-Imports, nur `@/config/layout` und `@/lib/utils`.
- **Tab-Navigation**: Client-Komponente mit `usePathname()`, Links auf Segment-Routen.

## Tabs ergänzen / umbenennen

- **Datei:** `src/config/layout.ts`
- **Konstante:** `TABS` – Array aus `{ label, href }`.
- Neuer Tab: Eintrag in `TABS` hinzufügen und neue Route anlegen: `app/(tacho)/<segment>/page.tsx`.

## Kostenstelle- und Rayon-Dropdowns mit echten Daten

- **Datei:** `src/config/layout.ts` (oder eigene API/Context-Module).
- **Konstanten:** `KOSTENSTELLE_OPTIONS`, `RAYON_OPTIONS` – später durch Daten aus API/Context ersetzen.
- **Komponente:** `src/layout/app-bar.tsx` – Dropdowns befüllen sich aus der Config; für echte Daten Props oder Context nutzen.
