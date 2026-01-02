/**
 * Page wrapper with layout
 */
import { ReactNode } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

interface PageWrapperProps {
  children: ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

