'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutAction, refreshToken as refreshTokenAction } from '@/actions/auth';
import { getUnreadNotificationCount } from '@/actions/notification';
import { getUnreadMessageCount } from '@/actions/message';
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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NotificationPopover, MessagePopover } from '@/components/shared';
import { Logo } from '@/components/shared';
import { PushNotificationBanner } from '@/components/shared/push-notification-banner';
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
  Bot,
  Compass,
} from 'lucide-react';
// Bell & MessageSquare still used in sidebar navItems
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
    label: 'AI Assistant',
    href: '/dashboard/ai-chat',
    icon: <Bot className="h-4 w-4" />,
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const [notifResult, msgResult] = await Promise.all([
        getUnreadNotificationCount(),
        getUnreadMessageCount(),
      ]);
      if (notifResult.success) setUnreadCount(notifResult.data);
      if (msgResult.success) setUnreadMessages(msgResult.data);
    } catch {
      // Non-critical — silently fail
    }
  }, []);

  // Proactive token refresh: refresh the access token every 13 minutes
  // (before the 15-minute expiry) to prevent 401s on polling calls
  useEffect(() => {
    if (!user) return;

    const refreshAccess = async () => {
      const storedRefresh = localStorage.getItem('refreshToken');
      if (!storedRefresh) return;
      const result = await refreshTokenAction(storedRefresh);
      if (result.success) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      } else {
        logout();
        router.push('/login');
      }
    };

    const refreshInterval = setInterval(refreshAccess, 13 * 60_000);
    return () => clearInterval(refreshInterval);
  }, [user, logout, router]);

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
      await logoutAction();
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

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

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
                    <Logo href="/explore" />
                  </div>
                  <Separator className="my-4" />
                  <div onClick={() => setMobileOpen(false)}>
                    <SidebarNav pathname={pathname} userRole={user.role} />
                  </div>
                </SheetContent>
              </Sheet>

              <Logo href="/explore" />
            </div>

            <div className="flex items-center gap-3">
              <MessagePopover unreadCount={unreadMessages} onCountChange={fetchUnread} />
              <NotificationPopover unreadCount={unreadCount} onCountChange={fetchUnread} />
              <ThemeToggle />

              {/* User avatar menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 rounded-full bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20"
                    aria-label="User menu"
                  >
                    {initials}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.role === 'business_owner'
                        ? 'Business Owner'
                        : user.role === 'admin'
                          ? 'Admin'
                          : 'Customer'}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/explore" className="cursor-pointer gap-2">
                      <Compass className="h-4 w-4" />
                      Explore
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowLogoutDialog(true)}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
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
          <main className="flex-1 p-6 lg:p-8">
            <PushNotificationBanner />
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
