import { useEffect, useState } from "react";
import { loadMeta } from "../lib/storage";
import { DEFAULT_HUD_STATE, GAME_VERSION_LABEL } from "../game/config/gameConfig";
import { GameBridge } from "../game/ui/gameBridge";
import type { UiState } from "../types/game";

const initialState: UiState = {
  phase: "menu",
  hud: DEFAULT_HUD_STATE,
  upgrades: [],
  runStats: null,
  meta: loadMeta(),
  canResume: false,
  versionLabel: GAME_VERSION_LABEL
};

export function useGameUi(bridge: GameBridge): UiState {
  const [state, setState] = useState<UiState>(initialState);

  useEffect(() => bridge.subscribeState(setState), [bridge]);

  return state;
}
