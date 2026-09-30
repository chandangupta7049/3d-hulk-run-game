import * as THREE from 'three';
import { PlayerAction } from './types';

export class PlayerModel {
  public group: THREE.Group;
  public bodyPivot: THREE.Group;
  public torso!: THREE.Mesh;
  public head!: THREE.Group;
  public leftArm!: THREE.Group;
  public rightArm!: THREE.Group;
  public leftLeg!: THREE.Group;
  public rightLeg!: THREE.Group;

  // Power-up visual effects
  public shieldMesh!: THREE.Mesh;
  public shieldRing!: THREE.Mesh;
  public magnetMesh!: THREE.Group;

  // Animation state
  public animTime = 0;
  public currentAction: PlayerAction = 'RUN';
  public laneLean = 0;
  public targetLaneLean = 0;
  public skin: string = 'adventurer';

  // Materials saved for skinning (Jade Hulk / Crimson Rager / Gladiator Colossus)
  private skinMat!: THREE.MeshStandardMaterial;
  private skinShadeMat!: THREE.MeshStandardMaterial;
  private pantsMat!: THREE.MeshStandardMaterial;
  private hairMat!: THREE.MeshStandardMaterial;
  private eyeMat!: THREE.MeshBasicMaterial;
  private bracerMat!: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.bodyPivot = new THREE.Group();
    this.group.add(this.bodyPivot);

