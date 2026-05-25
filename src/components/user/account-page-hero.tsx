import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

type AccountPageHeroProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  className?: string;
};

export function AccountPageHero({ title, subtitle, icon: Icon, className }: AccountPageHeroProps) {
  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-muted/30 p-6 shadow-sm md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
