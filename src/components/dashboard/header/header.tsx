"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Home } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import ThemeToggle from "@/src/components/ui/theme-toggle";

export default function Herader() {
  return (
    <div className="fixed z-[20] md:left-[300px] left-0 top-0 right-0 flex items-center justify-between gap-4 border-b bg-background/80 p-4 backdrop-blur-md">
      <Button variant="outline" size="sm" className="shrink-0 gap-2" asChild>
        <Link href="/">
          <Home className="h-4 w-4" />
          Back to shop
        </Link>
      </Button>
      <div className="flex items-center gap-2">
        <UserButton afterSignOutUrl="/" />
        <ThemeToggle />
      </div>
    </div>
  );
}
