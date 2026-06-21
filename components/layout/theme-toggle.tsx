"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { faSun, faMoon, faDesktop } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTheme } from "@/app/(dashboard)/profile/actions";
import type { ThemePreference } from "@/lib/types";

const options: { value: ThemePreference; label: string; icon: typeof faSun }[] = [
  { value: "light", label: "Light", icon: faSun },
  { value: "dark", label: "Dark", icon: faMoon },
  { value: "system", label: "System", icon: faDesktop },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard next-themes pattern: defers theme-dependent render until after mount so server and first client render match exactly, avoiding hydration mismatch (not just suppressing the warning)
    setMounted(true);
  }, []);

  async function handleSelect(value: ThemePreference) {
    setTheme(value);
    try {
      await updateTheme(value);
      toast.success("Theme updated.");
    } catch {
      toast.error("Could not save theme preference.");
    }
  }

  const current = mounted ? options.find((o) => o.value === theme) ?? options[2] : options[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Icon icon={current.icon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => handleSelect(option.value)}>
            <Icon icon={option.icon} className="mr-2" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
