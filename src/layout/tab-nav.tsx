"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "@/config/layout";
import { cn } from "@/lib/utils";

export const TabNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex w-full border-b border-border border-l border-border bg-background"
      )}
      role="navigation"
      aria-label="Hauptnavigation"
    >
      <ul className="flex gap-0">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "relative block px-4 pt-3 pb-3 text-sm no-underline",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                  isActive
                    ? "font-bold text-primary"
                    : "font-normal text-foreground hover:text-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary"
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
