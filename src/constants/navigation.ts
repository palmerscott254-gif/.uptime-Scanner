import type { LucideIcon } from 'lucide-react';
import { Bell, ChartNoAxesCombined, Cog, LayoutDashboard, ListTodo, Siren } from 'lucide-react';

export type NavKey = 'dashboard' | 'projects' | 'alerts' | 'analytics' | 'status' | 'settings';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', icon: ListTodo },
  { key: 'alerts', label: 'Alerts', icon: Siren },
  { key: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { key: 'status', label: 'Monitors', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Cog },
];
