import * as THREE from "three";
import type { QualityProfile } from "./types";

export class PostProcessingSystem {
  constructor(renderer: THREE.WebGLRenderer, profile: QualityProfile) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = profile.level === "high" ? 1.08 : 1.0;
    renderer.setClearColor(0x030305, 0);
  }

  update(renderer: THREE.WebGLRenderer, intensity: number) {
    renderer.toneMappingExposure = 0.98 + intensity * 0.08;
  }
}
