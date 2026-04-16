import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

interface PauseOverlayProps {
  open: boolean;
  onResume: () => void;
  onMenu: () => void;
}

export function PauseOverlay({ open, onResume, onMenu }: PauseOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <Panel className="min-w-[340px] p-8 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--theme-accent)]">Paused</p>
              <h2 className="mt-3 font-display text-4xl text-white">Breathing room.</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                The vault is frozen. Resume when you are ready to push the run again.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Button onClick={onResume}>Resume Run</Button>
                <Button variant="secondary" onClick={onMenu}>
                  Exit To Menu
                </Button>
              </div>
            </Panel>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
