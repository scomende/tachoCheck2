import { Suspense } from "react";
import { WeeklyDriverView } from "@/components/views/weekly-driver-view";

/** Fahrerkarten-Tab: Wochenansicht (US-01), Suche US-03 (useSearchParams). */
export default function FahrerkartenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[24rem] w-full items-center justify-center border border-border bg-background p-8 text-muted-foreground">
          Lade…
        </div>
      }
    >
      <WeeklyDriverView />
    </Suspense>
  );
}
