"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SEARCH_PARAM = "search";

export const SecondToolbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get(SEARCH_PARAM) ?? "";

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const next = new URLSearchParams(searchParams.toString());
      if (value) {
        next.set(SEARCH_PARAM, value);
      } else {
        next.delete(SEARCH_PARAM);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, searchParams, router]
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 border-b border-border bg-background px-4 py-3"
      )}
      role="toolbar"
      aria-label="Suche und Filter"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Mitarbeiter:in suchen…"
            aria-label="Mitarbeiter:in suchen"
            value={searchQuery}
            onChange={handleSearchChange}
            className={cn(
              "w-full border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
              "rounded"
            )}
          />
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
          )}
        >
          Filter – Platzhalter
        </div>
      </div>
    </div>
  );
};
