import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, type NavKey } from '../../constants/navigation';
import { cn } from '../../utils';

interface SidebarProps {
  active: NavKey;
  onChange: (item: NavKey) => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export function Sidebar({
  active,
  onChange,
  collapsed,
  onCollapseToggle,
  mobileOpen,
  onMobileToggle,
}: SidebarProps) {
  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-app-card text-white lg:hidden"
        type="button"
        onClick={onMobileToggle}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onMobileToggle}
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-app-card/95 px-3 py-4 backdrop-blur-xl transition-all duration-300',
          collapsed ? 'w-[84px]' : 'w-[264px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          {!collapsed ? <p className="text-lg font-semibold tracking-tight text-white">Uptime Scanner</p> : null}
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 transition hover:text-white lg:inline-flex"
            onClick={onCollapseToggle}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onChange(item.key);
                  if (mobileOpen) onMobileToggle();
                }}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-info/20 text-white ring-1 ring-info/30 shadow-glow'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-white',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]',
                    isActive ? 'text-info' : 'text-gray-400 group-hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
