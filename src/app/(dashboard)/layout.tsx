'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { notificationApi } from '@/lib/notification';
import { messageApi } from '@/lib/message';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/shared';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Store,
  User,
  LogOut,
  Calendar,
  Menu,
  Bell,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'My Businesses',
    href: '/dashboard/businesses',
    icon: <Store className="h-4 w-4" />,
    roles: ['business_owner', 'admin'],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ['business_owner', 'admin'],
  },
  {
    label: 'Bookings',
    href: '/dashboard/bookings',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: 'Messages',
    href: '/dashboard/messages',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: <User className="h-4 w-4" />,
  },
];

function SidebarNav({ pathname, userRole }: { pathname: string; userRole: string }) {
  const filtered = navItems.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <nav className="flex flex-col gap-1">
      {filtered.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const [notifCount, msgCount] = await Promise.all([
        notificationApi.getUnreadCount(),
        messageApi.getUnreadCount(),
      ]);
      setUnreadCount(notifCount);
      setUnreadMessages(msgCount);
    } catch {
      // Non-critical — silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnread();
      // Poll every 60 seconds
      const interval = setInterval(fetchUnread, 60_000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnread]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, log out locally
    } finally {
      logout();
      toast.success('Logged out');
      router.push('/login');
    }
  };

  if (!user) {
    // Middleware protects this route; user will be hydrated from Zustand persist.
    // Brief null flash is avoided by middleware redirect.
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Top navbar */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            {/* Mobile menu trigger */}
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4 pt-8">
                  <div onClick={() => setMobileOpen(false)}>
                    <Logo href="/dashboard" />
                  </div>
                  <Separator className="my-4" />
                  <div onClick={() => setMobileOpen(false)}>
                    <SidebarNav pathname={pathname} userRole={user.role} />
                  </div>
                </SheetContent>
              </Sheet>

              <Logo href="/dashboard" />
            </div>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Messages"
                    onClick={() => router.push('/dashboard/messages')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {unreadMessages > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {unreadMessages > 0
                      ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}`
                      : 'Messages'}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                    onClick={() => router.push('/dashboard/notifications')}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : 'Notifications'}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ThemeToggle />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
              <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 sm:flex">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {user.role === 'business_owner'
                    ? 'Business'
                    : user.role === 'admin'
                      ? 'Admin'
                      : 'Customer'}
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account and redirected to the login page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sign out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-border/40 lg:block">
            <div className="sticky top-14 p-4">
              <SidebarNav pathname={pathname} userRole={user.role} />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
