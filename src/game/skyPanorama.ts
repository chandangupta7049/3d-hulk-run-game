import * as THREE from 'three';

/**
 * Generates an ultra-high-definition panoramic sky texture
 * featuring a breathtaking golden sunrise breaking over ancient jungle mountains,
 * complete with a radiant sun, volumetric god rays, fluffy lit clouds, and distant peaks.
 */
export function createBeautifulSkyTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. SKY GRADIENT (Zenith Deep Cosmic Indigo to Horizon Tropical Mist)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0.0, '#071626');  // High atmosphere deep cosmic midnight indigo
  skyGrad.addColorStop(0.22, '#0d2d3e'); // Twilight sapphire
  skyGrad.addColorStop(0.40, '#155563'); // Radiant morning teal
  skyGrad.addColorStop(0.55, '#287970'); // Lush jungle canopy haze
  skyGrad.addColorStop(0.66, '#dc6843'); // Glowing coral peach sunrise blush
  skyGrad.addColorStop(0.76, '#f39c12'); // Blazing amber golden light
  skyGrad.addColorStop(0.85, '#fbc531'); // Radiant solar gold
  skyGrad.addColorStop(0.92, '#fde047'); // Warm golden horizon line
  skyGrad.addColorStop(1.0, '#13382c');  // Rich emerald jungle mist (matches scene fog 100%)
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. CELESTIAL STARS & SPARKLES IN ZENITH
  ctx.save();
  for (let i = 0; i < 110; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * (height * 0.35); // only in upper indigo sky
    const radius = 0.6 + Math.random() * 1.5;
    const brightness = 0.4 + Math.random() * 0.6;

    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Occasional 4-point twinkle diffraction spikes
    if (i % 12 === 0) {
      ctx.strokeStyle = `rgba(254, 240, 138, ${brightness * 0.7})`;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy);
      ctx.lineTo(sx + 5, sy);
      ctx.moveTo(sx, sy - 5);
      ctx.lineTo(sx, sy + 5);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. RADIANT SUN DISK, CORONA & VOLUMETRIC GOD RAYS
  // Centered at X = 1024 (facing forward +Z heading down the runner track)
  const sunX = width / 2;
  const sunY = height * 0.74;

  ctx.save();

  // 3a. Massive Atmospheric Sun Bloom (Wide soft aura)
  const bloomGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 680);
  bloomGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  bloomGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.75)');
  bloomGrad.addColorStop(0.28, 'rgba(251, 191, 36, 0.45)');
  bloomGrad.addColorStop(0.50, 'rgba(249, 115, 22, 0.22)');
  bloomGrad.addColorStop(0.75, 'rgba(220, 38, 38, 0.08)');
  bloomGrad.addColorStop(1.0, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = bloomGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 680, 0, Math.PI * 2);
  ctx.fill();

  // 3b. 18 Dramatic Volumetric God Rays (Sunbeams fanning upwards into the sky)
  const rayCount = 18;
  for (let r = 0; r < rayCount; r++) {
    const angle = -Math.PI * 0.85 + (r / (rayCount - 1)) * Math.PI * 0.7; // fanning upwards
    const rayLength = 550 + Math.sin(r * 2.3) * 120;
    const spread = 0.06 + Math.random() * 0.04;

    const x1 = sunX + Math.cos(angle - spread) * rayLength;
    const y1 = sunY + Math.sin(angle - spread) * rayLength;
    const x2 = sunX + Math.cos(angle + spread) * rayLength;
    const y2 = sunY + Math.sin(angle + spread) * rayLength;

    const rayGrad = ctx.createLinearGradient(sunX, sunY, (x1 + x2) / 2, (y1 + y2) / 2);
    rayGrad.addColorStop(0.0, 'rgba(255, 255, 230, 0.35)');
    rayGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.22)');
    rayGrad.addColorStop(0.75, 'rgba(251, 191, 36, 0.08)');
    rayGrad.addColorStop(1.0, 'rgba(251, 191, 36, 0.0)');

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }

  // 3c. Pure White-Hot Sun Core & Golden Solar Flare Ring
  const coreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 85);
  coreGrad.addColorStop(0.0, '#ffffff');
  coreGrad.addColorStop(0.45, '#fffbeb');
  coreGrad.addColorStop(0.75, 'rgba(254, 240, 138, 0.95)');
  coreGrad.addColorStop(1.0, 'rgba(245, 158, 11, 0.0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 85, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 4. PAINTED VOLUMETRIC CUMULUS & CIRRUS CLOUDS
  ctx.save();
  const cloudClusters = [
    { x: 300, y: 520, scale: 1.1, numPuffs: 14 },
    { x: 720, y: 460, scale: 1.4, numPuffs: 18 },
    { x: 1340, y: 480, scale: 1.35, numPuffs: 17 },
    { x: 1750, y: 530, scale: 1.15, numPuffs: 15 },
    { x: 1024, y: 410, scale: 1.6, numPuffs: 22 }, // Magnificent cloud directly above sun
    { x: 150, y: 340, scale: 0.8, numPuffs: 9 },
    { x: 1900, y: 350, scale: 0.8, numPuffs: 9 },
  ];

  for (const c of cloudClusters) {
    // Distance from sun determines how warmly backlit the cloud is
    const distToSun = Math.hypot(c.x - sunX, c.y - sunY);
    const sunProximity = Math.max(0, 1 - distToSun / 1000);

    for (let p = 0; p < c.numPuffs; p++) {
      const px = c.x + (p - c.numPuffs / 2) * (26 * c.scale) + Math.sin(p * 2) * 15;
      const py = c.y + Math.sin(p * 1.5) * (18 * c.scale) - Math.abs(p - c.numPuffs / 2) * 4;
      const pr = (36 + Math.sin(p * 3.1) * 16) * c.scale;

      // Soft illuminated cloud puff
      const puffGrad = ctx.createRadialGradient(px, py - pr * 0.35, pr * 0.1, px, py, pr);

      // Lit top edge: golden cream or bright warm white
      if (sunProximity > 0.4) {
        puffGrad.addColorStop(0.0, 'rgba(255, 255, 245, 0.75)');
        puffGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.55)');
        puffGrad.addColorStop(0.70, 'rgba(244, 162, 97, 0.35)');
        puffGrad.addColorStop(1.0, 'rgba(120, 60, 80, 0.0)');
      } else {
        puffGrad.addColorStop(0.0, 'rgba(250, 245, 255, 0.65)');
        puffGrad.addColorStop(0.40, 'rgba(230, 215, 245, 0.45)');
        puffGrad.addColorStop(0.75, 'rgba(80, 70, 100, 0.25)');
        puffGrad.addColorStop(1.0, 'rgba(50, 40, 70, 0.0)');
      }

      ctx.fillStyle = puffGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Wispy high-altitude cirrus feather bands
  for (let b = 0; b < 6; b++) {
    const by = 240 + b * 45;
    const bandGrad = ctx.createLinearGradient(0, by - 20, 0, by + 20);
    bandGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    bandGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.18)');
    bandGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bandGrad;

    ctx.beginPath();
    ctx.moveTo(0, by);
    for (let bx = 0; bx <= width; bx += 80) {
      const wave = Math.sin(bx * 0.006 + b * 2) * 22;
      ctx.lineTo(bx, by + wave);
    }
    ctx.lineTo(width, by + 40);
    ctx.lineTo(0, by + 40);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 5. DISTANT MOUNTAIN HORIZON SILHOUETTES & ANCIENT RUIN CRESTS
  ctx.save();

  // 5a. Far Jagged Alpine & Temple Spire Range (Soft atmospheric misty purple/teal)
  ctx.fillStyle = 'rgba(21, 48, 56, 0.65)';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.85);

  for (let x = 0; x <= width; x += 12) {
    const peak1 = Math.sin(x * 0.008) * 65;
    const peak2 = Math.sin(x * 0.022) * 35;
    const peak3 = Math.cos(x * 0.045) * 18;
    const y = height * 0.83 + peak1 + peak2 + peak3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 5b. Mid-Ground Jungle Ridges & Ancient Stepped Pyramid Silhouettes
  ctx.fillStyle = 'rgba(15, 45, 36, 0.85)';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.89);

  for (let x = 0; x <= width; x += 10) {
    let ridge = Math.sin(x * 0.006 + 1.2) * 45 + Math.cos(x * 0.018) * 25;

    // Distant Stepped Temple silhouettes along ridges
    if ((x > 380 && x < 460) || (x > 1580 && x < 1660)) {
      ridge -= 35; // pyramid crest
    }

    const y = height * 0.88 + ridge;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 5c. Low-Lying Rainforest Morning Canopy Mist (Soft blend into 3D fog)
  const mistGrad = ctx.createLinearGradient(0, height * 0.88, 0, height);
  mistGrad.addColorStop(0.0, 'rgba(19, 56, 44, 0.0)');
  mistGrad.addColorStop(0.45, 'rgba(19, 56, 44, 0.65)');
  mistGrad.addColorStop(1.0, '#13382c'); // Exactly equals 3D fog color
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, height * 0.88, width, height * 0.12);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
