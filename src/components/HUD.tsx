import React from 'react';
import { GameStats, PowerUpType } from '../game/types';
import { Pause, Shield, Zap, Compass, Sparkles } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  onPause: () => void;
}

const POWERUP_ICONS: Record<PowerUpType, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  SHIELD: {
    icon: <Shield className="w-4 h-4 text-sky-400" />,
    label: 'Shield',
    color: 'text-sky-400',
    bg: 'border-sky-500/40 bg-sky-950/60',
  },
  MAGNET: {
    icon: <Compass className="w-4 h-4 text-pink-400" />,
    label: 'Magnet',
    color: 'text-pink-400',
    bg: 'border-pink-500/40 bg-pink-950/60',
  },
  BOOST: {
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    label: 'Rush',
    color: 'text-amber-400',
    bg: 'border-amber-500/40 bg-amber-950/60',
  },
  MULTIPLIER: {
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    label: '2x Score',
    color: 'text-purple-400',
    bg: 'border-purple-500/40 bg-purple-950/60',
  },
};

export const HUD: React.FC<HUDProps> = ({ stats, onPause }) => {
  const activeKeys = (Object.keys(stats.activePowerUps) as PowerUpType[]).filter(
    (k) => stats.activePowerUps[k] !== null
  );

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* Top HUD Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Score & Distance */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-700/60 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Score</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-game-num tracking-tight">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3 px-3 py-1 bg-stone-900/60 backdrop-blur-sm rounded-lg border border-stone-800/80 w-fit text-xs font-game-num text-stone-300">
            <span>{stats.distance}m traveled</span>
            <span className="text-stone-600">·</span>
            <span className="text-stone-400">{stats.speed} m/s</span>
          </div>
        </div>

        {/* Right: Coins & Pause button */}
        <div className="flex items-center gap-3">
          {/* Coin Counter */}
          <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-600/40 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center shadow-inner shadow-yellow-200/50">
              <div className="w-3.5 h-3.5 rounded-full border border-amber-800/80" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-yellow-300 font-game-num">
              {stats.coins}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto p-2.5 bg-stone-900/80 hover:bg-stone-800/90 active:scale-95 transition-transform backdrop-blur-md rounded-xl border border-stone-700/60 text-stone-300 hover:text-white shadow-lg cursor-pointer"
            title="Pause Game (P or Esc)"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Power-Ups Banners */}
      <div className="flex flex-col gap-2 max-w-xs self-start mb-20 sm:mb-4">
        {activeKeys.map((type) => {
          const p = stats.activePowerUps[type]!;
          const info = POWERUP_ICONS[type];
          const pct = Math.max(0, Math.min(100, (p.duration / p.maxDuration) * 100));

          return (
            <div
              key={type}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-md ${info.bg} animate-pulse`}
            >
              <div className="p-1 rounded-lg bg-black/40">{info.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={info.color}>{info.label}</span>
                  <span className="text-stone-300 font-game-num">{Math.ceil(p.duration)}s</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-current transition-all duration-100 rounded-full"
                    style={{ width: `${pct}%`, color: 'inherit' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
