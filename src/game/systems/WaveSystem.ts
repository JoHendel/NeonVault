export class WaveSystem {
  wave = 1;

  private elapsed = 0;

  private nextWaveTime = 18;

  private spawnTimer = 0;

  private bossSpawnedThisWave = false;

  update(deltaSeconds: number, hasBossAlive: boolean): {
    waveChanged: boolean;
    spawnCount: number;
    shouldSpawnBoss: boolean;
  } {
    this.elapsed += deltaSeconds;
    let waveChanged = false;

    if (this.elapsed >= this.nextWaveTime) {
      this.wave += 1;
      this.nextWaveTime += 18;
      this.bossSpawnedThisWave = false;
      waveChanged = true;
    }

    this.spawnTimer -= deltaSeconds;

    const shouldSpawnBoss = this.wave % 5 === 0 && !this.bossSpawnedThisWave && !hasBossAlive;
    if (shouldSpawnBoss) {
      this.bossSpawnedThisWave = true;
      this.spawnTimer = 4.5;
      return { waveChanged, spawnCount: 0, shouldSpawnBoss: true };
    }

    if (this.spawnTimer > 0) {
      return { waveChanged, spawnCount: 0, shouldSpawnBoss: false };
    }

    const spawnCount = Math.min(4, 1 + Math.floor(this.wave / 2));
    const spawnRate = Math.max(0.35, 1.15 - this.wave * 0.05);
    this.spawnTimer = spawnRate;

    return {
      waveChanged,
      spawnCount,
      shouldSpawnBoss: false
    };
  }
}
