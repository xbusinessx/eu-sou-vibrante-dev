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
    const isSmall = width < 720;
    const isLow = this.reducedMotion || memory <= 4 || cores <= 4 || isSmall;
    const isHigh = width >= 1100 && memory >= 8 && cores >= 6 && !this.reducedMotion;

    if (isLow) {
      return {
        level: "low",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25),
        torusLines: 36,
        samplesPerLine: 168,
        fieldParticles: 1800,
        backgroundParticles: 120,
        chakraParticles: 24,
      };
    }

    if (isHigh) {
      return {
        level: "high",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.75),
        torusLines: 56,
        samplesPerLine: 236,
        fieldParticles: 5200,
        backgroundParticles: 340,
        chakraParticles: 54,
      };
    }

    return {
      level: "medium",
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      torusLines: 44,
      samplesPerLine: 204,
      fieldParticles: 3200,
      backgroundParticles: 220,
      chakraParticles: 36,
    };
  }
}
