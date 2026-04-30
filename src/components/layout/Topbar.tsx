import { Bell, ChevronDown, Moon, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TopbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddProject: () => void;
}

export function Topbar({ search, onSearchChange, onAddProject }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-app-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <Input
            placeholder="Search projects, urls, tags"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-gray-300 transition hover:text-white md:inline-flex">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-300 transition hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-300 transition hover:text-white">
            <Moon className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 lg:flex">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-info to-cyan-400 text-sm font-bold text-slate-950">
              AS
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">Owner</p>
            </div>
          </div>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onAddProject}>
            Add Project
          </Button>
        </div>
      </div>
    </header>
  );
}
