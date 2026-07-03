"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommandMenu } from "@/components/layout/command-menu";
import { PlatformHeader } from "@/components/layout/platform-header";
import { PlatformSidebar } from "@/components/layout/platform-sidebar";
import { useUiStore } from "@/store/ui-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 border-r border-border/60 bg-card/60 lg:block">
          <PlatformSidebar />
        </aside>
        <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <DialogContent className="left-0 top-0 h-screen w-[86vw] max-w-sm translate-x-0 translate-y-0 rounded-none border-r border-border/60 p-0">
            <PlatformSidebar />
          </DialogContent>
        </Dialog>
        <div className="flex min-w-0 flex-1 flex-col">
          <PlatformHeader />
          <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
        </div>
      </div>
      <CommandMenu />
    </div>
  );
}
