import React from 'react';
import Navbar from '../landing/Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <Navbar />}
      <main className={showNav ? 'pt-24' : ''}>{children}</main>
    </div>
  );
}
