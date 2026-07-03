"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [open, setOpen] = React.useState(0);

  return (
    <section className="container py-24">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-400">FAQ</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Questions teams ask before rolling out adaptive interview AI</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const active = open === index;
            return (
              <button
                key={faq.question}
                type="button"
                onClick={() => setOpen(active ? -1 : index)}
                className="glass-panel block w-full rounded-3xl p-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-medium">{faq.question}</p>
                    <p className={cn("mt-3 overflow-hidden text-sm leading-7 text-muted-foreground", active ? "max-h-40" : "max-h-0")}>
                      {faq.answer}
                    </p>
                  </div>
                  <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 transition-transform", active && "rotate-180")} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
