import { Suspense } from "react";
import { AppBar } from "@/layout/app-bar";
import { SecondToolbar } from "@/layout/second-toolbar";
import { TabNav } from "@/layout/tab-nav";
import { cn } from "@/lib/utils";

/**
 * US-04: App-Shell mit 2 Toolbars und Tabs.
 * Gilt für alle Routen unter (tacho): /, /fahrerkarten, /arv-verstoesse, …
 */
export default function TachoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background")}>
      <AppBar />
      <Suspense fallback={<SecondToolbarFallback />}>
        <SecondToolbar />
      </Suspense>
      <TabNav />
      <main className="flex-1 px-4 py-4" role="main">
        {children}
      </main>
    </div>
  );
}

function SecondToolbarFallback() {
  return (
    <div className="flex w-full flex-col gap-3 border-b border-border bg-background px-4 py-3">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md rounded border border-border bg-muted/30 py-2 pl-9 pr-3" />
        <div className="rounded border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Filter – Platzhalter
        </div>
      </div>
    </div>
  );
}
