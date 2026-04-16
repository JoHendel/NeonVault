import clsx from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  }
>;

export function Button({ children, className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={clsx(
        "group relative overflow-hidden rounded-2xl border px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] transition duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        variant === "primary" &&
          "border-white/20 bg-white/10 text-white shadow-glow hover:-translate-y-0.5 hover:bg-white/14",
        variant === "secondary" &&
          "border-white/15 bg-slate-950/50 text-white/90 hover:-translate-y-0.5 hover:border-white/25 hover:bg-slate-900/70",
        variant === "ghost" && "border-transparent bg-transparent text-white/70 hover:text-white",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
