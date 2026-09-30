import { GameSettings, PlayerUpgrades } from './types';

const STORAGE_KEYS = {
  HIGH_SCORE: 'relic_runner_high_score',
  TOTAL_COINS: 'relic_runner_total_coins',
  SETTINGS: 'relic_runner_settings',
  UPGRADES: 'relic_runner_upgrades',
  TUTORIAL_SEEN: 'relic_runner_tutorial_seen',
};

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.6,
  sfxVolume: 0.8,
  screenShake: true,
  touchControls: true,
  soundEnabled: true,
};

export const DEFAULT_UPGRADES: PlayerUpgrades = {
  shieldLevel: 1,
  magnetLevel: 1,
  boostLevel: 1,
  multiplierLevel: 1,
  selectedSkin: 'adventurer',
};

export function getHighScore(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): boolean {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function getTotalCoins(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.TOTAL_COINS);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function addCoins(amount: number): number {
  try {
    const total = getTotalCoins() + amount;
    localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, total.toString());
    return total;
  } catch {
    return amount;
  }
}

export function spendCoins(amount: number): boolean {
  try {
    const total = getTotalCoins();
    if (total >= amount) {
      localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, (total - amount).toString());
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function getSettings(): GameSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getUpgrades(): PlayerUpgrades {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UPGRADES);
    if (data) {
      return { ...DEFAULT_UPGRADES, ...JSON.parse(data) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_UPGRADES;
}

export function saveUpgrades(upgrades: PlayerUpgrades): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(upgrades));
  } catch {
    // ignore
  }
}

export function isTutorialSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_SEEN) === 'true';
  } catch {
    return false;
  }
}

export function setTutorialSeen(seen = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_SEEN, seen ? 'true' : 'false');
  } catch {
    // ignore
  }
}
