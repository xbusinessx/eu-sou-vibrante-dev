import * as THREE from "three";
import { ResourceManager } from "./ResourceManager";
import type { QualityProfile, RenderState, SceneSystem } from "./types";

const ORBIT_COUNT = 8;
const NODE_COUNT = 19;

const orbitTilts = [
  new THREE.Euler(0.08, 0.02, 0),
  new THREE.Euler(Math.PI * 0.5, 0.08, 0.1),
  new THREE.Euler(0.52, 0.34, -0.18),
  new THREE.Euler(-0.64, 0.56, 0.24),
  new THREE.Euler(0.92, -0.32, 0.34),
  new THREE.Euler(-1.02, -0.46, -0.28),
  new THREE.Euler(0.28, 1.02, 0.5),
  new THREE.Euler(-0.42, -1.06, -0.48),
];

const orbitVertex = `
  attribute float aOrbit;
  attribute float aProgress;

  uniform float uTime;
  uniform float uIntro;
  uniform float uEnergy;
  uniform float uExpansion;

  varying float vOrbit;
  varying float vDepth;
  varying float vFlow;
  varying float vIntro;

  void main() {
    vec3 p = position;
    float phase = aProgress * 6.28318530718;
    float motion = sin(phase * (2.0 + mod(aOrbit, 3.0)) + uTime * 0.32 + aOrbit * 0.73);
    vec3 direction = normalize(p + vec3(0.0001));
    p += direction * motion * (0.008 + uEnergy * 0.006);
    p *= 1.0 + uExpansion * 0.028;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vOrbit = aOrbit / 7.0;
    vDepth = smoothstep(-2.5, 2.5, p.z);
    vFlow = 0.5 + 0.5 * sin(phase * 2.0 - uTime * 0.48 + aOrbit * 1.37);
    vIntro = uIntro;
  }
`;

const orbitFragment = `
  precision highp float;

  varying float vOrbit;
  varying float vDepth;
  varying float vFlow;
  varying float vIntro;

  void main() {
    vec3 ultraviolet = vec3(0.4706, 0.4039, 0.9490);
    vec3 ionTeal = vec3(0.3843, 0.8471, 0.7804);
    vec3 moonstone = vec3(0.9255, 0.9255, 0.9569);
    vec3 color = mix(ultraviolet, ionTeal, smoothstep(0.08, 0.92, vOrbit));
    color = mix(color, moonstone, smoothstep(0.78, 1.0, vFlow) * 0.38);
    float depth = mix(0.38, 1.0, vDepth);
    float alpha = (0.085 + vFlow * 0.18) * depth * vIntro;
    gl_FragColor = vec4(color, alpha);
  }
`;

const nodeVertex = `
  attribute float aNode;
  attribute float aOrbit;
  attribute float aSize;
  attribute float aPhase;

  uniform float uTime;
  uniform float uIntro;
  uniform float uPixelRatio;
  uniform float uEnergy;
  uniform float uExpansion;

  varying float vNode;
  varying float vOrbit;
  varying float vPulse;
  varying float vIntro;

  void main() {
    vec3 p = position;
    float pulse = 0.5 + 0.5 * sin(uTime * (0.62 + mod(aNode, 4.0) * 0.06) + aPhase);
    p *= 1.0 + uExpansion * 0.03;
    p += normalize(p + vec3(0.0001)) * pulse * (0.009 + uEnergy * 0.008);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (4.8 / max(1.0, -mvPosition.z)) * (1.0 + pulse * 0.16 + uEnergy * 0.08);

    vNode = aNode / 18.0;
    vOrbit = aOrbit / 7.0;
    vPulse = pulse;
    vIntro = uIntro;
  }
`;

