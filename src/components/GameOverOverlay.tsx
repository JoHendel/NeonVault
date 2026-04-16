import { AnimatePresence, motion } from "framer-motion";
import { formatTime } from "../game/utils/math";
import type { MetaProgress, RunStats } from "../types/game";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

interface GameOverOverlayProps {
  stats: RunStats | null;
  meta: MetaProgress;
  open: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverOverlay({ stats, meta, open, onRestart, onMenu }: GameOverOverlayProps) {
  return (
    <AnimatePresence>
      {open && stats ? (
        <motion.div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/78 px-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
            <Panel className="w-full max-w-4xl p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-300">Run Complete</p>
                  <h2 className="mt-3 font-display text-5xl text-white">Neon burns out. Momentum stays.</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
                    Tight restart loop, clear stats, and local progression. Exactly the kind of flow that keeps a player clicking
                    “one more run”.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button onClick={onRestart}>Instant Restart</Button>
                    <Button variant="secondary" onClick={onMenu}>
                      Back To Menu
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Panel className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Score</p>
                    <p className="mt-3 font-display text-4xl text-white">{stats.score}</p>
                  </Panel>
                  <Panel className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Best Score</p>
                    <p className="mt-3 font-display text-4xl text-white">{meta.bestScore}</p>
                  </Panel>
                  <Panel className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Survival</p>
                    <p className="mt-3 font-display text-4xl text-white">{formatTime(stats.survivalTime)}</p>
                  </Panel>
                  <Panel className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Wave Reached</p>
                    <p className="mt-3 font-display text-4xl text-white">{stats.waveReached}</p>
                  </Panel>
                  <Panel className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Enemies</p>
                    <p className="mt-3 font-display text-4xl text-white">{stats.enemiesDefeated}</p>
                  </Panel>
                  <Panel className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Bosses</p>
                    <p className="mt-3 font-display text-4xl text-white">{stats.bossesDefeated}</p>
                  </Panel>
                </div>
              </div>
            </Panel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
