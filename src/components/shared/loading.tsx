import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  text?: string;
  /** Full page centered spinner (default) or inline */
  fullPage?: boolean;
}

/**
 * Consistent loading spinner. Used in data-fetching pages.
 */
export function Loading({ className, text, fullPage = true }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        fullPage && 'py-20',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
