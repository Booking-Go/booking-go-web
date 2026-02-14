'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  googleCalendarUrl,
  outlookCalendarUrl,
  downloadIcs,
  type CalendarEvent,
} from '@/lib/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────────────
// Brand icons — inline SVGs for pixel-perfect rendering
// ────────────────────────────────────────────────────────────────

/** Google's multicolor "G" logo. */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/** Apple logo — monochrome, respects current text color. */
const AppleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

/** Microsoft Outlook icon — blue brand color. */
const OutlookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 0 1-.588.236h-8.42v-8.47l1.6 1.14a.31.31 0 0 0 .347 0l7.06-4.79a.164.164 0 0 1 .105-.025.183.183 0 0 1 .131.065.191.191 0 0 1 0 .254l.003.536z"
      fill="#0078D4"
    />
    <path
      d="M15.073 8.3l.679-.49 8.248-5.59v-.03a.787.787 0 0 0-.826-.19H8.42a.803.803 0 0 0-.418.19l-.002.03 3.564 3.53 3.51 2.55z"
      fill="#0078D4"
    />
    <path
      d="M8 18.677V8.062L14.754 13v5.677a.803.803 0 0 0 .803.803h8.617a.773.773 0 0 0 .552-.236L8 18.677z"
      fill="#0078D4"
    />
    <path
      d="M8 8.062v10.615l-.006.006A.8.8 0 0 1 7.2 19.2H.8a.8.8 0 0 1-.8-.8V5.6a.8.8 0 0 1 .8-.8h5.6L8 8.062z"
      fill="#0364B8"
    />
    <ellipse cx="4.4" cy="12" rx="2.8" ry="3.6" fill="white" />
    <ellipse cx="4.4" cy="12" rx="1.8" ry="2.6" fill="#0364B8" />
  </svg>
);

// ────────────────────────────────────────────────────────────────
// Calendar option definitions
// ────────────────────────────────────────────────────────────────

interface CalendarOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (event: CalendarEvent) => void;
}

const CALENDAR_OPTIONS: CalendarOption[] = [
  {
    id: 'google',
    label: 'Google',
    icon: <GoogleIcon className="h-5 w-5" />,
    action: (event) => {
      window.open(googleCalendarUrl(event), '_blank', 'noopener');
    },
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: <AppleIcon className="h-5 w-5" />,
    action: (event) => {
      downloadIcs(event);
    },
  },
  {
    id: 'outlook',
    label: 'Outlook',
    icon: <OutlookIcon className="h-5 w-5" />,
    action: (event) => {
      window.open(outlookCalendarUrl(event), '_blank', 'noopener');
    },
  },
];

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

interface AddToCalendarProps {
  /** Pre-built CalendarEvent to pass to the chosen provider. */
  event: CalendarEvent;
  /** Additional classes for the root wrapper. */
  className?: string;
  /** Button size variant. */
  size?: 'sm' | 'default';
}

/**
 * Animated "Add to Calendar" radial menu.
 *
 * Renders a trigger button that, on click, fans out provider options
 * (Google, Apple, Outlook) in an arc with a staggered spring animation.
 * Each option shows the provider's brand icon with a tooltip label.
 *
 * @example
 * ```tsx
 * <AddToCalendar event={bookingToCalendarEvent(booking)} />
 * ```
 */
export function AddToCalendar({ event, className, size = 'sm' }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Cancel pending close when re-entering. */
  const cancelLeaveTimer = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  /** Open on hover. */
  const handleMouseEnter = () => {
    cancelLeaveTimer();
    setIsOpen(true);
  };

  /** Close after a short delay so the cursor can move to the options. */
  const handleMouseLeave = () => {
    cancelLeaveTimer();
    leaveTimerRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  /** Cleanup leave timer on unmount. */
  useEffect(() => {
    return () => cancelLeaveTimer();
  }, []);

  /** Close on outside click (fallback for touch devices). */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /** Close on Escape. */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleOptionClick = useCallback(
    (option: CalendarOption) => {
      try {
        option.action(event);
        setIsOpen(false);
        if (option.id === 'apple') {
          toast.success('Calendar file downloaded');
        }
      } catch {
        toast.error('Could not add to calendar');
      }
    },
    [event]
  );

  // Calculate positions for the fan-out.
  // Options expand upward in an arc from -40° to -140° (above the button).
  const optionCount = CALENDAR_OPTIONS.length;
  const arcStart = -40; // degrees (right-ish)
  const arcEnd = -140; // degrees (left-ish)
  const radius = 56; // px distance from center

  const getOptionPosition = (index: number) => {
    const angle =
      optionCount === 1
        ? (arcStart + arcEnd) / 2
        : arcStart + (arcEnd - arcStart) * (index / (optionCount - 1));
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative mr-2 inline-flex', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <Button
        size={size}
        variant="ghost"
        className={cn(
          'relative z-10 text-muted-foreground transition-all duration-200',
          isOpen ? 'bg-primary/10 text-primary rotate-45' : 'hover:text-foreground hover:bg-accent'
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Add to calendar"
        title="Add to calendar"
      >
        <CalendarPlus className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      </Button>

      {/* Animated fan-out options */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        role="menu"
        aria-label="Calendar provider options"
      >
        {CALENDAR_OPTIONS.map((option, i) => {
          const pos = getOptionPosition(i);
          const delay = i * 50; // stagger each by 50ms

          return (
            <div
              key={option.id}
              className={cn(
                'pointer-events-auto absolute left-1/2 top-1/2 z-20',
                'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
              )}
              style={{
                transform: isOpen
                  ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(1)`
                  : 'translate(-50%, -50%) scale(0)',
                opacity: isOpen ? 1 : 0,
                transitionDelay: isOpen ? `${delay}ms` : `${(optionCount - 1 - i) * 30}ms`,
              }}
            >
              <button
                role="menuitem"
                onClick={() => handleOptionClick(option)}
                className={cn(
                  'group/cal relative flex h-10 w-10 items-center justify-center rounded-full',
                  'border border-border/60 bg-card shadow-lg',
                  'transition-all duration-200 hover:scale-110 hover:shadow-xl',
                  'hover:border-primary/40 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                )}
                aria-label={`Add to ${option.label}`}
              >
                {option.icon}

                {/* Tooltip label */}
                <span
                  className={cn(
                    'absolute -top-8 left-1/2 -translate-x-1/2',
                    'whitespace-nowrap rounded-md bg-popover px-2 py-1',
                    'text-[10px] font-medium text-popover-foreground shadow-md',
                    'border border-border/40',
                    'opacity-0 transition-opacity duration-150 group-hover/cal:opacity-100',
                    'pointer-events-none'
                  )}
                >
                  {option.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Backdrop pulse ring on open */}
      <span
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
          'bg-primary/5 transition-all duration-500 ease-out',
          isOpen ? 'h-32 w-32 opacity-100' : 'h-0 w-0 opacity-0'
        )}
        aria-hidden="true"
      />
    </div>
  );
}
