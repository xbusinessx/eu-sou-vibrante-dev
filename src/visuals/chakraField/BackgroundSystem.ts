import * as THREE from "three";
import type { QualityProfile, RenderState, InteractionState, SceneSystem } from "./types";
import { ResourceManager } from "./ResourceManager";

const backgroundVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const backgroundFragment = `
  precision highp float;

  uniform float uTime;
  uniform float uIntro;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;
    centered.x += uPointer.x * 0.018;
    centered.y += uPointer.y * 0.012;

    float n1 = noise(uv * 3.2 + vec2(uTime * 0.012, -uTime * 0.01));
    float n2 = noise(uv * 8.0 + vec2(-uTime * 0.018, uTime * 0.014));
    float field = smoothstep(0.2, 0.95, n1 * 0.72 + n2 * 0.28);
    float vignette = smoothstep(0.98, 0.18, length(centered));
    float edgeFade = smoothstep(0.76, 0.22, length(centered * vec2(0.82, 1.08)));
    float centerGlow = smoothstep(0.64, 0.04, length(centered * vec2(0.72, 1.18)));

    vec3 deep = vec3(0.003, 0.004, 0.012);
    vec3 ionTeal = vec3(0.027, 0.11, 0.105);
    vec3 ultraviolet = vec3(0.09, 0.072, 0.22);
    vec3 moonstone = vec3(0.11, 0.115, 0.16);
    vec3 color = deep;
    color += ionTeal * smoothstep(0.82, 0.08, length(centered - vec2(-0.36, 0.1))) * 0.28;
    color += ultraviolet * smoothstep(0.84, 0.12, length(centered - vec2(0.34, 0.03))) * 0.34;
    color += ultraviolet * smoothstep(0.74, 0.1, length(centered - vec2(0.02, -0.08))) * 0.2;
    color += moonstone * centerGlow * 0.055;
    color += vec3(0.025, 0.052, 0.058) * field * 0.07;
    color *= vignette + 0.18;

    float alpha = clamp((centerGlow * 0.32 + field * 0.08 + edgeFade * 0.08) * edgeFade * uIntro, 0.0, 0.42);
    gl_FragColor = vec4(color * uIntro, alpha);
  }
`;

const starsVertex = `
  attribute float aSize;
  attribute float aDepth;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.x += uPointer.x * aDepth * 0.08;
    p.y += uPointer.y * aDepth * 0.05;
    p.y += sin(uTime * (0.05 + aDepth * 0.04) + p.x * 1.7) * 0.012;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (10.0 / -mvPosition.z);
    vAlpha = smoothstep(0.0, 1.0, aDepth);
  }
`;

const starsFragment = `
  precision highp float;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha * 0.42;
    vec3 ultraviolet = vec3(0.4706, 0.4039, 0.9490);
    vec3 ionTeal = vec3(0.3843, 0.8471, 0.7804);
    vec3 moonstone = vec3(0.9255, 0.9255, 0.9569);
    vec3 color = mix(ultraviolet, ionTeal, vAlpha);
    color = mix(color, moonstone, smoothstep(0.72, 1.0, vAlpha) * 0.42);
    gl_FragColor = vec4(color, alpha);
  }
`;

export class BackgroundSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly backgroundMaterial: THREE.ShaderMaterial;
  private readonly starsMaterial: THREE.ShaderMaterial;

  constructor(profile: QualityProfile, resources: ResourceManager) {
    const plane = resources.track(new THREE.PlaneGeometry(2, 2));
    this.backgroundMaterial = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        vertexShader: backgroundVertex,
        fragmentShader: backgroundFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        },
      }),
    );

    const background = new THREE.Mesh(plane, this.backgroundMaterial);
    background.frustumCulled = false;
    background.renderOrder = -100;
    this.group.add(background);

    const count = profile.backgroundParticles;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const depths = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      const i3 = index * 3;
      positions[i3] = (Math.random() - 0.5) * 8.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 4.8;
      positions[i3 + 2] = -2.8 - Math.random() * 5.2;
      sizes[index] = 3 + Math.random() * 5;
      depths[index] = Math.random();
    }

    const geometry = resources.track(new THREE.BufferGeometry());
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aDepth", new THREE.BufferAttribute(depths, 1));

    this.starsMaterial = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: starsVertex,
        fragmentShader: starsFragment,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: profile.pixelRatio },
          uPointer: { value: new THREE.Vector2() },
        },
      }),
    );

    const stars = new THREE.Points(geometry, this.starsMaterial);
    stars.renderOrder = -50;
    this.group.add(stars);
  }

  update(state: RenderState, interaction: InteractionState) {
    this.backgroundMaterial.uniforms.uTime.value = state.elapsed;
    this.backgroundMaterial.uniforms.uIntro.value = state.intro;
    this.backgroundMaterial.uniforms.uPointer.value.copy(interaction.smoothPointer);
    this.starsMaterial.uniforms.uTime.value = state.elapsed;
    this.starsMaterial.uniforms.uPointer.value.copy(interaction.smoothPointer);
  }

  dispose() {
    this.group.clear();
  }
}
