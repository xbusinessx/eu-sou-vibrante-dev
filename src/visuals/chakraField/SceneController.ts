import * as THREE from "three";
import { AnimationTimeline } from "./AnimationTimeline";
import { BackgroundSystem } from "./BackgroundSystem";
import { CameraController } from "./CameraController";
import { EnergyParticleSystem } from "./EnergyParticleSystem";
import { HolographicShellSystem } from "./HolographicShellSystem";
import { InteractionController } from "./InteractionController";
import { NucleusSystem } from "./NucleusSystem";
import { PostProcessingSystem } from "./PostProcessingSystem";
import { QualityManager } from "./QualityManager";
import { ResourceManager } from "./ResourceManager";
import { ScrollDirector } from "./ScrollDirector";
import { ToroidalFieldSystem } from "./ToroidalFieldSystem";
import type { SceneControllerOptions, SceneSystem, ScrollState } from "./types";

type MountableSceneSystem = SceneSystem & { group: THREE.Group };

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Falha desconhecida ao renderizar o campo WebGL.");

export class SceneController {
  private static hasLoggedVersion = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly container: HTMLElement;
  private readonly onReady?: () => void;
  private readonly onError?: (error: Error) => void;
  private readonly scene = new THREE.Scene();
  private readonly fieldRoot = new THREE.Group();
  private readonly resources = new ResourceManager();
  private readonly quality = new QualityManager();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cameraController: CameraController;
  private readonly interaction: InteractionController;
  private readonly timeline: AnimationTimeline;
  private readonly scrollDirector: ScrollDirector;
  private readonly postProcessing: PostProcessingSystem;
  private readonly systems: SceneSystem[] = [];
  private readonly resizeObserver: ResizeObserver;

  private frameId = 0;
  private lastTime = performance.now();
  private lastRenderedAt = 0;
  private elapsed = 0;
  private frameInterval = 1000 / 60;
  private disposed = false;
  private ready = false;
  private externallyActive = true;
  private pageVisible = !document.hidden;
  private contextLost = false;