    this.createMaterials();
    this.buildCharacterMesh();
    this.buildPowerUpMeshes();
    this.setSkin('adventurer');
  }

  private createMaterials() {
    // 1. Hulk Green Gamma-Titan Skin
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Vibrant Emerald Hulk Green
      roughness: 0.55,
      metalness: 0.05,
    });

    this.skinShadeMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Deep Forest Green (pec & ab muscle depth)
      roughness: 0.65,
    });

    // 2. Iconic Ripped Purple Shorts
    this.pantsMat = new THREE.MeshStandardMaterial({
      color: 0x7e22ce, // Torn Vibrant Purple Shorts
      roughness: 0.85,
      metalness: 0.0,
    });

    // 3. Wild Untamed Hair
    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep Raven / Midnight Black
      roughness: 0.9,
    });

    // 4. Fierce Glowing Eyes
    this.eyeMat = new THREE.MeshBasicMaterial({
      color: 0x86efac, // Piercing radioactive emerald glow
    });

    // 5. Gladiator / Accent Bracers
    this.bracerMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.6,
    });
  }

  public setSkin(skin: string) {
    this.skin = skin;
    if (skin === 'shadow' || skin === 'crimson') {
      // Crimson Rager (Fiery Red Titan / Red Hulk)
      this.skinMat.color.setHex(0xdc2626);
      this.skinShadeMat.color.setHex(0x991b1b);
      this.pantsMat.color.setHex(0x18181b); // Scorched Obsidian black shorts
      this.hairMat.color.setHex(0x09090b);
      this.eyeMat.color.setHex(0xfacc15); // Blazing magma eyes
      this.bracerMat.color.setHex(0x27272a);
    } else if (skin === 'golden' || skin === 'gladiator') {
      // Gladiator Colossus (Armored Battle Titan)
      this.skinMat.color.setHex(0x15803d); // Deep battle green
      this.skinShadeMat.color.setHex(0x166534);
      this.pantsMat.color.setHex(0xb45309); // Gladiator bronze leather kilt
      this.hairMat.color.setHex(0x451a03);
      this.eyeMat.color.setHex(0xfef08a);
      this.bracerMat.color.setHex(0xd97706); // Gilded spikes
      this.bracerMat.metalness = 0.8;
      this.bracerMat.roughness = 0.3;
    } else {
      // Classic Jade Behemoth (Emerald Hulk)
      this.skinMat.color.setHex(0x16a34a);
      this.skinShadeMat.color.setHex(0x14532d);
      this.pantsMat.color.setHex(0x7e22ce);
      this.hairMat.color.setHex(0x0f172a);
      this.eyeMat.color.setHex(0x86efac);
      this.bracerMat.color.setHex(0x475569);
      this.bracerMat.metalness = 0.5;
    }
  }

  private buildCharacterMesh() {
    // -------------------------------------------------------------
    // 1. MASSIVE HULK V-TAPER TORSO & CHEST
    // -------------------------------------------------------------
    const torsoGeo = new THREE.BoxGeometry(0.88, 0.76, 0.52);
    this.torso = new THREE.Mesh(torsoGeo, this.skinMat);
    this.torso.position.y = 1.25;
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.bodyPivot.add(this.torso);

    // Giant Sculpted Pectoral Muscles (Pecs)
    const pecGeo = new THREE.BoxGeometry(0.38, 0.3, 0.16);
    const leftPec = new THREE.Mesh(pecGeo, this.skinMat);
    leftPec.position.set(-0.21, 0.16, 0.22);
    leftPec.rotation.z = -0.08;
    leftPec.castShadow = true;

    const rightPec = new THREE.Mesh(pecGeo, this.skinMat);
    rightPec.position.set(0.21, 0.16, 0.22);
    rightPec.rotation.z = 0.08;
    rightPec.castShadow = true;
    this.torso.add(leftPec, rightPec);

    // Deep Chest Center Cleavage Line
    const centerLineGeo = new THREE.BoxGeometry(0.04, 0.32, 0.18);
    const centerLine = new THREE.Mesh(centerLineGeo, this.skinShadeMat);
    centerLine.position.set(0, 0.16, 0.22);
    this.torso.add(centerLine);

    // 6-Pack Abdominal Muscles
    const absUpperGeo = new THREE.BoxGeometry(0.38, 0.1, 0.1);
    const absUpper = new THREE.Mesh(absUpperGeo, this.skinMat);
    absUpper.position.set(0, -0.05, 0.22);

    const absMidGeo = new THREE.BoxGeometry(0.34, 0.1, 0.09);
    const absMid = new THREE.Mesh(absMidGeo, this.skinMat);
    absMid.position.set(0, -0.16, 0.21);

    const absLowerGeo = new THREE.BoxGeometry(0.3, 0.1, 0.08);
    const absLower = new THREE.Mesh(absLowerGeo, this.skinMat);
    absLower.position.set(0, -0.27, 0.2);
    this.torso.add(absUpper, absMid, absLower);

    // Abdominal center tendon line
    const abLineGeo = new THREE.BoxGeometry(0.04, 0.35, 0.11);
    const abLine = new THREE.Mesh(abLineGeo, this.skinShadeMat);
    abLine.position.set(0, -0.16, 0.21);
    this.torso.add(abLine);

    // Huge Flaring Latissimus Dorsi (Lats - V-taper wings)
    const latGeo = new THREE.BoxGeometry(0.18, 0.52, 0.42);
    const leftLat = new THREE.Mesh(latGeo, this.skinMat);
    leftLat.position.set(-0.46, 0.06, -0.02);
    leftLat.rotation.z = -0.15;
    leftLat.castShadow = true;

    const rightLat = new THREE.Mesh(latGeo, this.skinMat);
    rightLat.position.set(0.46, 0.06, -0.02);
    rightLat.rotation.z = 0.15;
    rightLat.castShadow = true;
    this.torso.add(leftLat, rightLat);

    // Massive Trapezius Muscles (Hulk neck bulges)
    const trapGeo = new THREE.BoxGeometry(0.24, 0.22, 0.34);
    const leftTrap = new THREE.Mesh(trapGeo, this.skinMat);
    leftTrap.position.set(-0.32, 0.44, -0.04);
    leftTrap.rotation.z = -0.28;
    leftTrap.castShadow = true;

    const rightTrap = new THREE.Mesh(trapGeo, this.skinMat);
    rightTrap.position.set(0.32, 0.44, -0.04);
    rightTrap.rotation.z = 0.28;
    rightTrap.castShadow = true;
    this.torso.add(leftTrap, rightTrap);

    // -------------------------------------------------------------
    // 2. RIPPED TORN SHORTS WAISTBAND & JAGGED SHREDS
    // -------------------------------------------------------------
    const waistGeo = new THREE.BoxGeometry(0.78, 0.22, 0.48);
    const waist = new THREE.Mesh(waistGeo, this.pantsMat);
    waist.position.set(0, -0.38, 0);
    waist.castShadow = true;
    this.torso.add(waist);

    // Shredded jagged cloth tears hanging at waist
    for (let i = -3; i <= 3; i++) {
      const tearGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
      tearGeo.rotateX(Math.PI);
      const tear = new THREE.Mesh(tearGeo, this.pantsMat);
      tear.position.set(i * 0.11, -0.48, 0.24);
      this.torso.add(tear);
    }

    // -------------------------------------------------------------
    // 3. FIERCE CRAGGY HULK HEAD & JAW
    // -------------------------------------------------------------
    this.head = new THREE.Group();
    this.head.position.set(0, 0.52, 0.08);

    // Chiseled massive square jaw & head
    const craniumGeo = new THREE.BoxGeometry(0.48, 0.46, 0.44);
    const cranium = new THREE.Mesh(craniumGeo, this.skinMat);
    cranium.castShadow = true;
    this.head.add(cranium);

    // Heavy jutting jawline
    const jawGeo = new THREE.BoxGeometry(0.46, 0.2, 0.42);
    const jaw = new THREE.Mesh(jawGeo, this.skinMat);
    jaw.position.set(0, -0.16, 0.08);
    this.head.add(jaw);

    // Pronounced angry brow ridge
    const browGeo = new THREE.BoxGeometry(0.5, 0.14, 0.18);
    const brow = new THREE.Mesh(browGeo, this.skinShadeMat);
    brow.position.set(0, 0.12, 0.18);
    brow.rotation.x = 0.12;
    this.head.add(brow);

    // Piercing Glowing Eyes
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.04, 0.05);
    const leftEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    leftEye.position.set(-0.13, 0.08, 0.23);
    leftEye.rotation.z = -0.15;

    const rightEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    rightEye.position.set(0.13, 0.08, 0.23);
    rightEye.rotation.z = 0.15;
    this.head.add(leftEye, rightEye);

    // Angry snarl mouth / teeth
    const mouthGeo = new THREE.BoxGeometry(0.24, 0.06, 0.04);
    const teethMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const mouth = new THREE.Mesh(mouthGeo, teethMat);
    mouth.position.set(0, -0.12, 0.23);
    this.head.add(mouth);

    // Wild spiky untamed dark hair tufts
    const hairCrownGeo = new THREE.BoxGeometry(0.52, 0.16, 0.48);
    const hairCrown = new THREE.Mesh(hairCrownGeo, this.hairMat);
    hairCrown.position.set(0, 0.26, -0.02);
    this.head.add(hairCrown);

    // Jagged hair spikes
    const spikeGeo = new THREE.ConeGeometry(0.1, 0.22, 5);
    for (let i = -2; i <= 2; i++) {
      const spike = new THREE.Mesh(spikeGeo, this.hairMat);
      spike.position.set(i * 0.1, 0.36, -i * 0.03);
      spike.rotation.z = -i * 0.15;
      spike.rotation.x = -0.2;
      this.head.add(spike);
    }

    this.torso.add(this.head);

    // -------------------------------------------------------------
    // 4. TITANIC LEFT ARM (Biceps, Forearm, Heavy Clenched Fist)
    // -------------------------------------------------------------
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.56, 0.28, 0);

    // Boulder Shoulder Deltoid
    const deltGeo = new THREE.SphereGeometry(0.28, 8, 8);
    deltGeo.scale(1, 1.2, 1);
    const leftDelt = new THREE.Mesh(deltGeo, this.skinMat);
    leftDelt.castShadow = true;
    this.leftArm.add(leftDelt);

    // Massive Upper Arm / Bicep
    const bicepGeo = new THREE.BoxGeometry(0.34, 0.42, 0.36);
    const leftBicep = new THREE.Mesh(bicepGeo, this.skinMat);
    leftBicep.position.set(0, -0.26, 0);
    leftBicep.castShadow = true;
    this.leftArm.add(leftBicep);

    // Bulging Forearm
    const forearmGeo = new THREE.BoxGeometry(0.36, 0.46, 0.38);
    const leftForearm = new THREE.Mesh(forearmGeo, this.skinMat);
    leftForearm.position.set(0, -0.62, 0.04);
    leftForearm.castShadow = true;
    this.leftArm.add(leftForearm);

    // Heavy Clenched Smashing Fist
    const fistGeo = new THREE.BoxGeometry(0.38, 0.34, 0.42);
    const leftFist = new THREE.Mesh(fistGeo, this.skinMat);
    leftFist.position.set(0, -0.92, 0.06);
    leftFist.castShadow = true;
    this.leftArm.add(leftFist);

    // Knuckles detail
    const knuckleGeo = new THREE.BoxGeometry(0.38, 0.1, 0.1);
    const leftKnuckles = new THREE.Mesh(knuckleGeo, this.skinShadeMat);
    leftKnuckles.position.set(0, -0.96, 0.26);
    this.leftArm.add(leftKnuckles);

    this.torso.add(this.leftArm);

    // -------------------------------------------------------------
    // 5. TITANIC RIGHT ARM (Biceps, Forearm, Heavy Clenched Fist)
    // -------------------------------------------------------------
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.56, 0.28, 0);

    const rightDelt = new THREE.Mesh(deltGeo, this.skinMat);
    rightDelt.castShadow = true;
    this.rightArm.add(rightDelt);

    const rightBicep = new THREE.Mesh(bicepGeo, this.skinMat);
    rightBicep.position.set(0, -0.26, 0);
    rightBicep.castShadow = true;
    this.rightArm.add(rightBicep);

    const rightForearm = new THREE.Mesh(forearmGeo, this.skinMat);
    rightForearm.position.set(0, -0.62, 0.04);
    rightForearm.castShadow = true;
    this.rightArm.add(rightForearm);

    const rightFist = new THREE.Mesh(fistGeo, this.skinMat);
    rightFist.position.set(0, -0.92, 0.06);
    rightFist.castShadow = true;
    this.rightArm.add(rightFist);

    const rightKnuckles = new THREE.Mesh(knuckleGeo, this.skinShadeMat);
    rightKnuckles.position.set(0, -0.96, 0.26);
    this.rightArm.add(rightKnuckles);

    this.torso.add(this.rightArm);

    // -------------------------------------------------------------
    // 6. TREE-TRUNK LEGS (Torn Shorts, Massive Calves, Bare Feet)
    // -------------------------------------------------------------
    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.25, 0.86, 0);

    // Upper Thigh covered in shredded purple pants
    const thighPantsGeo = new THREE.BoxGeometry(0.38, 0.38, 0.42);
    const leftThighPants = new THREE.Mesh(thighPantsGeo, this.pantsMat);
    leftThighPants.position.set(0, -0.2, 0);
    leftThighPants.castShadow = true;
    this.leftLeg.add(leftThighPants);

    // Frayed torn cloth hem at bottom of shorts
    for (let i = -1; i <= 1; i++) {
      const hemGeo = new THREE.ConeGeometry(0.06, 0.16, 4);
      hemGeo.rotateX(Math.PI);
      const hem = new THREE.Mesh(hemGeo, this.pantsMat);
      hem.position.set(i * 0.12, -0.44, 0.2);
      this.leftLeg.add(hem);
    }

    // Bare muscular green lower thigh & knee
    const kneeGeo = new THREE.BoxGeometry(0.34, 0.26, 0.36);
    const leftKnee = new THREE.Mesh(kneeGeo, this.skinMat);
    leftKnee.position.set(0, -0.42, 0);
    leftKnee.castShadow = true;
    this.leftLeg.add(leftKnee);

    // Bulging green calf
    const calfGeo = new THREE.BoxGeometry(0.36, 0.44, 0.4);
    const leftCalf = new THREE.Mesh(calfGeo, this.skinMat);
    leftCalf.position.set(0, -0.72, -0.02);
    leftCalf.castShadow = true;
    this.leftLeg.add(leftCalf);

    // Heavy bare stomping foot
    const footGeo = new THREE.BoxGeometry(0.38, 0.2, 0.58);
    const leftFoot = new THREE.Mesh(footGeo, this.skinMat);
    leftFoot.position.set(0, -0.98, 0.1);
    leftFoot.castShadow = true;
    this.leftLeg.add(leftFoot);

    // Big green toes
    const toesGeo = new THREE.BoxGeometry(0.38, 0.14, 0.14);
    const leftToes = new THREE.Mesh(toesGeo, this.skinShadeMat);
    leftToes.position.set(0, -0.98, 0.38);
    this.leftLeg.add(leftToes);

    this.bodyPivot.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.25, 0.86, 0);

    const rightThighPants = new THREE.Mesh(thighPantsGeo, this.pantsMat);
    rightThighPants.position.set(0, -0.2, 0);
    rightThighPants.castShadow = true;
    this.rightLeg.add(rightThighPants);

    for (let i = -1; i <= 1; i++) {
      const hemGeo = new THREE.ConeGeometry(0.06, 0.16, 4);
      hemGeo.rotateX(Math.PI);
      const hem = new THREE.Mesh(hemGeo, this.pantsMat);
      hem.position.set(i * 0.12, -0.44, 0.2);
      this.rightLeg.add(hem);
    }

    const rightKnee = new THREE.Mesh(kneeGeo, this.skinMat);
    rightKnee.position.set(0, -0.42, 0);
    rightKnee.castShadow = true;
    this.rightLeg.add(rightKnee);

    const rightCalf = new THREE.Mesh(calfGeo, this.skinMat);
    rightCalf.position.set(0, -0.72, -0.02);
    rightCalf.castShadow = true;
    this.rightLeg.add(rightCalf);

    const rightFoot = new THREE.Mesh(footGeo, this.skinMat);
    rightFoot.position.set(0, -0.98, 0.1);
    rightFoot.castShadow = true;
    this.rightLeg.add(rightFoot);

    const rightToes = new THREE.Mesh(toesGeo, this.skinShadeMat);
    rightToes.position.set(0, -0.98, 0.38);
    this.rightLeg.add(rightToes);

    this.bodyPivot.add(this.rightLeg);
  }

  private buildPowerUpMeshes() {
    // Shield Orb - Titan Gamma Dome
    const shieldGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.1;
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    // Shield Orbit Ring
    const ringGeo = new THREE.TorusGeometry(1.45, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.75 });
    this.shieldRing = new THREE.Mesh(ringGeo, ringMat);
    this.shieldRing.rotation.x = Math.PI / 3;
    this.shieldRing.position.y = 1.1;
    this.shieldRing.visible = false;
    this.group.add(this.shieldRing);

    // Magnet Rings
    this.magnetMesh = new THREE.Group();
    const magnetTorusGeo = new THREE.TorusGeometry(0.95, 0.05, 8, 24);
    const magnetMat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.8 });
    const mRing1 = new THREE.Mesh(magnetTorusGeo, magnetMat);
    const mRing2 = new THREE.Mesh(magnetTorusGeo, magnetMat);
    mRing2.rotation.x = Math.PI / 2;
    this.magnetMesh.add(mRing1, mRing2);
    this.magnetMesh.position.y = 1.1;
    this.magnetMesh.visible = false;
    this.group.add(this.magnetMesh);
  }

  public update(dt: number, speed: number, action: PlayerAction, hasShield: boolean, hasMagnet: boolean, hasBoost: boolean) {
    this.currentAction = action;
    this.animTime += dt * (speed / 16);

    // Smooth lane banking / lean
    this.laneLean = THREE.MathUtils.lerp(this.laneLean, this.targetLaneLean, dt * 14);
    this.group.rotation.z = -this.laneLean * 0.22;
    this.group.rotation.y = this.laneLean * 0.24;

    // Power-up visual rotations
    if (hasShield) {
      this.shieldMesh.visible = true;
      this.shieldRing.visible = true;
      this.shieldMesh.rotation.y += dt * 2;
      this.shieldMesh.rotation.x += dt * 1.2;
      this.shieldRing.rotation.z += dt * 3;
      const pulse = 1 + Math.sin(this.animTime * 8) * 0.04;
      this.shieldMesh.scale.set(pulse, pulse, pulse);
    } else {
      this.shieldMesh.visible = false;
      this.shieldRing.visible = false;
    }

    if (hasMagnet) {
      this.magnetMesh.visible = true;
      this.magnetMesh.rotation.y += dt * 4;
      this.magnetMesh.rotation.z += dt * 2.5;
    } else {
      this.magnetMesh.visible = false;
    }

    // -------------------------------------------------------------
    // ANIMATION STATES: HULK BRUTE MOVEMENT
    // -------------------------------------------------------------
    if (action === 'CRASH') {
      // Earth-shaking stumble and collapse
      this.bodyPivot.rotation.x = THREE.MathUtils.lerp(this.bodyPivot.rotation.x, -Math.PI / 2.1, dt * 10);
      this.bodyPivot.position.y = THREE.MathUtils.lerp(this.bodyPivot.position.y, 0.15, dt * 10);
      this.leftArm.rotation.x = -1.4;
      this.rightArm.rotation.x = -1.4;
      this.leftLeg.rotation.x = 0.6;
      this.rightLeg.rotation.x = -0.6;
      return;
    }

    if (action === 'SLIDE') {
      // Hulk low knuckle-drag ground slide
      this.bodyPivot.position.y = THREE.MathUtils.lerp(this.bodyPivot.position.y, -0.42, dt * 22);
      this.bodyPivot.rotation.x = THREE.MathUtils.lerp(this.bodyPivot.rotation.x, 0.9, dt * 22);

      this.leftLeg.rotation.x = -1.35; // Front leg extended
      this.rightLeg.rotation.x = 0.95;  // Back leg bent
      // Left arm drags along the stone ground!
      this.leftArm.rotation.x = 1.3;
      this.rightArm.rotation.x = 0.8;
      this.head.rotation.x = -0.7; // Looking forward ferociously
      return;
    }

    if (action === 'JUMP') {
      // Massive Titan Hulk Leap: Arms raised high into the air
      this.bodyPivot.position.y = THREE.MathUtils.lerp(this.bodyPivot.position.y, 0.1, dt * 15);
      this.bodyPivot.rotation.x = THREE.MathUtils.lerp(this.bodyPivot.rotation.x, -0.22, dt * 15);

      this.leftLeg.rotation.x = -0.7;
      this.rightLeg.rotation.x = 0.6;
      this.leftArm.rotation.x = -2.2; // Both massive arms raised high overhead!
      this.rightArm.rotation.x = -2.2;
      this.head.rotation.x = 0.2;
      return;
    }

    // -------------------------------------------------------------
    // RUN CYCLE: HEAVY HULK GROUND-POUNDING SPRINT
    // -------------------------------------------------------------
    this.bodyPivot.position.y = THREE.MathUtils.lerp(this.bodyPivot.position.y, 0, dt * 15);
    this.bodyPivot.rotation.x = 0.24; // Aggressive forward hunched stance

    const runFreq = hasBoost ? 19 : 13;
    const t = this.animTime * runFreq;

    // Heavy alternating leg stomps
    const legSwing = Math.sin(t);
    this.leftLeg.rotation.x = legSwing * 0.85;
    this.rightLeg.rotation.x = -legSwing * 0.85;

    // Powerful swinging gorilla-like arms with clenched fists
    this.leftArm.rotation.x = -legSwing * 1.05;
    this.rightArm.rotation.x = legSwing * 1.05;

    // Bulging bicep flex swing
    this.leftArm.rotation.z = -0.15 - Math.abs(Math.sin(t)) * 0.1;
    this.rightArm.rotation.z = 0.15 + Math.abs(Math.sin(t)) * 0.1;

    // Torso vertical heavy stomp bounce & muscular twist
    this.torso.position.y = 1.25 + Math.abs(Math.sin(t)) * 0.11;
    this.torso.rotation.y = Math.cos(t) * 0.12;

    // Head determined forward focus
    this.head.rotation.y = -Math.cos(t) * 0.08;
    this.head.rotation.x = -0.14;
  }
}
