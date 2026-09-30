import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  maxLife: number;
  life: number;
  alpha: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 600;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  public points: THREE.Points;

  private positions: Float32Array;
  private colors: Float32Array;

  constructor(scene: THREE.Scene) {
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Create a circular glowing particle texture with canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 230, 150, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 180, 50, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  public emitDust(x: number, y: number, z: number, count = 3) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        position: new THREE.Vector3(
          x + (Math.random() - 0.5) * 0.4,
          y + 0.05,
          z + (Math.random() - 0.5) * 0.4
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          Math.random() * 1.2 + 0.2,
          (Math.random() - 0.5) * 1.5 + 2 // puff backwards
        ),
        color: new THREE.Color(0xd2b48c).multiplyScalar(0.7 + Math.random() * 0.3),
        size: 0.3 + Math.random() * 0.25,
        maxLife: 0.45 + Math.random() * 0.2,
        life: 0,
        alpha: 0.7,
      });
    }
  }

  public emitSlideSparks(x: number, y: number, z: number) {
    for (let i = 0; i < 4; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        position: new THREE.Vector3(
          x + (Math.random() - 0.5) * 0.5,
          y + 0.08,
          z + (Math.random() - 0.5) * 0.3
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2 + 0.5,
          (Math.random() - 0.5) * 2 + 4
        ),
        color: new THREE.Color(Math.random() > 0.4 ? 0xffcc00 : 0xff6600),
        size: 0.25 + Math.random() * 0.2,
        maxLife: 0.3 + Math.random() * 0.2,
        life: 0,
        alpha: 0.9,
      });
    }
  }

  public emitCoinSparkles(x: number, y: number, z: number, colorHex = 0xffd700, count = 16) {
    const baseColor = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 3.5;
      const elevation = (Math.random() - 0.2) * 4;

      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          elevation,
          Math.sin(angle) * speed
        ),
        color: baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.5) * 0.1),
        size: 0.4 + Math.random() * 0.3,
        maxLife: 0.5 + Math.random() * 0.3,
        life: 0,
        alpha: 1.0,
      });
    }
  }

  public emitShieldImpact(x: number, y: number, z: number) {
    const count = 35;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = 4 + Math.random() * 4;
      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.sin(theta) * Math.sin(phi) * speed,
          Math.cos(theta) * speed
        ),
        color: new THREE.Color(0x38bdf8),
        size: 0.4 + Math.random() * 0.3,
        maxLife: 0.6,
        life: 0,
        alpha: 1.0,
      });
    }
  }

  public emitSpeedBoostTrail(x: number, y: number, z: number) {
    for (let i = 0; i < 3; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        position: new THREE.Vector3(
          x + (Math.random() - 0.5) * 0.8,
          y + 0.3 + Math.random() * 1.2,
          z + 0.2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          4 + Math.random() * 3 // fly backward
        ),
        color: new THREE.Color(Math.random() > 0.5 ? 0x06b6d4 : 0xec4899),
        size: 0.3 + Math.random() * 0.2,
        maxLife: 0.4,
        life: 0,
        alpha: 0.8,
      });
    }
  }

  public emitTorchFlame(x: number, y: number, z: number) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      position: new THREE.Vector3(
        x + (Math.random() - 0.5) * 0.15,
        y,
        z + (Math.random() - 0.5) * 0.15
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        0.8 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.2
      ),
      color: new THREE.Color(Math.random() > 0.3 ? 0xff7700 : 0xffcc00),
      size: 0.3,
      maxLife: 0.35,
      life: 0,
      alpha: 0.8,
    });
  }

  public emitAmbientSpore(x: number, y: number, z: number) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      position: new THREE.Vector3(
        x + (Math.random() - 0.5) * 20,
        y + 0.5 + Math.random() * 5.0,
        z + 5 + Math.random() * 35
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2 + 0.1,
        (Math.random() - 0.5) * 0.3
      ),
      color: new THREE.Color(Math.random() > 0.35 ? 0xfef08a : 0x86efac),
      size: 0.3 + Math.random() * 0.22,
      maxLife: 2.5 + Math.random() * 1.5,
      life: 0,
      alpha: 0.9,
    });
  }

  public emitWaterfallMist(x: number, y: number, z: number) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      position: new THREE.Vector3(
        x + (Math.random() - 0.5) * 4.0,
        y + (Math.random() - 0.5) * 1.0,
        z + (Math.random() - 0.5) * 4.0
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        1.2 + Math.random() * 1.5,
        (Math.random() - 0.5) * 1.5
      ),
      color: new THREE.Color(0xa5f3fc),
      size: 0.5 + Math.random() * 0.4,
      maxLife: 1.2 + Math.random() * 0.8,
      life: 0,
      alpha: 0.6,
    });
  }

  public update(dt: number) {
    let activeCount = 0;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        // Remove dead particle
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 3.5 * dt; // mild gravity
      p.velocity.multiplyScalar(0.96); // drag

      // Progress ratio (0 to 1)
      const progress = p.life / p.maxLife;
      const fade = 1 - progress;

      // Write to buffer
      const idx = activeCount * 3;
      this.positions[idx] = p.position.x;
      this.positions[idx + 1] = p.position.y;
      this.positions[idx + 2] = p.position.z;

      this.colors[idx] = p.color.r * fade;
      this.colors[idx + 1] = p.color.g * fade;
      this.colors[idx + 2] = p.color.b * fade;

      activeCount++;
    }

    // Hide remaining positions
    for (let i = activeCount; i < this.maxParticles; i++) {
      const idx = i * 3;
      this.positions[idx] = 0;
      this.positions[idx + 1] = -999;
      this.positions[idx + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
