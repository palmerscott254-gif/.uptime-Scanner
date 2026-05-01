import { AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Analytics</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Analytics</h1>
            <p className="mt-2 text-gray-400">Connect real monitors to generate analytics.</p>
          </div>
        </div>
      </section>

      <Card>
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-xl bg-white/[0.04] p-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No analytics available yet</h3>
            <p className="mt-1 text-sm text-gray-400">
              Analytics will populate after live URLs are connected and data starts flowing.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
