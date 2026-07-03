"use client";

import { Bell, Menu, Search } from "lucide-react";
import { toast } from "sonner";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui-store";

export function PlatformHeader() {
  const { setMobileNavOpen, setCommandMenuOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden max-w-xl flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            onClick={() => setCommandMenuOpen(true)}
            value=""
            placeholder="Search views, candidates, or AI insights"
            className="cursor-pointer pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCommandMenuOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast.info("Notifications are driven by candidate activity and budget alerts.")}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
