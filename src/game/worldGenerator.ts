import * as THREE from 'three';
import {
  CollectibleData,
  CollectibleType,
  Lane,
  LANE_POSITIONS,
  LANE_WIDTH,
  ObstacleType,
  PowerUpType,
} from './types';

export const SEGMENT_LENGTH = 36;
export const PATH_WIDTH = LANE_WIDTH * 3 + 1.2;

export interface ObstacleInstance {
  id: string;
  type: ObstacleType;
  mesh: THREE.Group;
  lane: Lane;
  z: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  canSlideUnder: boolean;
  canJumpOver: boolean;
  isGap: boolean;
}

export interface CollectibleInstance {
  id: string;
  type: CollectibleType;
  data: CollectibleData;
  mesh: THREE.Group;
  lane: Lane;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  baseY: number;
}

export interface PowerUpInstance {
  id: string;
  type: PowerUpType;
  mesh: THREE.Group;
  lane: Lane;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  baseY: number;
}

export interface Segment {
  index: number;
  zStart: number;
  zEnd: number;
  group: THREE.Group;
  obstacles: ObstacleInstance[];
  collectibles: CollectibleInstance[];
  powerUps: PowerUpInstance[];
  torches: THREE.Vector3[];
}

export class WorldGenerator {
  public scene: THREE.Scene;
  public segments: Segment[] = [];
  public nextSegmentIndex = 0;
  private currentZ = 0;
  private totalSegmentsCreated = 0;

  // Materials reuse
  private stonePathMat!: THREE.MeshStandardMaterial;
  private stoneEdgeMat!: THREE.MeshStandardMaterial;
  private mossyStoneMat!: THREE.MeshStandardMaterial;
  private woodMat!: THREE.MeshStandardMaterial;
  private foliageMat!: THREE.MeshStandardMaterial;
  private foliageDarkMat!: THREE.MeshStandardMaterial;
  private goldMat!: THREE.MeshStandardMaterial;
  private emeraldMat!: THREE.MeshStandardMaterial;
  private rubyMat!: THREE.MeshStandardMaterial;
  private ironMat!: THREE.MeshStandardMaterial;
  private flameMat!: THREE.MeshBasicMaterial;

