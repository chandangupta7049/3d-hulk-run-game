import * as THREE from 'three';

interface Firefly {
  baseX: number;
  baseY: number;
  baseZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  phase: number;
  colorType: 'gold' | 'emerald' | 'cyan';
  baseSize: number;
}

export class AmbientAtmosphere {
  private count = 90;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  public points: THREE.Points;

  private positions: Float32Array;
  private colors: Float32Array;
  private fireflies: Firefly[] = [];

  constructor(scene: THREE.Scene) {
    this.positions = new Float32Array(this.count * 3);
    this.colors = new Float32Array(this.count * 3);

    // Glowing circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)');
    grad.addColorStop(0.55, 'rgba(52, 211, 153, 0.45)');
    grad.addColorStop(0.85, 'rgba(16, 185, 129, 0.15)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.75,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);

    // Initialize fireflies distribution around the corridor
    for (let i = 0; i < this.count; i++) {
      const typeRand = Math.random();
      const colorType: 'gold' | 'emerald' | 'cyan' =
        typeRand < 0.45 ? 'emerald' : typeRand < 0.8 ? 'gold' : 'cyan';

      this.fireflies.push({
        baseX: (Math.random() - 0.5) * 26,
        baseY: 0.8 + Math.random() * 8.5,
        baseZ: -8 + Math.random() * 45,
        speedX: 0.6 + Math.random() * 0.8,
        speedY: 0.4 + Math.random() * 0.6,
        speedZ: 0.5 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        colorType,
        baseSize: 0.5 + Math.random() * 0.4,
      });
    }
  }

  public update(dt: number, playerX: number, playerY: number, playerZ: number, gameTime: number) {
    for (let i = 0; i < this.count; i++) {
      const f = this.fireflies[i];

      // Relative Z tracking
      let relZ = f.baseZ - (playerZ % 50);
      if (relZ < -10) relZ += 50;

      const worldX = playerX * 0.3 + f.baseX + Math.sin(gameTime * f.speedX + f.phase) * 1.6;
      const worldY = playerY + f.baseY + Math.cos(gameTime * f.speedY + f.phase) * 0.8;
      const worldZ = playerZ + relZ + Math.sin(gameTime * f.speedZ + f.phase) * 1.2;

      const idx = i * 3;
      this.positions[idx] = worldX;
      this.positions[idx + 1] = worldY;
      this.positions[idx + 2] = worldZ;

      // Organic pulsing glow
      const pulse = 0.55 + 0.45 * Math.sin(gameTime * 2.8 + f.phase * 1.5);

      if (f.colorType === 'emerald') {
        this.colors[idx] = 0.15 * pulse;
        this.colors[idx + 1] = 0.95 * pulse;
        this.colors[idx + 2] = 0.45 * pulse;
      } else if (f.colorType === 'gold') {
        this.colors[idx] = 0.98 * pulse;
        this.colors[idx + 1] = 0.82 * pulse;
        this.colors[idx + 2] = 0.20 * pulse;
      } else {
        this.colors[idx] = 0.20 * pulse;
        this.colors[idx + 1] = 0.75 * pulse;
        this.colors[idx + 2] = 0.98 * pulse;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
