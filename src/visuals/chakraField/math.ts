import * as THREE from "three";

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

export const damp = (current: number, target: number, lambda: number, delta: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));

export const dampVector2 = (
  current: THREE.Vector2,
  target: THREE.Vector2,
  lambda: number,
  delta: number,
) => {
  const factor = 1 - Math.exp(-lambda * delta);
  current.lerp(target, factor);
};

export const torusPoint = (
  progress: number,
  phase: number,
  family: number,
  out = new THREE.Vector3(),
) => {
  const u = progress * Math.PI * 2;
  const phase01 = (phase % (Math.PI * 2)) / (Math.PI * 2);
  const centeredPhase = phase01 * 2 - 1;
  const subtleDrift = Math.sin(u * 2.0 + phase * 1.3) * 0.012;

  if (family < 0.28) {
    const yLevel = centeredPhase * 1.34;
    const centerWeight = 1 - Math.min(1, Math.abs(yLevel) / 1.34);
    const width = 2.42 + centerWeight * 0.44;
    const depth = 0.32 + centerWeight * 0.1;
    out.set(
      Math.cos(u) * width,
      yLevel + Math.sin(u * 2.0 + phase) * 0.018,
      Math.sin(u) * depth + subtleDrift,
    );
  } else if (family < 0.56) {
    const radius = Math.sin(u);
    const side = 2.62 * radius;
    const vertical = Math.cos(u) * 1.62;
    out.set(
      side * Math.cos(phase),
      vertical + Math.sin(u * 3.0 + phase) * 0.018,
      side * Math.sin(phase) * 0.18 + subtleDrift,
    );
  } else if (family < 0.84) {
    const y = (progress - 0.5) * 3.16;
    const waist = Math.pow(Math.min(1, Math.abs(y) / 1.58), 1.72);
    const radius = 0.16 + waist * 1.42;
    const crossing = Math.sin(u * 2.0 + phase) * 0.034;
    out.set(
      Math.sin(phase) * radius + crossing,
      y,
      Math.cos(phase) * radius * 0.18 + subtleDrift,
    );
  } else {
    const lobe = phase01 < 0.5 ? 1 : -1;
    const localPhase = phase + lobe * 0.28;
    const width = 2.58 + Math.sin(localPhase) * 0.12;
    const yCenter = lobe * 1.34;
    out.set(
      Math.cos(u) * width,
      yCenter + Math.sin(u) * 0.22,
      Math.sin(u + localPhase) * 0.28 + subtleDrift,
    );
  }

  out.x *= 1.02;
  out.y *= 0.98;
  out.z *= 0.95;

  return out;
};

export const chakraEnergyPosition = (indexFloat: number) =>
  THREE.MathUtils.lerp(-1.12, 1.3, clamp01(indexFloat / 6));
