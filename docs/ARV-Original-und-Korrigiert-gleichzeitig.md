# ARV-Verstösse: Originaldaten und Korrigierte Daten gleichzeitig sichtbar

**Ziel:** Beide Datenbasen (Original und Korrigiert) gleichzeitig anzeigen, **ohne** Segment-Control / Toggle. Kein Umschalten mehr zwischen „Originaldaten“ und „Korrigierte Daten“.

---

## Ausgangslage

- Aktuell: Ein Toggle „Originaldaten | Korrigierte Daten“ filtert die Liste; es ist immer nur eine Datenbasis sichtbar.
- Gewünscht: Beide gleichzeitig sehen, damit man z. B. vergleichen kann, ob ein Verstoss nach Korrektur noch besteht oder nur in einer Basis vorkommt.

---

## Variante 1: Zwei Tabellen untereinander

**Aufbau**

- **Oben:** Bereich „Verstösse (Originaldaten)“ mit einer Tabelle (gleiche Spalten wie heute: Mitarbeiter:in, Datum, Verstosstyp, Schweregrad, Status).
- **Darunter:** Bereich „Verstösse (Korrigierte Daten)“ mit einer zweiten Tabelle, gleicher Aufbau.
- Filterzeile (Datum, Mitarbeiter:in, Schweregrad, Status) gilt für **beide** Tabellen.
- Das Toggle „Datenbasis“ entfällt.
- Detail-Panel rechts: Zeigt weiterhin einen ausgewählten Verstoss; Auswahl kann in **einer** der beiden Tabellen erfolgen (evtl. im Detail erkennbar, ob Original oder Korrigiert).

**Vorteile**

- Sehr klar: Zwei getrennte Listen, keine Verwechslung.
- Einfach umzusetzen (zweimal Report abrufen: einmal `useCorrectedData: false`, einmal `true`; zwei Tabellen rendern).

**Nachteile**

- Viel vertikaler Platz; bei vielen Verstössen viel Scrollen.
- Kein direkter Zeilenvergleich „dieselbe Person, derselbe Tag“ zwischen den Tabellen (man muss visuell suchen).

**Empfehlung**

- Gut geeignet, wenn die Anzahl Verstösse pro Datenbasis überschaubar ist und man die beiden Listen klar getrennt sehen will.

---

## Variante 2: Zwei Spalten nebeneinander (Side-by-Side)

**Aufbau**

- **Links:** Tabelle „Originaldaten“ (ca. 50 % Breite).
- **Rechts:** Tabelle „Korrigierte Daten“ (ca. 50 % Breite).
- Beide mit gleichen Spalten und denselben Filtern.
- Optional: Beim Klick auf eine Zeile links die „passende“ Zeile rechts hervorheben (z. B. gleicher Fahrer, gleiches Datum), falls vorhanden – oder umgekehrt.
- Detail-Panel rechts könnte erhalten bleiben (dann: drei Spalten: Tabelle Original | Tabelle Korrigiert | Detail) oder entfallen bzw. als Modal/Overlay beim Klick geöffnet werden.

**Vorteile**

- Direkter visueller Vergleich: Gleiche Zeilenhöhe = gleicher Kontext (wenn Sortierung identisch).
- Kompakter als zwei volle Tabellen untereinander.

**Nachteile**

- Weniger Platz pro Tabelle (schmalere Spalten).
- Drei Spalten (Original-Tabelle | Korrigiert-Tabelle | Detail) können auf kleinen Bildschirmen eng werden.

**Empfehlung**

- Gute Wahl, wenn Vergleich „Zeile zu Zeile“ (gleicher Mitarbeiter, gleicher Zeitraum) im Vordergrund steht und die Bildschirmbreite ausreicht.

---

## Variante 3: Eine Tabelle mit zwei Daten-Spalten („Original“ / „Korrigiert“)

**Aufbau**

- **Eine** Tabelle mit erweiterten Spalten:
  - Wie bisher: Mitarbeiter:in, Datum, Verstosstyp, Schweregrad, Status.
  - Zusätzlich zwei Spalten (oder eine kombinierte): z. B. **„Original“** und **„Korrigiert“**.
- Pro Zeile steht ein **logischer Verstoss** (z. B. definiert über Mitarbeiter + Datum + Verstosstyp). In den Zellen „Original“ und „Korrigiert“ wird angezeigt, ob dieser Verstoss in der jeweiligen Datenbasis vorkommt (z. B. Badge „Vorhanden“ / „–“ oder Schweregrad/Status pro Basis).
- Oder: Zeilen sind **pro Verstoss und Datenbasis** doppelt (eine Zeile „Müller Anna, 20.05., … Original“, eine Zeile „Müller Anna, 20.05., … Korrigiert“) mit einer kleinen Kennzeichnungsspalte „Original“ / „Korrigiert“.
- Das Toggle „Datenbasis“ entfällt; alle Daten kommen aus einer kombinierten Abfrage.

**Vorteile**

- Nur eine Tabelle, gewohnte Bedienung.
- Sehr kompakt: Auf einen Blick „in Original ja/nein, in Korrigiert ja/nein“.

**Nachteile**

- Logik und Datenmodell werden anspruchsvoller (Vereinigung/Abgleich von Verstössen über beide Basen, Definition „gleicher Verstoss“).
- Bei vielen Verstössen kann die Tabelle unübersichtlich werden (viele Spalten oder viele Doppelzeilen).

**Empfehlung**

- Sinnvoll, wenn die Verstoss-Menge moderat ist und der Fokus auf „Existenz in Original vs. Korrigiert“ pro Ereignis liegt.

---

## Kurz-Empfehlung für Tacho Check

- **Variante 1 (zwei Tabellen untereinander)** ist am einfachsten umzusetzen und sehr klar: oben Original, unten Korrigiert, gleiche Filter, kein Toggle. Detail-Panel rechts kann bleiben; Auswahl in einer der beiden Tabellen füllt das Detail (mit Anzeige „Original“ bzw. „Korrigiert“).
- **Variante 2 (Side-by-Side)** ist die beste Wahl, wenn ihr den Fokus auf **direkten Vergleich** (gleiche Zeile nebeneinander) legt und genug Breite habt.

Sobald du dich für eine Variante (oder eine Mischung) entschieden hast, kann die Umsetzung im Code geplant werden.
