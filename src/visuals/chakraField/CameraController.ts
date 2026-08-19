import * as THREE from "three";
import { dampVector2 } from "./math";
import type { InteractionState, RenderState } from "./types";

export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  motionScale = 1;
  private orbit = new THREE.Vector2();
  private targetOrbit = new THREE.Vector2();
  private target = new THREE.Vector3(0, 0.05, 0);

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 80);
    this.camera.position.set(0, 0.08, 7.2);
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  update(state: RenderState, interaction: InteractionState) {
    const cameraDrift = (state.reducedMotion ? 0.14 : 0.28) * this.motionScale;
    this.targetOrbit.set(
      interaction.smoothPointer.x * 0.16 * this.motionScale +
        Math.sin(state.elapsed * 0.13) * cameraDrift,
      interaction.smoothPointer.y * 0.08 * this.motionScale +
        Math.cos(state.elapsed * 0.1) * cameraDrift * 0.32,
    );

    dampVector2(this.orbit, this.targetOrbit, 1.7, state.delta);

    const dolly = Math.sin(state.loopPhase * Math.PI * 2) * 0.14 - state.intro * 0.14;
    const z = 7.25 + dolly - state.expansion * 0.18 - state.activation * 0.34;

    this.camera.position.set(this.orbit.x * 0.36, 0.08 + this.orbit.y * 0.24, z);
    this.target.set(this.orbit.x * 0.08, 0.04 + this.orbit.y * 0.05 + state.activation * 0.03, 0);
    this.camera.lookAt(this.target);
  }
}
