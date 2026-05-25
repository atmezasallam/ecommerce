
"use client";

import { useTheme } from "next-themes";
// custom UI components //must be @/lib/utils" or some thing more cliser
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Button } from './button';
//Icons
import { MoonIcon, SunIcon } from 'lucide-react';

export default function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 shrink-0 border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <SunIcon className="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
