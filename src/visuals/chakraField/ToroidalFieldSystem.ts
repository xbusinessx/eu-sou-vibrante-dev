import * as THREE from "three";
import { ResourceManager } from "./ResourceManager";
import { torusPoint } from "./math";
import type { InteractionState, QualityProfile, RenderState, SceneSystem } from "./types";

const fieldVertex = `
  attribute float aProgress;
  attribute float aPhase;
  attribute float aFamily;

  uniform float uTime;
  uniform float uIntro;
  uniform float uBreath;
  uniform float uExpansion;
  uniform float uEnergyY;
  uniform float uEnergyIntensity;
  uniform float uHoverY;
  uniform float uHoverStrength;
  uniform vec2 uPointer;

  varying float vProgress;
  varying float vPhase;
  varying float vDepth;
  varying float vEnergy;
  varying float vFamily;

  void main() {
    vec3 p = position;
    float flow = aProgress * 6.28318530718;
    float wave = sin(flow * (1.8 + aFamily * 0.42) + uTime * (0.42 + aFamily * 0.08) + aPhase);
    float breath = (uBreath - 0.5) * 0.036 + uExpansion * 0.026;
    float energyInfluence = 1.0 - smoothstep(0.0, 0.56, abs(p.y - uEnergyY));
    float hoverInfluence = uHoverStrength * (1.0 - smoothstep(0.0, 0.42, abs(p.y - uHoverY)));

    p.x *= 1.0 + breath + energyInfluence * uEnergyIntensity * 0.016 + hoverInfluence * 0.018;
    p.y *= 1.0 + breath * 0.5;
    p.z *= 1.0 + breath * 0.82;
    p.z += wave * 0.012 + energyInfluence * sin(flow * 3.0 + uTime * 1.2) * 0.018;
    p.x += uPointer.x * 0.018 * (0.25 + aFamily);
    p.y += uPointer.y * 0.009 * (0.25 + aFamily);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vProgress = aProgress;
    vPhase = aPhase;
    vDepth = smoothstep(-2.1, 2.1, p.z);
    vEnergy = energyInfluence * uEnergyIntensity + hoverInfluence;
    vFamily = aFamily;
  }
`;

const fieldFragment = `
  precision highp float;

  uniform float uTime;
  uniform float uIntro;
  uniform float uReducedMotion;

  varying float vProgress;
  varying float vPhase;
  varying float vDepth;
  varying float vEnergy;
  varying float vFamily;

  float pulseBand(float value, float center, float width) {
    float d = abs(fract(value) - center);
    d = min(d, 1.0 - d);
    return 1.0 - smoothstep(0.0, width, d);
  }

  void main() {
    float speed = mix(0.15, 0.045, uReducedMotion);
    float carrier = vProgress * (1.6 + vFamily * 0.72) - uTime * speed + vPhase * 0.09;
    float pulse = pulseBand(carrier, 0.5, 0.055);
    float micro = pulseBand(carrier * 3.1 + vPhase * 0.17, 0.44, 0.028) * 0.42;
    float depthFade = mix(0.44, 1.0, vDepth);
    float familyWeight = mix(0.78, 1.14, smoothstep(0.24, 0.7, vFamily));
    float baseAlpha = (0.082 + pulse * 0.15 + micro * 0.045 + vEnergy * 0.055) * depthFade * familyWeight * uIntro;
    vec3 obsidian = vec3(0.025, 0.028, 0.065);
    vec3 ultraviolet = vec3(0.4706, 0.4039, 0.9490);
    vec3 ionTeal = vec3(0.3843, 0.8471, 0.7804);
    vec3 moonstone = vec3(0.9255, 0.9255, 0.9569);
    vec3 familyColor = mix(ultraviolet, ionTeal, smoothstep(0.16, 0.86, vFamily));
    familyColor = mix(obsidian, familyColor, 0.82);
    vec3 color = mix(familyColor, moonstone, clamp(pulse * 0.32 + vEnergy * 0.16, 0.0, 0.68));
    gl_FragColor = vec4(color, baseAlpha);
  }
`;

