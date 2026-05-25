"use client";

import { Printer } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function PrintPageButton() {
  return (
    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      Print
    </Button>
  );
}
