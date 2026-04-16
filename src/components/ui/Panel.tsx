import clsx from "clsx";
import type { HTMLAttributes, PropsWithChildren } from "react";

export function Panel({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx(
        "rounded-[28px] border border-white/10 bg-slate-950/55 p-6 shadow-panel backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[28px] before:border before:border-white/5 before:opacity-60",
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
      {children}
    </div>
  );
}
