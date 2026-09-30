import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { InputController } from '../game/inputController';

interface TouchControlsProps {
  inputController: InputController;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ inputController }) => {
  const handleAction = (e: React.PointerEvent, action: 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE') => {
    e.preventDefault();
    e.stopPropagation();
    inputController.trigger(action);
  };

  return (
    <div className="absolute inset-x-0 bottom-4 px-6 flex justify-between items-end pointer-events-none z-20 select-none">
      {/* Left / Right Lateral D-Pad */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => handleAction(e, 'LEFT')}
          className="w-16 h-16 rounded-2xl bg-stone-900/75 active:bg-amber-600/70 active:scale-95 border border-stone-700/60 backdrop-blur-md flex items-center justify-center text-stone-200 shadow-xl transition-all cursor-pointer touch-none"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(e, 'RIGHT')}
          className="w-16 h-16 rounded-2xl bg-stone-900/75 active:bg-amber-600/70 active:scale-95 border border-stone-700/60 backdrop-blur-md flex items-center justify-center text-stone-200 shadow-xl transition-all cursor-pointer touch-none"
          aria-label="Move Right"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Jump / Slide Action Buttons */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => handleAction(e, 'JUMP')}
          className="w-16 h-16 rounded-2xl bg-amber-600/80 active:bg-amber-500 active:scale-95 border border-amber-400/50 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-xl shadow-amber-950/40 transition-all cursor-pointer touch-none"
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Jump</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(e, 'SLIDE')}
          className="w-16 h-16 rounded-2xl bg-stone-900/75 active:bg-amber-600/70 active:scale-95 border border-stone-700/60 backdrop-blur-md flex flex-col items-center justify-center text-stone-200 shadow-xl transition-all cursor-pointer touch-none"
          aria-label="Slide"
        >
          <ArrowDown className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Slide</span>
        </button>
      </div>
    </div>
  );
};
