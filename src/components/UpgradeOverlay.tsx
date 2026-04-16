import { AnimatePresence, motion } from "framer-motion";
import type { UpgradeChoice } from "../types/game";
import { Panel } from "./ui/Panel";

interface UpgradeOverlayProps {
  upgrades: UpgradeChoice[];
  onChoose: (id: UpgradeChoice["id"]) => void;
}

const rarityClass: Record<UpgradeChoice["rarity"], string> = {
  common: "from-white/10 to-white/5",
  rare: "from-cyan-400/20 to-blue-400/10",
  epic: "from-fuchsia-500/20 to-pink-500/10"
};

export function UpgradeOverlay({ upgrades, onChoose }: UpgradeOverlayProps) {
  return (
    <AnimatePresence>
      {upgrades.length > 0 ? (
        <motion.div
          className="absolute inset-0 z-40 grid place-items-center bg-slate-950/72 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Panel className="w-full max-w-5xl p-8">
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--theme-accent)]">Level Up</p>
                  <h2 className="mt-3 font-display text-4xl text-white">Choose your next spike in power.</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {upgrades.map((upgrade) => (
                    <button
                      key={upgrade.id}
                      onClick={() => onChoose(upgrade.id)}
                      className={`group rounded-[26px] border border-white/10 bg-gradient-to-br ${rarityClass[upgrade.rarity]} p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[var(--theme-accent)]/40 hover:shadow-glow`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{upgrade.rarity}</p>
                      <h3 className="mt-4 font-display text-2xl text-white">{upgrade.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/72">{upgrade.description}</p>
                      <div className="mt-8 text-xs uppercase tracking-[0.32em] text-[var(--theme-accent-soft)] transition group-hover:translate-x-1">
                        Equip Upgrade
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Panel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