const nodeFragment = `
  precision highp float;

  varying float vNode;
  varying float vOrbit;
  varying float vPulse;
  varying float vIntro;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float distanceToCenter = length(uv);
    float body = smoothstep(0.5, 0.16, distanceToCenter);
    float core = smoothstep(0.18, 0.0, distanceToCenter);
    vec3 ultraviolet = vec3(0.4706, 0.4039, 0.9490);
    vec3 ionTeal = vec3(0.3843, 0.8471, 0.7804);
    vec3 moonstone = vec3(0.9255, 0.9255, 0.9569);
    vec3 color = mix(ultraviolet, ionTeal, fract(vOrbit * 1.73 + vNode * 0.37));
    color = mix(color, moonstone, core * 0.84);
    float alpha = (body * (0.58 + vPulse * 0.24) + core * 0.34) * vIntro;
    gl_FragColor = vec4(color, alpha);
  }
`;

const glassVertex = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uExpansion;

  varying vec3 vNormal;
  varying vec3 vViewDirection;
  varying vec3 vObjectPosition;

  void main() {
    vec3 p = position;
    float facetMotion = sin((p.x + p.y * 1.4 + p.z * 0.8) * 8.0 + uTime * 0.32);
    p *= 1.0 + uExpansion * 0.018 + facetMotion * (0.002 + uEnergy * 0.0025);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-mvPosition.xyz);
    vObjectPosition = p;
  }
`;

const glassFragment = `
  precision highp float;

  uniform float uTime;
  uniform float uIntro;
  uniform float uEnergy;

  varying vec3 vNormal;
  varying vec3 vViewDirection;
  varying vec3 vObjectPosition;

  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0), 2.4);
    float interference = 0.5 + 0.5 * sin((vObjectPosition.y - vObjectPosition.x * 0.42) * 13.0 - uTime * 0.28);
    vec3 obsidian = vec3(0.012, 0.014, 0.032);
    vec3 ultraviolet = vec3(0.4706, 0.4039, 0.9490);
    vec3 ionTeal = vec3(0.3843, 0.8471, 0.7804);
    vec3 moonstone = vec3(0.9255, 0.9255, 0.9569);
    vec3 spectrum = mix(ultraviolet, ionTeal, smoothstep(-0.55, 0.7, vNormal.y));
    vec3 color = mix(obsidian, spectrum, fresnel * 0.92 + interference * 0.085);
    color = mix(color, moonstone, pow(fresnel, 3.2) * 0.66);
    float alpha = (0.34 + fresnel * 0.54 + uEnergy * 0.04) * uIntro;
    gl_FragColor = vec4(color, alpha);
  }
