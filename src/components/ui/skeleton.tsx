import { cn } from '@/lib/utils';

/**
 * Skeleton shimmer primitive — animated placeholder for loading states.
 * Uses a subtle pulse animation to indicate content is loading.
 */
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
};

export { Skeleton };
