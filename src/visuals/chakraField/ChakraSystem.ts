import * as THREE from "three";
import { smoothstep } from "./math";
import { ResourceManager } from "./ResourceManager";
import type {
  ChakraDefinition,
  InteractionState,
  QualityProfile,
  RenderState,
  SceneSystem,
} from "./types";

const createDefinitions = (): ChakraDefinition[] => [
  { id: "root", label: "Raiz", color: new THREE.Color("#ff3030"), y: -1.12, radius: 0.078, phase: 0.4, frequency: 1.16 },
  { id: "sacral", label: "Sacral", color: new THREE.Color("#ff8c32"), y: -0.72, radius: 0.073, phase: 1.1, frequency: 1.08 },
  { id: "solar", label: "Plexo solar", color: new THREE.Color("#ffe05f"), y: -0.32, radius: 0.082, phase: 1.7, frequency: 1.22 },
  { id: "heart", label: "Cardiaco", color: new THREE.Color("#28f58b"), y: 0.08, radius: 0.086, phase: 2.5, frequency: 0.96 },
  { id: "throat", label: "Laringeo", color: new THREE.Color("#58f4ff"), y: 0.48, radius: 0.074, phase: 3.2, frequency: 1.3 },
  { id: "brow", label: "Frontal", color: new THREE.Color("#6a87ff"), y: 0.84, radius: 0.072, phase: 3.9, frequency: 1.12 },
  { id: "crown", label: "Coronario", color: new THREE.Color("#c98cff"), y: 1.22, radius: 0.08, phase: 4.8, frequency: 0.9 },
];

interface ChakraVisual {
  definition: ChakraDefinition;
  group: THREE.Group;
  core: THREE.SpriteMaterial;
  halo: THREE.SpriteMaterial;
  outerHalo: THREE.SpriteMaterial;
  ringMaterials: THREE.MeshBasicMaterial[];
  mandala: THREE.LineSegments;
  particles: THREE.Points;
  particlesMaterial: THREE.PointsMaterial;
}

export class ChakraSystem implements SceneSystem {
  readonly group = new THREE.Group();
  readonly definitions = createDefinitions();
  private readonly visuals: ChakraVisual[] = [];
  private readonly tempColor = new THREE.Color();
  private readonly warmColor = new THREE.Color("#fff4c7");

