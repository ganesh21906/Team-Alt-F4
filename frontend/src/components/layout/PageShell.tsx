import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return <main className="mx-auto min-h-screen max-w-[1140px] px-4 py-2 flex flex-col justify-center">{children}</main>;
}
