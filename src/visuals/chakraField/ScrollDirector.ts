import * as THREE from "three";
import type { ScrollDirectorState, ScrollState } from "./types";

type ScenePose = Omit<ScrollDirectorState, keyof ScrollState>;

const CHAPTER_POSES: ScenePose[] = [
  {
    rootX: 1.05,
    rootY: 0.02,
    rootZ: 0,
    rootRotationX: 0.04,
    rootRotationY: -0.16,
    rootRotationZ: -0.03,
    rootScale: 0.84,
    cameraX: 0,
    cameraY: 0.08,
    cameraZ: 7.75,
    cameraTargetX: 0.18,
    cameraTargetY: 0.04,
    cameraTargetZ: 0,
    cameraRoll: 0,
    cameraFov: 34,
    energyY: -1.1,
    energyIntensity: 0.08,
    expansion: 0,
    activation: 0,
    presence: 1,
  },
  {
    rootX: 0.78,
    rootY: 0.05,
    rootZ: 0.04,
    rootRotationX: 0.02,
    rootRotationY: 0.08,
    rootRotationZ: 0.015,
    rootScale: 0.93,
    cameraX: -0.05,
    cameraY: 0.09,
    cameraZ: 7.15,
    cameraTargetX: 0.1,
    cameraTargetY: 0.05,
    cameraTargetZ: 0,
    cameraRoll: 0.008,
    cameraFov: 33,
    energyY: -0.55,
    energyIntensity: 0.25,
    expansion: 0.18,
    activation: 0.04,
    presence: 1,
  },
  {
    rootX: 0.34,
    rootY: 0,
    rootZ: 0.12,
    rootRotationX: -0.035,
    rootRotationY: -0.08,
    rootRotationZ: -0.018,
    rootScale: 1.07,
    cameraX: 0.03,
    cameraY: 0.07,
    cameraZ: 6.45,
    cameraTargetX: 0.02,
    cameraTargetY: 0.06,
    cameraTargetZ: 0,
    cameraRoll: -0.006,
    cameraFov: 32,
    energyY: 1.18,
    energyIntensity: 0.58,
    expansion: 0.6,
    activation: 0.18,
    presence: 1,
  },
  {
    rootX: -0.78,
    rootY: -0.02,
    rootZ: 0.05,
    rootRotationX: -0.06,
    rootRotationY: 0.36,
    rootRotationZ: -0.045,
    rootScale: 0.92,
    cameraX: 0.08,
    cameraY: 0.08,
    cameraZ: 6.8,
    cameraTargetX: -0.08,
    cameraTargetY: 0.04,
    cameraTargetZ: 0.02,
    cameraRoll: -0.018,
    cameraFov: 33,
    energyY: 0.18,
    energyIntensity: 0.42,
    expansion: 0.78,
    activation: 0.3,
    presence: 1,
  },
  {
    rootX: 0,
    rootY: 0.08,
    rootZ: -0.06,
    rootRotationX: 0.08,
    rootRotationY: 0.75,
    rootRotationZ: 0.08,
    rootScale: 0.74,
    cameraX: 0,
    cameraY: 0.12,
    cameraZ: 7.4,
    cameraTargetX: 0,
    cameraTargetY: 0.08,
    cameraTargetZ: 0,
    cameraRoll: 0.02,
    cameraFov: 36,
    energyY: 0.85,
    energyIntensity: 0.38,
    expansion: 0.45,
    activation: 0.18,
    presence: 0.9,
  },
  {
    rootX: 0.58,
    rootY: 0.16,
    rootZ: -0.12,
    rootRotationX: 0.1,
    rootRotationY: 0.98,
    rootRotationZ: 0.12,
    rootScale: 0.62,
    cameraX: 0,
    cameraY: 0.13,
    cameraZ: 7.85,
    cameraTargetX: 0.08,
    cameraTargetY: 0.1,
    cameraTargetZ: 0,
    cameraRoll: 0.024,
    cameraFov: 37,
    energyY: 1.1,
    energyIntensity: 0.28,
    expansion: 0.25,
    activation: 0.1,
    presence: 0.72,
  },
  {
    rootX: 0,
    rootY: 0.22,
    rootZ: -0.24,
    rootRotationX: 0.14,
    rootRotationY: 1.35,
    rootRotationZ: 0.2,
    rootScale: 0.48,
    cameraX: 0,
    cameraY: 0.15,
    cameraZ: 8.3,
    cameraTargetX: 0,
    cameraTargetY: 0.1,
    cameraTargetZ: 0,
    cameraRoll: 0.032,
    cameraFov: 39,
    energyY: 1.25,
    energyIntensity: 0.22,
    expansion: 0.12,
    activation: 0.06,
    presence: 0.48,
  },
];

const poseKeys = Object.keys(CHAPTER_POSES[0]) as Array<keyof ScenePose>;

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);

const smoothstep = (value: number) => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

const interpolatePose = (from: ScenePose, to: ScenePose, progress: number): ScenePose => {
  const pose = {} as ScenePose;

  poseKeys.forEach((key) => {
    pose[key] = THREE.MathUtils.lerp(from[key], to[key], progress);
  });

  return pose;
};

export const SCROLL_FIELD_CHAPTER_COUNT = CHAPTER_POSES.length;

export class ScrollDirector {
  private readonly reducedMotion: boolean;
  private readonly current: ScrollDirectorState;
  private readonly target: ScrollDirectorState;

  constructor(reducedMotion: boolean) {
    this.reducedMotion = reducedMotion;
    const first = CHAPTER_POSES[0];
    this.current = { progress: 0, chapter: 0, localProgress: 0, ...first };
    this.target = { ...this.current };
  }

  setScrollState({ progress, chapter, localProgress }: ScrollState) {
    const safeProgress = clamp01(Number.isFinite(progress) ? progress : 0);
    const safeChapter = THREE.MathUtils.clamp(
      Math.floor(Number.isFinite(chapter) ? chapter : 0),
      0,
      CHAPTER_POSES.length - 1,
    );
    const safeLocalProgress = clamp01(Number.isFinite(localProgress) ? localProgress : 0);
    const nextChapter = Math.min(safeChapter + 1, CHAPTER_POSES.length - 1);
    const pose = interpolatePose(
      CHAPTER_POSES[safeChapter],
      CHAPTER_POSES[nextChapter],
      smoothstep(safeLocalProgress),
    );

    this.target.progress = safeProgress;
    this.target.chapter = safeChapter;
    this.target.localProgress = safeLocalProgress;

    poseKeys.forEach((key) => {
      this.target[key] = pose[key];
    });

    // A slow global turn keeps chapter cuts from feeling like disconnected scenes.
    this.target.rootRotationY += (safeProgress - 0.5) * 0.18;
    this.target.rootRotationZ += Math.sin(safeProgress * Math.PI * 2) * 0.022;
  }

  update(delta: number): ScrollDirectorState {
    const factor = this.reducedMotion ? 1 : 1 - Math.exp(-5.8 * Math.max(delta, 0));

    poseKeys.forEach((key) => {
      this.current[key] = THREE.MathUtils.lerp(this.current[key], this.target[key], factor);
    });

    this.current.progress = THREE.MathUtils.lerp(
      this.current.progress,
      this.target.progress,
      factor,
    );
    this.current.localProgress = THREE.MathUtils.lerp(
      this.current.localProgress,
      this.target.localProgress,
      factor,
    );
    this.current.chapter = this.target.chapter;

    return this.current;
  }
}
