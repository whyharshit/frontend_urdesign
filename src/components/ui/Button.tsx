import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'danger';
export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function ButtonLink({
  to,
  children,
  variant = 'primary',
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link className={`button button--${variant} ${className}`} to={to}>
      {children}
    </Link>
  );
}
