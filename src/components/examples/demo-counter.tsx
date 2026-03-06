"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DemoCounterProps = {
  className?: string;
};

export const DemoCounter = ({ className }: DemoCounterProps) => {
  const [count, setCount] = React.useState(0);

  const handleIncrement = () => setCount((prev) => prev + 1);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleIncrement();
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      role="group"
      aria-label="Demo counter"
    >
      <span className="text-sm text-muted-foreground">
        Count: <strong className="text-foreground">{count}</strong>
      </span>
      <Button
        type="button"
        variant="secondary"
        onClick={handleIncrement}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Increment counter"
      >
        Increment
      </Button>
    </div>
  );
};
