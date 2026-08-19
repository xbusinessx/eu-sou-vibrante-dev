import * as THREE from "three";
import { damp, dampVector2 } from "./math";
import type { InteractionState } from "./types";

const chakraScreenY = [0.73, 0.676, 0.621, 0.565, 0.511, 0.458, 0.405];

export class InteractionController {
  private readonly container: HTMLElement;
  private targetPointer = new THREE.Vector2();
  private isInside = false;
  private targetHoverIndex = -1;
  private targetHoverStrength = 0;
  private activationTarget = 0;
  private activationAge = 999;
  private ringPulseTarget = 0;
  private chakraPulseIndex = -1;
  private chakraPulseAge = 999;

  readonly state: InteractionState = {
    pointer: new THREE.Vector2(),
    smoothPointer: new THREE.Vector2(),
    hoverIndex: -1,
    hoverStrength: 0,
    activation: 0,
    activationAge: 999,
    ringPulse: 0,
    chakraPulseIndex: -1,
    chakraPulseStrength: 0,
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.style.touchAction = "manipulation";
    this.container.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    this.container.addEventListener("pointerdown", this.handlePointerDown, { passive: true });
    this.container.addEventListener("pointerleave", this.handlePointerLeave, { passive: true });
  }

  update(delta: number) {
    dampVector2(this.state.smoothPointer, this.targetPointer, 5.5, delta);
    this.state.pointer.copy(this.targetPointer);
    this.state.hoverStrength = damp(
      this.state.hoverStrength,
      this.targetHoverStrength,
      5.2,
      delta,
    );

    if (this.state.hoverStrength < 0.04 && this.targetHoverIndex === -1) {
      this.state.hoverIndex = -1;
    } else if (this.targetHoverIndex !== -1) {
      this.state.hoverIndex = this.targetHoverIndex;
    }

    this.activationAge += delta;
    this.chakraPulseAge += delta;

    if (this.activationTarget > 0.5 && this.activationAge > 5.8) {
      this.activationTarget = 0;
    }

    this.state.activation = damp(this.state.activation, this.activationTarget, 2.4, delta);
    this.state.activationAge = this.activationAge;
    this.state.ringPulse = damp(this.state.ringPulse, this.ringPulseTarget, 5.2, delta);
    this.ringPulseTarget = damp(this.ringPulseTarget, 0, 2.8, delta);

    this.state.chakraPulseIndex = this.chakraPulseIndex;
    this.state.chakraPulseStrength =
      this.chakraPulseIndex === -1 ? 0 : Math.max(0, 1 - this.chakraPulseAge / 1.55);

    if (this.state.chakraPulseStrength <= 0.01) {
      this.chakraPulseIndex = -1;
      this.state.chakraPulseIndex = -1;
      this.state.chakraPulseStrength = 0;
    }
  }

  dispose() {
    this.container.removeEventListener("pointermove", this.handlePointerMove);
    this.container.removeEventListener("pointerdown", this.handlePointerDown);
    this.container.removeEventListener("pointerleave", this.handlePointerLeave);
  }

  private getPointerSample(event: PointerEvent) {
    const rect = this.container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    return { x, y, rect };
  }

  private findNearestChakra(x: number, y: number, radius = 0.095) {
    let nearest = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;

    chakraScreenY.forEach((chakraY, index) => {
      const distance = Math.hypot(x - 0.502, y - chakraY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    return {
      index: nearestDistance < radius ? nearest : -1,
      distance: nearestDistance,
      strength: nearestDistance < radius ? 1 - nearestDistance / radius : 0,
    };
  }

  private handlePointerMove = (event: PointerEvent) => {
    const { x, y } = this.getPointerSample(event);
    this.isInside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    this.targetPointer.set((x - 0.5) * 2, -(y - 0.5) * 2);

    const nearest = this.findNearestChakra(x, y);

    if (this.isInside && nearest.index !== -1) {
      this.targetHoverIndex = nearest.index;
      this.targetHoverStrength = nearest.strength;
    } else {
      this.targetHoverIndex = -1;
      this.targetHoverStrength = 0;
    }
  };

  private handlePointerDown = (event: PointerEvent) => {
    const { x, y } = this.getPointerSample(event);
    const touchRadius = event.pointerType === "mouse" ? 0.105 : 0.14;
    const nearest = this.findNearestChakra(x, y, touchRadius);

    if (nearest.index !== -1) {
      this.chakraPulseIndex = nearest.index;
      this.chakraPulseAge = 0;
    }

    this.activationTarget = this.activationTarget > 0.5 ? 0 : 1;
    this.activationAge = 0;
    this.ringPulseTarget = 1;
  };

  private handlePointerLeave = () => {
    this.isInside = false;
    this.targetPointer.set(0, 0);
    this.targetHoverIndex = -1;
    this.targetHoverStrength = 0;
  };
}
