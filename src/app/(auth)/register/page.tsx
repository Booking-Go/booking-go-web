'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { register as registerAction } from '@/actions/auth';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_REDIRECTS } from '@/lib/routes';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'business_owner';
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (formData: RegisterForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const result = await registerAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const { user, refreshToken } = result.data;
      login(user, refreshToken);
      toast.success('Account created!');

      // Redirect to callbackUrl (e.g. back to the business page to finish booking)
      const defaultRedirect =
        DEFAULT_REDIRECTS[user.role as keyof typeof DEFAULT_REDIRECTS] ??
        DEFAULT_REDIRECTS.fallback;
      router.push(callbackUrl === '/dashboard' ? defaultRedirect : callbackUrl);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start managing bookings today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">First name</label>
            <input
              {...register('firstName', { required: 'Required' })}
              type="text"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Last name</label>
            <input
              {...register('lastName', { required: 'Required' })}
              type="text"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Email</label>
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
          <label className="text-sm font-medium leading-none">Account type</label>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('role', { required: 'Select account type' })}
                type="radio"
                value="customer"
                defaultChecked
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">Customer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('role', { required: 'Select account type' })}
                type="radio"
                value="business_owner"
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">Business Owner</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Password</label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
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

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Confirm password</label>
          <div className="relative">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={
            callbackUrl !== '/dashboard'
              ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : '/login'
          }
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
