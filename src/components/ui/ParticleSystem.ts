import * as THREE from "three";

export class ParticleSystem {
  private particles: THREE.Points;
  private particleCount: number;
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterial: THREE.PointsMaterial;

  constructor(scene: THREE.Scene, count: number = 1000) {
    this.particleCount = count;
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
    });

    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random();
    }

    this.particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    this.particleGeometry.setAttribute(
      "scale",
      new THREE.BufferAttribute(scales, 1),
    );

    this.particles = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial,
    );
    scene.add(this.particles);
  }

  update() {
    const positions = this.particleGeometry.attributes.position
      .array as Float32Array;
    const scales = this.particleGeometry.attributes.scale.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += 0.01 * scales[i];

      if (positions[i3 + 1] > 5) {
        positions[i3 + 1] = -5;
      }
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
  }
}
