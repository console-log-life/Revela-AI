"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { platformNav } from "@/lib/constants";
import { useUiStore } from "@/store/ui-store";

export function CommandMenu() {
  const router = useRouter();
  const { commandMenuOpen, setCommandMenuOpen } = useUiStore();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandMenuOpen, setCommandMenuOpen]);

  const items = platformNav.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle>Quick jump</DialogTitle>
          <DialogDescription>
            Navigate the workspace with the keyboard and jump straight into candidate views.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search pages"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="mt-4 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    setCommandMenuOpen(false);
                    router.push(item.href);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-left transition hover:bg-secondary"
                >
                  <Icon className="h-4 w-4 text-sky-400" />
                  <span className="font-medium">{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Open</span>
                </button>
              );
            })}
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No matches for <span className="font-medium text-foreground">{query}</span>.
              </div>
            ) : null}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Try <Link href="/interviews" className="text-sky-400">Interview Sessions</Link> or{" "}
            <Link href="/analytics" className="text-sky-400">Analytics</Link>.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
