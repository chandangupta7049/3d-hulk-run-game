import React from 'react';
import { Play, Trophy, ShoppingBag, Settings as SettingsIcon, HelpCircle, Flame } from 'lucide-react';
import { audio } from '../game/audio';

interface MainMenuProps {
  highScore: number;
  totalCoins: number;
  onStart: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  totalCoins,
  onStart,
  onOpenShop,
  onOpenSettings,
  onOpenTutorial,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/80 backdrop-blur-[2px]">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Ancient Relic Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-400 text-xs font-semibold mb-4 tracking-wider uppercase shadow-lg">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          <span>Ancient Jungle Odyssey</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-amber-300 to-amber-500 drop-shadow-[0_4px_16px_rgba(34,197,94,0.4)] tracking-tight leading-tight">
          RELIC RUSH 3D
        </h1>
        <p className="text-stone-300 text-sm mt-1 mb-6 font-medium">
          Unleash the Titan · Smash the ruins · Claim the golden relics
        </p>

        {/* High Score & Total Gold Stat Cards */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md shadow-md">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Record</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-game-num">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md shadow-md">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-yellow-300" />
              <span>Total Gold</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-yellow-300 font-game-num">
              {totalCoins.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Primary START Action Button */}
        <button
          onClick={() => {
            audio.playClick();
            onStart();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 active:scale-[0.98] text-stone-950 font-black text-lg sm:text-xl shadow-[0_8px_30px_rgba(217,119,6,0.5)] transition-all cursor-pointer flex items-center justify-center gap-3 border border-yellow-200/60 uppercase tracking-wide group"
        >
          <Play className="w-6 h-6 fill-stone-950 group-hover:scale-110 transition-transform" />
          <span>Unleash The Behemoth</span>
        </button>

        {/* Secondary Menu Buttons */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-4">
          <button
            onClick={() => {
              audio.playClick();
              onOpenShop();
            }}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-stone-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold">Upgrades</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenTutorial();
            }}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-stone-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-semibold">How to Play</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-stone-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <SettingsIcon className="w-5 h-5 text-stone-400" />
            <span className="text-xs font-semibold">Settings</span>
          </button>
        </div>

        {/* Controls Cheatsheet */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-stone-400 bg-stone-950/60 py-2.5 px-4 rounded-xl border border-stone-800/80">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono text-[10px]">A</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono text-[10px]">D</kbd>
            <span>Change Lane</span>
          </div>
          <span className="text-stone-700">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono text-[10px]">W</kbd>
            <span>Jump</span>
          </div>
          <span className="text-stone-700">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono text-[10px]">S</kbd>
            <span>Slide</span>
          </div>
        </div>
      </div>
    </div>
  );
};
