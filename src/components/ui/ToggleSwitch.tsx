interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-colors hover:bg-white/[0.05]"
    >
      <div>
        <p className="font-medium text-white">{label}</p>
        {description ? <p className="mt-1 text-sm text-gray-400">{description}</p> : null}
      </div>
      <span
        className={
          checked
            ? 'relative inline-flex h-7 w-12 items-center rounded-full bg-success/25 ring-1 ring-success/40'
            : 'relative inline-flex h-7 w-12 items-center rounded-full bg-white/10 ring-1 ring-white/10'
        }
      >
        <span
          className={
            checked
              ? 'inline-block h-5 w-5 translate-x-6 rounded-full bg-success shadow-lg shadow-success/30 transition-transform'
              : 'inline-block h-5 w-5 translate-x-1 rounded-full bg-white/60 transition-transform'
          }
        />
      </span>
    </button>
  );
}
