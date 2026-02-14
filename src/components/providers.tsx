'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          offset={16}
          gap={8}
          closeButton
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                'group w-full flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg text-card-foreground font-sans text-sm',
              title: 'font-medium leading-tight',
              description: 'text-muted-foreground text-xs mt-0.5',
              actionButton:
                'ml-auto shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors',
              cancelButton:
                'ml-auto shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors',
              closeButton:
                '!bg-card !border-border !text-muted-foreground hover:!text-foreground hover:!border-foreground/20 !transition-colors',
              success:
                'group w-full flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-lg text-emerald-700 dark:text-emerald-400 font-sans text-sm',
              error:
                'group w-full flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 shadow-lg text-red-700 dark:text-red-400 font-sans text-sm',
              warning:
                'group w-full flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 shadow-lg text-amber-700 dark:text-amber-400 font-sans text-sm',
              info: 'group w-full flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 shadow-lg text-blue-700 dark:text-blue-400 font-sans text-sm',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
