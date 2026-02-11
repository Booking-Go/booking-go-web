import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, ExternalLink } from 'lucide-react';
import type { Business } from '@/types';

interface BusinessCardProps {
  business: Business;
}

/**
 * Private component — business card for the businesses list grid.
 * Co-located with the businesses route, not exported globally.
 */
export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/dashboard/businesses/${business.id}`}
      className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80"
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex gap-2">
          {business.isActive ? (
            <Badge variant="secondary" className="text-xs">Active</Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-amber-500">Inactive</Badge>
          )}
          {business.isVerified && (
            <Badge variant="secondary" className="text-xs text-green-600">Verified</Badge>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-primary">
        {business.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{business.category}</p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {business.city}, {business.state}
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Manage <ExternalLink className="h-3 w-3" />
      </div>
    </Link>
  );
}
