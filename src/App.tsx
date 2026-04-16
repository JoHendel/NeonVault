import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type Phaser from "phaser";
import { createGame } from "./game/phaser/createGame";
import { GameBridge } from "./game/ui/gameBridge";
import { useGameUi } from "./hooks/useGameUi";
import { HowToPlayModal } from "./components/HowToPlayModal";
import { StartScreen } from "./components/StartScreen";
import { HUDOverlay } from "./components/HUDOverlay";
import { UpgradeOverlay } from "./components/UpgradeOverlay";
import { PauseOverlay } from "./components/PauseOverlay";
import { GameOverOverlay } from "./components/GameOverOverlay";
import { THEMES } from "./game/config/gameConfig";
import { loadMeta } from "./lib/storage";

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [bridge] = useState(() => new GameBridge());
  const [howToOpen, setHowToOpen] = useState(false);
  const ui = useGameUi(bridge);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = createGame(containerRef.current, bridge, loadMeta());
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [bridge]);

  const activeTheme = useMemo(
    () => THEMES.find((theme) => theme.id === ui.meta.currentTheme) ?? THEMES[0],
    [ui.meta.currentTheme]
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
      style={
        {
          "--theme-accent": activeTheme.colors.accent,
          "--theme-accent-soft": activeTheme.colors.accentSoft,
          "--theme-accent-alt": activeTheme.colors.accentAlt,
          "--theme-danger": activeTheme.colors.danger,
          backgroundImage: `radial-gradient(circle at top, ${activeTheme.colors.accent}18, transparent 30%), radial-gradient(circle at 80% 10%, ${activeTheme.colors.accentAlt}14, transparent 24%), linear-gradient(180deg, ${activeTheme.colors.bgTop}, ${activeTheme.colors.bgBottom})`
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 md:px-8 md:py-6">
        <div className="game-shell relative flex-1 overflow-hidden rounded-[34px] border border-white/10 bg-black/20 shadow-panel backdrop-blur-xl">
          <div ref={containerRef} className="h-full w-full" />

          {ui.phase === "menu" ? (
            <StartScreen
              meta={ui.meta}
              versionLabel={ui.versionLabel}
              onStart={() => bridge.sendCommand({ type: "startRun" })}
              onHowTo={() => setHowToOpen(true)}
              onThemeChange={(themeId) => bridge.sendCommand({ type: "setTheme", themeId })}
            />
          ) : null}

          {ui.phase !== "menu" ? <HUDOverlay hud={ui.hud} meta={ui.meta} /> : null}

          <UpgradeOverlay upgrades={ui.upgrades} onChoose={(upgradeId) => bridge.sendCommand({ type: "chooseUpgrade", upgradeId })} />

          <PauseOverlay
            open={ui.phase === "paused"}
            onResume={() => bridge.sendCommand({ type: "resumeRun" })}
            onMenu={() => bridge.sendCommand({ type: "returnToMenu" })}
          />

          <GameOverOverlay
            open={ui.phase === "gameover"}
            stats={ui.runStats}
            meta={ui.meta}
            onRestart={() => bridge.sendCommand({ type: "restartRun" })}
            onMenu={() => bridge.sendCommand({ type: "returnToMenu" })}
          />

          <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />
        </div>
      </main>
    </div>
  );
}
