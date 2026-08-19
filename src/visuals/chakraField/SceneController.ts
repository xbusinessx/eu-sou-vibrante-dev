import * as THREE from "three";
import { ActivationRingSystem } from "./ActivationRingSystem";
import { AnimationTimeline } from "./AnimationTimeline";
import { BackgroundSystem } from "./BackgroundSystem";
import { CameraController } from "./CameraController";
import { ChakraSystem } from "./ChakraSystem";
import { EnergyParticleSystem } from "./EnergyParticleSystem";
import { FigureSystem } from "./FigureSystem";
import { HolographicShellSystem } from "./HolographicShellSystem";
import { InteractionController } from "./InteractionController";
import { PostProcessingSystem } from "./PostProcessingSystem";
import { QualityManager } from "./QualityManager";
import { ResourceManager } from "./ResourceManager";
import { ToroidalFieldSystem } from "./ToroidalFieldSystem";
import type { SceneControllerOptions, SceneSystem } from "./types";

export class SceneController {
  private static hasLoggedVersion = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly container: HTMLElement;
  private readonly onReady?: () => void;
  private readonly scene = new THREE.Scene();
  private readonly resources = new ResourceManager();
  private readonly quality = new QualityManager();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cameraController: CameraController;
  private readonly interaction: InteractionController;
  private readonly timeline: AnimationTimeline;
  private readonly postProcessing: PostProcessingSystem;
  private readonly systems: SceneSystem[] = [];
  private readonly resizeObserver: ResizeObserver;

  private frameId = 0;
  private lastTime = performance.now();
  private elapsed = 0;
  private disposed = false;
  private ready = false;

  constructor({ canvas, container, onReady }: SceneControllerOptions) {
    this.canvas = canvas;
    this.container = container;
    this.onReady = onReady;

    const rect = this.container.getBoundingClientRect();
    const profile = this.quality.updateSize(rect.width);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: profile.level !== "low",
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(profile.pixelRatio);
    this.renderer.setSize(rect.width, rect.height, false);

    this.cameraController = new CameraController(rect.width, rect.height);
    this.interaction = new InteractionController(this.container);
    this.timeline = new AnimationTimeline(this.quality.reducedMotion);
    this.postProcessing = new PostProcessingSystem(this.renderer, profile);

    if (!SceneController.hasLoggedVersion) {
      console.info("[Vibrant Field] vers\u00e3o 3 carregada");
      SceneController.hasLoggedVersion = true;
    }

    const background = new BackgroundSystem(profile, this.resources);
    const holographicShell = new HolographicShellSystem(this.resources);
    const toroidalField = new ToroidalFieldSystem(profile, this.resources);
    const activationRings = new ActivationRingSystem(this.resources);
    const energyParticles = new EnergyParticleSystem(profile, this.resources);
    const figure = new FigureSystem(this.resources);
    const chakras = new ChakraSystem(profile, this.resources);

    this.systems.push(
      background,
      holographicShell,
      toroidalField,
      activationRings,
      figure,
      chakras,
      energyParticles,
    );
    this.scene.add(
      background.group,
      holographicShell.group,
      toroidalField.group,
      activationRings.group,
      figure.group,
      chakras.group,
      energyParticles.group,
    );

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.container);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.start();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.interaction.dispose();
    this.systems.forEach((system) => system.dispose());
    this.resources.disposeObject(this.scene);
    this.resources.dispose();
    this.renderer.dispose();
  }

  private start() {
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.render);
  }

  private render = (now: number) => {
    if (this.disposed || document.hidden) {
      return;
    }

    const rawDelta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    const delta = rawDelta;
    this.elapsed += delta;

    this.interaction.update(rawDelta);

    const state = this.timeline.update(rawDelta, this.elapsed, this.interaction.state);

    this.systems.forEach((system) => system.update(state, this.interaction.state));
    this.cameraController.update(state, this.interaction.state);
    this.postProcessing.update(this.renderer, state.expansion + state.energyIntensity * 0.25);
    this.renderer.render(this.scene, this.cameraController.camera);

    if (!this.ready && state.intro > 0.12) {
      this.ready = true;
      this.onReady?.();
    }

    this.frameId = requestAnimationFrame(this.render);
  };

  private handleResize = () => {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const profile = this.quality.updateSize(width);
    this.renderer.setPixelRatio(profile.pixelRatio);
    this.renderer.setSize(width, height, false);
    this.cameraController.resize(width, height);
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.frameId);
      return;
    }

    this.start();
  };
}
