import * as THREE from "three";
import { ResourceManager } from "./ResourceManager";
import type { InteractionState, RenderState, SceneSystem } from "./types";

const shellVertex = `
  attribute float aProgress;
  attribute float aPhase;

  uniform float uTime;
  uniform float uIntro;
  uniform float uBreath;
  uniform vec2 uPointer;

  varying float vProgress;
  varying float vPhase;

  void main() {
    vec3 p = position;
    float shimmer = sin(aProgress * 6.2831853 * 2.0 + aPhase + uTime * 0.34) * 0.014;
    float breath = (uBreath - 0.5) * 0.024;
    p.x *= 1.0 + breath;
    p.y *= 1.0 + breath * 0.45;
    p.z += shimmer;
    p.x += uPointer.x * 0.018;
    p.y += uPointer.y * 0.012;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vProgress = aProgress;
    vPhase = aPhase;
  }
`;

const shellFragment = `
  precision highp float;

  uniform float uTime;
  uniform float uIntro;
  varying float vProgress;
  varying float vPhase;

  void main() {
    float band = sin(vProgress * 6.2831853 * 2.0 - uTime * 0.22 + vPhase) * 0.5 + 0.5;
    float fade = smoothstep(0.0, 0.18, vProgress) * (1.0 - smoothstep(0.82, 1.0, vProgress));
    vec3 ultraviolet = vec3(0.4706, 0.4039, 0.9490);
    vec3 ionTeal = vec3(0.3843, 0.8471, 0.7804);
    vec3 moonstone = vec3(0.9255, 0.9255, 0.9569);
    vec3 color = mix(ultraviolet, ionTeal, band * 0.72);
    color = mix(color, moonstone, pow(band, 5.0) * 0.24);
    float alpha = (0.014 + band * 0.026) * fade * uIntro;
    gl_FragColor = vec4(color, alpha);
  }
`;

export class HolographicShellSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly material: THREE.ShaderMaterial;

  constructor(resources: ResourceManager) {
    const loops = 6;
    const samples = 132;
    const vertices = loops * (samples - 1) * 2;
    const positions = new Float32Array(vertices * 3);
    const progress = new Float32Array(vertices);
    const phases = new Float32Array(vertices);
    let cursor = 0;

    for (let loop = 0; loop < loops; loop += 1) {
      const phase = (loop / loops) * Math.PI * 2;
      const tilt = Math.sin(phase) * 0.32;
      const width = 0.9 + (loop % 3) * 0.22;

      for (let sample = 0; sample < samples - 1; sample += 1) {
        const t0 = sample / (samples - 1);
        const t1 = (sample + 1) / (samples - 1);
        const a0 = (t0 - 0.5) * Math.PI * 2;
        const a1 = (t1 - 0.5) * Math.PI * 2;
        const points = [a0, a1];

        points.forEach((angle, pointIndex) => {
          const t = pointIndex === 0 ? t0 : t1;
          const x = Math.sin(angle) * width * (0.55 + Math.cos(angle) * 0.08);
          const y = Math.cos(angle) * 1.72 - 0.05;
          const z = Math.sin(phase) * 0.38 + Math.sin(angle * 2.0 + phase) * 0.1;
          const rotatedX = x * Math.cos(phase) - z * Math.sin(phase) * 0.28;
          const rotatedZ = x * Math.sin(phase) * 0.38 + z * Math.cos(phase);

          positions.set([rotatedX + tilt * Math.sin(angle) * 0.16, y, rotatedZ - 0.04], cursor * 3);
          progress[cursor] = t;
          phases[cursor] = phase;
          cursor += 1;
        });
      }
    }

    const geometry = resources.track(new THREE.BufferGeometry());
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aProgress", new THREE.BufferAttribute(progress, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    this.material = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: shellVertex,
        fragmentShader: shellFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uBreath: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        },
      }),
    );

    const shell = new THREE.LineSegments(geometry, this.material);
    shell.renderOrder = 1;
    this.group.add(shell);
  }

  update(state: RenderState, interaction: InteractionState) {
    this.group.rotation.y = Math.sin(state.elapsed * 0.08) * 0.08 + state.activation * 0.1;
    this.group.scale.setScalar(1 + state.expansion * 0.07 + state.activation * 0.035);
    this.material.uniforms.uTime.value = state.elapsed + state.activation * 1.2;
    this.material.uniforms.uIntro.value = state.intro;
    this.material.uniforms.uBreath.value = state.breath;
    this.material.uniforms.uPointer.value.copy(interaction.smoothPointer);
  }

  dispose() {
    this.group.clear();
  }
}
