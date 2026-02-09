import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Booking<span className="text-muted-foreground">.go</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#testimonials" className="transition-colors hover:text-foreground">
              Testimonials
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

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

      {/* ── CTA ── */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="container py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to simplify your bookings?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Join thousands of businesses that save time and delight customers with Booking.go.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" className="h-12 rounded-full px-8 text-[15px] shadow-lg shadow-primary/20" asChild>
              <Link href="/register">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever for up to 50 bookings/month. No credit card needed.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-lg font-semibold tracking-tight">
                Booking<span className="text-muted-foreground">.go</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Modern booking management for small businesses.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="transition-colors hover:text-foreground">Features</a></li>
                <li><a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Pricing</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">About</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Booking.go. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Components ── */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-border hover:shadow-sm">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary/[0.12]">
        {icon}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center md:text-left">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground">
        {step}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function Highlight({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      <span>{text}</span>
    </li>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{quote}&rdquo;</p>
      <div className="mt-4 border-t border-border/40 pt-4">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
