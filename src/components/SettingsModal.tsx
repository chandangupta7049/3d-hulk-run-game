import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Vibrate } from 'lucide-react';
import { GameSettings } from '../game/types';
import { getSettings, saveSettings } from '../game/storage';
import { audio } from '../game/audio';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsChanged: (settings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSettingsChanged }) => {
  const [settings, setLocalSettings] = useState<GameSettings>(getSettings());

  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    setLocalSettings(updated);
    saveSettings(updated);
    onSettingsChanged(updated);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <h2 className="text-xl font-black font-cinzel text-amber-300">SETTINGS</h2>
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

        <div className="flex flex-col gap-5 py-5">
          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-800 text-amber-400">
                {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-200">Master Audio</div>
                <div className="text-xs text-stone-400">Enable synthesized audio and music</div>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playClick();
                update({ soundEnabled: !settings.soundEnabled });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.soundEnabled ? 'bg-amber-500 justify-end' : 'bg-stone-700 justify-start'
              }`}
            >
              <div className="bg-stone-950 w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>

          {/* SFX Volume Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium text-stone-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                Sound Effects
              </span>
              <span className="font-game-num">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => update({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Music Volume Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium text-stone-300">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-stone-400" />
                Tribal Jungle Music
              </span>
              <span className="font-game-num">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => update({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Camera Shake */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-800 text-stone-300">
                <Vibrate className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-200">Camera Shake</div>
                <div className="text-xs text-stone-400">Cinematic rumble on crashes & boosts</div>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playClick();
                update({ screenShake: !settings.screenShake });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.screenShake ? 'bg-amber-500 justify-end' : 'bg-stone-700 justify-start'
              }`}
            >
              <div className="bg-stone-950 w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>

          {/* On-Screen Touch Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-800 text-stone-300">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-200">On-Screen Controls</div>
                <div className="text-xs text-stone-400">Display virtual D-pad and jump/slide buttons</div>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playClick();
                update({ touchControls: !settings.touchControls });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.touchControls ? 'bg-amber-500 justify-end' : 'bg-stone-700 justify-start'
              }`}
            >
              <div className="bg-stone-950 w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-sm transition-colors cursor-pointer mt-2"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};
