import { AlertTriangle, CheckCircle2, LoaderCircle, Link2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ProjectFormValues } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ToggleSwitch } from '../ui/ToggleSwitch';

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
  const [step, setStep] = useState(1);
  const validUrl = useMemo(() => /^https?:\/\//i.test(values.url.trim()) || /^[\w.-]+\.[a-z]{2,}/i.test(values.url.trim()), [values.url]);

  const nextStep = () => setStep((current) => Math.min(4, current + 1));
  const previousStep = () => setStep((current) => Math.max(1, current - 1));

  const closeModal = () => {
    setStep(1);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="New Monitor Onboarding"
      description={`Step ${step} of 4 • Configure monitor and alert defaults`}
      onClose={closeModal}
    >
      <div className="space-y-5">
        {step === 1 ? (
          <>
            <Input
              label="Project URL"
              placeholder="https://your-site.com"
              value={values.url}
              onChange={(event) => onChange({ ...values, url: event.target.value })}
              leftIcon={<Link2 className="h-4 w-4" />}
              helperText="The dashboard auto-detects your monitor name."
              error={!validUrl && values.url ? 'Enter a valid URL' : undefined}
            />
            <Input
              label="Project Name"
              placeholder="Auto-generated from URL"
              value={values.name}
              onChange={(event) => onChange({ ...values, name: event.target.value })}
            />
          </>
        ) : null}

        {step === 2 ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">Reachability & metadata test</p>
                <p className="mt-1 text-sm text-gray-400">Validate endpoint before monitor provisioning.</p>
              </div>
              <Button variant="secondary" onClick={onTest} icon={<LoaderCircle className="h-4 w-4" />}>
                Test URL
              </Button>
            </div>
            {testStatus === 'loading' ? (
              <div className="mt-4 rounded-2xl border border-info/25 bg-info/10 px-4 py-3 text-sm text-info">Running endpoint checks…</div>
            ) : null}
            {testStatus === 'success' ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                URL is reachable and healthy.
              </div>
            ) : null}
            {testStatus === 'error' ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                <AlertTriangle className="h-4 w-4" />
                Endpoint unreachable. Recheck URL or network policy.
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-300">Check Interval</span>
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white outline-none transition focus:border-success/60"
                  value={values.interval}
                  onChange={(event) => onChange({ ...values, interval: Number(event.target.value) })}
                >
                  <option className="bg-app-card text-white" value={1}>1 minute</option>
                  <option className="bg-app-card text-white" value={5}>5 minutes</option>
                  <option className="bg-app-card text-white" value={10}>10 minutes</option>
                  <option className="bg-app-card text-white" value={15}>15 minutes</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-300">Retry Threshold</span>
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white outline-none transition focus:border-success/60"
                  value={values.retryThreshold}
                  onChange={(event) => onChange({ ...values, retryThreshold: Number(event.target.value) })}
                >
                  <option className="bg-app-card text-white" value={1}>1 retry</option>
                  <option className="bg-app-card text-white" value={2}>2 retries</option>
                  <option className="bg-app-card text-white" value={3}>3 retries</option>
                </select>
              </label>
            </div>
            <Input
              label="Alert Email"
              type="email"
              placeholder="alerts@company.com"
              value={values.email}
              onChange={(event) => onChange({ ...values, email: event.target.value })}
            />
            <ToggleSwitch
              checked={values.keepAlive}
              onChange={(checked) => onChange({ ...values, keepAlive: checked })}
              label="Enable keep-alive defaults"
              description="Recommended for Render and serverless cold-start prevention."
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-[1.5rem] border border-success/20 bg-success/10 p-5">
            <p className="text-sm text-success">Ready to create monitor</p>
            <h4 className="mt-1 text-lg font-semibold text-white">{values.name || values.url}</h4>
            <p className="mt-2 text-sm text-gray-200">Interval: {values.interval}m • Retry: {values.retryThreshold} • Keep-alive: {values.keepAlive ? 'On' : 'Off'}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          {step > 1 ? (
            <Button variant="secondary" onClick={previousStep}>
              Back
            </Button>
          ) : null}
          {step < 4 ? (
            <Button variant="primary" onClick={nextStep} disabled={(step === 1 && !validUrl) || (step === 2 && testStatus !== 'success')}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={onSubmit}>
              Create Monitor
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
