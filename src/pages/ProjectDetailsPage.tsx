import { useEffect, useState } from 'react';
import { ArrowLeft, Globe, Mail, MapPin, ShieldCheck, TimerReset, Webhook, AlertTriangle } from 'lucide-react';
import type { Project, TimeRange } from '../types';
import { formatResponseTime, statusMeta } from '../utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { StatusBadge } from '../components/StatusBadge';
import { UptimeChart } from '../components/charts/UptimeChart';
import { ResponseTimeChart } from '../components/charts/ResponseTimeChart';
import { LogsTimeline } from '../components/LogsTimeline';

interface ProjectDetailsPageProps {
  project: Project;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onBack: () => void;
}

export function ProjectDetailsPage({ project, range, onRangeChange, onBack }: ProjectDetailsPageProps) {
  const meta = statusMeta[project.status];
  const [interval, setInterval] = useState(project.interval);
  const [email, setEmail] = useState(project.email);
  const [sms, setSms] = useState('');
  const [webhook, setWebhook] = useState('');
  const [retryThreshold, setRetryThreshold] = useState(2);
  const [alertsEnabled, setAlertsEnabled] = useState(project.alertsEnabled);
  const [keepAlive, setKeepAlive] = useState(project.keepAlive);

  useEffect(() => {
    setInterval(project.interval);
    setEmail(project.email);
    setAlertsEnabled(project.alertsEnabled);
    setKeepAlive(project.keepAlive);
  }, [project]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
              Back to dashboard
            </Button>
            <div className="mt-2">
              <Button variant="danger" size="sm" icon={<AlertTriangle className="h-4 w-4" />} onClick={() => {
                // delegate to global delete flow via custom event
                const ev = new CustomEvent('request-delete', { detail: { id: project.id, name: project.name } });
                window.dispatchEvent(ev as Event);
              }}>
                Delete monitor
              </Button>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-white">{project.name}</h2>
                <StatusBadge status={project.status} size="lg" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {project.url}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  {project.sslValid ? 'SSL valid' : 'SSL requires attention'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {project.region ?? 'Region unavailable'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <TimerReset className="h-4 w-4" />
                  Checks every {interval} min
                </span>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Status</p>
              <p className="mt-2 text-2xl font-semibold text-white">{meta.label}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Response</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {project.status === 'down' ? '—' : formatResponseTime(project.responseTime)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Last check</p>
              <p className="mt-2 text-2xl font-semibold text-white">{project.lastChecked}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <UptimeChart data={project.uptimeSeries[range]} status={project.status} range={range} onRangeChange={onRangeChange} />
          <ResponseTimeChart data={project.responseSeries[range]} />
        </div>

        <div className="space-y-5">
          <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-white">Alert Settings</h3>
            <p className="mt-1 text-sm text-gray-400">Configure escalation routing and monitoring behavior.</p>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-300">Interval</span>
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white outline-none transition focus:border-success/60"
                  value={interval}
                  onChange={(event) => setInterval(Number(event.target.value))}
                >
                  <option className="bg-app-card text-white" value={1}>1 minute</option>
                  <option className="bg-app-card text-white" value={5}>5 minutes</option>
                  <option className="bg-app-card text-white" value={10}>10 minutes</option>
                  <option className="bg-app-card text-white" value={15}>15 minutes</option>
                </select>
              </label>

              <Input
                label="Alert Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                helperText="Receive incident alerts and recovery notifications."
              />

              <Input
                label="SMS Number (Optional)"
                value={sms}
                onChange={(event) => setSms(event.target.value)}
                placeholder="+1 (555) 000-1234"
                helperText="Optional SMS notifications for critical incidents."
              />

              <Input
                label="Webhook URL (Optional)"
                value={webhook}
                onChange={(event) => setWebhook(event.target.value)}
                placeholder="https://hooks.slack.com/..."
                leftIcon={<Webhook className="h-4 w-4" />}
                helperText="Optional webhook for real-time integrations with Slack, Teams, or custom services."
              />

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-300">Retry threshold</span>
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white outline-none transition focus:border-success/60"
                  value={retryThreshold}
                  onChange={(event) => setRetryThreshold(Number(event.target.value))}
                >
                  <option className="bg-app-card text-white" value={1}>1 retry</option>
                  <option className="bg-app-card text-white" value={2}>2 retries</option>
                  <option className="bg-app-card text-white" value={3}>3 retries</option>
                </select>
              </label>

              <ToggleSwitch
                checked={alertsEnabled}
                onChange={setAlertsEnabled}
                label="Enable alerts"
                description="Send notifications on downtime, slowdown, and recovery events."
              />

              <ToggleSwitch
                checked={keepAlive}
                onChange={setKeepAlive}
                label="Enable keep-alive pings"
                description="Maintain active sessions and prevent cold starts for critical apps."
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-white">Incident Insights</h3>
            <div className="mt-5 grid gap-3">
              {project.logs.slice(0, 3).map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300">
                  <p className="font-medium text-white">{log.message}</p>
                  <p className="mt-1 text-xs text-gray-500">{log.timestamp}</p>
                  {log.details ? <p className="mt-1 text-gray-400">{log.details}</p> : null}
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-success/15 to-transparent px-4 py-4">
                <div className="flex items-center gap-2 text-success">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Reliable monitoring window</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Current status and historical checks are optimized for rapid incident triage.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <LogsTimeline logs={project.logs} />
    </div>
  );
}
