import { ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface DashboardPageProps {
  onAddProject: () => void;
}

export function DashboardPage({ onAddProject }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Dashboard</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-gray-400">
              Connect live URLs to populate this view with real monitor data.
            </p>
          </div>
          <Button variant="primary" onClick={onAddProject}>
            Add monitor
          </Button>
        </div>
      </section>

      <Card>
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-xl bg-white/[0.04] p-2 text-success">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No live monitor data yet</h3>
            <p className="mt-1 text-sm text-gray-400">
              Dashboard metrics, projects, and incidents will appear after you connect real endpoints.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
