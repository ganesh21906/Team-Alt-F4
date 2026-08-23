import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200';
  const variants = {
    primary: 'bg-[var(--ink)] text-[var(--paper)] border border-[var(--ink)] hover:-translate-y-0.5 hover:bg-[var(--paper)] hover:text-[var(--ink)]',
    secondary: 'bg-[var(--accent-soft)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] hover:-translate-y-0.5',
    ghost: 'bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] hover:-translate-y-0.5',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}
