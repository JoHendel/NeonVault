import Phaser from "phaser";

export class Projectile extends Phaser.GameObjects.Image {
  velocity = new Phaser.Math.Vector2();

  damage = 0;

  life = 0;

  fromPlayer = true;

  chainsRemaining = 0;

  splitCount = 0;

  hasSplit = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture = "projectile") {
    super(scene, x, y, texture);
    scene.add.existing(this);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setDepth(9);
  }

  update(deltaSeconds: number): void {
    this.x += this.velocity.x * deltaSeconds;
    this.y += this.velocity.y * deltaSeconds;
    this.life -= deltaSeconds;
  }
}
