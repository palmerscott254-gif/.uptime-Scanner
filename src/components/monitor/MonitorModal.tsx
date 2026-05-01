import { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ToggleSwitch } from '../ui/ToggleSwitch';

interface MonitorModalProps {
  open: boolean;
  project?: Project | null;
  onClose: () => void;
  onSubmit: (values: Partial<Project>) => Promise<void> | void;
}

export function MonitorModal({ open, project, onClose, onSubmit }: MonitorModalProps) {
  const [values, setValues] = useState<Partial<Project>>({});

  useEffect(() => {
    setValues(project ? { ...project } : { url: '', name: '', interval: 1, email: '', keepAlive: true, retryThreshold: 2 });
  }, [project]);

  const handleChange = (k: keyof Partial<Project>, v: any) => setValues((s) => ({ ...(s || {}), [k]: v }));

  const submit = async () => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal open={open} title={project ? 'Edit Monitor' : 'Add Monitor'} description={project ? 'Update monitor settings' : 'Create a new monitor'} onClose={onClose}>
      <div className="space-y-4">
        <Input label="URL" value={String(values?.url ?? '')} onChange={(e) => handleChange('url', e.target.value)} />
        <Input label="Name" value={String(values?.name ?? '')} onChange={(e) => handleChange('name', e.target.value)} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-300">Interval (min)</span>
            <select value={String(values?.interval ?? 1)} onChange={(e) => handleChange('interval', Number(e.target.value))} className="h-12 w-full rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white">
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </label>
          <Input label="Alert Email" value={String(values?.email ?? '')} onChange={(e) => handleChange('email', e.target.value)} />
        </div>

        <ToggleSwitch checked={Boolean(values?.keepAlive)} onChange={(v) => handleChange('keepAlive', v)} label="Enabled" description="Enable monitoring for this service" />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>{project ? 'Save' : 'Create'}</Button>
        </div>
      </div>
    </Modal>
  );
}

export default MonitorModal;
