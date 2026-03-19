# Mitarbeitenden-Auswahl: 3 UI-Varianten + Empfehlung

## Schritt 1: Drei UI-Varianten

### Variante A: Vertikale Liste mit Suchfeld oben (inline)

- **Aufbau:** Direkt unter der Wochenauswahl steht ein Suchfeld „Mitarbeiter:in filtern…“, darunter eine vertikale, scrollbare Liste aller (gefilterten) Mitarbeitenden. Die Zeitachse folgt weiter unten. Aktive Person ist in der Liste hervorgehoben.
- **Vorteile:** Alles in einem vertikalen Fluss, keine zusätzliche Spalte; gewohnt für Formulare.
- **Nachteile:** Nimmt vertikal viel Platz; bei vielen Einträgen muss stark gescrollt werden, bis die Zeitachse sichtbar ist.
- **Empfehlung für Tacho Check:** Eher geeignet, wenn nur wenige Mitarbeitende (z. B. < 15) im Fokus sind.

---

### Variante B: Sidebar-/Master-Liste links

- **Aufbau:** Links im Fahrerkartenbereich eine feste Spalte (z. B. 240–280 px) mit der Überschrift „Mitarbeitende“. Die globale Suche „Mitarbeiter:in suchen…“ filtert diese Liste. Darunter eine scrollbare Liste; Klick wählt aus. Rechts daneben: Woche + Zeitachse, rechts außen das ARV-Panel.
- **Vorteile:** Klar getrennte Bereiche (Liste | Inhalt | Detail-Panel), sehr gut scanbar, schneller Wechsel zwischen Personen, vertrautes Master-Detail-Muster, B2B-tauglich.
- **Nachteile:** Braucht horizontal Platz; bei sehr schmalen Viewports könnte die Sidebar geklappt werden (optional, nicht Teil dieser Anforderung).
- **Empfehlung für Tacho Check:** **Beste Wahl** – passt zur bestehenden rechten Panel-Struktur, klare Hierarchie, gute Lesbarkeit auch bei mehreren Einträgen.

---

### Variante C: Kompakte Karten-/Chips-Zeile (horizontal)

- **Aufbau:** Eine horizontale, scrollbare Zeile mit Karten oder Chips pro Mitarbeiter:in; die aktive Person ist hervorgehoben. Die globale Suche filtert die sichtbaren Karten. Woche und Zeitachse darunter.
- **Vorteile:** Sehr kompakt, wenig vertikaler Platz, gut auf kleinen Bildschirmen.
- **Nachteile:** Bei vielen Personen schlechter scanbar; wirkt weniger wie eine „Liste“, mehr wie eine Auswahlleiste.
- **Empfehlung für Tacho Check:** Eher für Szenarien mit wenigen, oft gewechselten Personen; für den Prototyp weniger prioritär als B.

---

## Schritt 2: Empfehlung

**Empfohlene Variante: B (Sidebar/Master-Liste links)**

- Die Auswahl wirkt **direkter und besser scanbar** als ein Dropdown und behält die **klare Trennung** zwischen Liste (links), Wochenansicht (Mitte) und ARV-Panel (rechts).
- **Konsistenz:** Es gibt bereits ein rechtes Detail-Panel; eine linke Liste ergänzt das Layout symmetrisch und verständlich.
- **Suche:** Die bestehende globale Suche „Mitarbeiter:in suchen…“ filtert die sichtbare Liste; keine doppelte Suchlogik nötig, wenn die Suche im Context geführt wird.
- **B2B / ruhig:** Vertikale Liste mit klarer Hervorhebung passt zur gewünschten nüchternen, funktionalen Darstellung.

Die Implementierung in Schritt 3 folgt dieser Variante.
