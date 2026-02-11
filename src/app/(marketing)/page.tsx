import Link from 'next/link';
import {
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeatureCard, StepCard, TestimonialCard, Highlight } from '@/components/marketing';

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/5 via-primary/3 to-transparent blur-3xl" />
        </div>

        <div className="container flex flex-col items-center gap-8 pb-16 pt-24 text-center md:pb-24 md:pt-36">
          {/* Pill badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Now with AI-powered booking</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Scheduling that
            <br />
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              just works.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-lg animate-fade-up text-lg leading-relaxed text-muted-foreground opacity-0 [animation-delay:150ms]">
            The modern booking platform for salons, clinics, gyms, and consultants.
            Your customers book in seconds. You stay in control.
          </p>

          {/* CTA buttons */}
          <div className="flex animate-fade-up gap-3 opacity-0 [animation-delay:300ms]">
            <Button size="lg" className="h-12 rounded-full px-8 text-[15px] shadow-lg shadow-primary/20" asChild>
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-[15px]" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          {/* Social proof */}
          <p className="animate-fade-in pt-4 text-sm text-muted-foreground opacity-0 [animation-delay:500ms]">
            Trusted by <span className="font-medium text-foreground">2,000+</span> businesses worldwide
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-border/40 bg-muted/30">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage bookings
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built with simplicity at its core. No clutter, no learning curve.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Smart Scheduling"
              description="Auto-generate slots based on your business hours. Drag, drop, done."
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Instant Bookings"
              description="Customers book available slots in real-time. No back-and-forth."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Customer Profiles"
              description="Complete booking history and preferences for every customer."
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Analytics"
              description="Revenue trends, peak hours, and no-show rates at a glance."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-t border-border/40">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-3 md:gap-8">
            <StepCard
              step="01"
              title="Create your business"
              description="Sign up, add your business info, and set your working hours. Takes under 2 minutes."
            />
            <StepCard
              step="02"
              title="Add your services"
              description="Define services with duration, price, and availability. Slots are generated automatically."
            />
            <StepCard
              step="03"
              title="Share and accept bookings"
              description="Share your booking page. Customers pick a slot and you get notified instantly."
            />
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="container py-24">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Why Booking.go
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for businesses that value simplicity
              </h2>
              <p className="mt-4 text-muted-foreground">
                No complex setups. No bloated features. Just a clean, focused tool that does one thing
                exceptionally well.
              </p>

              <ul className="mt-8 space-y-4">
                <Highlight text="No credit card required to start" />
                <Highlight text="Works on any device, any browser" />
                <Highlight text="99.9% uptime SLA" />
                <Highlight text="SOC 2 compliant data security" />
                <Highlight text="Cancel anytime, no lock-in" />
              </ul>
            </div>

            {/* Visual placeholder */}
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <div className="absolute inset-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/80 via-muted/40 to-transparent" />
              <div className="absolute inset-4 flex items-center justify-center rounded-2xl border border-border/40 bg-card shadow-sm">
                <div className="space-y-3 px-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Your booking page</p>
                  <p className="text-xs text-muted-foreground">
                    A beautiful, branded page your customers will love
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="border-t border-border/40">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by business owners
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="Booking.go replaced our messy WhatsApp scheduling. Our no-shows dropped by 40%."
              name="Priya S."
              role="Salon Owner"
            />
            <TestimonialCard
              quote="The simplicity is refreshing. I set it up during lunch break and it just worked."
              name="Arjun M."
              role="Fitness Trainer"
            />
            <TestimonialCard
              quote="My patients can now book appointments without calling. It saves us hours every week."
              name="Dr. Neha K."
              role="Clinic Director"
            />
          </div>
        </div>
      </section>
    </>
  );
}

