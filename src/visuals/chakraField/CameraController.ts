import * as THREE from "three";
import { damp, dampVector2 } from "./math";
import type { InteractionState, RenderState, ScrollDirectorState } from "./types";

export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  motionScale = 1;
  private orbit = new THREE.Vector2();
  private targetOrbit = new THREE.Vector2();
  private target = new THREE.Vector3(0, 0.05, 0);
  private currentFov = 34;

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 80);
    this.camera.position.set(0, 0.08, 7.2);
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  update(
    state: RenderState,
    interaction: InteractionState,
    narrative: ScrollDirectorState,
  ) {
    const cameraDrift = (state.reducedMotion ? 0.14 : 0.28) * this.motionScale;
    this.targetOrbit.set(
      interaction.smoothPointer.x * 0.16 * this.motionScale +
        Math.sin(state.elapsed * 0.13) * cameraDrift,
      interaction.smoothPointer.y * 0.08 * this.motionScale +
        Math.cos(state.elapsed * 0.1) * cameraDrift * 0.32,
    );

    dampVector2(this.orbit, this.targetOrbit, 1.7, state.delta);

    const dolly = state.reducedMotion
      ? 0
      : Math.sin(state.loopPhase * Math.PI * 2) * 0.1 - state.activation * 0.18;
    const z = narrative.cameraZ + dolly - state.expansion * 0.06;

    this.camera.position.set(
      narrative.cameraX + this.orbit.x * 0.36,
      narrative.cameraY + this.orbit.y * 0.24,
      z,
    );
    this.target.set(
      narrative.cameraTargetX + this.orbit.x * 0.08,
      narrative.cameraTargetY + this.orbit.y * 0.05 + state.activation * 0.03,
      narrative.cameraTargetZ,
    );

    this.currentFov = state.reducedMotion
      ? narrative.cameraFov
      : damp(this.currentFov, narrative.cameraFov, 7, state.delta);
    if (Math.abs(this.camera.fov - this.currentFov) > 0.005) {
      this.camera.fov = this.currentFov;
      this.camera.updateProjectionMatrix();
    }

    this.camera.lookAt(this.target);
    this.camera.rotateZ(narrative.cameraRoll);
  }
}
