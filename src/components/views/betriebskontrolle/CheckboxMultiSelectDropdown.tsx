"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxDropdownOption = {
  value: string;
  label: string;
  /** Optional: z. B. Status-Icon zwischen Checkbox und Text */
  meta?: ReactNode;
};

type CheckboxMultiSelectDropdownProps = {
  /** sichtbares Feld-Label darüber */
  fieldLabel: string;
  /** Kurztext im geschlossenen Trigger */
  placeholder?: string;
  options: CheckboxDropdownOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  className?: string;
  /** Breite des Triggers */
  triggerClassName?: string;
};

/**
 * Aufklappbares Dropdown mit Checkbox links und Bezeichnung rechts (Mehrfachauswahl).
 */
export function CheckboxMultiSelectDropdown({
  fieldLabel,
  placeholder = "Auswählen…",
  options,
  selectedValues,
  onSelectionChange,
  className,
  triggerClassName,
}: CheckboxMultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const triggerId = useId();

  const selectedSet = new Set(selectedValues);

  const toggleValue = useCallback(
    (value: string) => {
      const next = selectedSet.has(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onSelectionChange(next);
    },
    [selectedSet, selectedValues, onSelectionChange]
  );

  const triggerSummary = (() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === options.length && options.length > 0) {
      return `Alle (${selectedValues.length})`;
    }
    if (selectedValues.length <= 2) {
      return options
        .filter((o) => selectedSet.has(o.value))
        .map((o) => o.label)
        .join(", ");
    }
    return `${selectedValues.length} ausgewählt`;
  })();

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative flex min-w-0 flex-col gap-1.5", className)}>
      <span id={`${triggerId}-label`} className="text-xs font-medium text-muted-foreground">
        {fieldLabel}
      </span>
      <button
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${triggerId}-label ${triggerId}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full min-w-[16rem] items-center justify-between gap-2 rounded border border-border bg-background px-3 text-left text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
          "hover:bg-muted/30",
          triggerClassName
        )}
      >
        <span className="min-w-0 truncate">{triggerSummary}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-labelledby={`${triggerId}-label`}
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded border border-border bg-background py-1 shadow-md"
        >
          {options.map((opt) => {
            const checked = selectedSet.has(opt.value);
            const optionId = `${listId}-opt-${opt.value}`;
            return (
              <label
                key={opt.value}
                role="option"
                aria-selected={checked}
                htmlFor={optionId}
                className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted/40"
              >
                <input
                  id={optionId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleValue(opt.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="size-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                {opt.meta != null && (
                  <span className="flex shrink-0 items-center justify-center" aria-hidden>
                    {opt.meta}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
