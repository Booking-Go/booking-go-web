'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutAction } from '@/actions/auth';
import { getUnreadNotificationCount } from '@/actions/notification';
import { getUnreadMessageCount } from '@/actions/message';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';
import { USER_ROLE_LABELS } from '@/lib/constants';
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

import { NotificationPopover, MessagePopover } from '@/components/shared';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

/**
 * Auth-aware navigation buttons for the marketing navbar.
 * Shows sign-in / get-started when logged out.
 * When logged in, shows notification & message indicators plus a user avatar menu.
 */
export function NavAuth() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  /** Fetch unread counts for notifications & messages. */
  const fetchUnread = useCallback(async () => {
    try {
      const [notifResult, msgResult] = await Promise.all([
        getUnreadNotificationCount(),
        getUnreadMessageCount(),
      ]);
      if (notifResult.success) setUnreadNotifs(notifResult.data);
      if (msgResult.success) setUnreadMessages(msgResult.data);
    } catch {
      // Non-critical — silently fail
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [user, fetchUnread]);

  if (!user) {
    return (
      <>
        <ThemeToggle />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button size="sm" className="rounded-full px-4" asChild>
          <Link href="/register">Get Started</Link>
        </Button>
      </>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch {
      // Even if API call fails, log out locally
    } finally {
      logout();
      toast.success('Logged out');
      router.push('/');
    }
  };

  return (
    <>
      <MessagePopover unreadCount={unreadMessages} onCountChange={fetchUnread} />
      <NotificationPopover unreadCount={unreadNotifs} onCountChange={fetchUnread} />
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
              {USER_ROLE_LABELS[user.role] ?? user.role}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
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
              You will be signed out of your account and redirected to the home page.
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
    </>
  );
}
