import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { BootScene } from "../scenes/BootScene";
import { GameScene } from "../scenes/GameScene";
import { GameBridge } from "../ui/gameBridge";
import type { MetaProgress } from "../../types/game";

export function createGame(container: HTMLDivElement, bridge: GameBridge, meta: MetaProgress): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#050816",
    scene: [new BootScene(), new GameScene(bridge, meta)],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      roundPixels: false,
      powerPreference: "high-performance"
    },
    input: {
      activePointers: 2
    }
  });
}
