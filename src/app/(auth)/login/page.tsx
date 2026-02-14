'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { login as loginAction } from '@/actions/auth';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_REDIRECTS } from '@/lib/routes';
import { Eye, EyeOff, User, Briefcase } from 'lucide-react';

const DEV_ACCOUNTS = [
  { label: 'Customer', email: 'booking@co.com', password: 'Hello@123', icon: User },
  { label: 'Customer 2', email: 'booking@co.in', password: 'Hello@123', icon: User },
  { label: 'Business', email: 'booking@go.com', password: 'Hello@123', icon: Briefcase },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const fillDevAccount = (account: (typeof DEV_ACCOUNTS)[number]) => {
    setValue('email', account.email);
    setValue('password', account.password);
  };

  const onSubmit = async (formData: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await loginAction(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const { user, refreshToken } = result.data;
      login(user, refreshToken);
      toast.success('Welcome back!');

      // Customers land on explore (browse businesses), owners go to dashboard
      const defaultRedirect =
        DEFAULT_REDIRECTS[user.role as keyof typeof DEFAULT_REDIRECTS] ??
        DEFAULT_REDIRECTS.fallback;
      router.push(callbackUrl === '/dashboard' ? defaultRedirect : callbackUrl);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            placeholder="you@example.com"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href={
            callbackUrl !== '/dashboard'
              ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : '/register'
          }
          className="font-medium text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>

      {/* Quick fill for demo accounts */}
      <div className="rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-3">
        <p className="mb-2 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
          Quick Login
        </p>
        <div className="flex gap-2">
          {DEV_ACCOUNTS.map((account) => (
            <Button
              key={account.label}
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => fillDevAccount(account)}
            >
              <account.icon className="mr-1.5 h-3.5 w-3.5" />
              {account.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
