"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useSelectedEmployee } from "@/context/SelectedEmployeeContext";
import { filterDriversBySearch } from "@/lib/driverSearch";
import { cn } from "@/lib/utils";

export const SecondToolbar = () => {
  const {
    selectedDriver,
    drivers,
    searchQuery,
    setSelectedEmployee,
    setSearchQuery,
    clearSelection,
  } = useSelectedEmployee();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredDrivers = useMemo(
    () => filterDriversBySearch(drivers, searchQuery),
    [drivers, searchQuery]
  );

  const displayValue = selectedDriver ? selectedDriver.name : searchQuery;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value) clearSelection();
    setIsOpen(true);
  };

  const handleSelect = useCallback(
    (driver: (typeof drivers)[number]) => {
      setSelectedEmployee(driver.id, driver);
      setSearchQuery("");
      setIsOpen(false);
    },
    [setSelectedEmployee, setSearchQuery]
  );

  const handleClear = useCallback(() => {
    clearSelection();
    setSearchQuery("");
    setIsOpen(false);
  }, [clearSelection, setSearchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 border-b border-border bg-muted/20 px-5 py-2.5"
      )}
      role="toolbar"
      aria-label="Suche und Filter"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="relative max-w-md flex-1" ref={containerRef}>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Mitarbeiter:in suchen…"
            aria-label="Mitarbeiter:in suchen oder auswählen"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            role="combobox"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "h-10 w-full rounded border border-border bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            )}
          />
          {selectedDriver && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              aria-label="Auswahl aufheben"
            >
              <X className="size-4" />
            </button>
          )}
          {isOpen && (
            <ul
              className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded border border-border bg-background py-1 shadow-lg"
              role="listbox"
            >
              {filteredDrivers.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-muted-foreground">Keine Treffer</li>
              ) : (
                filteredDrivers.map((d) => (
                  <li
                    key={d.id}
                    role="option"
                    aria-selected={selectedDriver?.id === d.id}
                    className={cn(
                      "cursor-pointer px-3 py-2.5 text-sm hover:bg-muted focus-within:bg-muted",
                      selectedDriver?.id === d.id && "bg-primary/10 font-medium"
                    )}
                    onClick={() => handleSelect(d)}
                  >
                    {d.name}
                    {d.personalNumber != null && (
                      <span className="ml-2 text-muted-foreground">({d.personalNumber})</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          className={cn(
            "shrink-0 text-sm text-primary underline-offset-4 transition-colors",
            "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          )}
        >
          zur Mitarbeiterverwaltung
        </Link>
      </div>
    </div>
  );
};