  constructor(profile: QualityProfile, resources: ResourceManager) {
    const coreTexture = resources.createRadialTexture([
      [0, "rgba(255,255,255,1)"],
      [0.2, "rgba(255,255,255,0.92)"],
      [0.58, "rgba(255,255,255,0.38)"],
      [1, "rgba(255,255,255,0)"],
    ]);

    this.definitions.forEach((definition, index) => {
      const chakraGroup = new THREE.Group();
      chakraGroup.position.set(0, definition.y, 0.28);

      const coreMaterial = resources.track(
        new THREE.SpriteMaterial({
          map: coreTexture,
          color: definition.color,
          transparent: true,
          opacity: 0.92,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const core = new THREE.Sprite(coreMaterial);
      core.scale.setScalar(definition.radius * 5.2);
      chakraGroup.add(core);

      const haloMaterial = resources.track(
        new THREE.SpriteMaterial({
          map: coreTexture,
          color: definition.color,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const halo = new THREE.Sprite(haloMaterial);
      halo.scale.setScalar(definition.radius * 10.2);
      chakraGroup.add(halo);

      const outerHaloMaterial = resources.track(
        new THREE.SpriteMaterial({
          map: coreTexture,
          color: definition.color,
          transparent: true,
          opacity: 0.14,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const outerHalo = new THREE.Sprite(outerHaloMaterial);
      outerHalo.scale.setScalar(definition.radius * 15.6);
      chakraGroup.add(outerHalo);

      const ringMaterials: THREE.MeshBasicMaterial[] = [];
      for (let ring = 0; ring < 3; ring += 1) {
        const material = resources.track(
          new THREE.MeshBasicMaterial({
            color: definition.color,
            transparent: true,
            opacity: 0.18 - ring * 0.035,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        );
        ringMaterials.push(material);
        const geometry = resources.track(
          new THREE.TorusGeometry(definition.radius * (2 + ring * 1.2), 0.0028, 8, 88),
        );
        const torus = new THREE.Mesh(geometry, material);
        torus.rotation.set(Math.PI * 0.5, ring * 0.62 + index * 0.12, ring * 0.34);
        chakraGroup.add(torus);
      }

      const mandalaGeometry = resources.track(new THREE.BufferGeometry());
      const rayCount = 18;
      const rayPositions = new Float32Array(rayCount * 2 * 3);
      for (let ray = 0; ray < rayCount; ray += 1) {
        const angle = (ray / rayCount) * Math.PI * 2;
        const inner = definition.radius * 1.15;
        const outer = definition.radius * (1.8 + (ray % 3) * 0.26);
        const offset = ray * 6;
        rayPositions[offset] = Math.cos(angle) * inner;
        rayPositions[offset + 1] = Math.sin(angle) * inner;
        rayPositions[offset + 2] = 0.02;
        rayPositions[offset + 3] = Math.cos(angle) * outer;
        rayPositions[offset + 4] = Math.sin(angle) * outer;
        rayPositions[offset + 5] = 0.02;
      }
      mandalaGeometry.setAttribute("position", new THREE.BufferAttribute(rayPositions, 3));
      const mandalaMaterial = resources.track(
        new THREE.LineBasicMaterial({
          color: definition.color,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const mandala = new THREE.LineSegments(mandalaGeometry, mandalaMaterial);
      chakraGroup.add(mandala);

      const particleCount = profile.chakraParticles;
      const particleGeometry = resources.track(new THREE.BufferGeometry());
      const particlePositions = new Float32Array(particleCount * 3);
      for (let particle = 0; particle < particleCount; particle += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = definition.radius * (1.4 + Math.random() * 3.2);
        const offset = particle * 3;
        particlePositions[offset] = Math.cos(angle) * radius;
        particlePositions[offset + 1] = Math.sin(angle) * radius;
        particlePositions[offset + 2] = (Math.random() - 0.5) * 0.12;
      }
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      const particlesMaterial = resources.track(
        new THREE.PointsMaterial({
          color: definition.color,
          size: 0.018,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const particles = new THREE.Points(particleGeometry, particlesMaterial);
      chakraGroup.add(particles);

      this.group.add(chakraGroup);
      this.visuals.push({
        definition,
        group: chakraGroup,
        core: coreMaterial,
        halo: haloMaterial,
        outerHalo: outerHaloMaterial,
        ringMaterials,
        mandala,
        particles,
        particlesMaterial,
      });
    });
  }

  getWorldY(index: number) {
    return this.definitions[index]?.y ?? 0;
  }

  update(state: RenderState, interaction: InteractionState) {
    this.visuals.forEach((visual, index) => {
      const { definition, group } = visual;
      const localWave = 1 - smoothstep(0.0, 0.34, Math.abs(definition.y - state.energyY));
      const neighborWave = 1 - smoothstep(0.12, 0.66, Math.abs(definition.y - state.energyY));
      const hovered = interaction.hoverIndex === index ? interaction.hoverStrength : 0;
      const selected = state.chakraPulseIndex === index ? state.chakraPulseStrength : 0;
      const crown = index === this.visuals.length - 1 ? state.crownFlash : 0;
      const phase = state.elapsed * definition.frequency + definition.phase;
      const pulse = 0.5 + 0.5 * Math.sin(phase * 2.1 + Math.sin(phase * 0.31));
      const activeLift = state.activation * (0.16 + localWave * 0.44);
      const intensity =
        state.intro *
        (0.72 +
          pulse * 0.18 +
          localWave * 0.76 +
          hovered * 0.52 +
          selected * 0.78 +
          crown * 1.25 +
          activeLift);
      const scale =
        1 +
        pulse * 0.08 +
        localWave * 0.22 +
        hovered * 0.18 +
        selected * 0.28 +
        crown * 0.42 +
        state.activation * 0.04;

      group.scale.setScalar(scale);
      group.position.z = 0.28 + localWave * 0.06 + hovered * 0.05 + selected * 0.08 + crown * 0.1;

      visual.core.opacity = Math.min(1, 0.64 + intensity * 0.34);
      visual.halo.opacity = Math.min(
        0.82,
        0.2 + intensity * 0.26 + neighborWave * 0.12 + selected * 0.12,
      );
      visual.outerHalo.opacity = Math.min(
        0.52,
        0.08 + neighborWave * 0.14 + hovered * 0.12 + state.activation * 0.1 + crown * 0.24,
      );
      visual.particlesMaterial.opacity = Math.min(
        0.82,
        0.16 + intensity * 0.28 + selected * 0.18,
      );

      visual.ringMaterials.forEach((material, ringIndex) => {
        material.opacity = Math.min(
          0.58,
          0.1 + intensity * 0.08 + ringIndex * 0.025 + selected * 0.08 + crown * 0.12,
        );
      });

      visual.group.children.forEach((child, childIndex) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
          child.rotation.z +=
            state.delta * (0.12 + index * 0.015 + childIndex * 0.01 + state.activation * 0.34);
          child.rotation.x += state.delta * (0.04 + childIndex * 0.006 + selected * 0.12);
        }
      });

      visual.mandala.rotation.z -= state.delta * (0.18 + index * 0.018 + state.activation * 0.22);
      visual.particles.rotation.z +=
        state.delta * (0.26 + index * 0.028 + localWave * 0.18 + state.activation * 0.22);
      visual.particles.rotation.x = Math.sin(state.elapsed * 0.35 + definition.phase) * 0.18;

      this.tempColor
        .copy(definition.color)
        .lerp(this.warmColor, Math.min(0.45, localWave * 0.24 + crown * 0.38));
      visual.core.color.copy(this.tempColor);
    });
  }

  dispose() {
    this.group.clear();
  }
}
