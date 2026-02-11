import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page header with title, optional description, and action slot.
 * Used across dashboard pages for uniform heading patterns.
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
