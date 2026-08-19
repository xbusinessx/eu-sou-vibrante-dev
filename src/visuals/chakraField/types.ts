import * as THREE from "three";

export type QualityLevel = "low" | "medium" | "high";

export interface QualityProfile {
  level: QualityLevel;
  pixelRatio: number;
  maxFps: number;
  torusLines: number;
  samplesPerLine: number;
  fieldParticles: number;
  backgroundParticles: number;
  chakraParticles: number;
  enableBackground: boolean;
  enableHolographicShell: boolean;
  enableCoreWireframe: boolean;
}

export interface ScrollState {
  progress: number;
  chapter: number;
  localProgress: number;
}

export interface ScrollDirectorState extends ScrollState {
  rootX: number;
  rootY: number;
  rootZ: number;
  rootRotationX: number;
  rootRotationY: number;
  rootRotationZ: number;
  rootScale: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  cameraTargetX: number;
  cameraTargetY: number;
  cameraTargetZ: number;
  cameraRoll: number;
  cameraFov: number;
  energyY: number;
  energyIntensity: number;
  expansion: number;
  activation: number;
  presence: number;
}

export interface RenderState {
  delta: number;
  elapsed: number;
  intro: number;
  loopPhase: number;
  breath: number;
  energyY: number;
  energyIntensity: number;
  expansion: number;
  activation: number;
  activationAge: number;
  chakraPulseIndex: number;
  chakraPulseStrength: number;
  crownFlash: number;
  ringPulse: number;
  reducedMotion: boolean;
  scrollProgress: number;
  scrollChapter: number;
  scrollLocalProgress: number;
}

export interface InteractionState {
  pointer: THREE.Vector2;
  smoothPointer: THREE.Vector2;
  hoverIndex: number;
  hoverStrength: number;
  activation: number;
  activationAge: number;
  ringPulse: number;
  chakraPulseIndex: number;
  chakraPulseStrength: number;
}

export interface ChakraDefinition {
  id: string;
  label: string;
  color: THREE.Color;
  y: number;
  radius: number;
  phase: number;
  frequency: number;
}

export interface SceneControllerOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface SceneSystem {
  update(state: RenderState, interaction: InteractionState): void;
  dispose(): void;
}
