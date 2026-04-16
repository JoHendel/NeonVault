import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

const tips = [
  "WASD steuert deine Bewegung. Präzise Positionierung ist dein erster Schutzschild.",
  "Shift oder Rechtsklick führt einen Dash aus. Nutze ihn, um Boss-Charges und Dash-Gegner sauber zu brechen.",
  "Linksklick oder Leertaste aktiviert eine Nova-Fähigkeit mit Cooldown. Heb sie dir für dichte Wellen oder Boss-Fenster auf.",
  "Deine Hauptwaffe feuert automatisch in die aktuelle Zielrichtung. Richte mit der Maus oder notfalls mit deiner Bewegungsrichtung.",
  "Level-Ups pausieren die Action und geben dir 3 Upgrades. Build-Synergien entscheiden den Run."
];

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center bg-slate-950/65 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <Panel className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--theme-accent)]">How To Play</p>
                  <h2 className="mt-3 font-display text-3xl text-white">Fast, readable, dangerously addictive.</h2>
                </div>
                <div className="grid gap-3">
                  {tips.map((tip) => (
                    <div key={tip} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/78">
                      {tip}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={onClose}>Back To Vault</Button>
                </div>
              </div>
            </Panel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
