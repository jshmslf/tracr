"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { faBriefcase, faUser, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/applications", label: "Applications", icon: faBriefcase },
    { href: "/profile", label: "Profile", icon: faUser },
  ];

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/applications" className="font-semibold">
          Tracr
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              aria-label={link.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm sm:px-3",
                pathname.startsWith(link.href)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon icon={link.icon} />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="ml-2"
          >
            <Icon icon={faRightFromBracket} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
