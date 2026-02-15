import type { Metadata } from 'next';
import { Footer } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Booking.go — how we collect, use, and protect your data.',
};

/**
 * Privacy Policy page — static legal content.
 */
export default function PrivacyPage() {
  const lastUpdated = 'February 15, 2026';

  return (
    <>
      <main className="container max-w-3xl py-16 md:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-2">
              Booking.go (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <h3 className="mt-3 font-medium text-foreground">2.1 Information You Provide</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Account information:</strong> name, email address, phone number, and
                password when you register.
              </li>
              <li>
                <strong>Business information:</strong> business name, description, address,
                operating hours, and services offered (for business owners).
              </li>
              <li>
                <strong>Booking information:</strong> service selections, appointment dates, times,
                and any notes you provide.
              </li>
              <li>
                <strong>Communications:</strong> messages sent through the platform between
                customers and businesses.
              </li>
              <li>
                <strong>Reviews:</strong> ratings and comments you submit about businesses.
              </li>
            </ul>

            <h3 className="mt-3 font-medium text-foreground">
              2.2 Information Collected Automatically
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Usage data:</strong> pages visited, features used, and actions taken within
                the platform.
              </li>
              <li>
                <strong>Device information:</strong> browser type, operating system, and device
                identifiers.
              </li>
              <li>
                <strong>Location data:</strong> approximate location based on IP address or, with
                your consent, precise location for nearby business discovery.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. How We Use Your Information
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To create and manage your account.</li>
              <li>To facilitate bookings between customers and businesses.</li>
              <li>To send booking confirmations, reminders, and status updates.</li>
              <li>To enable communication between customers and businesses.</li>
              <li>To display business listings and reviews.</li>
              <li>To provide location-based business discovery.</li>
              <li>To improve and personalize the Service.</li>
              <li>To send important service-related announcements.</li>
              <li>To detect, prevent, and address fraud or security issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Information Sharing</h2>
            <p className="mt-2">
              We do not sell your personal information. We may share information:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>With businesses you book:</strong> your name, contact information, and
                booking details are shared with the business to fulfill your appointment.
              </li>
              <li>
                <strong>With customers who book (for business owners):</strong> your business
                information, availability, and services are publicly displayed.
              </li>
              <li>
                <strong>Service providers:</strong> we may share data with third-party service
                providers that assist in operating the platform (e.g., hosting, email delivery,
                analytics).
              </li>
              <li>
                <strong>Legal requirements:</strong> we may disclose information if required by law
                or to protect the rights and safety of Booking.go, our users, or the public.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Data Security</h2>
            <p className="mt-2">
              We implement industry-standard security measures to protect your information,
              including encryption in transit (HTTPS), secure password hashing, and access controls.
              However, no method of electronic storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Data Retention</h2>
            <p className="mt-2">
              We retain your information for as long as your account is active or as needed to
              provide services. You may request deletion of your account and associated data at any
              time by contacting us. Some information may be retained as required by law or for
              legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
            <p className="mt-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your information.</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Export your data in a portable format.</li>
              <li>Withdraw consent for optional data processing.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{' '}
              <a
                href="mailto:privacy@booking.go"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                privacy@booking.go
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Cookies &amp; Tracking</h2>
            <p className="mt-2">
              We use essential cookies to maintain your session and preferences (e.g.,
              authentication tokens, theme preference). We do not use third-party tracking cookies
              for advertising. Analytics cookies may be used to understand usage patterns and
              improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Push Notifications</h2>
            <p className="mt-2">
              With your consent, we may send push notifications for booking updates, messages, and
              other important events. You can manage notification preferences in your account
              settings or through your browser/device settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Children&apos;s Privacy</h2>
            <p className="mt-2">
              The Service is not intended for users under 18 years of age. We do not knowingly
              collect personal information from children. If we become aware that we have collected
              data from a child, we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting a notice on the platform or sending an email. Continued use of the
              Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Contact Us</h2>
            <p className="mt-2">
              If you have questions or concerns about this Privacy Policy, contact us at{' '}
              <a
                href="mailto:privacy@booking.go"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                privacy@booking.go
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
