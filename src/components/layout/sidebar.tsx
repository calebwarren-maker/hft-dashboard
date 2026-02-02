'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  BookOpen,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitor', label: 'Toxic Flow', icon: Shield },
  { href: '/orderbook', label: 'Order Book', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/risk', label: 'Risk', icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[200px] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
            HFT
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            ToxicFlow
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 live-dot" />
          System Active
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground/60">
          v1.0.0 — Mock Mode
        </div>
      </div>
    </aside>
  );
}
