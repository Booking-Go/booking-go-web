import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-api';
import { ProfileForm } from './_components/form';
import type { User } from '@/types';

export const metadata: Metadata = {
  title: 'Profile',
};

/**
 * Profile page — Server Component.
 * Fetches the user profile server-side so the form is pre-populated on first render.
 */
export default async function ProfilePage() {
  let profile: User | null = null;

  try {
    profile = await serverFetch<User>('/users/me');
  } catch {
    // Fallback to null — client component will show empty state
  }

  return <ProfileForm initialProfile={profile} />;
}
