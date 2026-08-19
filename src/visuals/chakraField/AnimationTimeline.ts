import * as THREE from "three";
import { chakraEnergyPosition, smoothstep } from "./math";
import type { InteractionState, RenderState } from "./types";

export class AnimationTimeline {
  private readonly reducedMotion: boolean;

  constructor(reducedMotion: boolean) {
    this.reducedMotion = reducedMotion;
  }

  update(delta: number, elapsed: number, interaction: InteractionState): RenderState {
    const introDuration = this.reducedMotion ? 1.2 : 4.2;
    const loopDuration = this.reducedMotion ? 30 : 24;
    const intro = smoothstep(0, introDuration, elapsed);
    const loopPhase = ((Math.max(0, elapsed - introDuration) % loopDuration) / loopDuration + 1) % 1;
    const breath = 0.5 + 0.5 * Math.sin(loopPhase * Math.PI * 2);

    const ascent = smoothstep(0.08, 0.58, loopPhase);
    const returnFlow = 1 - smoothstep(0.66, 0.96, loopPhase);
    const energyNormalized = loopPhase < 0.62 ? ascent : Math.max(0, returnFlow * 0.9);
    const calmExpansion =
      smoothstep(0.54, 0.7, loopPhase) * (1 - smoothstep(0.76, 0.96, loopPhase));
    const energyIntensity =
      0.34 +
      0.52 * Math.sin(Math.PI * smoothstep(0.08, 0.58, loopPhase)) +
      0.26 * calmExpansion;
    const activation = this.reducedMotion ? interaction.activation * 0.48 : interaction.activation;
    const activationProgress = smoothstep(0.08, 2.8, interaction.activationAge);
    const calmEnergyY = chakraEnergyPosition(energyNormalized * 6);
    const activationWaveY = chakraEnergyPosition(activationProgress * 6);
    const crownFlash =
      activation *
      smoothstep(2.15, 2.75, interaction.activationAge) *
      (1 - smoothstep(3.25, 4.4, interaction.activationAge));
    const selectedEnergy = interaction.chakraPulseStrength * 0.5;
    const expansion = calmExpansion + activation * 0.34 + interaction.ringPulse * 0.26;
    const combinedEnergyIntensity =
      energyIntensity + activation * 0.72 + crownFlash * 0.42 + selectedEnergy;

    return {
      delta,
      elapsed,
      intro,
      loopPhase,
      breath,
      energyY:
        activation > 0.08
          ? THREE.MathUtils.lerp(calmEnergyY, activationWaveY, activation)
          : calmEnergyY,
      energyIntensity: this.reducedMotion
        ? combinedEnergyIntensity * 0.45
        : combinedEnergyIntensity,
      expansion: this.reducedMotion ? expansion * 0.36 : expansion,
      activation,
      activationAge: interaction.activationAge,
      chakraPulseIndex: interaction.chakraPulseIndex,
      chakraPulseStrength: interaction.chakraPulseStrength,
      crownFlash,
      ringPulse: interaction.ringPulse,
      reducedMotion: this.reducedMotion,
    };
  }
}
