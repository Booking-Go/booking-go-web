import Head from 'next/head';
import Link from 'next/link';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Booking.go - Simplify Your Booking Management</title>
        <meta name="description" content="Professional booking management system for small businesses" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-600">Booking.go</div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-gray-700 hover:bg-white/50 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Simplify Your Booking Management
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Empower your small business with an easy-to-use booking platform. Let your customers
              book slots effortlessly while you focus on what matters.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white hover:bg-primary-700 transition"
              >
                Start Free Trial
              </Link>
              <Link
                href="/explore"
                className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary-600 hover:bg-gray-50 transition"
              >
                Explore Businesses
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Easy Scheduling"
              description="Create and manage your booking slots with just a few clicks"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Real-time Updates"
              description="Get instant notifications for new bookings and cancellations"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Customer Management"
              description="Keep track of your customers and their booking history"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Analytics"
              description="Understand your business with detailed insights and reports"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 mt-20 border-t">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 Booking.go. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
