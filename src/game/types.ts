export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type PlayerAction = 'RUN' | 'JUMP' | 'SLIDE' | 'CRASH';

export type Lane = -1 | 0 | 1;

export const LANE_WIDTH = 2.4;
export const LANE_POSITIONS: Record<Lane, number> = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH,
};

export type PowerUpType = 'SHIELD' | 'MAGNET' | 'BOOST' | 'MULTIPLIER';

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;
  maxDuration: number;
}

export type CollectibleType = 'COIN' | 'EMERALD' | 'RUBY';

export interface CollectibleData {
  type: CollectibleType;
  value: number;
  points: number;
}

export type ObstacleType =
  | 'FALLEN_LOG'       // Jump or change lane
  | 'SPIKE_GATE'       // Slide or change lane
  | 'ANCIENT_PILLAR'   // Full block, change lane
  | 'PATH_GAP'         // Jump required
  | 'FIRE_BRAZIER'     // Jump or change lane
  | 'SWINGING_BLADE';  // Time slide or change lane

export interface GameStats {
  score: number;
  coins: number;
  distance: number;
  speed: number;
  highScore: number;
  totalCoins: number;
  activePowerUps: Record<PowerUpType, ActivePowerUp | null>;
  consecutiveCoins: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  touchControls: boolean;
  soundEnabled: boolean;
}

export interface PlayerUpgrades {
  shieldLevel: number;
  magnetLevel: number;
  boostLevel: number;
  multiplierLevel: number;
  selectedSkin: 'adventurer' | 'shadow' | 'golden' | 'jade' | 'crimson' | 'gladiator';
}

export const UPGRADE_CONFIG = {
  shield: { name: 'Sun Shield', baseDuration: 10, perLevel: 3, maxLevel: 5, cost: 100 },
  magnet: { name: 'Relic Magnet', baseDuration: 10, perLevel: 2.5, maxLevel: 5, cost: 100 },
  boost: { name: 'Speed Rush', baseDuration: 5, perLevel: 1.5, maxLevel: 5, cost: 150 },
  multiplier: { name: 'Double Score', baseDuration: 12, perLevel: 3, maxLevel: 5, cost: 120 },
};
