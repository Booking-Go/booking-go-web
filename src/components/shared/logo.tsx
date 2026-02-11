import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export function Logo({ href = '/', className, size = 'md' }: LogoProps) {
  const content = (
    <span className={cn('font-semibold tracking-tight', sizeClasses[size], className)}>
      Booking<span className="text-muted-foreground">.go</span>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
