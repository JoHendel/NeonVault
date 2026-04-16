import type { MetaProgress, RunStats, ThemeId } from "../types/game";

const STORAGE_KEY = "neon-vault-meta";

const defaultMeta: MetaProgress = {
  bestScore: 0,
  bestTime: 0,
  unlockedThemes: ["cobalt"],
  currentTheme: "cobalt",
  runsPlayed: 0
};

const themeUnlocks: Record<ThemeId, number> = {
  cobalt: 0,
  sunset: 1200,
  glacier: 2500,
  ultraviolet: 4200
};

function normalizeMeta(meta: Partial<MetaProgress> | null): MetaProgress {
  const merged: MetaProgress = {
    ...defaultMeta,
    ...meta,
    unlockedThemes: Array.isArray(meta?.unlockedThemes) ? meta!.unlockedThemes : defaultMeta.unlockedThemes
  };

  const unlockedThemes = (Object.entries(themeUnlocks) as [ThemeId, number][])
    .filter(([, score]) => merged.bestScore >= score)
    .map(([themeId]) => themeId);

  if (!unlockedThemes.includes("cobalt")) {
    unlockedThemes.unshift("cobalt");
  }

  if (!unlockedThemes.includes(merged.currentTheme)) {
    merged.currentTheme = unlockedThemes[0];
  }

  return {
    ...merged,
    unlockedThemes
  };
}

export function loadMeta(): MetaProgress {
  if (typeof window === "undefined") {
    return defaultMeta;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return normalizeMeta(raw ? (JSON.parse(raw) as Partial<MetaProgress>) : null);
  } catch {
    return defaultMeta;
  }
}

export function saveMeta(meta: MetaProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeMeta(meta)));
}

export function recordRun(run: RunStats): MetaProgress {
  const current = loadMeta();
  const next = normalizeMeta({
    ...current,
    bestScore: Math.max(current.bestScore, run.score),
    bestTime: Math.max(current.bestTime, run.survivalTime),
    runsPlayed: current.runsPlayed + 1
  });
  saveMeta(next);
  return next;
}

export function setTheme(themeId: ThemeId): MetaProgress {
  const current = loadMeta();
  if (!current.unlockedThemes.includes(themeId)) {
    return current;
  }

  const next = normalizeMeta({
    ...current,
    currentTheme: themeId
  });
  saveMeta(next);
  return next;
}
