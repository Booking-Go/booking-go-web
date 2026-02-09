import Link from 'next/link';
import { Calendar, Clock, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Booking.go
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-24 text-center md:pt-32">
        <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
          Built for small businesses
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Booking management,{' '}
          <span className="text-muted-foreground">simplified.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Let your customers book slots effortlessly. A clean, modern platform for salons, clinics,
          gyms, and consultants.
        </p>
        <div className="flex gap-3 pt-2">
          <Button size="lg" asChild>
            <Link href="/register">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/explore">Explore businesses</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24 pt-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Calendar className="h-5 w-5" />}
            title="Easy Scheduling"
            description="Create and manage booking slots with just a few clicks."
          />
          <FeatureCard
            icon={<Clock className="h-5 w-5" />}
            title="Real-time Updates"
            description="Instant notifications for new bookings and cancellations."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Customer Management"
            description="Track your customers and their booking history."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Analytics"
            description="Understand your business with detailed insights."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container flex h-16 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Booking.go. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

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
    <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/50">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
