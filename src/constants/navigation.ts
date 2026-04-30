import type { LucideIcon } from 'lucide-react';
import { Bell, ChartNoAxesCombined, LayoutDashboard, Siren } from 'lucide-react';

export type NavKey = 'dashboard' | 'alerts' | 'analytics' | 'status';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'alerts', label: 'Alerts', icon: Siren },
  { key: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { key: 'status', label: 'Status Pages', icon: Bell },
];
