import React from 'react';
import { Play, RotateCcw, Home, Settings as SettingsIcon } from 'lucide-react';
import { audio } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center text-center bg-stone-900/90 border border-stone-800 p-6 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-black font-cinzel text-amber-300 tracking-tight mb-1">
          EXPEDITION PAUSED
        </h2>
        <p className="text-stone-400 text-xs mb-6">Catch your breath before braving the ruins again</p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              audio.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-black text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-stone-200 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-stone-300" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-stone-200 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <SettingsIcon className="w-4 h-4 text-stone-300" />
            <span>Audio & Controls</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onHome();
            }}
            className="w-full py-3 px-6 rounded-xl bg-stone-950/70 hover:bg-stone-950 text-stone-400 hover:text-stone-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-stone-800/80"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Quit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
