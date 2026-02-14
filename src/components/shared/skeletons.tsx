import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Skeleton stat card — matches the layout of StatCard component.
 */
export const StatCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('rounded-2xl border border-border/60 bg-card p-6', className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="mt-4 h-7 w-24" />
    <Skeleton className="mt-2 h-3 w-32" />
  </div>
);

/**
 * Skeleton for a table row.
 */
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="border-b border-border/40">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-3">
        <Skeleton className={cn('h-4', i === 0 ? 'w-28' : i === columns - 1 ? 'w-16' : 'w-20')} />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton for a list item (bookings, notifications, etc.).
 */
export const ListItemSkeleton = () => (
  <div className="flex items-center justify-between px-6 py-3.5">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <div className="ml-4 flex items-center gap-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  </div>
);

/**
 * Skeleton for a page header (title + description).
 */
export const PageHeaderSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-72" />
  </div>
);

/**
 * Skeleton card with header and content area.
 */
export const CardSkeleton = ({ className, lines = 3 }: { className?: string; lines?: number }) => (
  <div className={cn('rounded-2xl border border-border/60 bg-card', className)}>
    <div className="border-b border-border/40 px-6 py-4">
      <Skeleton className="h-5 w-36" />
    </div>
    <div className="space-y-3 px-6 py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === 0 ? 'w-full' : i === lines - 1 ? 'w-3/5' : 'w-4/5')}
        />
      ))}
    </div>
  </div>
);

/**
 * Skeleton for conversation list items in messaging.
 */
export const ConversationSkeleton = () => (
  <div className="flex items-start gap-3 border-b border-border/20 px-4 py-3">
    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-3 w-40" />
    </div>
  </div>
);

/**
 * Skeleton for a chat message bubble.
 */
export const MessageBubbleSkeleton = ({ isMine = false }: { isMine?: boolean }) => (
  <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[75%] space-y-2 rounded-2xl px-4 py-3',
        isMine ? 'bg-primary/10' : 'bg-muted'
      )}
    >
      <Skeleton className={cn('h-4', isMine ? 'w-32' : 'w-48')} />
      <Skeleton className="ml-auto h-2.5 w-10" />
    </div>
  </div>
);

/**
 * Skeleton for a metric tile (performance section).
 */
export const MetricTileSkeleton = () => (
  <div className="rounded-xl bg-muted/50 p-4">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="mt-2 h-6 w-16" />
  </div>
);

/**
 * Skeleton for a business card in the businesses list.
 */
export const BusinessCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <div className="flex items-start gap-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-9 w-24 rounded-lg" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton for form fields.
 */
export const FormFieldSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for the explore/business detail page.
 */
export const BusinessDetailSkeleton = () => (
  <div className="space-y-8">
    {/* Hero */}
    <Skeleton className="h-48 w-full rounded-2xl" />
    {/* Title + meta */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
    {/* Services grid */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for notification list items.
 */
export const NotificationSkeleton = () => (
  <div className="flex items-start gap-3 border-b border-border/40 px-4 py-3">
    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  </div>
);

/**
 * Skeleton for analytics charts area.
 */
export const ChartSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('rounded-2xl border border-border/60 bg-card p-6', className)}>
    <Skeleton className="h-5 w-32" />
    <Skeleton className="mt-1 h-3 w-48" />
    <Skeleton className="mt-6 h-48 w-full rounded-lg" />
  </div>
);
