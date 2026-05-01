import { AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface AlertsPageProps {
  onCreateAlert?: () => void;
}

export default function AlertsPage({ onCreateAlert }: AlertsPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Alerts</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Alerts</h1>
            <p className="mt-2 text-gray-400">Connect real monitors to start receiving alerts.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={onCreateAlert}>
              Create alert
            </Button>
          </div>
        </div>
      </section>

      <Card>
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-xl bg-white/[0.04] p-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No connected monitors</h3>
            <p className="mt-1 text-sm text-gray-400">
              Alerts will appear here after you connect live URLs and start monitoring real services.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
