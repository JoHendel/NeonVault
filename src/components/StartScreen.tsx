import { motion } from "framer-motion";
import { THEMES } from "../game/config/gameConfig";
import type { MetaProgress, ThemeId } from "../types/game";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

interface StartScreenProps {
  meta: MetaProgress;
  versionLabel: string;
  onStart: () => void;
  onHowTo: () => void;
  onThemeChange: (themeId: ThemeId) => void;
}

export function StartScreen({ meta, versionLabel, onStart, onHowTo, onThemeChange }: StartScreenProps) {
  return (
    <div className="absolute inset-0 z-30 overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,251,255,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,77,141,0.12),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.15),rgba(5,8,22,0.78))]" />
      <div className="relative mx-auto flex min-h-full max-w-[1440px] items-center px-4 py-10 md:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="self-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[var(--theme-accent-soft)]">
              {versionLabel}
            </div>
            <h1 className="mt-6 font-display text-6xl leading-none text-white md:text-8xl">
              Neon
              <span className="block text-[var(--theme-accent)]">Vault</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              A cyberpunk arena survival prototype focused on immediate spectacle, fluid input feel, upgrade synergies and a
              fast “one more run” loop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={onStart}>Start Run</Button>
              <Button variant="secondary" onClick={onHowTo}>
                How To Play
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                ["Best Score", String(meta.bestScore)],
                ["Best Time", `${Math.floor(meta.bestTime)}s`],
                ["Runs", String(meta.runsPlayed)]
              ].map(([label, value]) => (
                <Panel key={label} className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">{label}</p>
                  <p className="mt-3 font-display text-2xl text-white">{value}</p>
                </Panel>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
            <Panel className="p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--theme-accent)]">Vault Themes</p>
                  <h2 className="mt-3 font-display text-3xl text-white">Meta progression with visual identity.</h2>
                </div>
                <div className="grid gap-4">
                  {THEMES.map((theme) => {
                    const unlocked = meta.unlockedThemes.includes(theme.id);
                    const active = meta.currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => unlocked && onThemeChange(theme.id)}
                        className={`rounded-[24px] border p-5 text-left transition duration-300 ${
                          active
                            ? "border-[var(--theme-accent)]/45 bg-white/10 shadow-glow"
                            : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
                        } ${!unlocked ? "opacity-55" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-2xl text-white">{theme.name}</h3>
                            <p className="mt-2 text-sm leading-7 text-white/65">{theme.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors.accentAlt }} />
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors.accentSoft }} />
                          </div>
                        </div>
                        <div className="mt-5 text-[10px] uppercase tracking-[0.35em] text-white/45">
                          {unlocked ? (active ? "Equipped" : "Unlocked") : `Unlock at ${theme.unlockScore} score`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Panel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
