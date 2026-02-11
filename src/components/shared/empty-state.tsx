import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Consistent empty state panel — icon, title, description, and optional action slot.
 * Used when lists have no items (no businesses, no bookings, etc.).
 */
export function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20',
        className,
      )}
    >
      <div className="text-muted-foreground/50">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
