import * as THREE from 'three';
import { AmbientAtmosphere } from './ambientAtmosphere';
import { audio } from './audio';
import { InputController } from './inputController';
import { ParticleSystem } from './particleSystem';
import { PlayerModel } from './playerModel';
import { createBeautifulSkyTexture } from './skyPanorama';
import {
  addCoins,
  getHighScore,
  getSettings,
  getUpgrades,
  saveHighScore,
} from './storage';
import {
  ActivePowerUp,
  GameState,
  GameStats,
  Lane,
  LANE_POSITIONS,
  LANE_WIDTH,
  ObstacleType,
  PlayerAction,
  PowerUpType,
  UPGRADE_CONFIG,
} from './types';
import { CollectibleInstance, PowerUpInstance, WorldGenerator } from './worldGenerator';

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private hemiLight: THREE.HemisphereLight;
  private skyMesh!: THREE.Mesh;

  private playerModel: PlayerModel;
  private worldGenerator: WorldGenerator;
  private particleSystem: ParticleSystem;
  private ambientAtmosphere: AmbientAtmosphere;
  public inputController: InputController;

  // Game Loop
  private animFrameId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  public state: GameState = 'MENU';

  // Player state
  private playerX = 0;
  private playerY = 0;
  private playerZ = 0;
  private currentLane: Lane = 0;
  private targetX = 0;

  private isJumping = false;
  private jumpVelocity = 0;
  private readonly GRAVITY = -38;
  private readonly JUMP_FORCE = 13.5;

  private isSliding = false;
  private slideTimer = 0;
  private readonly SLIDE_DURATION = 0.8;

  private isDead = false;
  private deathTimer = 0;
  private invulnerableTimer = 0;

  // Speeds & Difficulty
  private baseSpeed = 19;
  private currentSpeed = 19;
  private maxSpeed = 34;
  private distance = 0;
  private score = 0;
  private coins = 0;
  private consecutiveCoins = 0;

  // Power-Ups active
  private activePowerUps: Record<PowerUpType, ActivePowerUp | null> = {
    SHIELD: null,
    MAGNET: null,
    BOOST: null,
    MULTIPLIER: null,
  };

  // Camera Shake
  private shakeIntensity = 0;
  private baseFOV = 60;
  private targetFOV = 60;

  // Callbacks
  private onStatsUpdate?: (stats: GameStats) => void;
  private onGameOver?: (stats: GameStats) => void;
  private onStateChange?: (state: GameState) => void;

  // Cached bound loop
  private boundAnimate: (t: number) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.boundAnimate = this.animate.bind(this);

    // 1. Scene & Atmosphere (Cinematic Ancient Jungle Horizon)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x13382c);
    this.scene.fog = new THREE.Fog(0x13382c, 85, 300);

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.baseFOV, width / height, 0.1, 500);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting - Radiant Golden Sunrise with Lush Canopy Fill
    this.ambientLight = new THREE.AmbientLight(0x7dd3fc, 0.65);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xfef08a, 0x14532d, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    this.dirLight.position.set(15, 35, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -22;
    this.dirLight.shadow.camera.right = 22;
    this.dirLight.shadow.camera.top = 28;
    this.dirLight.shadow.camera.bottom = -16;
    this.scene.add(this.dirLight);

    // 5. Beautiful High-Def Sky Dome (Follows camera seamlessly)
    this.createSkyDome();

    // 6. Subsystems
    this.particleSystem = new ParticleSystem(this.scene);
    this.ambientAtmosphere = new AmbientAtmosphere(this.scene);
    this.worldGenerator = new WorldGenerator(this.scene);
    this.playerModel = new PlayerModel();
    this.scene.add(this.playerModel.group);

    // 7. Input
    this.inputController = new InputController();
    this.setupInputHandlers();

    // Resize listener
    window.addEventListener('resize', this.handleResize);

    // Initial setup
    const upgrades = getUpgrades();
    this.playerModel.setSkin(upgrades.selectedSkin);
    this.resetGame();

    // Start render loop
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.boundAnimate);
  }

  private createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(380, 32, 24);
    // Invert geometry so inside is visible
    skyGeo.scale(-1, 1, 1);

    const skyTex = createBeautifulSkyTexture();
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      depthWrite: false,
      fog: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.skyMesh.renderOrder = -1000;
    this.scene.add(this.skyMesh);
  }

  public setCallbacks(callbacks: {
    onStatsUpdate?: (stats: GameStats) => void;
    onGameOver?: (stats: GameStats) => void;
    onStateChange?: (state: GameState) => void;
  }) {
    this.onStatsUpdate = callbacks.onStatsUpdate;
    this.onGameOver = callbacks.onGameOver;
    this.onStateChange = callbacks.onStateChange;
  }

  public updateSettings() {
    const s = getSettings();
    audio.setSettings(s.musicVolume, s.sfxVolume, s.soundEnabled);
  }

  public updateSkin() {
    const upgrades = getUpgrades();
    this.playerModel.setSkin(upgrades.selectedSkin);
  }

  private setupInputHandlers() {
    this.inputController.onAction((action) => {
      if (this.state === 'PAUSED' && action === 'PAUSE') {
        this.resume();
        return;
      }

      if (this.state !== 'PLAYING') return;

      switch (action) {
        case 'LEFT':
          this.changeLane(-1);
          break;
        case 'RIGHT':
          this.changeLane(1);
          break;
        case 'JUMP':
          this.jump();
          break;
        case 'SLIDE':
          this.slide();
          break;
        case 'PAUSE':
          this.pause();
          break;
      }
    });
  }

  private changeLane(dir: number) {
    if (this.isDead) return;
    const nextLane = this.currentLane + dir;
    if (nextLane >= -1 && nextLane <= 1) {
      this.currentLane = nextLane as Lane;
      this.targetX = LANE_POSITIONS[this.currentLane];
      this.playerModel.targetLaneLean = dir * 1.35;
      audio.playLaneSwitch(dir);
      this.particleSystem.emitDust(this.playerX, this.playerY, this.playerZ, 5);
    } else {
      // Edge curb bump feedback when attempting to move past outer lanes
      this.playerModel.targetLaneLean = dir * 0.45;
      this.particleSystem.emitDust(this.playerX, this.playerY, this.playerZ, 2);
    }
  }

  private jump() {
    if (this.isDead || this.isJumping) return;
    this.isJumping = true;
    this.jumpVelocity = this.JUMP_FORCE;

    // Cancel slide if jumping
    this.isSliding = false;

    audio.playJump();
    this.particleSystem.emitDust(this.playerX, this.playerY, this.playerZ, 6);
  }

  private slide() {
    if (this.isDead) return;

    // Fast-drop if in mid-air
    if (this.isJumping) {
      this.jumpVelocity = -22;
    }

    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    audio.playSlide();
    this.particleSystem.emitSlideSparks(this.playerX, this.playerY, this.playerZ);
  }

  public startGame() {
    this.resetGame();
    this.state = 'PLAYING';
    this.onStateChange?.('PLAYING');
    this.updateSettings();
    audio.startMusic();
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.onStateChange?.('PAUSED');
      audio.stopMusic();
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.onStateChange?.('PLAYING');
      audio.startMusic();
    }
  }

  public restart() {
    this.startGame();
  }

  public goToMenu() {
    this.state = 'MENU';
    this.onStateChange?.('MENU');
    audio.stopMusic();
    this.resetGame();
  }

  private resetGame() {
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.currentLane = 0;
    this.targetX = 0;

    this.isJumping = false;
    this.jumpVelocity = 0;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isDead = false;
    this.deathTimer = 0;
    this.invulnerableTimer = 0;

    this.baseSpeed = 19;
    this.currentSpeed = 19;
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.consecutiveCoins = 0;

    this.activePowerUps = {
      SHIELD: null,
      MAGNET: null,
      BOOST: null,
      MULTIPLIER: null,
    };

    this.targetFOV = this.baseFOV;
    this.camera.fov = this.baseFOV;
    this.camera.updateProjectionMatrix();

    this.worldGenerator.reset();
    this.playerModel.group.position.set(0, 0, 0);
    this.playerModel.group.rotation.set(0, 0, 0);
    this.playerModel.bodyPivot.position.set(0, 0, 0);
    this.playerModel.bodyPivot.rotation.set(0, 0, 0);
  }

  private animate(now: number) {
    this.animFrameId = requestAnimationFrame(this.boundAnimate);

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.state === 'PLAYING' || (this.state === 'GAMEOVER' && this.deathTimer < 2.5)) {
      this.updateGame(dt);
    }

    // Always update visual particles, ambient atmosphere, and character animation
    this.particleSystem.update(dt);
    if (this.ambientAtmosphere) {
      this.ambientAtmosphere.update(
        dt,
        this.playerX,
        this.playerY,
        this.playerZ,
        now * 0.001
      );
    }
    this.updateCamera(dt);

    this.renderer.render(this.scene, this.camera);
  }

  private updateGame(dt: number) {
    if (this.isDead) {
      this.deathTimer += dt;
      this.playerModel.update(dt, 0, 'CRASH', false, false, false);
      if (this.deathTimer >= 1.6 && this.state !== 'GAMEOVER') {
        this.triggerGameOver();
      }
      return;
    }

    // 1. Difficulty & Speed Scaling
    const speedBoostActive = this.activePowerUps.BOOST !== null;
    const targetBaseSpeed = Math.min(this.maxSpeed, 19 + Math.floor(this.distance / 120) * 1.5);
    const speedMultiplier = speedBoostActive ? 1.65 : 1.0;
    this.currentSpeed = targetBaseSpeed * speedMultiplier;

    audio.setTempo((this.currentSpeed - 19) / 15);

    // 2. Forward Movement
    const moveStep = this.currentSpeed * dt;
    this.playerZ += moveStep;
    this.distance += moveStep;

    // Score accumulation: 1 pt per meter, multiplied if Multiplier active
    const scoreMulti = this.activePowerUps.MULTIPLIER !== null ? 2 : 1;
    this.score += Math.floor(moveStep * 1.2) * scoreMulti;

    // 3. Lateral Movement (Lane switching)
    const laneDecay = 1 - Math.exp(-22 * dt);
    this.playerX = THREE.MathUtils.lerp(this.playerX, this.targetX, laneDecay);

    // Snap when close enough to target lane to eliminate micro-lag and reset banking
    if (Math.abs(this.playerX - this.targetX) < 0.04) {
      this.playerX = this.targetX;
      this.playerModel.targetLaneLean = 0;
    }

    // 4. Vertical Movement (Jump & Gravity)
    if (this.isJumping) {
      this.playerY += this.jumpVelocity * dt;
      this.jumpVelocity += this.GRAVITY * dt;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.particleSystem.emitDust(this.playerX, 0, this.playerZ, 6);
      }
    }

    // 5. Sliding Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      this.particleSystem.emitSlideSparks(this.playerX, this.playerY, this.playerZ);
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 6. Invulnerability grace period after shield break
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 7. Power-Ups Timers Update
    this.updatePowerUps(dt);

    // 8. Player Model Position & Animation
    this.playerModel.group.position.set(this.playerX, this.playerY, this.playerZ);

    let currentAction: PlayerAction = 'RUN';
    if (this.isJumping) currentAction = 'JUMP';
    else if (this.isSliding) currentAction = 'SLIDE';

    this.playerModel.update(
      dt,
      this.currentSpeed,
      currentAction,
      this.activePowerUps.SHIELD !== null,
      this.activePowerUps.MAGNET !== null,
      speedBoostActive
    );

    // Speed boost particle trail
    if (speedBoostActive) {
      this.particleSystem.emitSpeedBoostTrail(this.playerX, this.playerY, this.playerZ);
    } else if (!this.isJumping && !this.isSliding) {
      // Heavy Titan running footfall dust puffs
      if (Math.random() < 0.35) {
        this.particleSystem.emitDust(this.playerX, this.playerY, this.playerZ, 3);
      }
    }

    // 9. World Generation & Segments update
    const difficulty = 1 + this.distance / 500;
    this.worldGenerator.update(this.playerZ, difficulty);

    // 10. Torches Particle emission
    for (const seg of this.worldGenerator.segments) {
      if (Math.abs(seg.zStart - this.playerZ) < 80) {
        for (const t of seg.torches) {
          if (Math.random() < 0.4) {
            this.particleSystem.emitTorchFlame(t.x, t.y, t.z);
          }
        }
      }
    }

    // 11. Collisions with Collectibles, Power-Ups, and Obstacles
    this.checkCollisions(dt);

    // 12. Move Directional Light with player for crisp local shadows
    this.dirLight.position.set(this.playerX + 15, 30, this.playerZ + 20);
    this.dirLight.target.position.set(this.playerX, 0, this.playerZ + 10);
    this.dirLight.target.updateMatrixWorld();

    // 13. Dispatch stats to UI
    this.dispatchStats();
  }

  private updatePowerUps(dt: number) {
    for (const key of Object.keys(this.activePowerUps) as PowerUpType[]) {
      const p = this.activePowerUps[key];
      if (p) {
        p.duration -= dt;
        if (p.duration <= 0) {
          this.activePowerUps[key] = null;
          if (key === 'BOOST') {
            this.targetFOV = this.baseFOV;
          }
        }
      }
    }
  }

  private checkCollisions(dt: number) {
    const hasShield = this.activePowerUps.SHIELD !== null;
    const hasMagnet = this.activePowerUps.MAGNET !== null;
    const hasBoost = this.activePowerUps.BOOST !== null;
    const scoreMulti = this.activePowerUps.MULTIPLIER !== null ? 2 : 1;

    // Player bounding dimensions
    const pWidth = 0.8;
    const pDepth = 0.8;
    const pBottom = this.playerY;
    const pTop = this.isSliding ? this.playerY + 0.55 : this.playerY + 1.85;

    for (const segment of this.worldGenerator.segments) {
      // Only test segments within interaction range
      if (segment.zEnd < this.playerZ - 5 || segment.zStart > this.playerZ + 40) {
        continue;
      }

      // 1. Collectibles (Coins & Rare Gems)
      for (const col of segment.collectibles) {
        if (col.collected) continue;

        // Magnet attraction mechanic
        if (hasMagnet) {
          const dx = this.playerX - col.x;
          const dy = (this.playerY + 1) - col.y;
          const dz = this.playerZ - col.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 144) { // 12m magnet radius
            const pullSpeed = 24 * dt;
            col.x += dx * pullSpeed;
            col.y += dy * pullSpeed;
            col.z += dz * pullSpeed;
            col.mesh.position.set(col.x, col.y, col.z);
          }
        }

        // Spin animation
        col.mesh.rotation.y += dt * 3.5;

        // Pickup collision
        const distZ = Math.abs(this.playerZ - col.z);
        const distX = Math.abs(this.playerX - col.x);
        const distY = Math.abs((this.playerY + 0.9) - col.y);

        if (distZ < 1.3 && distX < 1.1 && distY < 1.5) {
          col.collected = true;
          col.mesh.visible = false;

          if (col.type === 'COIN') {
            this.coins += col.data.value;
            this.score += col.data.points * scoreMulti;
            audio.playCoin();
            this.particleSystem.emitCoinSparkles(col.x, col.y, col.z, 0xffd700, 12);
          } else {
            // Rare Emerald or Ruby Relic
            this.coins += col.data.value;
            this.score += col.data.points * scoreMulti;
            audio.playRelic();
            const colorHex = col.type === 'EMERALD' ? 0x10b981 : 0xef4444;
            this.particleSystem.emitCoinSparkles(col.x, col.y, col.z, colorHex, 24);
          }
        }
      }

      // 2. Power-Ups
      for (const pUp of segment.powerUps) {
        if (pUp.collected) continue;

        // Floating hover and spin
        pUp.mesh.rotation.y += dt * 3;
        pUp.mesh.position.y = pUp.baseY + Math.sin(this.playerZ * 0.3) * 0.2;

        const distZ = Math.abs(this.playerZ - pUp.z);
        const distX = Math.abs(this.playerX - pUp.x);
        const distY = Math.abs((this.playerY + 0.9) - pUp.y);

        if (distZ < 1.4 && distX < 1.1 && distY < 1.6) {
          pUp.collected = true;
          pUp.mesh.visible = false;
          audio.playPowerUp();

          // Calculate upgraded duration
          const upgrades = getUpgrades();
          let dur = 10;
          if (pUp.type === 'SHIELD') {
            dur = UPGRADE_CONFIG.shield.baseDuration + (upgrades.shieldLevel - 1) * UPGRADE_CONFIG.shield.perLevel;
          } else if (pUp.type === 'MAGNET') {
            dur = UPGRADE_CONFIG.magnet.baseDuration + (upgrades.magnetLevel - 1) * UPGRADE_CONFIG.magnet.perLevel;
          } else if (pUp.type === 'BOOST') {
            dur = UPGRADE_CONFIG.boost.baseDuration + (upgrades.boostLevel - 1) * UPGRADE_CONFIG.boost.perLevel;
            this.targetFOV = 75; // widen FOV for rush speed feeling!
          } else {
            dur = UPGRADE_CONFIG.multiplier.baseDuration + (upgrades.multiplierLevel - 1) * UPGRADE_CONFIG.multiplier.perLevel;
          }

          this.activePowerUps[pUp.type] = {
            type: pUp.type,
            duration: dur,
            maxDuration: dur,
          };

          this.particleSystem.emitCoinSparkles(pUp.x, pUp.y, pUp.z, 0x38bdf8, 20);
        }
      }

      // 3. Obstacles Collision Testing
      for (const obs of segment.obstacles) {
        const obsX = obs.mesh.position.x;
        const obsZ = obs.z;
        const halfW = obs.width / 2;
        const halfD = obs.depth / 2;

        // X overlap
        const overlapX = Math.abs(this.playerX - obsX) < (pWidth / 2 + halfW - 0.15);
        // Z overlap
        const overlapZ = Math.abs(this.playerZ - obsZ) < (pDepth / 2 + halfD);

        if (overlapX && overlapZ) {
          // Check vertical clearance
          let safe = false;

          if (obs.canJumpOver) {
            // Player must be high enough
            const obsTop = obs.y + obs.height / 2;
            if (pBottom >= obsTop - 0.2) {
              safe = true;
            }
          }

          if (obs.canSlideUnder) {
            // Player must be sliding and low enough
            const obsBottom = obs.y - obs.height / 2 + 0.4;
            if (this.isSliding && pTop <= obsBottom) {
              safe = true;
            }
          }

          if (!safe) {
            // Collision occurred!
            if (hasBoost) {
              // Speed boost smashes obstacles into sparks!
              this.particleSystem.emitSlideSparks(obsX, obs.y, obsZ);
              this.shakeCamera(0.2);
              continue;
            }

            if (this.invulnerableTimer > 0) {
              // In grace period, ignore
              continue;
            }

            if (hasShield) {
              // Shield absorbs the collision
              this.activePowerUps.SHIELD = null;
              this.invulnerableTimer = 1.2;
              this.shakeCamera(0.4);
              audio.playShieldHit();
              this.particleSystem.emitShieldImpact(this.playerX, this.playerY + 1, this.playerZ);
              continue;
            }

            // Fatal crash!
            this.handlePlayerDeath(obs.type);
            return;
          }
        }
      }
    }
  }

  private handlePlayerDeath(obstacleType: ObstacleType) {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTimer = 0;
    audio.stopMusic();
    audio.playCrash();
    this.shakeCamera(0.8);
    this.particleSystem.emitShieldImpact(this.playerX, this.playerY + 1, this.playerZ);
  }

  private triggerGameOver() {
    this.state = 'GAMEOVER';
    this.onStateChange?.('GAMEOVER');

    // Save coins & high score
    addCoins(this.coins);
    saveHighScore(this.score);

    audio.playGameOver();

    const stats = this.getStats();
    this.onGameOver?.(stats);
  }

  public shakeCamera(intensity = 0.5) {
    const s = getSettings();
    if (s.screenShake) {
      this.shakeIntensity = Math.min(1.0, this.shakeIntensity + intensity);
    }
  }

  private updateCamera(dt: number) {
    // Smooth dynamic FOV
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFOV, dt * 6);
    this.camera.updateProjectionMatrix();

    // 3rd person chase camera math (adjusted for massive Behemoth silhouette)
    const targetCamX = this.playerX * 0.65;
    const targetCamY = this.playerY + (this.isSliding ? 3.0 : 4.0);
    const targetCamZ = this.playerZ - 7.0;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, dt * 14);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, dt * 10);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, dt * 20);

    // Screen Shake Offset
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity * 0.7;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity * 0.7;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 2.5);
    }

    const lookTargetX = this.playerX * 0.35;
    const lookTargetY = this.playerY + 1.6;
    const lookTargetZ = this.playerZ + 8.5;
    this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

    // Keep panoramic sky sphere perfectly centered on camera
    if (this.skyMesh) {
      this.skyMesh.position.set(
        this.camera.position.x,
        this.camera.position.y * 0.15,
        this.camera.position.z
      );
      this.skyMesh.rotation.y += dt * 0.003;
    }
  }

  public getStats(): GameStats {
    return {
      score: this.score,
      coins: this.coins,
      distance: Math.floor(this.distance),
      speed: Math.round(this.currentSpeed),
      highScore: getHighScore(),
      totalCoins: getUpgrades() ? (window as unknown as { __cachedTotalCoins?: number }).__cachedTotalCoins || 0 : 0,
      activePowerUps: { ...this.activePowerUps },
      consecutiveCoins: this.consecutiveCoins,
    };
  }

  private dispatchStats() {
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.getStats());
    }
  }

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    this.inputController.detach();
    audio.stopMusic();
    this.particleSystem.dispose();
    if (this.ambientAtmosphere) {
      this.ambientAtmosphere.dispose();
    }
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
