import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Business',
};

export default function NewBusinessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
