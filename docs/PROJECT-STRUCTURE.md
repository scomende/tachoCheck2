# Tacho Check – Projektstruktur (nach Refactoring)

Trennung: **Layout** | **Domain** | **Mock/Daten** | **Config** | **Lib**

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root: html, body, globals.css, metadata
│   ├── globals.css
│   └── (tacho)/                  # Route-Group (URLs ohne /tacho)
│       ├── layout.tsx            # App-Shell (importiert aus @/layout)
│       ├── page.tsx              # Redirect / → /fahrerkarten
│       ├── fahrerkarten/page.tsx
│       ├── arv-verstoesse/page.tsx
│       ├── betriebskontrolle/page.tsx
│       └── fahrzeuge/page.tsx
│
├── layout/                       # App-Shell (nur UI, keine Domain/Mock)
│   ├── app-bar.tsx               # Erste Toolbar (Titel, Kostenstelle, Rayon, User, Sprache)
│   ├── second-toolbar.tsx        # Suchfeld „Mitarbeiter:in suchen…“ + Filter-Platzhalter
│   └── tab-nav.tsx               # Tab-Navigation (Fahrerkarten, ARV-Verstoesse, …)
│
├── components/
│   ├── ui/                       # Wiederverwendbare UI-Primitive (Shadcn)
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── views/                    # Feature-spezifische Ansichten
│   │   ├── weekly-driver-view.tsx   # US-01 Wochenansicht
│   │   ├── arv-violations-panel.tsx  # US-05 ARV-Verstösse-Panel
│   │   └── placeholder-content.tsx   # „… – in Arbeit“ für andere Tabs
│   └── examples/
│       └── demo-counter.tsx
│
├── domain/                      # Domain-Typen (keine UI, keine I/O)
│   ├── drivingTypes.ts          # Driver, DrivingDay, DrivingSegment, ArvViolation, …
│   └── index.ts                 # Re-Export aller Domain-Typen
│
├── mock/                        # Mock-Daten (Daten-Schicht für Entwicklung)
│   ├── drivingData.ts            # MOCK_DRIVERS, MOCK_DRIVER_WEEKS, ARV-Verstösse, getter
│   └── index.ts                 # Re-Export für zentrale Daten-Zugriffe
│
├── config/                      # Konfiguration (Layout, Tabs, Dropdown-Optionen)
│   └── layout.ts                # APP_TITLE, TABS, KOSTENSTELLE_OPTIONS, RAYON_OPTIONS, …
│
└── lib/                         # Gemeinsame Hilfsfunktionen
    ├── utils.ts                 # cn() (Tailwind-Klassen)
    ├── drivingUtils.ts          # Zeit/Dauer, Segment-Farben, formatDayLabel, …
    └── driverSearch.ts          # filterDriversBySearch (US-03)
```

## Abhängigkeiten

| Schicht    | Darf importieren von        | Darf nicht importieren von |
|-----------|-----------------------------|-----------------------------|
| **app/** | layout, components, config, lib, domain, mock | – |
| **layout/** | config, lib | domain, mock |
| **components/** | domain, lib, mock, config | – |
| **domain/** | – | layout, components, mock, config, lib (nur reine Typen) |
| **mock/** | domain | layout, components |
| **config/** | – | domain, mock |
| **lib/** | domain (nur Typen) | layout, components, mock |

## Kurzüberblick

- **Layout**: Alles, was zur App-Shell gehört (Toolbars, Tabs), lebt unter `src/layout/` und nutzt nur `@/config/layout` und `@/lib/utils`.
- **Domain**: Typen und reine Fachlogik unter `src/domain/`; keine Abhängigkeit zu UI oder Daten.
- **Mock**: Alle Entwicklungs-Mockdaten unter `src/mock/`; importiert nur aus `@/domain`.
- **Config**: Zentrale Konfiguration (Tabs, Dropdown-Optionen) unter `src/config/`; später durch API/Context ersetzbar.
