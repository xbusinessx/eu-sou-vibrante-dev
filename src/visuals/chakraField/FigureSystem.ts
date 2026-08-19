import * as THREE from "three";
import { ResourceManager } from "./ResourceManager";
import type { RenderState, SceneSystem } from "./types";

const auraVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const auraFragment = `
  precision highp float;

  uniform float uBreath;
  uniform float uEnergy;
  uniform float uIntro;
  uniform float uActivation;
  uniform float uCrownFlash;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= 1.26;
    uv.y *= 0.86;
    float d = length(uv);
    float verticalFade = smoothstep(0.62, 0.08, abs(uv.y));
    float core = smoothstep(0.34, 0.05, d);
    float outer = smoothstep(0.48, 0.14, d) * verticalFade;
    vec3 color = mix(vec3(0.03, 0.16, 0.15), vec3(0.78, 0.62, 0.3), core);
    color = mix(color, vec3(0.34, 0.86, 0.82), outer * 0.22 + uActivation * 0.18);
    color = mix(color, vec3(0.92, 0.72, 1.0), uCrownFlash * smoothstep(0.22, 0.05, distance(uv, vec2(0.0, 0.33))));
    float alpha = (outer * 0.12 + core * 0.16 + uEnergy * core * 0.12 + uActivation * outer * 0.12 + uCrownFlash * 0.14) * (0.72 + uBreath * 0.22) * uIntro;
    gl_FragColor = vec4(color, alpha);
  }
`;

const createMeditationSilhouetteTexture = (resources: ResourceManager) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 620;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context unavailable.");
  }

  const fill = "rgba(1, 5, 6, 0.96)";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = fill;
  context.strokeStyle = fill;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgba(128, 255, 235, 0.18)";
  context.shadowBlur = 18;

  context.beginPath();
  context.moveTo(256, 388);
  context.bezierCurveTo(210, 402, 160, 430, 110, 468);
  context.bezierCurveTo(61, 505, 82, 548, 144, 534);
  context.bezierCurveTo(199, 522, 232, 490, 256, 460);
  context.bezierCurveTo(280, 490, 313, 522, 368, 534);
  context.bezierCurveTo(430, 548, 451, 505, 402, 468);
  context.bezierCurveTo(352, 430, 302, 402, 256, 388);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(256, 184);
  context.bezierCurveTo(224, 200, 204, 252, 203, 320);
  context.bezierCurveTo(202, 370, 222, 411, 256, 430);
  context.bezierCurveTo(290, 411, 310, 370, 309, 320);
  context.bezierCurveTo(308, 252, 288, 200, 256, 184);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(178, 232);
  context.bezierCurveTo(204, 203, 230, 190, 256, 190);
  context.bezierCurveTo(282, 190, 308, 203, 334, 232);
  context.bezierCurveTo(310, 246, 282, 254, 256, 253);
  context.bezierCurveTo(230, 254, 202, 246, 178, 232);
  context.closePath();
  context.fill();

  context.lineWidth = 46;
  context.beginPath();
  context.moveTo(196, 245);
  context.bezierCurveTo(160, 304, 150, 366, 190, 408);
  context.bezierCurveTo(207, 426, 232, 434, 253, 429);
  context.stroke();

  context.beginPath();
  context.moveTo(316, 245);
  context.bezierCurveTo(352, 304, 362, 366, 322, 408);
  context.bezierCurveTo(305, 426, 280, 434, 259, 429);
  context.stroke();

  context.beginPath();
  context.moveTo(210, 438);
  context.bezierCurveTo(229, 421, 283, 421, 302, 438);
  context.bezierCurveTo(285, 454, 227, 454, 210, 438);
  context.closePath();
  context.fill();

  context.shadowBlur = 10;
  context.fillRect(238, 146, 36, 58);

  context.beginPath();
  context.arc(256, 120, 40, 0, Math.PI * 2);
  context.fill();

  context.shadowBlur = 0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return resources.track(texture);
};

export class FigureSystem implements SceneSystem {
  readonly group = new THREE.Group();
  private readonly bodyGroup = new THREE.Group();
  private readonly silhouette: THREE.Mesh;
  private readonly auraMaterial: THREE.ShaderMaterial;

  constructor(resources: ResourceManager) {
    this.group.position.z = 0.08;
    this.group.scale.setScalar(1.08);

    const auraGeometry = resources.track(new THREE.PlaneGeometry(2.2, 3.35, 1, 1));
    this.auraMaterial = resources.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: auraVertex,
        fragmentShader: auraFragment,
        uniforms: {
          uBreath: { value: 0 },
          uEnergy: { value: 0 },
          uIntro: { value: 0 },
          uActivation: { value: 0 },
          uCrownFlash: { value: 0 },
        },
      }),
    );

    const aura = new THREE.Mesh(auraGeometry, this.auraMaterial);
    aura.position.set(0, -0.04, -0.16);
    this.group.add(aura);

    const silhouetteMaterial = resources.track(
      new THREE.MeshBasicMaterial({
        map: createMeditationSilhouetteTexture(resources),
        color: new THREE.Color("#071211"),
        transparent: true,
        opacity: 0.28,
        blending: THREE.NormalBlending,
        depthTest: true,
        depthWrite: false,
      }),
    );

    this.silhouette = new THREE.Mesh(
      resources.track(new THREE.PlaneGeometry(2.46, 2.98, 1, 1)),
      silhouetteMaterial,
    );
    this.silhouette.position.set(0, -0.18, 0.03);
    this.silhouette.renderOrder = 0;
    this.bodyGroup.add(this.silhouette);

    this.bodyGroup.position.y = -0.08;
    this.group.add(this.bodyGroup);
  }

  update(state: RenderState) {
    const breath = Math.sin(state.loopPhase * Math.PI * 2) * 0.5 + 0.5;
    const microLift = (breath - 0.5) * 0.028;
    const activeBreath = state.activation * 0.018 + state.ringPulse * 0.012;

    this.silhouette.scale.set(1 + breath * 0.006 + activeBreath, 1 + breath * 0.012 + activeBreath, 1);
    this.bodyGroup.position.y = -0.08 + microLift;
    this.bodyGroup.position.z = Math.sin(state.elapsed * 0.42) * 0.012;

    this.auraMaterial.uniforms.uBreath.value = breath;
    this.auraMaterial.uniforms.uEnergy.value = state.energyIntensity;
    this.auraMaterial.uniforms.uIntro.value = state.intro;
    this.auraMaterial.uniforms.uActivation.value = state.activation;
    this.auraMaterial.uniforms.uCrownFlash.value = state.crownFlash;
  }

  dispose() {
    this.group.clear();
  }
}
