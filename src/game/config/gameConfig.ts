import type { HudState, ThemeDefinition } from "../../types/game";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const GAME_VERSION_LABEL = "Premium Prototype Build";

export const THEMES: ThemeDefinition[] = [
  {
    id: "cobalt",
    name: "Cobalt Relay",
    unlockScore: 0,
    description: "Electric cyan highlights with cold steel shadows.",
    colors: {
      accent: "#4FFBFF",
      accentSoft: "#74FFD7",
      accentAlt: "#6B7CFF",
      danger: "#FF4D8D",
      bgTop: "#06111f",
      bgBottom: "#090312",
      arenaGlow: 0x45f7ff,
      grid: 0x17354b,
      xp: 0xffdf7c,
      player: 0x6effd6,
      boss: 0xff3b87
    }
  },
  {
    id: "sunset",
    name: "Sunset Smuggler",
    unlockScore: 1200,
    description: "Amber heatwaves and magenta danger lighting.",
    colors: {
      accent: "#FF8A00",
      accentSoft: "#FFD166",
      accentAlt: "#FF4D8D",
      danger: "#FF355E",
      bgTop: "#1b0d08",
      bgBottom: "#100312",
      arenaGlow: 0xff8f2c,
      grid: 0x4a2418,
      xp: 0xfff099,
      player: 0xffd166,
      boss: 0xff355e
    }
  },
  {
    id: "glacier",
    name: "Glacier Array",
    unlockScore: 2500,
    description: "Clean arctic glass with high-contrast neon frost.",
    colors: {
      accent: "#8FE8FF",
      accentSoft: "#E3FBFF",
      accentAlt: "#8D9CFF",
      danger: "#FF6B9D",
      bgTop: "#04131f",
      bgBottom: "#030812",
      arenaGlow: 0x8fe8ff,
      grid: 0x1c4055,
      xp: 0xf2f7ff,
      player: 0xc8fbff,
      boss: 0xff6b9d
    }
  },
  {
    id: "ultraviolet",
    name: "Ultraviolet Heist",
    unlockScore: 4200,
    description: "Violet noir with razor pink boss tells.",
    colors: {
      accent: "#BA7CFF",
      accentSoft: "#E8CBFF",
      accentAlt: "#FF5D9E",
      danger: "#FF5D9E",
      bgTop: "#12081f",
      bgBottom: "#050312",
      arenaGlow: 0xc08bff,
      grid: 0x382053,
      xp: 0xffd0ff,
      player: 0xe3bcff,
      boss: 0xff5d9e
    }
  }
];

export const DEFAULT_HUD_STATE: HudState = {
  health: 100,
  maxHealth: 100,
  xp: 0,
  xpToNext: 20,
  level: 1,
  score: 0,
  survivalTime: 0,
  wave: 1,
  dashCooldown: 0,
  dashCooldownMax: 3.8,
  specialCooldown: 0,
  specialCooldownMax: 7,
  enemiesDefeated: 0,
  bossAlive: false
};
