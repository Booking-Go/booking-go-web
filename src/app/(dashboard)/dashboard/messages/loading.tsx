import { PageHeaderSkeleton, ConversationSkeleton } from '@/components/shared/skeletons';

/**
 * Messages page skeleton — conversation list + empty chat panel.
 */
export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeaderSkeleton />
      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40">
        {/* Conversation list */}
        <div className="w-full shrink-0 border-r border-border/40 md:w-80">
          <div className="border-b border-border/40 px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </div>
        </div>
        {/* Empty chat pane */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
