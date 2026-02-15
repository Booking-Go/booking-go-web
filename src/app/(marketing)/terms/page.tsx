import type { Metadata } from 'next';
import { Footer } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for Booking.go — the modern scheduling platform for small businesses.',
};

/**
 * Terms of Service page — static legal content.
 */
export default function TermsPage() {
  const lastUpdated = 'February 15, 2026';

  return (
    <>
      <main className="container max-w-3xl py-16 md:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using Booking.go (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p className="mt-2">
              Booking.go is a multi-tenant SaaS platform that enables businesses (salons, clinics,
              gyms, and other service providers) to manage appointments and bookings online.
              Customers can discover businesses, view available services, and book appointments
              through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 18 years old to create an account.</li>
              <li>One person may not maintain more than one account.</li>
              <li>You are responsible for all activities that occur under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Business Accounts</h2>
            <p className="mt-2">
              Business owners may register their businesses on the platform. By listing a business,
              you represent that you have the authority to operate that business and that all
              information provided is accurate. Booking.go reserves the right to verify or remove
              business listings at its discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Bookings &amp; Cancellations
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Bookings made through the platform constitute an agreement between the customer and
                the business.
              </li>
              <li>
                Cancellation policies are set by individual businesses. Please review the
                business&apos;s policy before booking.
              </li>
              <li>
                Booking.go is not responsible for disputes between customers and businesses
                regarding bookings, cancellations, or service quality.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Prohibited Conduct</h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Submit false, misleading, or fraudulent information.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts.</li>
              <li>Scrape, crawl, or use automated tools to extract data from the Service.</li>
              <li>Post reviews that are fake, defamatory, or intended to manipulate ratings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Intellectual Property</h2>
            <p className="mt-2">
              All content, trademarks, and materials on the Service are owned by Booking.go or its
              licensors. You may not copy, modify, distribute, or create derivative works without
              prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
            <p className="mt-2">
              To the fullest extent permitted by law, Booking.go shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of the Service. The Service is provided &quot;as is&quot; without warranties of
              any kind.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Termination</h2>
            <p className="mt-2">
              We reserve the right to suspend or terminate your account at any time for violations
              of these Terms or for any other reason at our sole discretion. Upon termination, your
              right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Changes to Terms</h2>
            <p className="mt-2">
              We may update these Terms from time to time. Continued use of the Service after
              changes constitutes acceptance of the updated Terms. We will notify registered users
              of material changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
            <p className="mt-2">
              If you have questions about these Terms, please contact us at{' '}
              <a
                href="mailto:support@booking.go"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                support@booking.go
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer hideCta />
    </>
  );
}
