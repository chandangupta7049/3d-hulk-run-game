import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, ShoppingBag, Trophy, Flame } from 'lucide-react';
import { GameStats } from '../game/types';
import { audio } from '../game/audio';

interface GameOverModalProps {
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
  onHome: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewHighScore,
  onRestart,
  onHome,
  onOpenShop,
}) => {
  useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8'],
        });
      } catch {
        // ignore
      }
    }
  }, [isNewHighScore]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Header icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-500 mb-3 shadow-lg shadow-red-950/50">
          <Flame className="w-8 h-8 fill-red-500/20" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-stone-100 tracking-tight">
          EXPEDITION ENDED
        </h2>
        <p className="text-stone-400 text-sm mt-0.5 mb-5">The ancient ruins claimed another explorer</p>

        {/* New Record Banner */}
        {isNewHighScore && (
          <div className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-500/60 text-amber-300 font-bold text-sm mb-4 flex items-center justify-center gap-2 animate-bounce">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>NEW ALL-TIME RECORD!</span>
          </div>
        )}

        {/* Score & Run Breakdown */}
        <div className="w-full bg-stone-900/90 rounded-2xl border border-stone-800 p-4 mb-6 shadow-xl">
          <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1">
            Total Score
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 font-game-num tracking-tight mb-4">
            {stats.score.toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-800 text-left">
            <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block mb-0.5">
                Distance
              </span>
              <span className="text-lg font-bold text-stone-200 font-game-num">
                {stats.distance} <span className="text-xs font-normal text-stone-500">meters</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block mb-0.5">
                Gold Coins
              </span>
              <span className="text-lg font-bold text-yellow-300 font-game-num flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-yellow-300 inline-block" />
                +{stats.coins}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 active:scale-[0.98] text-stone-950 font-black text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <RotateCcw className="w-5 h-5 fill-stone-950" />
            <span>Play Again</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                audio.playClick();
                onOpenShop();
              }}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-stone-200 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Upgrades</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onHome();
              }}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-stone-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
