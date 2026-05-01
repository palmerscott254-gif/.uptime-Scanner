import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Workspace preferences</h1>
        <p className="mt-2 text-gray-400">Configure alerts, notification routes, branding, and access controls.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">Notification rules</h3>
          <p className="mt-2 text-sm text-gray-400">Manage email, webhook, and escalation preferences.</p>
          <div className="mt-4 flex gap-3">
            <Button variant="primary">Edit rules</Button>
            <Button variant="secondary">View audit log</Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white">Brand & access</h3>
          <p className="mt-2 text-sm text-gray-400">Control team access, public status branding, and API tokens.</p>
          <div className="mt-4 flex gap-3">
            <Button variant="primary">Manage access</Button>
            <Button variant="secondary">Security settings</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
