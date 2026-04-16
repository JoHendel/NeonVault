import { formatTime } from "../game/utils/math";
import type { HudState, MetaProgress } from "../types/game";
import { Panel } from "./ui/Panel";
import { StatBar } from "./ui/StatBar";

interface HUDOverlayProps {
  hud: HudState;
  meta: MetaProgress;
}

function CooldownPill({ label, value, max }: { label: string; value: number; max: number }) {
  const ready = value <= 0.05;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">{label}</p>
      <p className={`mt-2 font-display text-lg ${ready ? "text-[var(--theme-accent-soft)]" : "text-white"}`}>
        {ready ? "Ready" : `${value.toFixed(1)}s`}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--theme-accent-alt)] to-[var(--theme-accent-soft)] transition-all duration-200"
          style={{ width: `${100 - (value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function HUDOverlay({ hud, meta }: HUDOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-4 md:p-6">
      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between">
        <div className="grid gap-4 lg:grid-cols-[360px_1fr_320px]">
          <Panel className="p-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.36em] text-white/45">Vault Operative</p>
                  <h2 className="mt-2 font-display text-2xl text-white">Run Level {hud.level}</h2>
                </div>
                <div className="rounded-full border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--theme-accent-soft)]">
                  Best {meta.bestScore}
                </div>
              </div>
              <StatBar label="Health" value={hud.health} max={hud.maxHealth} colorClass="bg-gradient-to-r from-rose-500 to-pink-500" />
              <StatBar label="Experience" value={hud.xp} max={hud.xpToNext} colorClass="bg-gradient-to-r from-amber-300 to-[var(--theme-accent-soft)]" />
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Panel className="p-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Score</p>
              <p className="mt-3 font-display text-4xl text-white">{hud.score}</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Time</p>
              <p className="mt-3 font-display text-4xl text-white">{formatTime(hud.survivalTime)}</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Wave</p>
              <p className="mt-3 font-display text-4xl text-white">{hud.wave}</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Eliminations</p>
              <p className="mt-3 font-display text-4xl text-white">{hud.enemiesDefeated}</p>
            </Panel>
          </div>

          <Panel className="p-5">
            <div className="grid gap-3">
              <CooldownPill label="Dash" value={hud.dashCooldown} max={hud.dashCooldownMax} />
              <CooldownPill label="Nova" value={hud.specialCooldown} max={hud.specialCooldownMax} />
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Threat</p>
                <p className={`mt-2 font-display text-lg ${hud.bossAlive ? "text-rose-300" : "text-white"}`}>
                  {hud.bossAlive ? "Boss Active" : "Wave Pressure Rising"}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex justify-center">
          <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-white/55 backdrop-blur-md">
            WASD Move • Shift / RMB Dash • LMB / Space Nova • ESC Pause
          </div>
        </div>
      </div>
    </div>
  );
}
