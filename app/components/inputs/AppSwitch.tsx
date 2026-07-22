export interface AppSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export default function AppSwitch({ value, onChange, label }: AppSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex cursor-pointer h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-indigo-500" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