`;

const orbitPoint = (orbit: number, progress: number, out: THREE.Vector3) => {
  const angle = progress * Math.PI * 2;
  const radius = 1.08 + orbit * 0.17;
  const ellipse = 0.48 + (orbit % 4) * 0.045;
  out.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * ellipse,
    Math.sin(angle * 2 + orbit * 0.7) * 0.035,
  );
  out.applyEuler(orbitTilts[orbit]);
  return out;
};

export class NucleusSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly orbitGroup = new THREE.Group();
  private readonly coreGroup = new THREE.Group();
  private readonly orbitMaterial: THREE.ShaderMaterial;
  private readonly nodeMaterial: THREE.ShaderMaterial;
  private readonly glassMaterial: THREE.ShaderMaterial;
  private readonly bodyMaterial: THREE.MeshBasicMaterial;
  private readonly wireMaterial?: THREE.MeshBasicMaterial;
  private readonly pulseMaterial: THREE.SpriteMaterial;
  private readonly pulse: THREE.Sprite;

  constructor(profile: QualityProfile, resources: ResourceManager) {
    const samples = profile.level === "low" ? 72 : profile.level === "medium" ? 108 : 144;
    const orbitGeometry = resources.track(new THREE.BufferGeometry());
    const orbitVertexCount = ORBIT_COUNT * samples * 2;
    const orbitPositions = new Float32Array(orbitVertexCount * 3);
    const orbitIndices = new Float32Array(orbitVertexCount);
    const orbitProgress = new Float32Array(orbitVertexCount);
    const pointA = new THREE.Vector3();
    const pointB = new THREE.Vector3();
    let cursor = 0;

    for (let orbit = 0; orbit < ORBIT_COUNT; orbit += 1) {
      for (let sample = 0; sample < samples; sample += 1) {
        const t0 = sample / samples;
        const t1 = (sample + 1) / samples;
        orbitPoint(orbit, t0, pointA);
        orbitPoint(orbit, t1, pointB);

        orbitPositions.set([pointA.x, pointA.y, pointA.z], cursor * 3);
        orbitIndices[cursor] = orbit;
        orbitProgress[cursor] = t0;
        cursor += 1;

        orbitPositions.set([pointB.x, pointB.y, pointB.z], cursor * 3);
        orbitIndices[cursor] = orbit;
        orbitProgress[cursor] = t1;
        cursor += 1;
      }
    }

    orbitGeometry.setAttribute("position", new THREE.BufferAttribute(orbitPositions, 3));
    orbitGeometry.setAttribute("aOrbit", new THREE.BufferAttribute(orbitIndices, 1));
    orbitGeometry.setAttribute("aProgress", new THREE.BufferAttribute(orbitProgress, 1));

    this.orbitMaterial = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        vertexShader: orbitVertex,
        fragmentShader: orbitFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uEnergy: { value: 0 },
          uExpansion: { value: 0 },
        },
      }),
    );

    const orbitLines = new THREE.LineSegments(orbitGeometry, this.orbitMaterial);
    orbitLines.renderOrder = 4;
    this.orbitGroup.add(orbitLines);

    const nodeGeometry = resources.track(new THREE.BufferGeometry());
    const nodePositions = new Float32Array(NODE_COUNT * 3);
    const nodeIndices = new Float32Array(NODE_COUNT);
    const nodeOrbits = new Float32Array(NODE_COUNT);
    const nodeSizes = new Float32Array(NODE_COUNT);
    const nodePhases = new Float32Array(NODE_COUNT);
    const nodePoint = new THREE.Vector3();

    for (let node = 0; node < NODE_COUNT; node += 1) {
      const orbit = node % ORBIT_COUNT;
      const progress = (node * 0.61803398875 + orbit * 0.113) % 1;
      orbitPoint(orbit, progress, nodePoint);
      nodePositions.set([nodePoint.x, nodePoint.y, nodePoint.z], node * 3);
      nodeIndices[node] = node;
      nodeOrbits[node] = orbit;
      nodeSizes[node] = 15 + (node % 4) * 2.2;
      nodePhases[node] = progress * Math.PI * 2;
    }

    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute("aNode", new THREE.BufferAttribute(nodeIndices, 1));
    nodeGeometry.setAttribute("aOrbit", new THREE.BufferAttribute(nodeOrbits, 1));
    nodeGeometry.setAttribute("aSize", new THREE.BufferAttribute(nodeSizes, 1));
    nodeGeometry.setAttribute("aPhase", new THREE.BufferAttribute(nodePhases, 1));

    this.nodeMaterial = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        vertexShader: nodeVertex,
        fragmentShader: nodeFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uPixelRatio: { value: profile.pixelRatio },
          uEnergy: { value: 0 },
          uExpansion: { value: 0 },
        },
      }),
    );

    const nodes = new THREE.Points(nodeGeometry, this.nodeMaterial);
    nodes.renderOrder = 6;
    this.orbitGroup.add(nodes);

    const detail = profile.level === "low" ? 2 : profile.level === "medium" ? 3 : 4;
    const bodyGeometry = resources.track(new THREE.IcosahedronGeometry(0.76, detail));
    this.bodyMaterial = resources.track(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#05060d"),
        transparent: true,
        opacity: 0.76,
        depthWrite: true,
        depthTest: true,
      }),
    );
    const body = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
    body.renderOrder = 2;
    this.coreGroup.add(body);

    const glassGeometry = resources.track(new THREE.IcosahedronGeometry(0.87, detail));
    this.glassMaterial = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        vertexShader: glassVertex,
        fragmentShader: glassFragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uEnergy: { value: 0 },
          uExpansion: { value: 0 },
        },
      }),
    );
    const glass = new THREE.Mesh(glassGeometry, this.glassMaterial);
    glass.renderOrder = 3;
    this.coreGroup.add(glass);

    if (profile.enableCoreWireframe) {
      const wireGeometry = resources.track(new THREE.IcosahedronGeometry(0.94, 2));
      this.wireMaterial = resources.track(
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#7867f2"),
          transparent: true,
          opacity: 0.1,
          wireframe: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        }),
      );
      const wire = new THREE.Mesh(wireGeometry, this.wireMaterial);
      wire.renderOrder = 4;
      this.coreGroup.add(wire);
    }

    const pulseTexture = resources.createRadialTexture([
      [0, "rgba(255,255,255,1)"],
      [0.12, "rgba(255,255,255,0.95)"],
      [0.38, "rgba(255,255,255,0.34)"],
      [1, "rgba(255,255,255,0)"],
    ]);
    this.pulseMaterial = resources.track(
      new THREE.SpriteMaterial({
        map: pulseTexture,
        color: new THREE.Color("#e8c477"),
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    );
    this.pulse = new THREE.Sprite(this.pulseMaterial);
    this.pulse.scale.setScalar(0.28);
    this.pulse.renderOrder = 8;
    this.coreGroup.add(this.pulse);

    this.group.add(this.orbitGroup, this.coreGroup);
  }

  update(state: RenderState) {
    const time = state.elapsed;
    const scrollTurn = state.scrollProgress * 1.18;
    const chapterTurn = (state.scrollChapter + state.scrollLocalProgress) * 0.055;
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.18 + state.scrollProgress * Math.PI * 2);

    this.orbitGroup.rotation.y = time * 0.035 + scrollTurn;
    this.orbitGroup.rotation.x =
      Math.sin(time * 0.12) * 0.045 + chapterTurn - state.scrollProgress * 0.12;
    this.orbitGroup.rotation.z = Math.cos(time * 0.09) * 0.028;
    this.orbitGroup.scale.setScalar(1 + state.expansion * 0.045);

    this.coreGroup.rotation.y = -time * 0.07 + scrollTurn * 0.38;
    this.coreGroup.rotation.x = time * 0.025 - chapterTurn * 0.4;
    this.coreGroup.scale.setScalar(1 + pulse * 0.018 + state.energyIntensity * 0.012);

    this.orbitMaterial.uniforms.uTime.value = time;
    this.orbitMaterial.uniforms.uIntro.value = state.intro;
    this.orbitMaterial.uniforms.uEnergy.value = state.energyIntensity;
    this.orbitMaterial.uniforms.uExpansion.value = state.expansion;

    this.nodeMaterial.uniforms.uTime.value = time;
    this.nodeMaterial.uniforms.uIntro.value = state.intro;
    this.nodeMaterial.uniforms.uEnergy.value = state.energyIntensity;
    this.nodeMaterial.uniforms.uExpansion.value = state.expansion;

    this.glassMaterial.uniforms.uTime.value = time;
    this.glassMaterial.uniforms.uIntro.value = state.intro;
    this.glassMaterial.uniforms.uEnergy.value = state.energyIntensity;
    this.glassMaterial.uniforms.uExpansion.value = state.expansion;

    this.bodyMaterial.opacity = Math.min(0.82, state.intro * (0.66 + state.energyIntensity * 0.035));
    if (this.wireMaterial) {
      this.wireMaterial.opacity = state.intro * (0.12 + pulse * 0.08);
    }
    this.pulseMaterial.opacity = state.intro * (0.42 + pulse * 0.24);
    this.pulse.scale.setScalar(0.22 + pulse * 0.08 + state.energyIntensity * 0.012);
  }

  dispose() {
    this.group.clear();
  }
}