  // Scenic & Landscape Materials
  private waterMat!: THREE.MeshStandardMaterial;
  private foamMat!: THREE.MeshStandardMaterial;
  private pyramidMat!: THREE.MeshStandardMaterial;
  private mountainMat!: THREE.MeshStandardMaterial;
  private vineMat!: THREE.MeshStandardMaterial;
  private flowerMat!: THREE.MeshStandardMaterial;
  private statueMat!: THREE.MeshStandardMaterial;
  private sunbeamMat!: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createMaterials();
  }

  private createMaterials() {
    // Ancient weathered stone
    this.stonePathMat = new THREE.MeshStandardMaterial({
      color: 0x5c574f,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.stoneEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x3d3831,
      roughness: 0.9,
    });

    this.mossyStoneMat = new THREE.MeshStandardMaterial({
      color: 0x47573f,
      roughness: 0.9,
    });

    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x543d2b,
      roughness: 0.85,
    });

    this.foliageMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Vibrant lush jungle canopy green
      roughness: 0.65,
    });

    this.foliageDarkMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Deep emerald undergrowth
      roughness: 0.75,
    });

    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });

    this.emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x059669,
      emissiveIntensity: 0.45,
    });

    this.rubyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0xdc2626,
      emissiveIntensity: 0.45,
    });

    this.ironMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    });

    this.flameMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });

    // Scenic Environmental Materials
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Crystal clear turquoise jungle water
      roughness: 0.1,
      metalness: 0.3,
      emissive: 0x0891b2,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.85,
    });

    this.foamMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.3,
      emissive: 0xbae6fd,
      emissiveIntensity: 0.4,
    });

    this.pyramidMat = new THREE.MeshStandardMaterial({
      color: 0x6b6357, // Ancient carved sandstone monoliths
      roughness: 0.85,
      metalness: 0.1,
    });

    this.mountainMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a34, // Atmospheric distant jungle ridge
      roughness: 0.95,
    });

    this.vineMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.8,
    });

    this.flowerMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // Glowing exotic jungle orchid
      emissive: 0xe11d48,
      emissiveIntensity: 0.4,
      roughness: 0.4,
    });

    this.statueMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Ancient guardian stone sentinel
      roughness: 0.8,
      metalness: 0.1,
    });

    // Soft volumetric sunbeam plane
    this.sunbeamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  public reset() {
    // Clear all segments from scene
    for (const segment of this.segments) {
      this.scene.remove(segment.group);
    }
    this.segments = [];
    this.nextSegmentIndex = 0;
    this.currentZ = 0;
    this.totalSegmentsCreated = 0;

    // Build initial run of 8 segments
    for (let i = 0; i < 8; i++) {
      this.spawnNextSegment(i < 2); // First 2 segments are safe without obstacles
    }
  }

  public update(playerZ: number, difficulty: number): { passedObstacles: ObstacleInstance[] } {
    const passedObstacles: ObstacleInstance[] = [];

    // Check if we need to remove old segments and spawn new ones
    while (this.segments.length > 0 && this.segments[0].zEnd < playerZ - 20) {
      const oldSeg = this.segments.shift()!;
      this.scene.remove(oldSeg.group);
    }

    // Keep ahead of player by at least 180 units (~5 segments)
    const furthestZ = this.segments.length > 0 ? this.segments[this.segments.length - 1].zEnd : playerZ;
    if (furthestZ - playerZ < 220) {
      this.spawnNextSegment(false, difficulty);
    }

    return { passedObstacles };
  }

  private spawnNextSegment(isSafe: boolean, difficulty = 1) {
    const zStart = this.currentZ;
    const zEnd = zStart + SEGMENT_LENGTH;
    this.currentZ = zEnd;

    const segmentGroup = new THREE.Group();
    const obstacles: ObstacleInstance[] = [];
    const collectibles: CollectibleInstance[] = [];
    const powerUps: PowerUpInstance[] = [];
    const torches: THREE.Vector3[] = [];

    const isBridge = this.totalSegmentsCreated > 4 && this.totalSegmentsCreated % 5 === 0;

    // 1. Path Floor
    if (isBridge) {
      this.buildBridgeFloor(segmentGroup, zStart);
    } else {
      this.buildStonePathFloor(segmentGroup, zStart);
    }

    // 2. Side scenery & props (pillars, palms, torches, gargoyles)
    this.buildSegmentScenery(segmentGroup, zStart, isBridge, torches);

    // 3. Obstacles & Collectibles
    if (!isSafe) {
      this.populateObstaclesAndCollectibles(
        segmentGroup,
        zStart,
        difficulty,
        obstacles,
        collectibles,
        powerUps
      );
    } else {
      // Safe segment: just collect some starter coins!
      this.spawnCoinLine(segmentGroup, 0, zStart + 10, 8, collectibles);
    }

    this.scene.add(segmentGroup);

    const segment: Segment = {
      index: this.nextSegmentIndex++,
      zStart,
      zEnd,
      group: segmentGroup,
      obstacles,
      collectibles,
      powerUps,
      torches,
    };

    this.segments.push(segment);
    this.totalSegmentsCreated++;
  }

  private buildStonePathFloor(group: THREE.Group, zStart: number) {
    const length = SEGMENT_LENGTH;
    const centerZ = zStart + length / 2;

    // Main flagstone path
    const pathGeo = new THREE.BoxGeometry(PATH_WIDTH, 0.4, length);
    const pathMesh = new THREE.Mesh(pathGeo, this.stonePathMat);
    pathMesh.position.set(0, -0.2, centerZ);
    pathMesh.receiveShadow = true;
    group.add(pathMesh);

    // Raised stone curbs with ancient carved borders
    const curbGeo = new THREE.BoxGeometry(0.5, 0.55, length);
    const curbLeft = new THREE.Mesh(curbGeo, this.stoneEdgeMat);
    curbLeft.position.set(-PATH_WIDTH / 2 - 0.25, -0.1, centerZ);
    curbLeft.receiveShadow = true;
    group.add(curbLeft);

    const curbRight = new THREE.Mesh(curbGeo, this.stoneEdgeMat);
    curbRight.position.set(PATH_WIDTH / 2 + 0.25, -0.1, centerZ);
    curbRight.receiveShadow = true;
    group.add(curbRight);

    // Flagstone tile seams (decorative dark crossbars)
    for (let z = 6; z < length; z += 6) {
      const seamGeo = new THREE.BoxGeometry(PATH_WIDTH - 0.1, 0.02, 0.15);
      const seam = new THREE.Mesh(seamGeo, this.stoneEdgeMat);
      seam.position.set(0, 0.01, zStart + z);
      seam.receiveShadow = true;
      group.add(seam);
    }
  }

  private buildBridgeFloor(group: THREE.Group, zStart: number) {
    const length = SEGMENT_LENGTH;
    const centerZ = zStart + length / 2;

    // Wooden suspension bridge planks
    const plankWidth = PATH_WIDTH - 0.4;
    for (let z = 1; z < length; z += 1.5) {
      const plankGeo = new THREE.BoxGeometry(plankWidth, 0.2, 1.2);
      const plank = new THREE.Mesh(plankGeo, this.woodMat);
      plank.position.set(0, -0.1, zStart + z);
      plank.receiveShadow = true;
      group.add(plank);
    }

    // Bridge ropes & posts
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6);
    for (let z = 3; z < length; z += 6) {
      const postL = new THREE.Mesh(postGeo, this.woodMat);
      postL.position.set(-plankWidth / 2, 0.5, zStart + z);
      const postR = new THREE.Mesh(postGeo, this.woodMat);
      postR.position.set(plankWidth / 2, 0.5, zStart + z);
      group.add(postL, postR);
    }

    // Thick rope railings
    const ropeGeo = new THREE.CylinderGeometry(0.06, 0.06, length, 6);
    const ropeL = new THREE.Mesh(ropeGeo, this.woodMat);
    ropeL.rotation.x = Math.PI / 2;
    ropeL.position.set(-plankWidth / 2, 0.9, centerZ);
    const ropeR = new THREE.Mesh(ropeGeo, this.woodMat);
    ropeR.rotation.x = Math.PI / 2;
    ropeR.position.set(plankWidth / 2, 0.9, centerZ);
    group.add(ropeL, ropeR);
  }

  private buildSegmentScenery(group: THREE.Group, zStart: number, isBridge: boolean, torches: THREE.Vector3[]) {
    const length = SEGMENT_LENGTH;
    const centerZ = zStart + length / 2;

    if (isBridge) {
      // Magnificent deep canyon gorge with rushing turquoise river & waterfall
      this.buildRavineAndWaterfall(group, zStart);
      return;
    }

    // 1. Distant Landscape & Horizons
    // Majestic Stepped Maya/Inca Pyramid every 2 segments
    if (this.totalSegmentsCreated % 2 === 0) {
      const side = (this.totalSegmentsCreated % 4 === 0) ? -1 : 1;
      this.buildSteppedPyramid(group, side * 55, centerZ);
    }

    // Distant mountain ridges & peaks flanking the valley
    this.buildDistantMountain(group, -75, centerZ - 6);
    this.buildDistantMountain(group, 80, centerZ + 8);

    // Cascading mountain waterfalls pouring into lush jungle basins
    if (this.totalSegmentsCreated % 3 === 0) {
      this.buildWaterfallCliff(group, -28, centerZ, -1);
    } else if (this.totalSegmentsCreated % 3 === 1) {
      this.buildWaterfallCliff(group, 28, centerZ, 1);
    }

    // Giant overhead ancient jungle canopy boughs with hanging vines
    if (this.totalSegmentsCreated % 2 === 1) {
      this.buildOverheadCanopyArch(group, zStart + 18);
    }

    // Volumetric golden sunbeam cards
    this.buildSunbeams(group, zStart + 12);

    // Ancient stone guardian statues
    if (this.totalSegmentsCreated % 4 === 1) {
      this.buildGuardianStatue(group, -PATH_WIDTH / 2 - 3.8, zStart + 14, -1);
      this.buildGuardianStatue(group, PATH_WIDTH / 2 + 3.8, zStart + 14, 1);
    }

    // 2. Ancient Ruin Pillars & Jungle Palms on flanks
    const positionsZ = [8, 20, 30];
    for (const pz of positionsZ) {
      const z = zStart + pz;

      // Left Pillar or Tree
      if (Math.random() > 0.4) {
        this.buildAncientPillar(group, -PATH_WIDTH / 2 - 2.5, z);
      } else {
        this.buildPalmTree(group, -PATH_WIDTH / 2 - 3.5, z);
      }

      // Right Pillar or Tree
      if (Math.random() > 0.4) {
        this.buildAncientPillar(group, PATH_WIDTH / 2 + 2.5, z);
      } else {
        this.buildPalmTree(group, PATH_WIDTH / 2 + 3.5, z);
      }

      // Stone Wall Ruins with hanging moss
      this.buildWallRuin(group, -PATH_WIDTH / 2 - 4.5, z, -1);
      this.buildWallRuin(group, PATH_WIDTH / 2 + 4.5, z, 1);
    }

    // Burning Torches on stone stands every segment
    const torchZ = zStart + 16;
    this.buildTorchStand(group, -PATH_WIDTH / 2 - 0.7, torchZ, torches);
    this.buildTorchStand(group, PATH_WIDTH / 2 + 0.7, torchZ, torches);
  }

  // ---- SPECTACULAR LANDSCAPE & SCENIC GENERATION ----

  private buildRavineAndWaterfall(group: THREE.Group, zStart: number) {
    const length = SEGMENT_LENGTH;
    const centerZ = zStart + length / 2;

    // Deep rushing turquoise river below bridge
    const riverGeo = new THREE.BoxGeometry(PATH_WIDTH + 32, 0.8, length + 2);
    const river = new THREE.Mesh(riverGeo, this.waterMat);
    river.position.set(0, -12, centerZ);
    group.add(river);

    // River foam rapids
    const foamGeo = new THREE.BoxGeometry(PATH_WIDTH + 24, 0.2, 4);
    for (let fz = zStart + 4; fz < zStart + length; fz += 8) {
      const foam = new THREE.Mesh(foamGeo, this.foamMat);
      foam.position.set((Math.random() - 0.5) * 4, -11.5, fz);
      group.add(foam);
    }

    // Deep canyon gorge cliff walls
    const cliffGeo = new THREE.BoxGeometry(16, 20, length);
    const leftCliff = new THREE.Mesh(cliffGeo, this.mountainMat);
    leftCliff.position.set(-PATH_WIDTH / 2 - 10, -5, centerZ);
    const rightCliff = new THREE.Mesh(cliffGeo, this.mountainMat);
    rightCliff.position.set(PATH_WIDTH / 2 + 10, -5, centerZ);
    group.add(leftCliff, rightCliff);

    // Cascading chasm waterfall plunging into the gorge
    const fallGeo = new THREE.BoxGeometry(5.5, 14, 0.4);
    const waterfall = new THREE.Mesh(fallGeo, this.waterMat);
    waterfall.position.set(-PATH_WIDTH / 2 - 4.5, -4, zStart + 14);
    group.add(waterfall);
  }

  private buildSteppedPyramid(group: THREE.Group, x: number, z: number) {
    // 4-Tier Colossal Mayan/Inca Stepped Sun Pyramid
    const tiers = [
      { size: 36, height: 6.5, y: 3.25 },
      { size: 28, height: 5.5, y: 9.25 },
      { size: 20, height: 5.5, y: 14.75 },
      { size: 13, height: 4.5, y: 19.75 },
    ];

    for (const t of tiers) {
      const tierGeo = new THREE.BoxGeometry(t.size, t.height, t.size);
      const tier = new THREE.Mesh(tierGeo, this.pyramidMat);
      tier.position.set(x, t.y, z);
      tier.receiveShadow = true;
      group.add(tier);

      // Radiant Gilded Sun-Glyph Cornice on each terrace
      const corniceGeo = new THREE.BoxGeometry(t.size + 0.6, 0.4, t.size + 0.6);
      const cornice = new THREE.Mesh(corniceGeo, this.goldMat);
      cornice.position.set(x, t.y + t.height / 2 - 0.2, z);
      group.add(cornice);
    }

    // Grand Stairway ascending the pyramid front
    const stairGeo = new THREE.BoxGeometry(4.5, 20, 16);
    stairGeo.rotateX(-Math.PI / 4.8);
    const stair = new THREE.Mesh(stairGeo, this.stoneEdgeMat);
    stair.position.set(x, 10, z - (x > 0 ? 10 : -10));
    group.add(stair);

    // Summit Temple Shrine
    const templeGeo = new THREE.BoxGeometry(8, 5, 8);
    const temple = new THREE.Mesh(templeGeo, this.stoneEdgeMat);
    temple.position.set(x, 24.5, z);
    group.add(temple);

    // Summit Radiant Golden Sun Disk
    const sunDiskGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16);
    sunDiskGeo.rotateX(Math.PI / 2);
    const sunDisk = new THREE.Mesh(sunDiskGeo, this.goldMat);
    sunDisk.position.set(x, 28.5, z);
    group.add(sunDisk);

    // Summit Eternal Golden Sun Brazier
    const brazierGeo = new THREE.CylinderGeometry(1.4, 0.9, 1.6, 8);
    const brazier = new THREE.Mesh(brazierGeo, this.goldMat);
    brazier.position.set(x, 27.2, z);
    group.add(brazier);

    const flameGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const flame = new THREE.Mesh(flameGeo, this.flameMat);
    flame.position.set(x, 28.6, z);
    group.add(flame);
  }

  private buildDistantMountain(group: THREE.Group, x: number, z: number) {
    // Majestic multi-peak mountain range with atmospheric jungle massifs
    const peaks = [
      { dx: 0, dz: 0, r: 26 + Math.random() * 8, h: 58 + Math.random() * 22 },
      { dx: -16, dz: 12, r: 18 + Math.random() * 6, h: 42 + Math.random() * 15 },
      { dx: 18, dz: -14, r: 20 + Math.random() * 6, h: 46 + Math.random() * 16 },
    ];

    for (const p of peaks) {
      const px = x + p.dx;
      const pz = z + p.dz;
      const mtnGeo = new THREE.ConeGeometry(p.r, p.h, 7);
      const mtn = new THREE.Mesh(mtnGeo, this.mountainMat);
      mtn.position.set(px, p.h / 2 - 2, pz);
      group.add(mtn);

      // Lush emerald moss canopy cap on mountain shoulders
      const capGeo = new THREE.ConeGeometry(p.r * 0.72, p.h * 0.52, 6);
      const cap = new THREE.Mesh(capGeo, this.foliageDarkMat);
      cap.position.set(px, p.h * 0.52, pz);
      group.add(cap);
    }
  }

  private buildWaterfallCliff(group: THREE.Group, x: number, z: number, side: number) {
    // Sheer emerald-covered mossy cliff face
    const cliffGeo = new THREE.BoxGeometry(12, 32, 14);
    const cliff = new THREE.Mesh(cliffGeo, this.mossyStoneMat);
    cliff.position.set(x, 14, z);
    group.add(cliff);

    // Cascading crystal turquoise waterfall chute (primary)
    const fallGeo = new THREE.BoxGeometry(4.8, 28, 0.4);
    const waterfall = new THREE.Mesh(fallGeo, this.waterMat);
    waterfall.position.set(x - side * 5.9, 14, z - 1);
    group.add(waterfall);

    // Secondary cascade stream for lush realistic depth
    const fallSmallGeo = new THREE.BoxGeometry(2.4, 24, 0.4);
    const waterfallSmall = new THREE.Mesh(fallSmallGeo, this.waterMat);
    waterfallSmall.position.set(x - side * 5.9, 12, z + 3);
    group.add(waterfallSmall);

    // Crystal Lagoon splash basin pool
    const poolGeo = new THREE.CylinderGeometry(6.5, 7.5, 0.8, 10);
    const pool = new THREE.Mesh(poolGeo, this.waterMat);
    pool.position.set(x - side * 8, 0.2, z);
    group.add(pool);

    // Glistening water rapids foam ring
    const foamGeo = new THREE.TorusGeometry(5.2, 0.45, 6, 16);
    foamGeo.rotateX(Math.PI / 2);
    const foam = new THREE.Mesh(foamGeo, this.foamMat);
    foam.position.set(x - side * 8, 0.55, z);
    group.add(foam);
  }

  private buildOverheadCanopyArch(group: THREE.Group, z: number) {
    const archGroup = new THREE.Group();
    const span = PATH_WIDTH + 8;

    // Massive curved mossy tree branch arching overhead
    const archGeo = new THREE.CylinderGeometry(0.55, 0.75, span, 8);
    archGeo.rotateZ(Math.PI / 2);
    const branch = new THREE.Mesh(archGeo, this.woodMat);
    branch.position.set(0, 6.8, z);
    archGroup.add(branch);

    // Hanging lush jungle lianas & vines
    const vineCount = 7;
    for (let i = 0; i < vineCount; i++) {
      const vx = (i / (vineCount - 1) - 0.5) * (PATH_WIDTH + 2);
      const vLen = 2.2 + Math.random() * 2.2;
      const vineGeo = new THREE.CylinderGeometry(0.04, 0.04, vLen, 4);
      const vine = new THREE.Mesh(vineGeo, this.vineMat);
      vine.position.set(vx, 6.8 - vLen / 2, z + (Math.random() - 0.5) * 0.4);
      archGroup.add(vine);

      // Glowing exotic orchid flower at vine tip
      if (Math.random() > 0.3) {
        const flowerGeo = new THREE.SphereGeometry(0.18, 6, 6);
        const flower = new THREE.Mesh(flowerGeo, this.flowerMat);
        flower.position.set(vx, 6.8 - vLen, z);
        archGroup.add(flower);
      }
    }

    group.add(archGroup);
  }

  private buildGuardianStatue(group: THREE.Group, x: number, z: number, side: number) {
    const statueGroup = new THREE.Group();
    statueGroup.position.set(x, 0, z);

    // Stone plinth
    const baseGeo = new THREE.BoxGeometry(2.4, 1.2, 2.4);
    const base = new THREE.Mesh(baseGeo, this.stoneEdgeMat);
    base.position.y = 0.6;
    statueGroup.add(base);

    // Ancient seated guardian sentinel body
    const bodyGeo = new THREE.BoxGeometry(1.8, 3.2, 1.6);
    const body = new THREE.Mesh(bodyGeo, this.statueMat);
    body.position.y = 2.8;
    statueGroup.add(body);

    // Carved Head
    const headGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const head = new THREE.Mesh(headGeo, this.statueMat);
    head.position.y = 5.0;
    statueGroup.add(head);

    // Glowing Emerald / Ruby Gemstone Eyes
    const eyeGeo = new THREE.SphereGeometry(0.16, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, this.emeraldMat);
    leftEye.position.set(-0.35, 5.1, -side * 0.72);
    const rightEye = new THREE.Mesh(eyeGeo, this.emeraldMat);
    rightEye.position.set(0.35, 5.1, -side * 0.72);
    statueGroup.add(leftEye, rightEye);

    group.add(statueGroup);
  }

  private buildSunbeams(group: THREE.Group, z: number) {
    // Volumetric diagonal sunbeam ray
    const rayGeo = new THREE.PlaneGeometry(3.5, 18);
    const ray = new THREE.Mesh(rayGeo, this.sunbeamMat);
    ray.position.set(-6, 9, z);
    ray.rotation.z = Math.PI / 4.5;
    ray.rotation.y = -Math.PI / 6;
    group.add(ray);
  }

  private buildAncientPillar(group: THREE.Group, x: number, z: number) {
    const height = 5 + Math.random() * 2;
    const pillarGeo = new THREE.CylinderGeometry(0.65, 0.75, height, 8);
    const pillar = new THREE.Mesh(pillarGeo, this.stoneEdgeMat);
    pillar.position.set(x, height / 2 - 0.2, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    // Carved capital block
    const capGeo = new THREE.BoxGeometry(1.6, 0.5, 1.6);
    const cap = new THREE.Mesh(capGeo, this.stoneEdgeMat);
    cap.position.set(x, height - 0.1, z);
    group.add(cap);
  }

  private buildPalmTree(group: THREE.Group, x: number, z: number) {
    const trunkHeight = 6 + Math.random() * 2;
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.woodMat);
    trunk.position.set(x, trunkHeight / 2 - 0.2, z);
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    group.add(trunk);

    // Palm fronds
    const frondGroup = new THREE.Group();
    frondGroup.position.set(x, trunkHeight, z);
    const leafGeo = new THREE.ConeGeometry(2.4, 4.5, 5);
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(leafGeo, i % 2 === 0 ? this.foliageMat : this.foliageDarkMat);
      leaf.rotation.z = Math.PI / 2.8;
      leaf.rotation.y = (i * Math.PI) / 3;
      leaf.position.y = -0.5;
      frondGroup.add(leaf);
    }
    group.add(frondGroup);
  }

  private buildWallRuin(group: THREE.Group, x: number, z: number, side: number) {
    const wallGeo = new THREE.BoxGeometry(2, 3 + Math.random() * 2, 4);
    const wall = new THREE.Mesh(wallGeo, this.mossyStoneMat);
    wall.position.set(x + side * 1.5, 1.5, z);
    wall.castShadow = true;
    group.add(wall);
  }

  private buildTorchStand(group: THREE.Group, x: number, z: number, torches: THREE.Vector3[]) {
    // Stone pedestal
    const postGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 8);
    const post = new THREE.Mesh(postGeo, this.stoneEdgeMat);
    post.position.set(x, 1.1, z);
    group.add(post);

    // Iron brazier bowl
    const bowlGeo = new THREE.CylinderGeometry(0.4, 0.2, 0.35, 8);
    const bowl = new THREE.Mesh(bowlGeo, this.ironMat);
    bowl.position.set(x, 2.3, z);
    group.add(bowl);

    // Glowing flame core
    const flameGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const flame = new THREE.Mesh(flameGeo, this.flameMat);
    flame.position.set(x, 2.5, z);
    group.add(flame);

    torches.push(new THREE.Vector3(x, 2.6, z));
  }

  // --- OBSTACLE & COLLECTIBLE POPULATION ---

  private populateObstaclesAndCollectibles(
    group: THREE.Group,
    zStart: number,
    difficulty: number,
    obstacles: ObstacleInstance[],
    collectibles: CollectibleInstance[],
    powerUps: PowerUpInstance[]
  ) {
    const lanes: Lane[] = [-1, 0, 1];
    const length = SEGMENT_LENGTH;

    // Usually 2 obstacle zones per segment (z ~ 12 and z ~ 26)
    const zones = [zStart + 12, zStart + 26];

    for (const zoneZ of zones) {
      const obstacleTypeRand = Math.random();

      // Determine how many lanes are blocked (at lower difficulty 1 lane; higher difficulty 2 lanes)
      const numBlockedLanes = difficulty > 1.8 && Math.random() > 0.4 ? 2 : 1;
      const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);
      const blockedLanes = shuffledLanes.slice(0, numBlockedLanes);

      if (obstacleTypeRand < 0.28) {
        // FALLEN LOG (Low barrier: jump over or lane switch)
        for (const lane of blockedLanes) {
          const obs = this.createFallenLogObstacle(group, lane, zoneZ);
          obstacles.push(obs);
        }
        // Place coins arching over the log to teach jumping!
        this.spawnCoinArch(group, blockedLanes[0], zoneZ - 4, zoneZ + 4, collectibles);

      } else if (obstacleTypeRand < 0.52) {
        // SPIKE ARCH / TEMPLE BEAM (Slide under or lane switch)
        for (const lane of blockedLanes) {
          const obs = this.createSpikeGateObstacle(group, lane, zoneZ);
          obstacles.push(obs);
        }
        // Place low coins under the gate to teach sliding!
        this.spawnLowCoinLine(group, blockedLanes[0], zoneZ - 2, 4, collectibles);

      } else if (obstacleTypeRand < 0.72) {
        // ANCIENT PILLAR / TOTEM BLOCK (Must lane switch)
        for (const lane of blockedLanes) {
          const obs = this.createAncientPillarObstacle(group, lane, zoneZ);
          obstacles.push(obs);
        }
        // Place coins in free lane
        const openLane = shuffledLanes[numBlockedLanes] ?? 0;
        this.spawnCoinLine(group, openLane, zoneZ - 3, 5, collectibles);

      } else if (obstacleTypeRand < 0.88) {
        // FIRE BRAZIER HAZARD (Ground fire trap: jump or dodge)
        for (const lane of blockedLanes) {
          const obs = this.createFireBrazierObstacle(group, lane, zoneZ);
          obstacles.push(obs);
        }
        this.spawnCoinArch(group, blockedLanes[0], zoneZ - 3, zoneZ + 3, collectibles);

      } else {
        // SWINGING BLADE / PENDULUM (Timing slide or dodge)
        const obs = this.createSwingingBladeObstacle(group, blockedLanes[0], zoneZ);
        obstacles.push(obs);
      }
    }

    // Rare Power-Up Spawn Chance (~25% chance per segment)
    if (Math.random() < 0.28) {
      const powerUpTypes: PowerUpType[] = ['SHIELD', 'MAGNET', 'BOOST', 'MULTIPLIER'];
      const pType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const freeLane = lanes[Math.floor(Math.random() * lanes.length)];
      const pz = zStart + 18 + (Math.random() - 0.5) * 6;

      const pUp = this.createPowerUp(group, pType, freeLane, pz);
      powerUps.push(pUp);
    }

    // Rare Collectible Spawn Chance (Emerald Scarab or Ruby Idol)
    if (Math.random() < 0.2) {
      const isRuby = Math.random() > 0.6;
      const rareType: CollectibleType = isRuby ? 'RUBY' : 'EMERALD';
      const freeLane = lanes[Math.floor(Math.random() * lanes.length)];
      const rz = zStart + 6 + Math.random() * 20;

      const rareRelic = this.createRareCollectible(group, rareType, freeLane, rz);
      collectibles.push(rareRelic);
    }
  }

  // ---- OBSTACLE FACTORIES ----

  private createFallenLogObstacle(group: THREE.Group, lane: Lane, z: number): ObstacleInstance {
    const obsGroup = new THREE.Group();
    const x = LANE_POSITIONS[lane];

    // Mossy fallen trunk
    const logGeo = new THREE.CylinderGeometry(0.38, 0.42, LANE_WIDTH * 0.95, 10);
    const log = new THREE.Mesh(logGeo, this.woodMat);
    log.rotation.z = Math.PI / 2;
    log.position.set(0, 0.4, 0);
    log.castShadow = true;
    obsGroup.add(log);

    // Moss tufts
    const mossGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
    const moss = new THREE.Mesh(mossGeo, this.mossyStoneMat);
    moss.position.set(0, 0.78, 0);
    obsGroup.add(moss);

    obsGroup.position.set(x, 0, z);
    group.add(obsGroup);

    return {
      id: `log_${lane}_${z}`,
      type: 'FALLEN_LOG',
      mesh: obsGroup,
      lane,
      z,
      y: 0.4,
      width: LANE_WIDTH * 0.9,
      height: 0.8,
      depth: 0.8,
      canSlideUnder: false,
      canJumpOver: true,
      isGap: false,
    };
  }

  private createSpikeGateObstacle(group: THREE.Group, lane: Lane, z: number): ObstacleInstance {
    const obsGroup = new THREE.Group();
    const x = LANE_POSITIONS[lane];

    // High Stone Arch with Spiked Hanging Timber (player must SLIDE underneath!)
    const beamGeo = new THREE.BoxGeometry(LANE_WIDTH * 0.95, 0.6, 0.4);
    const beam = new THREE.Mesh(beamGeo, this.stoneEdgeMat);
    beam.position.set(0, 1.8, 0);
    beam.castShadow = true;
    obsGroup.add(beam);

    // Hanging downward iron spikes
    const spikeGeo = new THREE.ConeGeometry(0.1, 0.55, 6);
    spikeGeo.rotateX(Math.PI);
    for (let i = -2; i <= 2; i++) {
      const spike = new THREE.Mesh(spikeGeo, this.ironMat);
      spike.position.set(i * 0.38, 1.3, 0);
      obsGroup.add(spike);
    }

    obsGroup.position.set(x, 0, z);
    group.add(obsGroup);

    return {
      id: `spikegate_${lane}_${z}`,
      type: 'SPIKE_GATE',
      mesh: obsGroup,
      lane,
      z,
      y: 1.5,
      width: LANE_WIDTH * 0.9,
      height: 1.2,
      depth: 0.5,
      canSlideUnder: true,
      canJumpOver: false,
      isGap: false,
    };
  }

  private createAncientPillarObstacle(group: THREE.Group, lane: Lane, z: number): ObstacleInstance {
    const obsGroup = new THREE.Group();
    const x = LANE_POSITIONS[lane];

    // Giant carved stone monolith / totem (Must dodge)
    const pillarGeo = new THREE.BoxGeometry(1.6, 3.8, 1.6);
    const pillar = new THREE.Mesh(pillarGeo, this.mossyStoneMat);
    pillar.position.set(0, 1.9, 0);
    pillar.castShadow = true;
    obsGroup.add(pillar);

    // Carved Idol Face in stone
    const eyeGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.35, 2.5, 0.82);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.35, 2.5, 0.82);
    obsGroup.add(eyeL, eyeR);

    obsGroup.position.set(x, 0, z);
    group.add(obsGroup);

    return {
      id: `monolith_${lane}_${z}`,
      type: 'ANCIENT_PILLAR',
      mesh: obsGroup,
      lane,
      z,
      y: 1.9,
      width: 1.6,
      height: 3.8,
      depth: 1.6,
      canSlideUnder: false,
      canJumpOver: false,
      isGap: false,
    };
  }

  private createFireBrazierObstacle(group: THREE.Group, lane: Lane, z: number): ObstacleInstance {
    const obsGroup = new THREE.Group();
    const x = LANE_POSITIONS[lane];

    // Low stone fire pit
    const pitGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.4, 8);
    const pit = new THREE.Mesh(pitGeo, this.stoneEdgeMat);
    pit.position.set(0, 0.2, 0);
    pit.castShadow = true;
    obsGroup.add(pit);

    // Glowing fire center
    const fireGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const fire = new THREE.Mesh(fireGeo, this.flameMat);
    fire.position.set(0, 0.45, 0);
    obsGroup.add(fire);

    obsGroup.position.set(x, 0, z);
    group.add(obsGroup);

    return {
      id: `fire_${lane}_${z}`,
      type: 'FIRE_BRAZIER',
      mesh: obsGroup,
      lane,
      z,
      y: 0.4,
      width: 1.5,
      height: 0.9,
      depth: 1.5,
      canSlideUnder: false,
      canJumpOver: true,
      isGap: false,
    };
  }

  private createSwingingBladeObstacle(group: THREE.Group, lane: Lane, z: number): ObstacleInstance {
    const obsGroup = new THREE.Group();
    const x = LANE_POSITIONS[lane];

    // High overhead gantry
    const gantryGeo = new THREE.BoxGeometry(LANE_WIDTH * 1.5, 0.4, 0.4);
    const gantry = new THREE.Mesh(gantryGeo, this.stoneEdgeMat);
    gantry.position.set(0, 4.2, 0);
    obsGroup.add(gantry);

    // Pendulum rod and stone blade
    const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6);
    const rod = new THREE.Mesh(rodGeo, this.ironMat);
    rod.position.set(0, 2.4, 0);
    obsGroup.add(rod);

    const bladeGeo = new THREE.BoxGeometry(1.4, 0.9, 0.15);
    const blade = new THREE.Mesh(bladeGeo, this.stoneEdgeMat);
    blade.position.set(0, 1.2, 0);
    obsGroup.add(blade);

    obsGroup.position.set(x, 0, z);
    group.add(obsGroup);

    return {
      id: `blade_${lane}_${z}`,
      type: 'SWINGING_BLADE',
      mesh: obsGroup,
      lane,
      z,
      y: 1.2,
      width: 1.4,
      height: 1.6,
      depth: 0.5,
      canSlideUnder: true,
      canJumpOver: false,
      isGap: false,
    };
  }

  // ---- COLLECTIBLES & POWER-UPS ----

  public spawnCoinLine(
    group: THREE.Group,
    lane: Lane,
    startZ: number,
    count: number,
    collectibles: CollectibleInstance[]
  ) {
    const x = LANE_POSITIONS[lane];
    for (let i = 0; i < count; i++) {
      const z = startZ + i * 2.2;
      const coin = this.createCoin(group, lane, x, 0.85, z);
      collectibles.push(coin);
    }
  }

  public spawnLowCoinLine(
    group: THREE.Group,
    lane: Lane,
    startZ: number,
    count: number,
    collectibles: CollectibleInstance[]
  ) {
    const x = LANE_POSITIONS[lane];
    for (let i = 0; i < count; i++) {
      const z = startZ + i * 1.8;
      const coin = this.createCoin(group, lane, x, 0.35, z);
      collectibles.push(coin);
    }
  }

  public spawnCoinArch(
    group: THREE.Group,
    lane: Lane,
    startZ: number,
    endZ: number,
    collectibles: CollectibleInstance[]
  ) {
    const x = LANE_POSITIONS[lane];
    const steps = 7;
    for (let i = 0; i < steps; i++) {
      const frac = i / (steps - 1);
      const z = startZ + frac * (endZ - startZ);
      const y = 0.8 + Math.sin(frac * Math.PI) * 2.2; // parabolic arch up to ~3.0m
      const coin = this.createCoin(group, lane, x, y, z);
      collectibles.push(coin);
    }
  }

  private createCoin(group: THREE.Group, lane: Lane, x: number, y: number, z: number): CollectibleInstance {
    const coinGroup = new THREE.Group();

    // Ancient Golden Sun Disc
    const discGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 14);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, this.goldMat);
    coinGroup.add(disc);

    // Inner embossed glyph ring
    const ringGeo = new THREE.TorusGeometry(0.2, 0.03, 6, 12);
    const ring = new THREE.Mesh(ringGeo, this.goldMat);
    coinGroup.add(ring);

    coinGroup.position.set(x, y, z);
    group.add(coinGroup);

    return {
      id: `coin_${x}_${z}`,
      type: 'COIN',
      data: { type: 'COIN', value: 1, points: 10 },
      mesh: coinGroup,
      lane,
      x,
      y,
      z,
      collected: false,
      baseY: y,
    };
  }

  private createRareCollectible(
    group: THREE.Group,
    type: CollectibleType,
    lane: Lane,
    z: number
  ): CollectibleInstance {
    const x = LANE_POSITIONS[lane];
    const y = 1.2;
    const relicGroup = new THREE.Group();

    if (type === 'EMERALD') {
      // Emerald Scarab
      const scarabGeo = new THREE.OctahedronGeometry(0.48, 1);
      const scarab = new THREE.Mesh(scarabGeo, this.emeraldMat);
      relicGroup.add(scarab);

      const auraGeo = new THREE.IcosahedronGeometry(0.65, 1);
      const auraMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.5 });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      relicGroup.add(aura);
    } else {
      // Ruby Idol
      const rubyGeo = new THREE.DodecahedronGeometry(0.52);
      const ruby = new THREE.Mesh(rubyGeo, this.rubyMat);
      relicGroup.add(ruby);

      const auraGeo = new THREE.IcosahedronGeometry(0.7, 1);
      const auraMat = new THREE.MeshBasicMaterial({ color: 0xf87171, wireframe: true, transparent: true, opacity: 0.5 });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      relicGroup.add(aura);
    }

    relicGroup.position.set(x, y, z);
    group.add(relicGroup);

    return {
      id: `relic_${type}_${x}_${z}`,
      type,
      data: {
        type,
        value: type === 'EMERALD' ? 5 : 15,
        points: type === 'EMERALD' ? 50 : 150,
      },
      mesh: relicGroup,
      lane,
      x,
      y,
      z,
      collected: false,
      baseY: y,
    };
  }

  private createPowerUp(
    group: THREE.Group,
    type: PowerUpType,
    lane: Lane,
    z: number
  ): PowerUpInstance {
    const x = LANE_POSITIONS[lane];
    const y = 1.35;
    const pGroup = new THREE.Group();

    let mainColor = 0x38bdf8;
    if (type === 'MAGNET') mainColor = 0xec4899;
    if (type === 'BOOST') mainColor = 0xf59e0b;
    if (type === 'MULTIPLIER') mainColor = 0xa855f7;

    const pMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      metalness: 0.6,
      roughness: 0.2,
      emissive: mainColor,
      emissiveIntensity: 0.5,
    });

    if (type === 'SHIELD') {
      const shieldGeo = new THREE.IcosahedronGeometry(0.55, 1);
      const shield = new THREE.Mesh(shieldGeo, pMat);
      pGroup.add(shield);
    } else if (type === 'MAGNET') {
      const magnetGeo = new THREE.TorusGeometry(0.42, 0.12, 8, 16, Math.PI * 1.4);
      const magnet = new THREE.Mesh(magnetGeo, pMat);
      magnet.rotation.z = Math.PI / 4;
      pGroup.add(magnet);
    } else if (type === 'BOOST') {
      const coneGeo = new THREE.ConeGeometry(0.4, 0.9, 6);
      const cone = new THREE.Mesh(coneGeo, pMat);
      cone.rotation.x = Math.PI / 2;
      pGroup.add(cone);
    } else {
      // 2X MULTIPLIER
      const octaGeo = new THREE.OctahedronGeometry(0.55);
      const octa = new THREE.Mesh(octaGeo, pMat);
      pGroup.add(octa);
    }

    // Outer spinning glowing ring
    const ringGeo = new THREE.TorusGeometry(0.72, 0.04, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: mainColor });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    pGroup.add(ring);

    pGroup.position.set(x, y, z);
    group.add(pGroup);

    return {
      id: `p_${type}_${x}_${z}`,
      type,
      mesh: pGroup,
      lane,
      x,
      y,
      z,
      collected: false,
      baseY: y,
    };
  }
}
