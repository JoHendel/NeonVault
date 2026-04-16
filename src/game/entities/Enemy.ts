import Phaser from "phaser";
import type { EnemyKind } from "../../types/game";

export class Enemy extends Phaser.GameObjects.Image {
  readonly kind: EnemyKind;

  hp: number;

  maxHp: number;

  speed: number;

  radius: number;

  contactDamage: number;

  xpReward: number;

  scoreReward: number;

  windup = 0;

  dashTimer = 0;

  attackCooldown = 0;

  orbitAngle = 0;

  dashVector = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number, kind: EnemyKind, scaleFactor: number, tint: number) {
    super(scene, x, y, kind === "boss" ? "boss-core" : `enemy-${kind}`);
    this.kind = kind;
    scene.add.existing(this);
    this.setDepth(kind === "boss" ? 8 : 7);
    this.setTint(tint);
    this.setBlendMode(Phaser.BlendModes.SCREEN);

    if (kind === "chaser") {
      this.maxHp = 24 * scaleFactor;
      this.speed = 90 + scaleFactor * 6;
      this.radius = 18;
      this.contactDamage = 10;
      this.xpReward = 4;
      this.scoreReward = 24;
      this.setScale(0.95);
    } else if (kind === "dasher") {
      this.maxHp = 16 * scaleFactor;
      this.speed = 125 + scaleFactor * 10;
      this.radius = 14;
      this.contactDamage = 14;
      this.xpReward = 5;
      this.scoreReward = 36;
      this.attackCooldown = Phaser.Math.FloatBetween(0.8, 1.6);
      this.setScale(0.92);
    } else if (kind === "tank") {
      this.maxHp = 62 * scaleFactor;
      this.speed = 55 + scaleFactor * 3;
      this.radius = 24;
      this.contactDamage = 18;
      this.xpReward = 8;
      this.scoreReward = 52;
      this.setScale(1.18);
    } else {
      this.maxHp = 520 * scaleFactor;
      this.speed = 72 + scaleFactor * 4;
      this.radius = 48;
      this.contactDamage = 24;
      this.xpReward = 28;
      this.scoreReward = 600;
      this.attackCooldown = 2.8;
      this.setScale(1.7);
    }

    this.hp = this.maxHp;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }
}
