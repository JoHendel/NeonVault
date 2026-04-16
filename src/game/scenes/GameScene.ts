import Phaser from "phaser";
import { GAME_HEIGHT, GAME_VERSION_LABEL, GAME_WIDTH, THEMES } from "../config/gameConfig";
import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import { XPOrb } from "../entities/XPOrb";
import { recordRun, setTheme } from "../../lib/storage";
import type {
  EnemyKind,
  GameCommand,
  GamePhase,
  MetaProgress,
  ThemeDefinition,
  ThemeId,
  UiState,
  UpgradeChoice,
  UpgradeId
} from "../../types/game";
import { DEFAULT_HUD_STATE } from "../config/gameConfig";
import { GameBridge } from "../ui/gameBridge";
import { AudioSystem } from "../systems/AudioSystem";
import { applyUpgrade, getUpgradeChoices } from "../systems/UpgradeSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { clamp, lerp, randomRange } from "../utils/math";

export class GameScene extends Phaser.Scene {
  private readonly bridge: GameBridge;

  private readonly audioSystem = new AudioSystem();

  private player!: Player;

  private enemies: Enemy[] = [];

  private projectiles: Projectile[] = [];

  private xpOrbs: XPOrb[] = [];

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    dash: Phaser.Input.Keyboard.Key;
    special: Phaser.Input.Keyboard.Key;
    escape: Phaser.Input.Keyboard.Key;
  };

  private phase: GamePhase = "menu";

  private waveSystem = new WaveSystem();

  private meta!: MetaProgress;

  private theme!: ThemeDefinition;

  private upgradeChoices: UpgradeChoice[] = [];

  private runStats: UiState["runStats"] = null;

  private backgroundGlow!: Phaser.GameObjects.Graphics;

  private backgroundGrid!: Phaser.GameObjects.Graphics;

  private ringGraphics!: Phaser.GameObjects.Graphics;

  private particleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private pointerAim = new Phaser.Math.Vector2(1, 0);

  private uiEmitAccumulator = 0;

  private hitStopTimer = 0;

  constructor(bridge: GameBridge, meta: MetaProgress) {
    super("GameScene");
    this.bridge = bridge;
    this.meta = meta;
    this.theme = THEMES.find((item) => item.id === meta.currentTheme) ?? THEMES[0];
  }

  create(): void {
    this.createTextures();
    this.cameras.main.setRoundPixels(true);
    this.backgroundGlow = this.add.graphics();
    this.backgroundGrid = this.add.graphics();
    this.ringGraphics = this.add.graphics();
    const particles = this.add.particles(0, 0, "particle", {
      speed: { min: 15, max: 120 },
      scale: { start: 0.35, end: 0 },
      lifespan: 500,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
      tint: this.theme.colors.arenaGlow
    });
    particles.setDepth(20);
    this.particleEmitter = particles;

    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, this.theme.colors.player);
    this.player.setVisible(true);
    this.player.setAlpha(0.82);

    this.keys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      special: Phaser.Input.Keyboard.KeyCodes.SPACE,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    }) as GameScene["keys"];

    this.input.mouse?.disableContextMenu();
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.tryDash();
      } else if (pointer.leftButtonDown()) {
        this.trySpecial();
      }
    });

    this.bridge.subscribeCommand((command) => this.handleCommand(command));

    this.applyTheme(this.theme.id);
    this.emitUiState();
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    this.uiEmitAccumulator += deltaSeconds;

    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      if (this.phase === "running") {
        this.setPhase("paused");
      } else if (this.phase === "paused") {
        this.setPhase("running");
      }
    }

    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= deltaSeconds;
      if (this.uiEmitAccumulator >= 0.08) {
        this.emitUiState();
        this.uiEmitAccumulator = 0;
      }
      return;
    }

    this.drawArena();

    if (this.phase === "menu") {
      this.player.rotation += deltaSeconds * 0.7;
      if (this.uiEmitAccumulator >= 0.12) {
        this.emitUiState();
        this.uiEmitAccumulator = 0;
      }
      return;
    }

    if (this.phase === "paused" || this.phase === "levelup" || this.phase === "gameover") {
      if (this.uiEmitAccumulator >= 0.08) {
        this.emitUiState();
        this.uiEmitAccumulator = 0;
      }
      return;
    }

    this.player.tick(deltaSeconds);
    this.handlePlayerInput(deltaSeconds);
    this.handleWeaponFire();
    this.updateProjectiles(deltaSeconds);
    this.updateEnemies(deltaSeconds);
    if (this.phase !== "running") {
      this.emitUiState();
      return;
    }
    this.updateXpOrbs(deltaSeconds);
    if (this.phase !== "running") {
      this.emitUiState();
      return;
    }
    this.handleWaveProgress(deltaSeconds);

    if (this.uiEmitAccumulator >= 0.05) {
      this.emitUiState();
      this.uiEmitAccumulator = 0;
    }
  }

  private handleCommand(command: GameCommand): void {
    if (command.type === "startRun") {
      this.startRun();
    } else if (command.type === "restartRun") {
      this.startRun();
    } else if (command.type === "returnToMenu") {
      this.returnToMenu();
    } else if (command.type === "togglePause") {
      if (this.phase === "running") {
        this.setPhase("paused");
      } else if (this.phase === "paused") {
        this.setPhase("running");
      }
    } else if (command.type === "resumeRun" && this.phase === "paused") {
      this.setPhase("running");
    } else if (command.type === "chooseUpgrade") {
      this.applyChosenUpgrade(command.upgradeId);
    } else if (command.type === "setTheme") {
      this.meta = setTheme(command.themeId);
      this.applyTheme(command.themeId);
      this.emitUiState();
    }
  }

  private setPhase(phase: GamePhase): void {
    this.phase = phase;
    this.emitUiState();
  }

  private startRun(): void {
    this.clearRunObjects();
    this.player.resetRun();
    this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.player.setVisible(true);
    this.player.setTint(this.theme.colors.player);
    this.waveSystem = new WaveSystem();
    this.upgradeChoices = [];
    this.runStats = null;
    this.phase = "running";
    this.spawnEnemy("chaser");
    this.spawnEnemy("chaser");
    this.spawnEnemy("dasher");
    this.cameras.main.flash(200, 80, 255, 220, false);
    this.emitUiState();
  }

  private returnToMenu(): void {
    this.clearRunObjects();
    this.phase = "menu";
    this.runStats = null;
    this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.player.setVisible(true);
    this.player.setAlpha(0.82);
    this.emitUiState();
  }

  private clearRunObjects(): void {
    this.enemies.forEach((enemy) => enemy.destroy());
    this.projectiles.forEach((projectile) => projectile.destroy());
    this.xpOrbs.forEach((orb) => orb.destroy());
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
  }

  private applyTheme(themeId: ThemeId): void {
    this.theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
    this.player?.setTint(this.theme.colors.player);
    this.cameras.main.setBackgroundColor(this.theme.colors.bgTop);
    this.drawArena();
  }

  private createTextures(): void {
    if (this.textures.exists("player-core")) {
      return;
    }

    const graphics = this.add.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(18, 18, 14);
    graphics.lineStyle(3, 0xffffff, 0.6);
    graphics.strokeCircle(18, 18, 16);
    graphics.generateTexture("player-core", 36, 36);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture("enemy-chaser", 32, 32);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(4, 4, 28, 28, 8);
    graphics.generateTexture("enemy-tank", 36, 36);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.beginPath();
    graphics.moveTo(18, 0);
    graphics.lineTo(36, 18);
    graphics.lineTo(18, 36);
    graphics.lineTo(0, 18);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture("enemy-dasher", 36, 36);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(32, 32, 28);
    graphics.lineStyle(4, 0xffffff, 0.45);
    graphics.strokeCircle(32, 32, 30);
    graphics.generateTexture("boss-core", 64, 64);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(0, 0, 10, 26, 4);
    graphics.generateTexture("projectile", 10, 26);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 6);
    graphics.generateTexture("xp-orb", 16, 16);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(3, 3, 3);
    graphics.generateTexture("particle", 6, 6);
    graphics.destroy();
  }

  private drawArena(): void {
    this.backgroundGlow.clear();
    this.backgroundGlow.fillGradientStyle(0x0f172a, 0x0b1220, 0x070915, 0x05040b, 1);
    this.backgroundGlow.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.backgroundGlow.fillStyle(this.theme.colors.arenaGlow, 0.06);
    this.backgroundGlow.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 280 + Math.sin(this.time.now * 0.0012) * 18);

    this.backgroundGrid.clear();
    this.backgroundGrid.lineStyle(1, this.theme.colors.grid, 0.55);
    for (let x = 0; x <= GAME_WIDTH; x += 48) {
      this.backgroundGrid.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 48) {
      this.backgroundGrid.lineBetween(0, y, GAME_WIDTH, y);
    }
    this.backgroundGrid.lineStyle(2, this.theme.colors.arenaGlow, 0.2);
    this.backgroundGrid.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 265);

    this.ringGraphics.clear();
    const boss = this.enemies.find((enemy) => enemy.kind === "boss");
    if (boss && boss.windup > 0) {
      const ringRadius = 90 + (1 - boss.windup) * 80;
      this.ringGraphics.lineStyle(3, this.theme.colors.boss, 0.65);
      this.ringGraphics.strokeCircle(boss.x, boss.y, ringRadius);
      this.ringGraphics.lineStyle(1, this.theme.colors.boss, 0.35);
      this.ringGraphics.strokeCircle(boss.x, boss.y, ringRadius + 18);
    }
  }

  private handlePlayerInput(deltaSeconds: number): void {
    const movement = new Phaser.Math.Vector2(
      Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
      Number(this.keys.down.isDown) - Number(this.keys.up.isDown)
    );

    if (movement.lengthSq() > 0) {
      movement.normalize();
      this.player.lastMoveDirection.copy(movement);
      this.player.x = clamp(this.player.x + movement.x * this.player.stats.moveSpeed * deltaSeconds, 48, GAME_WIDTH - 48);
      this.player.y = clamp(this.player.y + movement.y * this.player.stats.moveSpeed * deltaSeconds, 48, GAME_HEIGHT - 48);
    }

    const pointer = this.input.activePointer;
    this.pointerAim.set(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
    if (this.pointerAim.lengthSq() < 64 && movement.lengthSq() > 0) {
      this.pointerAim.copy(movement);
    } else if (this.pointerAim.lengthSq() < 64) {
      this.pointerAim.copy(this.player.lastMoveDirection);
    }
    this.pointerAim.normalize();
    this.player.aimDirection.copy(this.pointerAim);
    this.player.rotation = this.pointerAim.angle() + Math.PI / 2;

    if (Phaser.Input.Keyboard.JustDown(this.keys.dash)) {
      this.tryDash();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special)) {
      this.trySpecial();
    }
  }

  private tryDash(): void {
    if (this.phase !== "running" || this.player.dashCooldownRemaining > 0) {
      return;
    }

    const dashDirection =
      this.player.lastMoveDirection.lengthSq() > 0 ? this.player.lastMoveDirection.clone() : this.player.aimDirection.clone();
    dashDirection.normalize();
    this.player.x = clamp(this.player.x + dashDirection.x * this.player.stats.dashDistance, 48, GAME_WIDTH - 48);
    this.player.y = clamp(this.player.y + dashDirection.y * this.player.stats.dashDistance, 48, GAME_HEIGHT - 48);
    this.player.dashCooldownRemaining = this.player.stats.dashCooldown;
    this.player.invulnerability = 0.32;
    this.emitBurst(this.player.x, this.player.y, this.theme.colors.player, 12);
    this.audioSystem.play("dash");
    this.cameras.main.shake(90, 0.002);
  }

  private trySpecial(): void {
    if (this.phase !== "running" || this.player.specialCooldownRemaining > 0) {
      return;
    }

    this.player.specialCooldownRemaining = this.player.stats.specialCooldown;
    const bolts = 12 + this.player.stats.projectileCount * 2;
    for (let index = 0; index < bolts; index += 1) {
      const angle = (Math.PI * 2 * index) / bolts;
      const projectile = new Projectile(this, this.player.x, this.player.y);
      projectile.fromPlayer = true;
      projectile.damage = this.player.stats.weaponDamage * 0.9;
      projectile.life = 0.75;
      projectile.velocity.set(Math.cos(angle), Math.sin(angle)).scale(this.player.stats.projectileSpeed * 0.82);
      projectile.rotation = angle + Math.PI / 2;
      projectile.chainsRemaining = this.player.stats.chainHits;
      projectile.splitCount = this.player.stats.projectileSplit;
      projectile.setTint(this.theme.colors.xp);
      this.projectiles.push(projectile);
    }
    this.emitBurst(this.player.x, this.player.y, this.theme.colors.arenaGlow, 24);
    this.cameras.main.shake(140, 0.0035);
  }

  private handleWeaponFire(): void {
    if (this.player.fireCooldownRemaining > 0) {
      return;
    }

    this.player.fireCooldownRemaining = 1 / this.player.stats.fireRate;
    const projectilesPerVolley = this.player.stats.projectileCount;
    const spread = 0.18;

    for (let index = 0; index < projectilesPerVolley; index += 1) {
      const offset = projectilesPerVolley === 1 ? 0 : Phaser.Math.Linear(-spread, spread, index / (projectilesPerVolley - 1));
      const direction = this.player.aimDirection.clone().rotate(offset);
      const projectile = new Projectile(this, this.player.x, this.player.y);
      projectile.fromPlayer = true;
      projectile.damage = this.rollDamage(this.player.stats.weaponDamage);
      projectile.life = 1.2;
      projectile.velocity.copy(direction.scale(this.player.stats.projectileSpeed));
      projectile.rotation = direction.angle() + Math.PI / 2;
      projectile.chainsRemaining = this.player.stats.chainHits;
      projectile.splitCount = this.player.stats.projectileSplit;
      projectile.setTint(this.theme.colors.arenaGlow);
      this.projectiles.push(projectile);
    }
  }

  private rollDamage(baseDamage: number): number {
    const crit = Math.random() < this.player.stats.critChance;
    return crit ? baseDamage * this.player.stats.critMultiplier : baseDamage;
  }

  private updateProjectiles(deltaSeconds: number): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index];
      projectile.update(deltaSeconds);

      if (
        projectile.life <= 0 ||
        projectile.x < -40 ||
        projectile.y < -40 ||
        projectile.x > GAME_WIDTH + 40 ||
        projectile.y > GAME_HEIGHT + 40
      ) {
        if (projectile.fromPlayer && projectile.splitCount > 0 && !projectile.hasSplit) {
          this.splitProjectile(projectile, projectile.velocity.angle());
        }
        projectile.destroy();
        this.projectiles.splice(index, 1);
        continue;
      }

      if (projectile.fromPlayer) {
        const enemy = this.enemies.find(
          (target) => Phaser.Math.Distance.Between(projectile.x, projectile.y, target.x, target.y) <= target.radius + 10
        );
        if (enemy) {
          this.damageEnemy(enemy, projectile.damage, projectile);
          if (projectile.chainsRemaining > 0) {
            this.chainDamage(enemy, projectile.damage * 0.65, projectile.chainsRemaining);
          }
          if (projectile.splitCount > 0 && !projectile.hasSplit) {
            this.splitProjectile(projectile, projectile.velocity.angle());
          }
          projectile.destroy();
          this.projectiles.splice(index, 1);
        }
      } else if (Phaser.Math.Distance.Between(projectile.x, projectile.y, this.player.x, this.player.y) <= 24) {
        this.onPlayerDamaged(12);
        projectile.destroy();
        this.projectiles.splice(index, 1);
      }
    }
  }

  private splitProjectile(projectile: Projectile, angle: number): void {
    projectile.hasSplit = true;
    for (const offset of [-0.45, 0.45]) {
      const split = new Projectile(this, projectile.x, projectile.y);
      split.fromPlayer = true;
      split.damage = projectile.damage * 0.55;
      split.life = 0.55;
      split.velocity.setToPolar(angle + offset, this.player.stats.projectileSpeed * 0.85);
      split.rotation = angle + offset + Math.PI / 2;
      split.chainsRemaining = Math.max(0, projectile.chainsRemaining - 1);
      split.splitCount = projectile.splitCount - 1;
      split.setTint(this.theme.colors.grid);
      this.projectiles.push(split);
    }
  }

  private chainDamage(originEnemy: Enemy, damage: number, chainsRemaining: number): void {
    let currentSource = originEnemy;
    let remaining = chainsRemaining;

    while (remaining > 0) {
      const nextTarget = this.enemies
        .filter((enemy) => enemy !== currentSource)
        .sort(
          (a, b) =>
            Phaser.Math.Distance.Between(currentSource.x, currentSource.y, a.x, a.y) -
            Phaser.Math.Distance.Between(currentSource.x, currentSource.y, b.x, b.y)
        )
        .find((enemy) => Phaser.Math.Distance.Between(currentSource.x, currentSource.y, enemy.x, enemy.y) < 170);

      if (!nextTarget) {
        break;
      }

      const beam = this.add.graphics();
      beam.lineStyle(2, this.theme.colors.arenaGlow, 0.65);
      beam.lineBetween(currentSource.x, currentSource.y, nextTarget.x, nextTarget.y);
      beam.setDepth(15);
      this.time.delayedCall(55, () => beam.destroy());
      this.damageEnemy(nextTarget, damage, null);
      currentSource = nextTarget;
      remaining -= 1;
    }
  }

  private updateEnemies(deltaSeconds: number): void {
    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = this.enemies[index];
      const toPlayer = new Phaser.Math.Vector2(this.player.x - enemy.x, this.player.y - enemy.y);
      const distance = Math.max(0.001, toPlayer.length());
      const direction = toPlayer.scale(1 / distance);

      if (enemy.kind === "chaser") {
        enemy.x += direction.x * enemy.speed * deltaSeconds;
        enemy.y += direction.y * enemy.speed * deltaSeconds;
      } else if (enemy.kind === "dasher") {
        enemy.attackCooldown -= deltaSeconds;
        if (enemy.windup > 0) {
          enemy.windup -= deltaSeconds;
          enemy.setScale(1.02 + enemy.windup * 0.18);
          if (enemy.windup <= 0) {
            enemy.dashTimer = 0.18;
            enemy.dashVector.copy(direction.scale(enemy.speed * 3.6));
          }
        } else if (enemy.dashTimer > 0) {
          enemy.x += enemy.dashVector.x * deltaSeconds;
          enemy.y += enemy.dashVector.y * deltaSeconds;
          enemy.dashTimer -= deltaSeconds;
          enemy.setScale(1.12);
        } else {
          enemy.setScale(0.92);
          enemy.x += direction.x * enemy.speed * deltaSeconds;
          enemy.y += direction.y * enemy.speed * deltaSeconds;
          if (enemy.attackCooldown <= 0 && distance < 280) {
            enemy.windup = 0.42;
            enemy.attackCooldown = 2.1;
          }
        }
      } else if (enemy.kind === "tank") {
        enemy.x += direction.x * enemy.speed * deltaSeconds;
        enemy.y += direction.y * enemy.speed * deltaSeconds;
      } else {
        enemy.attackCooldown -= deltaSeconds;
        enemy.orbitAngle += deltaSeconds * 0.8;
        const orbitDirection = new Phaser.Math.Vector2(Math.cos(enemy.orbitAngle), Math.sin(enemy.orbitAngle));
        const preferredDistance = 220;
        const distanceOffset = distance - preferredDistance;
        enemy.x += (orbitDirection.x * enemy.speed * 0.8 + direction.x * distanceOffset * 0.55) * deltaSeconds;
        enemy.y += (orbitDirection.y * enemy.speed * 0.8 + direction.y * distanceOffset * 0.55) * deltaSeconds;

        if (enemy.windup > 0) {
          enemy.windup -= deltaSeconds;
          if (enemy.windup <= 0) {
            this.spawnBossBurst(enemy);
            enemy.dashVector.copy(direction.scale(enemy.speed * 5));
            enemy.dashTimer = 0.22;
          }
        } else if (enemy.dashTimer > 0) {
          enemy.x += enemy.dashVector.x * deltaSeconds;
          enemy.y += enemy.dashVector.y * deltaSeconds;
          enemy.dashTimer -= deltaSeconds;
        } else if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 3.6;
          enemy.windup = 0.95;
          this.hitStop(0.05);
          this.cameras.main.shake(160, 0.0024);
          this.audioSystem.play("boss-spawn");
        }
      }

      const combinedRadius = enemy.kind === "boss" ? enemy.radius : enemy.radius + 18;
      if (distance < combinedRadius) {
        this.onPlayerDamaged(enemy.contactDamage * deltaSeconds * 1.6);
      }

      enemy.rotation += deltaSeconds * (enemy.kind === "tank" ? 0.25 : 0.9);
      enemy.setPosition(clamp(enemy.x, 24, GAME_WIDTH - 24), clamp(enemy.y, 24, GAME_HEIGHT - 24));
    }
  }

  private spawnBossBurst(enemy: Enemy): void {
    for (let index = 0; index < 18; index += 1) {
      const angle = (Math.PI * 2 * index) / 18;
      const projectile = new Projectile(this, enemy.x, enemy.y);
      projectile.fromPlayer = false;
      projectile.damage = 1;
      projectile.life = 2.4;
      projectile.velocity.setToPolar(angle, 260);
      projectile.rotation = angle + Math.PI / 2;
      projectile.setTint(this.theme.colors.boss);
      this.projectiles.push(projectile);
    }
    this.emitBurst(enemy.x, enemy.y, this.theme.colors.boss, 18);
  }

  private updateXpOrbs(deltaSeconds: number): void {
    for (let index = this.xpOrbs.length - 1; index >= 0; index -= 1) {
      const orb = this.xpOrbs[index];
      const toPlayer = new Phaser.Math.Vector2(this.player.x - orb.x, this.player.y - orb.y);
      const distance = toPlayer.length();

      if (distance < 26) {
        const leveledUp = this.player.gainXp(orb.value);
        orb.destroy();
        this.xpOrbs.splice(index, 1);
        if (leveledUp) {
          this.openUpgradeSelection();
          break;
        }
        continue;
      }

      if (distance < 190) {
        toPlayer.normalize();
        orb.x += toPlayer.x * lerp(90, 360, 1 - distance / 190) * deltaSeconds;
        orb.y += toPlayer.y * lerp(90, 360, 1 - distance / 190) * deltaSeconds;
      } else {
        orb.x += Math.cos(orb.driftAngle + this.time.now * 0.0008) * 8 * deltaSeconds;
        orb.y += Math.sin(orb.driftAngle + this.time.now * 0.0007) * 8 * deltaSeconds;
      }
    }
  }

  private handleWaveProgress(deltaSeconds: number): void {
    const bossAlive = this.enemies.some((enemy) => enemy.kind === "boss");
    const waveResult = this.waveSystem.update(deltaSeconds, bossAlive);

    if (waveResult.waveChanged) {
      this.player.score += 80 * this.waveSystem.wave;
      this.flashBanner(`WAVE ${this.waveSystem.wave}`);
    }

    if (waveResult.shouldSpawnBoss) {
      this.flashBanner("VAULT BOSS");
      this.spawnEnemy("boss");
      this.hitStop(0.08);
      return;
    }

    for (let count = 0; count < waveResult.spawnCount; count += 1) {
      const roll = Math.random();
      let kind: EnemyKind = "chaser";
      if (this.waveSystem.wave >= 3 && roll > 0.66) {
        kind = "dasher";
      }
      if (this.waveSystem.wave >= 4 && roll > 0.86) {
        kind = "tank";
      }
      this.spawnEnemy(kind);
    }
  }

  private flashBanner(text: string): void {
    const banner = this.add.text(GAME_WIDTH / 2, 88, text, {
      fontFamily: "Orbitron, sans-serif",
      fontSize: "30px",
      color: this.theme.colors.accentSoft,
      stroke: "#081019",
      strokeThickness: 8
    });
    banner.setOrigin(0.5);
    banner.setDepth(30);
    this.tweens.add({
      targets: banner,
      y: 72,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.9, to: 1 },
      duration: 200,
      yoyo: false,
      onComplete: () => {
        this.tweens.add({
          targets: banner,
          alpha: 0,
          y: 42,
          delay: 550,
          duration: 300,
          onComplete: () => banner.destroy()
        });
      }
    });
  }

  private spawnEnemy(kind: EnemyKind): void {
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (edge === 0) {
      x = randomRange(48, GAME_WIDTH - 48);
      y = -32;
    } else if (edge === 1) {
      x = GAME_WIDTH + 32;
      y = randomRange(48, GAME_HEIGHT - 48);
    } else if (edge === 2) {
      x = randomRange(48, GAME_WIDTH - 48);
      y = GAME_HEIGHT + 32;
    } else {
      x = -32;
      y = randomRange(48, GAME_HEIGHT - 48);
    }

    const enemy = new Enemy(this, x, y, kind, 1 + this.waveSystem.wave * 0.11, kind === "boss" ? this.theme.colors.boss : this.theme.colors.arenaGlow);
    this.enemies.push(enemy);
  }

  private damageEnemy(enemy: Enemy, damage: number, projectile: Projectile | null): void {
    const died = enemy.takeDamage(damage);
    enemy.setScale(enemy.kind === "boss" ? 1.78 : enemy.kind === "tank" ? 1.24 : 1.08);
    this.time.delayedCall(60, () => {
      if (enemy.active) {
        enemy.setScale(enemy.kind === "boss" ? 1.7 : enemy.kind === "tank" ? 1.18 : enemy.kind === "dasher" ? 0.92 : 0.95);
      }
    });
    this.emitBurst(enemy.x, enemy.y, this.theme.colors.arenaGlow, enemy.kind === "boss" ? 10 : 5);
    this.audioSystem.play("hit");
    this.cameras.main.shake(enemy.kind === "boss" ? 80 : 45, enemy.kind === "boss" ? 0.003 : 0.0015);
    this.hitStop(enemy.kind === "boss" ? 0.04 : 0.018);

    if (this.player.stats.lifesteal > 0) {
      this.player.heal(damage * this.player.stats.lifesteal);
    }

    if (!died) {
      return;
    }

    const enemyIndex = this.enemies.indexOf(enemy);
    if (enemyIndex >= 0) {
      this.enemies.splice(enemyIndex, 1);
    }

    if (enemy.kind === "boss") {
      this.player.bossesDefeated += 1;
      this.flashBanner("BOSS CLEARED");
    }

    this.player.score += enemy.scoreReward;
    this.player.enemiesDefeated += 1;
    for (let count = 0; count < (enemy.kind === "boss" ? 12 : enemy.kind === "tank" ? 4 : 2); count += 1) {
      const orb = new XPOrb(this, enemy.x + randomRange(-12, 12), enemy.y + randomRange(-12, 12));
      orb.value = enemy.kind === "boss" ? 8 : enemy.xpReward;
      orb.setTint(this.theme.colors.xp);
      this.xpOrbs.push(orb);
    }

    enemy.destroy();

    if (projectile && projectile.splitCount > 0 && !projectile.hasSplit) {
      this.splitProjectile(projectile, projectile.velocity.angle());
    }
  }

  private onPlayerDamaged(amount: number): void {
    const died = this.player.takeDamage(amount);
    if (!died) {
      this.cameras.main.shake(120, 0.0035);
      return;
    }

    this.audioSystem.play("game-over");
    this.phase = "gameover";
    this.runStats = {
      score: Math.floor(this.player.score),
      survivalTime: this.player.survivalTime,
      waveReached: this.waveSystem.wave,
      levelReached: this.player.level,
      enemiesDefeated: this.player.enemiesDefeated,
      bossesDefeated: this.player.bossesDefeated,
      upgradesTaken: [...this.player.upgradesTaken]
    };
    this.meta = recordRun(this.runStats);
    this.emitBurst(this.player.x, this.player.y, this.theme.colors.boss, 28);
    this.emitUiState();
  }

  private openUpgradeSelection(): void {
    this.audioSystem.play("level-up");
    this.upgradeChoices = getUpgradeChoices(this.player.upgradeStacks, 3);
    if (this.upgradeChoices.length === 0) {
      this.player.heal(10);
      this.phase = "running";
      this.emitUiState();
      return;
    }
    this.phase = "levelup";
    this.hitStop(0.06);
    this.emitUiState();
  }

  private applyChosenUpgrade(upgradeId: UpgradeId): void {
    if (this.phase !== "levelup") {
      return;
    }

    this.player.stats = applyUpgrade(this.player.stats, upgradeId);
    this.player.upgradeStacks[upgradeId] = (this.player.upgradeStacks[upgradeId] ?? 0) + 1;
    this.player.upgradesTaken.push(upgradeId);
    if (upgradeId === "reinforced_shell") {
      this.player.health = Math.min(this.player.stats.maxHealth, this.player.health + 20);
    }
    this.upgradeChoices = [];
    this.phase = "running";
    this.emitBurst(this.player.x, this.player.y, this.theme.colors.xp, 16);
    this.emitUiState();
  }

  private emitBurst(x: number, y: number, tint: number, quantity: number): void {
    this.particleEmitter.setPosition(x, y);
    this.particleEmitter.explode(quantity, x, y);
  }

  private hitStop(duration: number): void {
    this.hitStopTimer = Math.max(this.hitStopTimer, duration);
  }

  private emitUiState(): void {
    this.bridge.emitState({
      phase: this.phase,
      hud: {
        ...DEFAULT_HUD_STATE,
        health: Math.round(this.player.health),
        maxHealth: this.player.stats.maxHealth,
        xp: this.player.xp,
        xpToNext: this.player.xpToNext,
        level: this.player.level,
        score: Math.floor(this.player.score),
        survivalTime: this.player.survivalTime,
        wave: this.waveSystem.wave,
        dashCooldown: this.player.dashCooldownRemaining,
        dashCooldownMax: this.player.stats.dashCooldown,
        specialCooldown: this.player.specialCooldownRemaining,
        specialCooldownMax: this.player.stats.specialCooldown,
        enemiesDefeated: this.player.enemiesDefeated,
        bossAlive: this.enemies.some((enemy) => enemy.kind === "boss")
      },
      upgrades: this.upgradeChoices,
      runStats: this.runStats,
      meta: this.meta,
      canResume: this.phase === "paused",
      versionLabel: GAME_VERSION_LABEL
    });
  }
}
