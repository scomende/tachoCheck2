"use client";

import {
  APP_TITLE,
  DEFAULT_USER_DISPLAY_NAME,
  KOSTENSTELLE_OPTIONS,
  LANG_OPTIONS,
  RAYON_OPTIONS,
} from "@/config/layout";
import { cn } from "@/lib/utils";

export const AppBar = () => {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between border-b border-border bg-background px-4 py-3",
        "min-h-[3.25rem]"
      )}
      role="banner"
      aria-label="App-Leiste"
    >
      <div className="flex items-center gap-4">
        <span className="text-base font-bold text-primary">
          {APP_TITLE}
        </span>
        <div className="relative flex items-center">
          <select
            aria-label="Kostenstelle auswählen"
            className={cn(
              "appearance-none border border-border bg-background py-1.5 pl-3 pr-8 text-sm text-foreground",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
              "cursor-pointer rounded"
            )}
            defaultValue={KOSTENSTELLE_OPTIONS[0]}
          >
            {KOSTENSTELLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 size-4 text-muted-foreground"
            aria-hidden
          >
            ▼
          </span>
        </div>
        <div className="relative flex items-center">
          <select
            aria-label="Rayon auswählen"
            className={cn(
              "appearance-none border border-border bg-background py-1.5 pl-3 pr-8 text-sm text-foreground",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
              "cursor-pointer rounded"
            )}
            defaultValue={RAYON_OPTIONS[0]}
          >
            {RAYON_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 size-4 text-muted-foreground"
            aria-hidden
          >
            ▼
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground">{DEFAULT_USER_DISPLAY_NAME}</span>
        <div className="relative flex items-center">
          <select
            aria-label="Sprache auswählen"
            className={cn(
              "appearance-none border border-border bg-background py-1.5 pl-3 pr-8 text-sm text-foreground",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
              "cursor-pointer rounded"
            )}
            defaultValue="DE"
          >
            {LANG_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 size-4 text-muted-foreground"
            aria-hidden
          >
            ▼
          </span>
        </div>
      </div>
    </header>
  );
};