export class ToroidalFieldSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly material: THREE.ShaderMaterial;

  constructor(profile: QualityProfile, resources: ResourceManager) {
    const lineCount = profile.torusLines;
    const samples = profile.samplesPerLine;
    const segmentVertices = lineCount * (samples - 1) * 2;
    const positions = new Float32Array(segmentVertices * 3);
    const progress = new Float32Array(segmentVertices);
    const phases = new Float32Array(segmentVertices);
    const families = new Float32Array(segmentVertices);
    const tempA = new THREE.Vector3();
    const tempB = new THREE.Vector3();
    let cursor = 0;

    const latitudeCount = Math.max(8, Math.round(lineCount * 0.24));
    const meridianCount = Math.max(8, Math.round(lineCount * 0.34));
    const funnelCount = Math.max(8, Math.round(lineCount * 0.28));
    const capCount = Math.max(4, lineCount - latitudeCount - meridianCount - funnelCount);

    for (let line = 0; line < lineCount; line += 1) {
      let phase: number;
      let familyValue: number;

      if (line < latitudeCount) {
        const local = line / Math.max(1, latitudeCount - 1);
        phase = local * Math.PI * 2;
        familyValue = 0.14;
      } else if (line < latitudeCount + meridianCount) {
        const localLine = line - latitudeCount;
        const local = localLine / meridianCount;
        phase = local * Math.PI * 2;
        familyValue = 0.42;
      } else if (line < latitudeCount + meridianCount + funnelCount) {
        const localLine = line - latitudeCount - meridianCount;
        const local = localLine / funnelCount;
        phase = local * Math.PI * 2;
        familyValue = 0.7;
      } else {
        const localLine = line - latitudeCount - meridianCount - funnelCount;
        const local = localLine / Math.max(1, capCount - 1);
        phase = local * Math.PI * 2;
        familyValue = 0.92;
      }

      for (let sample = 0; sample < samples - 1; sample += 1) {
        const t0 = sample / (samples - 1);
        const t1 = (sample + 1) / (samples - 1);
        torusPoint(t0, phase, familyValue, tempA);
        torusPoint(t1, phase, familyValue, tempB);

        positions.set([tempA.x, tempA.y, tempA.z], cursor * 3);
        progress[cursor] = t0;
        phases[cursor] = phase;
        families[cursor] = familyValue;
        cursor += 1;

        positions.set([tempB.x, tempB.y, tempB.z], cursor * 3);
        progress[cursor] = t1;
        phases[cursor] = phase;
        families[cursor] = familyValue;
        cursor += 1;
      }
    }

    const geometry = resources.track(new THREE.BufferGeometry());
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aProgress", new THREE.BufferAttribute(progress, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aFamily", new THREE.BufferAttribute(families, 1));

    this.material = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        vertexShader: fieldVertex,
        fragmentShader: fieldFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uBreath: { value: 0 },
          uExpansion: { value: 0 },
          uEnergyY: { value: 0 },
          uEnergyIntensity: { value: 0 },
          uHoverY: { value: 0 },
          uHoverStrength: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
          uReducedMotion: { value: 0 },
        },
      }),
    );

    const field = new THREE.LineSegments(geometry, this.material);
    field.renderOrder = 3;
    this.group.add(field);
  }

  update(state: RenderState, interaction: InteractionState) {
    this.group.rotation.y =
      Math.sin(state.elapsed * 0.1) * 0.045 +
      interaction.smoothPointer.x * 0.018 +
      state.activation * Math.sin(state.elapsed * 0.34) * 0.05;
    this.group.rotation.x =
      Math.cos(state.elapsed * 0.08) * 0.018 -
      interaction.smoothPointer.y * 0.01 +
      state.activation * 0.018;
    this.group.scale.setScalar(1 + state.expansion * 0.055 + state.activation * 0.028);
    this.material.uniforms.uTime.value = state.elapsed + state.activation * 1.8;
    this.material.uniforms.uIntro.value = state.intro;
    this.material.uniforms.uBreath.value = state.breath;
    this.material.uniforms.uExpansion.value = state.expansion;
    this.material.uniforms.uEnergyY.value = state.energyY;
    this.material.uniforms.uEnergyIntensity.value = state.energyIntensity + state.activation * 0.52;
    this.material.uniforms.uHoverY.value =
      interaction.hoverIndex >= 0 ? -1.12 + interaction.hoverIndex * 0.39 : state.energyY;
    this.material.uniforms.uHoverStrength.value = interaction.hoverStrength;
    this.material.uniforms.uPointer.value.copy(interaction.smoothPointer);
    this.material.uniforms.uReducedMotion.value = state.reducedMotion ? 1 : 0;
  }

  dispose() {
    this.group.clear();
  }
}
