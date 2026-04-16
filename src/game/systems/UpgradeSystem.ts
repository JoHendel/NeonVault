import type { PlayerStats, UpgradeChoice, UpgradeDefinition, UpgradeId } from "../../types/game";

export const upgradeCatalog: UpgradeDefinition[] = [
  {
    id: "damage_boost",
    title: "Overclocked Rounds",
    description: "+35% weapon damage. Chunkier hits, stronger chains.",
    rarity: "common",
    maxStacks: 5,
    apply: (stats) => ({ ...stats, weaponDamage: stats.weaponDamage * 1.35 })
  },
  {
    id: "fire_rate",
    title: "Pulse Accelerator",
    description: "+18% fire rate. Faster streams mean safer spacing.",
    rarity: "common",
    maxStacks: 6,
    apply: (stats) => ({ ...stats, fireRate: stats.fireRate * 1.18 })
  },
  {
    id: "move_speed",
    title: "Afterimage Drive",
    description: "+26 move speed. Slicker strafes and cleaner dodges.",
    rarity: "common",
    maxStacks: 4,
    apply: (stats) => ({ ...stats, moveSpeed: stats.moveSpeed + 26 })
  },
  {
    id: "dash_distance",
    title: "Vector Thrusters",
    description: "+42 dash distance. Better gap creation under pressure.",
    rarity: "rare",
    maxStacks: 4,
    apply: (stats) => ({ ...stats, dashDistance: stats.dashDistance + 42 })
  },
  {
    id: "dash_cooldown",
    title: "Coolant Loop",
    description: "-0.25s dash cooldown. Keeps tempo high in late waves.",
    rarity: "rare",
    maxStacks: 4,
    apply: (stats) => ({ ...stats, dashCooldown: Math.max(1.1, stats.dashCooldown - 0.25) })
  },
  {
    id: "chain_arc",
    title: "Chain Arc",
    description: "Bullets jump to an extra nearby target on hit.",
    rarity: "epic",
    maxStacks: 3,
    apply: (stats) => ({ ...stats, chainHits: stats.chainHits + 1 })
  },
  {
    id: "splitter",
    title: "Splitter Core",
    description: "Killed or expired shots split into two neon shards.",
    rarity: "epic",
    maxStacks: 2,
    apply: (stats) => ({ ...stats, projectileSplit: stats.projectileSplit + 1 })
  },
  {
    id: "extra_shot",
    title: "Twin Fang Array",
    description: "+1 projectile per volley. Huge synergy with crit and split.",
    rarity: "rare",
    maxStacks: 3,
    apply: (stats) => ({ ...stats, projectileCount: stats.projectileCount + 1 })
  },
  {
    id: "lifesteal",
    title: "Vampiric Circuit",
    description: "Heal for 4% of damage dealt. Aggression sustains runs.",
    rarity: "epic",
    maxStacks: 3,
    apply: (stats) => ({ ...stats, lifesteal: stats.lifesteal + 0.04 })
  },
  {
    id: "crit_chance",
    title: "Critical Mass",
    description: "+8% crit chance. Critical hits strike for 1.9x damage.",
    rarity: "rare",
    maxStacks: 5,
    apply: (stats) => ({ ...stats, critChance: stats.critChance + 0.08 })
  },
  {
    id: "overcharge",
    title: "Nova Capacitor",
    description: "-0.9s special cooldown and +18 blast radius.",
    rarity: "rare",
    maxStacks: 4,
    apply: (stats) => ({
      ...stats,
      specialCooldown: Math.max(2.8, stats.specialCooldown - 0.9),
      specialRadius: stats.specialRadius + 18
    })
  },
  {
    id: "reinforced_shell",
    title: "Reinforced Shell",
    description: "+20 max health and a stronger recovery buffer.",
    rarity: "common",
    maxStacks: 4,
    apply: (stats) => ({ ...stats, maxHealth: stats.maxHealth + 20 })
  }
];

export function getUpgradeDefinition(id: UpgradeId): UpgradeDefinition {
  const found = upgradeCatalog.find((upgrade) => upgrade.id === id);
  if (!found) {
    throw new Error(`Unknown upgrade id: ${id}`);
  }
  return found;
}

export function getUpgradeChoices(stacks: Partial<Record<UpgradeId, number>>, count = 3): UpgradeChoice[] {
  const weightedPool = upgradeCatalog
    .filter((upgrade) => (stacks[upgrade.id] ?? 0) < upgrade.maxStacks)
    .flatMap((upgrade) => {
      const weight = upgrade.rarity === "common" ? 4 : upgrade.rarity === "rare" ? 3 : 2;
      return Array.from({ length: weight }, () => upgrade);
    });

  const picks: UpgradeDefinition[] = [];

  while (picks.length < count && weightedPool.length > 0) {
    const index = Math.floor(Math.random() * weightedPool.length);
    const picked = weightedPool[index];
    if (!picks.some((item) => item.id === picked.id)) {
      picks.push(picked);
    }
    for (let poolIndex = weightedPool.length - 1; poolIndex >= 0; poolIndex -= 1) {
      if (weightedPool[poolIndex].id === picked.id) {
        weightedPool.splice(poolIndex, 1);
      }
    }
  }

  return picks.map((upgrade) => ({
    id: upgrade.id,
    title: upgrade.title,
    description: upgrade.description,
    rarity: upgrade.rarity
  }));
}

export function applyUpgrade(stats: PlayerStats, upgradeId: UpgradeId): PlayerStats {
  return getUpgradeDefinition(upgradeId).apply(stats);
}
