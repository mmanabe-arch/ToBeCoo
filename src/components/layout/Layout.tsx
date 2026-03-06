import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, title, headerRight, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {title && (
        <header className="flex items-center justify-between px-4 py-4 border-b border-border-color sticky top-0 bg-background z-40">
          <h1 className="text-base font-semibold text-text-primary">{title}</h1>
          {headerRight && <div>{headerRight}</div>}
        </header>
      )}
      <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
