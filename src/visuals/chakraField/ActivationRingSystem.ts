import * as THREE from "three";
import { ResourceManager } from "./ResourceManager";
import type { RenderState, SceneSystem } from "./types";

export class ActivationRingSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly rings: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly colors = [
    new THREE.Color("#ffe7a0"),
    new THREE.Color("#80fff1"),
    new THREE.Color("#d8a6ff"),
  ];

  constructor(resources: ResourceManager) {
    this.group.position.set(0, -1.18, 0.22);

    for (let index = 0; index < 3; index += 1) {
      const material = resources.track(
        new THREE.MeshBasicMaterial({
          color: this.colors[index],
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide,
        }),
      );
      const geometry = resources.track(new THREE.TorusGeometry(0.48, 0.0045, 8, 180));
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI * 0.5;
      ring.rotation.z = index * 0.28;
      ring.renderOrder = 7;
      this.group.add(ring);
      this.rings.push(ring);
    }
  }

  update(state: RenderState) {
    const activeGlow = Math.max(state.ringPulse, state.activation * 0.16);

    this.rings.forEach((ring, index) => {
      const offset = index * 0.16;
      const progress = Math.min(1, Math.max(0, state.activationAge * 0.42 - offset));
      const calmWave = 0.5 + 0.5 * Math.sin(state.elapsed * (0.55 + index * 0.08) + index);
      const size = 1.1 + progress * (2.4 + index * 0.42) + calmWave * 0.04;
      ring.scale.set(size * 1.38, size * 0.42, size);
      ring.rotation.z += state.delta * (0.06 + state.activation * 0.38 + index * 0.02);
      ring.material.opacity =
        state.intro *
        Math.min(0.46, (1 - progress) * activeGlow * (0.36 - index * 0.05) + state.activation * 0.03);
    });
  }

  dispose() {
    this.group.clear();
  }
}
