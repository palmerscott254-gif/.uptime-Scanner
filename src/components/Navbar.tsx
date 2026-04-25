import { BarChart3, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  onAddProject: () => void;
}

export function Navbar({ onAddProject }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-app-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/20 shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white">Uptime Scanner</h1>
              <Sparkles className="h-4 w-4 text-warning" />
            </div>
            <p className="text-sm text-gray-400">Modern website monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onAddProject}>
            Add Project
          </Button>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]">
            <BarChart3 className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-cyan-400 text-sm font-semibold text-slate-950 shadow-lg shadow-success/20">
            AS
          </div>
        </div>
      </div>
    </header>
  );
}
