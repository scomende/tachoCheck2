import { cn } from "@/lib/utils";

type PlaceholderContentProps = {
  title: string;
  className?: string;
};

export const PlaceholderContent = ({ title, className }: PlaceholderContentProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[20rem] w-full items-center justify-center border border-dashed border-border bg-background p-8",
        className
      )}
      role="region"
      aria-label={`Platzhalter ${title}`}
    >
      <p className="text-muted-foreground">{title} – in Arbeit</p>
    </div>
  );
};
