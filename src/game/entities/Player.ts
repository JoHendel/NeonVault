import Phaser from "phaser";
import type { PlayerStats, UpgradeId } from "../../types/game";

const baseStats: PlayerStats = {
  maxHealth: 100,
  moveSpeed: 280,
  fireRate: 3.8,
  weaponDamage: 14,
  projectileCount: 1,
  projectileSpeed: 610,
  dashDistance: 190,
  dashCooldown: 3.8,
  specialCooldown: 7,
  specialRadius: 132,
  chainHits: 0,
  projectileSplit: 0,
  lifesteal: 0,
  critChance: 0.08,
  critMultiplier: 1.9
};

export class Player extends Phaser.GameObjects.Image {
  stats: PlayerStats = { ...baseStats };

  health = this.stats.maxHealth;

  level = 1;

  xp = 0;

  xpToNext = 20;

  score = 0;

  survivalTime = 0;

  dashCooldownRemaining = 0;

  specialCooldownRemaining = 0;

  fireCooldownRemaining = 0;

  invulnerability = 0;

  enemiesDefeated = 0;

  bossesDefeated = 0;

  lastMoveDirection = new Phaser.Math.Vector2(1, 0);

  aimDirection = new Phaser.Math.Vector2(1, 0);

  upgradeStacks: Partial<Record<UpgradeId, number>> = {};

  upgradesTaken: UpgradeId[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, tint: number) {
    super(scene, x, y, "player-core");
    scene.add.existing(this);
    this.setTint(tint);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setDepth(10);
    this.setScale(1.15);
  }

  resetRun(): void {
    this.stats = { ...baseStats };
    this.health = this.stats.maxHealth;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 20;
    this.score = 0;
    this.survivalTime = 0;
    this.dashCooldownRemaining = 0;
    this.specialCooldownRemaining = 0;
    this.fireCooldownRemaining = 0;
    this.invulnerability = 0;
    this.enemiesDefeated = 0;
    this.bossesDefeated = 0;
    this.upgradeStacks = {};
    this.upgradesTaken = [];
    this.setAlpha(1);
    this.setScale(1.15);
  }

  tick(deltaSeconds: number): void {
    this.survivalTime += deltaSeconds;
    this.dashCooldownRemaining = Math.max(0, this.dashCooldownRemaining - deltaSeconds);
    this.specialCooldownRemaining = Math.max(0, this.specialCooldownRemaining - deltaSeconds);
    this.fireCooldownRemaining = Math.max(0, this.fireCooldownRemaining - deltaSeconds);
    this.invulnerability = Math.max(0, this.invulnerability - deltaSeconds);

    if (this.invulnerability > 0) {
      this.setAlpha(0.55 + Math.sin(this.survivalTime * 28) * 0.15);
    } else {
      this.setAlpha(1);
    }
  }

  gainXp(amount: number): boolean {
    this.xp += amount;
    if (this.xp < this.xpToNext) {
      return false;
    }

    this.xp -= this.xpToNext;
    this.level += 1;
    this.xpToNext = Math.floor(this.xpToNext * 1.24 + 8);
    return true;
  }

  heal(amount: number): void {
    this.health = Math.min(this.stats.maxHealth, this.health + amount);
  }

  takeDamage(amount: number): boolean {
    if (this.invulnerability > 0) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.invulnerability = 0.75;
    return this.health <= 0;
  }
}
