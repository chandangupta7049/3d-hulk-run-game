import React from 'react';
import { X, ArrowUpDown, ArrowLeftRight, Shield, Zap, Compass, Sparkles } from 'lucide-react';
import { audio } from '../game/audio';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <h2 className="text-xl font-black font-cinzel text-amber-300">SURVIVAL MANUAL</h2>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 py-4 flex flex-col gap-4 text-left">
          {/* Movement controls */}
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Lane Switching</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-2">
              Switch between the 3 path lanes to dodge obstacles and grab coin lines.
            </p>
            <div className="flex gap-2 text-[11px] text-stone-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200">A / D</span>
              <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200">← / →</span>
              <span>or Swipe Left / Right</span>
            </div>
          </div>

          {/* Jump & Slide */}
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ArrowUpDown className="w-4 h-4" />
              <span>Jump & Knee-Slide</span>
            </div>
            <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
              <div>
                <span className="font-bold text-amber-300">Jump:</span> Leap over fallen logs, fire pits, and bridge gaps.
                <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200">W / Space / ↑ / Swipe Up</span>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-800/60">
                <span className="font-bold text-amber-300">Slide:</span> Drop low to duck under spiked arches and swinging blades.
                <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200">S / ↓ / Swipe Down</span>
                </div>
              </div>
            </div>
          </div>

          {/* Power-Ups Guide */}
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
            <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              Ancient Power-Up Relics
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Sun Shield</span>
                </div>
                <p className="text-[11px] text-stone-400">Protects against 1 obstacle collision</p>
              </div>

              <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-1.5 font-bold text-pink-400 mb-0.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Relic Magnet</span>
                </div>
                <p className="text-[11px] text-stone-400">Pulls all coins automatically</p>
              </div>

              <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Speed Rush</span>
                </div>
                <p className="text-[11px] text-stone-400">Supersonic speed + invulnerability</p>
              </div>

              <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-1.5 font-bold text-purple-400 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2X Multiplier</span>
                </div>
                <p className="text-[11px] text-stone-400">Doubles all scored points</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg mt-2"
        >
          Got It! Let's Run
        </button>
      </div>
    </div>
  );
};
