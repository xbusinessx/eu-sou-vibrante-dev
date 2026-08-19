import * as THREE from "three";
import { ResourceManager } from "./ResourceManager";
import type { InteractionState, QualityProfile, RenderState, SceneSystem } from "./types";

const particleVertex = `
  attribute float aSeed;
  attribute float aPhase;
  attribute float aMajor;
  attribute float aMinor;
  attribute float aSpeed;
  attribute float aWinding;
  attribute float aSize;
  attribute float aFamily;
  attribute float aChakra;

  uniform float uTime;
  uniform float uIntro;
  uniform float uPixelRatio;
  uniform float uEnergyY;
  uniform float uEnergyIntensity;
  uniform float uExpansion;
  uniform float uReducedMotion;
  uniform vec2 uPointer;

  varying float vAlpha;
  varying float vWarmth;
  varying float vEnergy;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    float speed = mix(aSpeed, aSpeed * 0.28, uReducedMotion);
    float u = fract(aSeed + uTime * speed);
    float angle = u * 6.28318530718;
    float v = angle * aWinding + aPhase + sin(uTime * 0.13 + aPhase) * 0.18;
    float chakraY = mix(-1.12, 1.30, aChakra / 6.0);
    float energyInfluence = 1.0 - smoothstep(0.0, 0.64, abs(chakraY - uEnergyY));
    float localBoost = energyInfluence * uEnergyIntensity;

    float major = aMajor * (1.0 + uExpansion * 0.04 + localBoost * 0.025);
    float minor = aMinor * (1.0 + localBoost * 0.08);
    float helix = sin(angle * (2.0 + aFamily) + aPhase) * 0.16;
    float torusRadius = major + minor * cos(v);

    vec3 p;
    p.x = cos(angle + aPhase * 0.08) * torusRadius;
    p.z = sin(angle + aPhase * 0.08) * torusRadius * (0.48 + aFamily * 0.12);
    p.y = minor * sin(v) + chakraY * 0.18 + helix;

    float tilt = (aFamily - 0.5) * 0.54;
    mat2 rot = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
    p.xy = rot * p.xy;
    p.x *= 1.18;
    p.z *= 1.08;
    p.x += uPointer.x * 0.05 * (0.3 + aFamily);
    p.y += uPointer.y * 0.026 * (0.3 + aFamily);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float travelPulse = smoothstep(0.0, 0.16, u) * (1.0 - smoothstep(0.82, 1.0, u));
    float depth = smoothstep(-2.2, 2.2, p.z);
    gl_PointSize = aSize * uPixelRatio * (4.4 / -mvPosition.z) * (1.0 + localBoost * 0.32);
    vAlpha = travelPulse * mix(0.08, 0.38, depth) * uIntro;
    vWarmth = hash(aPhase * 19.13 + aSeed * 8.77);
    vEnergy = localBoost;
  }
`;

const particleFragment = `
  precision highp float;
  varying float vAlpha;
  varying float vWarmth;
  varying float vEnergy;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.0, d);
    float spark = smoothstep(0.18, 0.0, d);
    vec3 gold = vec3(0.92, 0.68, 0.28);
    vec3 teal = vec3(0.18, 0.88, 0.82);
    vec3 violet = vec3(0.58, 0.38, 1.0);
    vec3 color = mix(gold, teal, smoothstep(0.28, 0.72, vWarmth));
    color = mix(color, violet, smoothstep(0.76, 1.0, vWarmth) * 0.48);
    color = mix(color, vec3(1.0, 0.94, 0.72), spark * (0.42 + vEnergy * 0.36));
    gl_FragColor = vec4(color, core * vAlpha * 0.38);
  }
`;

export class EnergyParticleSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly material: THREE.ShaderMaterial;

  constructor(profile: QualityProfile, resources: ResourceManager) {
    const count = profile.fieldParticles;
    const geometry = resources.track(new THREE.BufferGeometry());
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const majors = new Float32Array(count);
    const minors = new Float32Array(count);
    const speeds = new Float32Array(count);
    const windings = new Float32Array(count);
    const sizes = new Float32Array(count);
    const families = new Float32Array(count);
    const chakras = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = 0;
      positions[index * 3 + 1] = 0;
      positions[index * 3 + 2] = 0;
      seeds[index] = Math.random();
      phases[index] = Math.random() * Math.PI * 2;
      families[index] = Math.random();
      majors[index] = 1.42 + Math.random() * 1.34;
      minors[index] = 0.18 + Math.random() * 0.46;
      speeds[index] = 0.008 + Math.random() * 0.024;
      windings[index] = 1.2 + Math.floor(Math.random() * 5) * 0.5;
      sizes[index] = 1.8 + Math.random() * 3.6;
      chakras[index] = Math.floor(Math.random() * 7);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aMajor", new THREE.BufferAttribute(majors, 1));
    geometry.setAttribute("aMinor", new THREE.BufferAttribute(minors, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute("aWinding", new THREE.BufferAttribute(windings, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aFamily", new THREE.BufferAttribute(families, 1));
    geometry.setAttribute("aChakra", new THREE.BufferAttribute(chakras, 1));

    this.material = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uPixelRatio: { value: profile.pixelRatio },
          uEnergyY: { value: 0 },
          uEnergyIntensity: { value: 0 },
          uExpansion: { value: 0 },
          uReducedMotion: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        },
      }),
    );

    const particles = new THREE.Points(geometry, this.material);
    particles.renderOrder = 5;
    this.group.add(particles);
  }

  update(state: RenderState, interaction: InteractionState) {
    this.group.rotation.y = Math.sin(state.elapsed * 0.08) * 0.06 + state.activation * 0.05;
    this.group.scale.setScalar(1 + state.activation * 0.035 + state.ringPulse * 0.02);
    this.material.uniforms.uTime.value = state.elapsed + state.activation * 2.1;
    this.material.uniforms.uIntro.value = state.intro;
    this.material.uniforms.uEnergyY.value = state.energyY;
    this.material.uniforms.uEnergyIntensity.value = state.energyIntensity + state.activation * 0.42;
    this.material.uniforms.uExpansion.value = state.expansion;
    this.material.uniforms.uReducedMotion.value = state.reducedMotion ? 1 : 0;
    this.material.uniforms.uPointer.value.copy(interaction.smoothPointer);
  }

  dispose() {
    this.group.clear();
  }
}
