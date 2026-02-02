'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { getDashboardStats } from '@/lib/mock-data';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [totalPnl, setTotalPnl] = useState(0);

  useEffect(() => {
    const tick = () => {
      const stats = getDashboardStats();
      setTotalPnl(stats.totalPnl);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar totalPnl={totalPnl} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
