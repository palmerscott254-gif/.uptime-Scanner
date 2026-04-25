import { AlertTriangle, CheckCircle2, LoaderCircle, Link2 } from 'lucide-react';
import type { ProjectFormValues } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface AddProjectModalProps {
  open: boolean;
  values: ProjectFormValues;
  onChange: (values: ProjectFormValues) => void;
  onClose: () => void;
  onTest: () => void;
  testStatus: 'idle' | 'loading' | 'success' | 'error';
  onSubmit: () => void;
}

export function AddProjectModal({
  open,
  values,
  onChange,
  onClose,
  onTest,
  testStatus,
  onSubmit,
}: AddProjectModalProps) {
  return (
    <Modal
      open={open}
      title="Add Project"
      description="Add a new monitor, validate the endpoint, and start tracking instantly."
      onClose={onClose}
    >
      <div className="space-y-5">
        <Input
          label="Project URL"
          placeholder="https://your-site.com"
          value={values.url}
          onChange={(event) => onChange({ ...values, url: event.target.value })}
          leftIcon={<Link2 className="h-4 w-4" />}
          helperText="The dashboard will auto-detect the project name from the URL."
        />

        <Input
          label="Project Name"
          placeholder="Auto-generated from URL"
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-300">Check Interval</span>
            <select
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-success/60"
              value={values.interval}
              onChange={(event) => onChange({ ...values, interval: Number(event.target.value) })}
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </label>

          <Input
            label="Alert Email"
            type="email"
            placeholder="alerts@company.com"
            value={values.email}
            onChange={(event) => onChange({ ...values, email: event.target.value })}
          />
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">Test connectivity</p>
              <p className="mt-1 text-sm text-gray-400">Verify reachability before creating the monitor.</p>
            </div>
            <Button variant="secondary" onClick={onTest} icon={<LoaderCircle className="h-4 w-4" />}>
              Test URL
            </Button>
          </div>
          {testStatus === 'success' ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              URL is reachable and returning 200 OK.
            </div>
          ) : null}
          {testStatus === 'error' ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              <AlertTriangle className="h-4 w-4" />
              URL is unreachable or returned a failure response.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Create Monitor
          </Button>
        </div>
      </div>
    </Modal>
  );
}
