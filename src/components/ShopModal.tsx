import React, { useState } from 'react';
import { X, Shield, Compass, Zap, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { PlayerUpgrades, UPGRADE_CONFIG } from '../game/types';
import { getUpgrades, saveUpgrades, getTotalCoins, spendCoins } from '../game/storage';
import { audio } from '../game/audio';

interface ShopModalProps {
  onClose: () => void;
  onSkinChanged: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose, onSkinChanged }) => {
  const [upgrades, setUpgradesState] = useState<PlayerUpgrades>(getUpgrades());
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const [activeTab, setActiveTab] = useState<'powerups' | 'skins'>('powerups');

  const buyUpgrade = (key: 'shieldLevel' | 'magnetLevel' | 'boostLevel' | 'multiplierLevel', cost: number) => {
    if (coins < cost) return;

    if (spendCoins(cost)) {
      audio.playRelic();
      const updated = { ...upgrades, [key]: upgrades[key] + 1 };
      setUpgradesState(updated);
      saveUpgrades(updated);
      setCoins(getTotalCoins());
    }
  };

  const selectSkin = (skin: 'adventurer' | 'shadow' | 'golden') => {
    audio.playClick();
    const updated = { ...upgrades, selectedSkin: skin };
    setUpgradesState(updated);
    saveUpgrades(updated);
    onSkinChanged();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black font-cinzel text-amber-300">EXPLORER'S BAZAAR</h2>
            {/* Coins Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/40 text-yellow-300 text-xs font-bold font-game-num shadow-inner">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-yellow-300" />
              <span>{coins.toLocaleString()}</span>
            </div>
          </div>

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

        {/* Tabs */}
        <div className="flex gap-2 my-4 bg-stone-950/60 p-1 rounded-xl border border-stone-800/80">
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('powerups');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'powerups'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Power-Up Upgrades
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('skins');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'skins'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Adventurer Outfits
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {activeTab === 'powerups' ? (
            <>
              {/* Shield Upgrade */}
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800/50 text-sky-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-200">{UPGRADE_CONFIG.shield.name}</div>
                    <div className="text-xs text-stone-400">
                      Duration: {UPGRADE_CONFIG.shield.baseDuration + (upgrades.shieldLevel - 1) * UPGRADE_CONFIG.shield.perLevel}s
                    </div>
                    {/* Level pips */}
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3.5 h-1.5 rounded-full ${
                            lvl <= upgrades.shieldLevel ? 'bg-sky-400' : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {upgrades.shieldLevel < UPGRADE_CONFIG.shield.maxLevel ? (
                  <button
                    onClick={() => buyUpgrade('shieldLevel', UPGRADE_CONFIG.shield.cost * upgrades.shieldLevel)}
                    disabled={coins < UPGRADE_CONFIG.shield.cost * upgrades.shieldLevel}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>{UPGRADE_CONFIG.shield.cost * upgrades.shieldLevel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40">
                    MAX
                  </span>
                )}
              </div>

              {/* Magnet Upgrade */}
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-pink-950 border border-pink-800/50 text-pink-400">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-200">{UPGRADE_CONFIG.magnet.name}</div>
                    <div className="text-xs text-stone-400">
                      Duration: {UPGRADE_CONFIG.magnet.baseDuration + (upgrades.magnetLevel - 1) * UPGRADE_CONFIG.magnet.perLevel}s
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3.5 h-1.5 rounded-full ${
                            lvl <= upgrades.magnetLevel ? 'bg-pink-400' : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {upgrades.magnetLevel < UPGRADE_CONFIG.magnet.maxLevel ? (
                  <button
                    onClick={() => buyUpgrade('magnetLevel', UPGRADE_CONFIG.magnet.cost * upgrades.magnetLevel)}
                    disabled={coins < UPGRADE_CONFIG.magnet.cost * upgrades.magnetLevel}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>{UPGRADE_CONFIG.magnet.cost * upgrades.magnetLevel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40">
                    MAX
                  </span>
                )}
              </div>

              {/* Speed Boost Upgrade */}
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-800/50 text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-200">{UPGRADE_CONFIG.boost.name}</div>
                    <div className="text-xs text-stone-400">
                      Duration: {UPGRADE_CONFIG.boost.baseDuration + (upgrades.boostLevel - 1) * UPGRADE_CONFIG.boost.perLevel}s
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3.5 h-1.5 rounded-full ${
                            lvl <= upgrades.boostLevel ? 'bg-amber-400' : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {upgrades.boostLevel < UPGRADE_CONFIG.boost.maxLevel ? (
                  <button
                    onClick={() => buyUpgrade('boostLevel', UPGRADE_CONFIG.boost.cost * upgrades.boostLevel)}
                    disabled={coins < UPGRADE_CONFIG.boost.cost * upgrades.boostLevel}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>{UPGRADE_CONFIG.boost.cost * upgrades.boostLevel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40">
                    MAX
                  </span>
                )}
              </div>

              {/* 2X Multiplier Upgrade */}
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800/50 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-200">{UPGRADE_CONFIG.multiplier.name}</div>
                    <div className="text-xs text-stone-400">
                      Duration: {UPGRADE_CONFIG.multiplier.baseDuration + (upgrades.multiplierLevel - 1) * UPGRADE_CONFIG.multiplier.perLevel}s
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3.5 h-1.5 rounded-full ${
                            lvl <= upgrades.multiplierLevel ? 'bg-purple-400' : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {upgrades.multiplierLevel < UPGRADE_CONFIG.multiplier.maxLevel ? (
                  <button
                    onClick={() => buyUpgrade('multiplierLevel', UPGRADE_CONFIG.multiplier.cost * upgrades.multiplierLevel)}
                    disabled={coins < UPGRADE_CONFIG.multiplier.cost * upgrades.multiplierLevel}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>{UPGRADE_CONFIG.multiplier.cost * upgrades.multiplierLevel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40">
                    MAX
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Skin 1: Jade Behemoth (Hulk) */}
              <div
                onClick={() => selectSkin('adventurer')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  upgrades.selectedSkin === 'adventurer' || upgrades.selectedSkin === 'jade'
                    ? 'bg-emerald-950/50 border-emerald-500/80 shadow-lg'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/60 flex items-center justify-center text-emerald-400 font-black text-sm">
                    JB
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-200">Jade Behemoth</div>
                    <div className="text-xs text-stone-400">Emerald gamma brute with torn purple shorts</div>
                  </div>
                </div>

                {upgrades.selectedSkin === 'adventurer' || upgrades.selectedSkin === 'jade' ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 font-medium">Equip</span>
                )}
              </div>

              {/* Skin 2: Crimson Rager (Red Hulk) */}
              <div
                onClick={() => selectSkin('shadow')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  upgrades.selectedSkin === 'shadow' || upgrades.selectedSkin === 'crimson'
                    ? 'bg-red-950/50 border-red-500/80 shadow-lg'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-600/60 flex items-center justify-center text-red-400 font-black text-sm">
                    CR
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-200">Crimson Rager</div>
                    <div className="text-xs text-stone-400">Furious magma red titan with scorched obsidian shorts</div>
                  </div>
                </div>

                {upgrades.selectedSkin === 'shadow' || upgrades.selectedSkin === 'crimson' ? (
                  <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 font-medium">Equip</span>
                )}
              </div>

              {/* Skin 3: Gladiator Colossus */}
              <div
                onClick={() => selectSkin('golden')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  upgrades.selectedSkin === 'golden' || upgrades.selectedSkin === 'gladiator'
                    ? 'bg-amber-950/50 border-amber-500/80 shadow-lg'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-yellow-500/80 flex items-center justify-center text-yellow-300 font-black text-sm">
                    GC
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-300">Gladiator Colossus</div>
                    <div className="text-xs text-stone-400">Armored battle titan with bronze leather kilt</div>
                  </div>
                </div>

                {upgrades.selectedSkin === 'golden' || upgrades.selectedSkin === 'gladiator' ? (
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 font-medium">Equip</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-sm transition-colors cursor-pointer mt-4"
        >
          Close Bazaar
        </button>
      </div>
    </div>
  );
};
