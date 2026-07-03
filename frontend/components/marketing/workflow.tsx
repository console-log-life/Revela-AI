import { workflowSteps } from "@/lib/constants";

export function WorkflowSection() {
  return (
    <section className="container py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-400">AI workflow</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">A full interview pipeline, not a simple chatbot shell</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            The frontend mirrors the actual backend lifecycle: recall context, decide route, generate questions, evaluate
            responses, persist memory, and reflect at session end.
          </p>
        </div>
        <div className="grid gap-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step}
              className="glass-panel relative overflow-hidden rounded-3xl p-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[linear-gradient(180deg,#38bdf8,#f472b6)]"
            >
              <div className="pl-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Step {index + 1}</p>
                <p className="mt-2 text-lg font-medium">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
