import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CustomerView } from './_components/customer-view';
import { OwnerView } from './_components/owner-view';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Dashboard home page — Server Component.
 * Reads the user role from the JWT cookie and renders the appropriate view.
 */
export default async function DashboardPage() {
  let userRole = 'customer';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role || 'customer';
    }
  } catch {
    // Fallback to customer role
  }

  if (userRole === 'business_owner' || userRole === 'admin') {
    return <OwnerView />;
  }

  return <CustomerView />;
}
