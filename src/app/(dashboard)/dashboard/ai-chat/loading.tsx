import { PageHeaderSkeleton } from '@/components/shared/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiChatLoading() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeaderSkeleton />

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40">
        {/* Sidebar skeleton */}
        <div className="hidden shrink-0 border-r border-border/40 bg-card md:block md:w-72">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg px-3 py-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1.5 h-3 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Main chat skeleton */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-12" />
            </div>
          </div>

          {/* Messages area skeleton */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-44 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>

          {/* Input area skeleton */}
          <div className="border-t border-border/40 p-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