  constructor({ canvas, container, onReady, onError }: SceneControllerOptions) {
    this.canvas = canvas;
    this.container = container;
    this.onReady = onReady;
    this.onError = onError;

    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const profile = this.quality.updateSize(width);
    this.frameInterval = 1000 / profile.maxFps;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: profile.level !== "low",
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(profile.pixelRatio);
    this.renderer.setSize(width, height, false);

    this.cameraController = new CameraController(width, height);
    this.interaction = new InteractionController(this.container);
    this.timeline = new AnimationTimeline(this.quality.reducedMotion);
    this.scrollDirector = new ScrollDirector(this.quality.reducedMotion);
    this.postProcessing = new PostProcessingSystem(this.renderer, profile);

    if (!SceneController.hasLoggedVersion) {
      console.info("[Núcleo 19/8] campo scroll-linked carregado");
      SceneController.hasLoggedVersion = true;
    }

    this.fieldRoot.rotation.order = "YXZ";
    this.scene.add(this.fieldRoot);

    const mount = (system: MountableSceneSystem) => {
      this.systems.push(system);
      this.fieldRoot.add(system.group);
    };

    if (profile.enableBackground) {
      mount(new BackgroundSystem(profile, this.resources));
    }

    if (profile.enableHolographicShell) {
      mount(new HolographicShellSystem(this.resources));
    }

    mount(new ToroidalFieldSystem(profile, this.resources));

    mount(new NucleusSystem(profile, this.resources));
    mount(new EnergyParticleSystem(profile, this.resources));

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.container);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost, false);
    this.canvas.addEventListener("webglcontextrestored", this.handleContextRestored, false);

    this.start();
  }

  setScrollState(state: ScrollState): void;
  setScrollState(progress: number, chapter?: number, localProgress?: number): void;
  setScrollState(
    stateOrProgress: ScrollState | number,
    chapter = 0,
    localProgress = 0,
  ) {
    const state =
      typeof stateOrProgress === "number"
        ? { progress: stateOrProgress, chapter, localProgress }
        : stateOrProgress;

    this.scrollDirector.setScrollState(state);

    if (this.quality.reducedMotion) {
      this.renderOnce();
    }
  }

  setActive(active: boolean) {
    if (this.disposed || this.externallyActive === active) return;

    this.externallyActive = active;

    if (!active) {
      this.cancelFrame();
      return;
    }

    this.start();
  }

  renderOnce() {
    if (!this.canRender() || this.frameId) return;
    this.frameId = requestAnimationFrame(this.render);
  }

  dispose() {
    if (this.disposed) return;

    this.disposed = true;
    this.cancelFrame();
    this.resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.handleContextRestored);
    this.interaction.dispose();
    this.systems.forEach((system) => system.dispose());
    this.resources.disposeObject(this.scene);
    this.resources.dispose();
    this.renderer.dispose();
  }

  private canRender() {
    return (
      !this.disposed &&
      !this.contextLost &&
      this.externallyActive &&
      this.pageVisible
    );
  }

  private start() {
    if (!this.canRender()) return;

    this.lastTime = performance.now();
    this.renderOnce();
  }

  private cancelFrame() {
    if (!this.frameId) return;
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  private scheduleNextFrame() {
    if (!this.canRender() || this.frameId) return;
    this.frameId = requestAnimationFrame(this.render);
  }

  private render = (now: number) => {
    this.frameId = 0;

    if (!this.canRender()) return;

    if (
      !this.quality.reducedMotion &&
      this.lastRenderedAt > 0 &&
      now - this.lastRenderedAt < this.frameInterval - 0.5
    ) {
      this.scheduleNextFrame();
      return;
    }

    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.lastRenderedAt = now;
    this.elapsed += delta;

    try {
      this.interaction.update(delta);

      const narrative = this.scrollDirector.update(delta);
      const state = this.timeline.update(delta, this.elapsed, this.interaction.state, narrative);

      this.fieldRoot.position.set(narrative.rootX, narrative.rootY, narrative.rootZ);
      this.fieldRoot.rotation.set(
        narrative.rootRotationX,
        narrative.rootRotationY,
        narrative.rootRotationZ,
      );
      this.fieldRoot.scale.setScalar(narrative.rootScale);

      this.systems.forEach((system) => system.update(state, this.interaction.state));
      this.cameraController.update(state, this.interaction.state, narrative);
      this.postProcessing.update(
        this.renderer,
        state.expansion + state.energyIntensity * 0.25,
      );
      this.renderer.render(this.scene, this.cameraController.camera);

      if (!this.ready && (this.quality.reducedMotion || state.intro > 0.12)) {
        this.ready = true;
        this.onReady?.();
      }
    } catch (error) {
      this.externallyActive = false;
      this.onError?.(toError(error));
      return;
    }

    if (!this.quality.reducedMotion) {
      this.scheduleNextFrame();
    }
  };

  private handleResize = () => {
    if (this.disposed || this.contextLost) return;

    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const profile = this.quality.updateSize(width);
    this.frameInterval = 1000 / profile.maxFps;
    this.renderer.setPixelRatio(profile.pixelRatio);
    this.renderer.setSize(width, height, false);
    this.cameraController.resize(width, height);

    if (this.quality.reducedMotion) {
      this.renderOnce();
    }
  };

  private handleVisibilityChange = () => {
    this.pageVisible = !document.hidden;

    if (!this.pageVisible) {
      this.cancelFrame();
      return;
    }

    this.start();
  };

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    this.cancelFrame();
    this.onError?.(new Error("O contexto WebGL foi perdido; exibindo a imagem de segurança."));
  };

  private handleContextRestored = () => {
    if (this.disposed) return;
    this.contextLost = false;
    this.ready = false;
    this.lastTime = performance.now();
    this.lastRenderedAt = 0;
    this.start();
  };
}
