import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/lib/constants";

export function TestimonialsSection() {
  return (
    <section className="container py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-400">Testimonials</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight">Teams want signal. Candidates want context. Revela delivers both.</h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="h-full">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
              <p className="text-lg leading-8 text-foreground/90">“{testimonial.quote}”</p>
              <div>
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
