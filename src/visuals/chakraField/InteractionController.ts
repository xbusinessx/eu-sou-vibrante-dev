import * as THREE from "three";
import { dampVector2 } from "./math";
import type { InteractionState } from "./types";

export class InteractionController {
  private readonly container: HTMLElement;
  private targetPointer = new THREE.Vector2();
  private activationAge = 999;

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
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("blur", this.handlePointerLeave);
  }

  update(delta: number) {
    dampVector2(this.state.smoothPointer, this.targetPointer, 5.5, delta);
    this.state.pointer.copy(this.targetPointer);
    this.activationAge += delta;
    this.state.hoverIndex = -1;
    this.state.hoverStrength = 0;
    this.state.activation = 0;
    this.state.activationAge = this.activationAge;
    this.state.ringPulse = 0;
    this.state.chakraPulseIndex = -1;
    this.state.chakraPulseStrength = 0;
  }

  dispose() {
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("blur", this.handlePointerLeave);
  }

  private getPointerSample(event: PointerEvent) {
    const rect = this.container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    return { x, y, rect };
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const { x, y } = this.getPointerSample(event);
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      this.handlePointerLeave();
      return;
    }
    this.targetPointer.set((x - 0.5) * 2, -(y - 0.5) * 2);
  };

  private handlePointerLeave = () => {
    this.targetPointer.set(0, 0);
  };
}
