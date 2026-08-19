import type { QualityProfile } from "./types";

export class QualityManager {
  readonly reducedMotion: boolean;
  private profile: QualityProfile;

  constructor() {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.profile = this.createProfile();
  }

  getProfile() {
    return this.profile;
  }

  updateSize(width: number) {
    const next = this.createProfile(width);
    this.profile = next;
    return next;
  }

  private createProfile(width = window.innerWidth): QualityProfile {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const isSmall = width < 720;
    const constrainedNetwork =
      connection?.saveData === true || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
    const isLow =
      this.reducedMotion || constrainedNetwork || memory <= 4 || cores <= 4 || isSmall;
    const isHigh = width >= 1100 && memory >= 8 && cores >= 6 && !this.reducedMotion;

    if (isLow) {
      return {
        level: "low",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.15),
        maxFps: this.reducedMotion ? 1 : 30,
        torusLines: 30,
        samplesPerLine: 132,
        fieldParticles: 1100,
        backgroundParticles: 72,
        chakraParticles: 16,
        enableBackground: false,
        enableHolographicShell: false,
        enableCoreWireframe: false,
      };
    }

    if (isHigh) {
      return {
        level: "high",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.65),
        maxFps: 60,
        torusLines: 56,
        samplesPerLine: 236,
        fieldParticles: 4600,
        backgroundParticles: 300,
        chakraParticles: 48,
        enableBackground: true,
        enableHolographicShell: true,
        enableCoreWireframe: true,
      };
    }

    return {
      level: "medium",
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.4),
      maxFps: 45,
      torusLines: 44,
      samplesPerLine: 204,
      fieldParticles: 2800,
      backgroundParticles: 180,
      chakraParticles: 32,
      enableBackground: true,
      enableHolographicShell: true,
      enableCoreWireframe: true,
    };
  }
}
