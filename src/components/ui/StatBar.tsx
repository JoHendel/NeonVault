interface StatBarProps {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}

export function StatBar({ label, value, max, colorClass }: StatBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/60">
        <span>{label}</span>
        <span>{Math.round(value) + " / " + Math.round(max)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full transition-all duration-200 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
