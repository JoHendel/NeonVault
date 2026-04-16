export type GamePhase = "menu" | "running" | "paused" | "levelup" | "gameover";

export type ThemeId = "cobalt" | "sunset" | "glacier" | "ultraviolet";

export type EnemyKind = "chaser" | "dasher" | "tank" | "boss";

export type UpgradeId =
  | "damage_boost"
  | "fire_rate"
  | "move_speed"
  | "dash_distance"
  | "dash_cooldown"
  | "chain_arc"
  | "splitter"
  | "extra_shot"
  | "lifesteal"
  | "crit_chance"
  | "overcharge"
  | "reinforced_shell";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  unlockScore: number;
  description: string;
  colors: {
    accent: string;
    accentSoft: string;
    accentAlt: string;
    danger: string;
    bgTop: string;
    bgBottom: string;
    arenaGlow: number;
    grid: number;
    xp: number;
    player: number;
    boss: number;
  };
}

export interface PlayerStats {
  maxHealth: number;
  moveSpeed: number;
  fireRate: number;
  weaponDamage: number;
  projectileCount: number;
  projectileSpeed: number;
  dashDistance: number;
  dashCooldown: number;
  specialCooldown: number;
  specialRadius: number;
  chainHits: number;
  projectileSplit: number;
  lifesteal: number;
  critChance: number;
  critMultiplier: number;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic";
  maxStacks: number;
  apply: (stats: PlayerStats) => PlayerStats;
}

export interface UpgradeChoice {
  id: UpgradeId;
  title: string;
  description: string;
  rarity: UpgradeDefinition["rarity"];
}

export interface HudState {
  health: number;
  maxHealth: number;
  xp: number;
  xpToNext: number;
  level: number;
  score: number;
  survivalTime: number;
  wave: number;
  dashCooldown: number;
  dashCooldownMax: number;
  specialCooldown: number;
  specialCooldownMax: number;
  enemiesDefeated: number;
  bossAlive: boolean;
}

export interface RunStats {
  score: number;
  survivalTime: number;
  waveReached: number;
  levelReached: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  upgradesTaken: UpgradeId[];
}

export interface MetaProgress {
  bestScore: number;
  bestTime: number;
  unlockedThemes: ThemeId[];
  currentTheme: ThemeId;
  runsPlayed: number;
}

export interface UiState {
  phase: GamePhase;
  hud: HudState;
  upgrades: UpgradeChoice[];
  runStats: RunStats | null;
  meta: MetaProgress;
  canResume: boolean;
  versionLabel: string;
}

export type GameCommand =
  | { type: "startRun" }
  | { type: "restartRun" }
  | { type: "returnToMenu" }
  | { type: "togglePause" }
  | { type: "resumeRun" }
  | { type: "chooseUpgrade"; upgradeId: UpgradeId }
  | { type: "setTheme"; themeId: ThemeId };
