import * as THREE from "three";

type Disposable = { dispose: () => void };

export class ResourceManager {
  private disposables: Disposable[] = [];

  track<T extends Disposable>(resource: T) {
    this.disposables.push(resource);
    return resource;
  }

  createRadialTexture(stops: Array<[number, string]>, size = 128) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D context unavailable.");
    }

    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return this.track(texture);
  }

  disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh | THREE.Points | THREE.LineSegments;
      const geometry = mesh.geometry as THREE.BufferGeometry | undefined;
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;

      geometry?.dispose();

      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material?.dispose();
      }
    });
  }

  dispose() {
    this.disposables.forEach((resource) => resource.dispose());
    this.disposables = [];
  }
}
