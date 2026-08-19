import * as THREE from "three";

export type QualityLevel = "low" | "medium" | "high";

export interface QualityProfile {
  level: QualityLevel;
  pixelRatio: number;
  torusLines: number;
  samplesPerLine: number;
  fieldParticles: number;
  backgroundParticles: number;
  chakraParticles: number;
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
}

export interface SceneSystem {
  update(state: RenderState, interaction: InteractionState): void;
  dispose(): void;
}
