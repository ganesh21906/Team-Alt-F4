import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return <main className="mx-auto min-h-[calc(100vh-32px)] max-w-[1040px] px-6 py-8">{children}</main>;
}
