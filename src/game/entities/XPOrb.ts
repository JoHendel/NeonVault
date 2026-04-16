import Phaser from "phaser";

export class XPOrb extends Phaser.GameObjects.Image {
  value = 1;

  driftAngle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "xp-orb");
    scene.add.existing(this);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setScale(0.75);
    this.setDepth(5);
    this.driftAngle = Math.random() * Math.PI * 2;
  }
}
