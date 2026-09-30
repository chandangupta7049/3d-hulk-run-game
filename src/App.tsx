/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { TouchControls } from './components/TouchControls';
import { TutorialModal } from './components/TutorialModal';
import { GameEngine } from './game/engine';
import {
  getHighScore,
  getSettings,
  getTotalCoins,
  isTutorialSeen,
  setTutorialSeen,
} from './game/storage';
import { GameSettings, GameState, GameStats } from './game/types';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    distance: 0,
    speed: 19,
    highScore: getHighScore(),
    totalCoins: getTotalCoins(),
    activePowerUps: {
      SHIELD: null,
      MAGNET: null,
      BOOST: null,
      MULTIPLIER: null,
    },
    consecutiveCoins: 0,
  });

  const [settings, setSettings] = useState<GameSettings>(getSettings());
  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Initialize Game Engine on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current);
    engineRef.current = engine;

    engine.setCallbacks({
      onStatsUpdate: (newStats) => {
        setStats(newStats);
      },
      onGameOver: (finalStats) => {
        const previousHigh = getHighScore();
        const brokeRecord = finalStats.score > previousHigh;
        setIsNewHighScore(brokeRecord);
        setStats(finalStats);
        setGameState('GAMEOVER');
      },
      onStateChange: (newState) => {
        setGameState(newState);
      },
    });

    // Check first-time tutorial
    if (!isTutorialSeen()) {
      setShowTutorial(true);
      setTutorialSeen(true);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    setShowShop(false);
    setShowSettings(false);
    setShowTutorial(false);
    setIsNewHighScore(false);
    engineRef.current?.startGame();
  };

  const handlePause = () => {
    engineRef.current?.pause();
  };

  const handleResume = () => {
    engineRef.current?.resume();
  };

  const handleRestart = () => {
    setShowShop(false);
    setShowSettings(false);
    setIsNewHighScore(false);
    engineRef.current?.restart();
  };

  const handleGoHome = () => {
    setShowShop(false);
    setShowSettings(false);
    setShowTutorial(false);
    engineRef.current?.goToMenu();
    setStats((prev) => ({
      ...prev,
      highScore: getHighScore(),
      totalCoins: getTotalCoins(),
    }));
  };

  const handleSettingsChanged = (newSettings: GameSettings) => {
    setSettings(newSettings);
    engineRef.current?.updateSettings();
  };

  const handleSkinChanged = () => {
    engineRef.current?.updateSkin();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* In-Game HUD (Visible during active play & pause) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <HUD stats={stats} onPause={handlePause} />
      )}

      {/* On-Screen Mobile Touch Controls (Toggleable via Settings) */}
      {gameState === 'PLAYING' && settings.touchControls && engineRef.current && (
        <TouchControls inputController={engineRef.current.inputController} />
      )}

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={getHighScore()}
          totalCoins={getTotalCoins()}
          onStart={handleStartGame}
          onOpenShop={() => setShowShop(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleGoHome}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
          onHome={handleGoHome}
          onOpenShop={() => setShowShop(true)}
        />
      )}

      {/* Bazaar & Upgrades Modal */}
      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onSkinChanged={handleSkinChanged}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsChanged={handleSettingsChanged}
        />
      )}

      {/* Tutorial & Controls Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
