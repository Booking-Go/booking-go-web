import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: React.ReactNode;
  className?: string;
}

/**
 * Dashboard stat card — icon, label, value, description.
 * Reusable across dashboard home, analytics, and overview sections.
 */
export function StatCard({ icon, title, value, description, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card p-6', className)}>
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          {icon}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
