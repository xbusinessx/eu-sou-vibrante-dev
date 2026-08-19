import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import energyFieldArt from "../assets/optimized/meditation-energy-vector.webp";

const chakraNodes = [
  { top: "19%", color: "#b88cff" },
  { top: "29%", color: "#758eff" },
  { top: "38%", color: "#59dcff" },
  { top: "49%", color: "#6ff0af" },
  { top: "59%", color: "#ffd35a" },
  { top: "69%", color: "#ff8f36" },
  { top: "79%", color: "#ff5548" },
];

const createParticleStyle = (index: number): CSSProperties =>
  ({
    "--particle-x": `${8 + ((index * 23) % 84)}%`,
    "--particle-y": `${10 + ((index * 31) % 78)}%`,
    "--particle-size": `${2 + (index % 3)}px`,
    "--particle-delay": `${-(index % 7) * 0.9}s`,
    "--particle-duration": `${7 + (index % 5) * 1.2}s`,
  }) as CSSProperties;

export const MeditationEnergyAnimation = () => {
  const sceneRef = useRef<HTMLButtonElement | null>(null);
  const pointerFrameRef = useRef(0);
  const activationTimerRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const particles = useMemo(() => Array.from({ length: 14 }, (_, index) => index), []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPaused(!entry.isIntersecting),
      { rootMargin: "100px 0px", threshold: 0.05 },
    );
    observer.observe(scene);

    return () => {
      observer.disconnect();
      if (pointerFrameRef.current) window.cancelAnimationFrame(pointerFrameRef.current);
      if (activationTimerRef.current) window.clearTimeout(activationTimerRef.current);
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion || pointerFrameRef.current || !sceneRef.current) return;

    const clientX = event.clientX;
    const clientY = event.clientY;
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = 0;
      const scene = sceneRef.current;
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
      scene.style.setProperty("--field-shift-x", `${(x * 4).toFixed(2)}px`);
      scene.style.setProperty("--field-shift-y", `${(y * 3).toFixed(2)}px`);
      scene.style.setProperty("--field-rotate-y", `${(x * 2.2).toFixed(2)}deg`);
      scene.style.setProperty("--field-rotate-x", `${(-y * 1.5).toFixed(2)}deg`);
      scene.style.setProperty("--field-image-x", `${(-x * 7).toFixed(2)}px`);
      scene.style.setProperty("--field-image-y", `${(-y * 5).toFixed(2)}px`);
    });
  };

  const resetPointer = () => {
    if (pointerFrameRef.current) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = 0;
    }
    sceneRef.current?.style.setProperty("--field-shift-x", "0px");
    sceneRef.current?.style.setProperty("--field-shift-y", "0px");
    sceneRef.current?.style.setProperty("--field-rotate-y", "0deg");
    sceneRef.current?.style.setProperty("--field-rotate-x", "0deg");
    sceneRef.current?.style.setProperty("--field-image-x", "0px");
    sceneRef.current?.style.setProperty("--field-image-y", "0px");
  };

  const triggerActivation = () => {
    if (activationTimerRef.current) window.clearTimeout(activationTimerRef.current);
    setIsActive(false);
    window.requestAnimationFrame(() => setIsActive(true));
    activationTimerRef.current = window.setTimeout(() => setIsActive(false), 1800);
  };

  return (
    <button
      ref={sceneRef}
      type="button"
      className={`vibrational-map${isActive ? " is-active" : ""}${isPaused ? " is-paused" : ""}`}
      aria-label="Ativar o pulso do mapa vibracional"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onClick={triggerActivation}
    >
      <span className="map-stage" aria-hidden="true">
        <span className="map-depth-grid" />
        <span className="map-atmosphere" />
        <span className="map-torus map-torus-back" />
        <span className="map-torus map-torus-mid" />
        <span className="map-torus map-torus-front" />

        <span className="map-image-plane">
          <img src={energyFieldArt} alt="" loading="lazy" decoding="async" draggable={false} />
        </span>

        <span className="map-particles">
          {particles.map((particle) => (
            <i key={particle} style={createParticleStyle(particle)} />
          ))}
        </span>

        <span className="map-chakra-line">
          {chakraNodes.map((node, index) => (
            <i
              key={node.top}
              style={{ "--chakra-top": node.top, "--chakra-color": node.color } as CSSProperties}
              className={index === 3 ? "is-heart" : ""}
            />
          ))}
        </span>

        <span className="map-scan-line" />
        <span className="map-axis map-axis-top">CONSCIÊNCIA / 08</span>
        <span className="map-axis map-axis-left">CAMPO / PRESENÇA</span>
        <span className="map-axis map-axis-right">AGORA / ∞</span>
        <span className="map-activation-ring" />
      </span>

      <span className="map-interaction-hint">
        <i /> Toque para ativar o campo
      </span>
    </button>
  );
};
