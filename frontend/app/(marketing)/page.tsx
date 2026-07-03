import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { BenefitsSection } from "@/components/marketing/benefits";
import { CtaSection } from "@/components/marketing/cta";
import { FaqSection } from "@/components/marketing/faq";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingFooter } from "@/components/marketing/footer";
import { HeroSection } from "@/components/marketing/hero";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { WorkflowSection } from "@/components/marketing/workflow";

export default function MarketingPage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <ThemeToggle />
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <MarketingFooter />
    </>
  );
}
