import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: React.ReactNode;
  className?: string;
  /** If provided, the card becomes a clickable link */
  href?: string;
  /** Tooltip text shown on hover */
  tooltip?: string;
}

/**
 * Dashboard stat card — icon, label, value, description.
 * Reusable across dashboard home, analytics, and overview sections.
 * Supports optional click-to-navigate and tooltip.
 */
export function StatCard({
  icon,
  title,
  value,
  description,
  className,
  href,
  tooltip,
}: StatCardProps) {
  const card = (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-6 transition-colors',
        href && 'cursor-pointer hover:border-primary/30 hover:bg-accent/50',
        className
      )}
    >
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

  const wrappedCard = href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );

  if (!tooltip) return wrappedCard;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{wrappedCard}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
