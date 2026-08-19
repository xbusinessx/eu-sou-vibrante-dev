import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import energyFieldArt from "../assets/original/meditation-energy-vector.png";

const orbitDots = [
  { id: "wide-1", width: "92%", depth: 0.33, unscale: 3.05, top: "49%", duration: "22s", active: "12s", phase: "18deg", size: "0.62rem", color: "#ffe28b" },
  { id: "wide-2", width: "86%", depth: 0.47, unscale: 2.13, top: "47%", duration: "26s", active: "14s", phase: "184deg", size: "0.5rem", color: "#fff2bb", reverse: true },
  { id: "upper-1", width: "68%", depth: 0.3, unscale: 3.35, top: "38%", duration: "18s", active: "10s", phase: "302deg", size: "0.44rem", color: "#ffd36d" },
  { id: "upper-2", width: "58%", depth: 0.52, unscale: 1.92, top: "36%", duration: "31s", active: "17s", phase: "92deg", size: "0.4rem", color: "#f6c7ff", reverse: true },
  { id: "middle-1", width: "74%", depth: 0.2, unscale: 5, top: "53%", duration: "20s", active: "11s", phase: "246deg", size: "0.42rem", color: "#8cf7ff" },
  { id: "lower-1", width: "80%", depth: 0.22, unscale: 4.55, top: "77%", duration: "28s", active: "15s", phase: "138deg", size: "0.5rem", color: "#ffe18a", reverse: true },
  { id: "lower-2", width: "62%", depth: 0.14, unscale: 7.15, top: "80%", duration: "23s", active: "13s", phase: "328deg", size: "0.38rem", color: "#ffffff" },
];

const geometryLines = [
  { rx: 344, ry: 118, rotate: -4, className: "line-primary" },
  { rx: 314, ry: 94, rotate: 19, className: "line-secondary" },
  { rx: 292, ry: 168, rotate: -28, className: "line-secondary" },
  { rx: 230, ry: 206, rotate: 14, className: "line-quiet" },
  { rx: 382, ry: 256, rotate: 0, className: "line-quiet" },
];

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
};

const createParticleStyle = (index: number): CSSProperties =>
  ({
    "--particle-x": `${6 + ((index * 17) % 88)}%`,
    "--particle-y": `${8 + ((index * 29) % 82)}%`,
    "--particle-size": `${0.12 + (index % 5) * 0.055}rem`,
    "--particle-delay": `${-(index % 11) * 0.7}s`,
    "--particle-duration": `${6.6 + (index % 8) * 0.8}s`,
    "--particle-drift": `${index % 2 === 0 ? 1 : -1}`,
    "--particle-alpha": `${0.26 + (index % 7) * 0.055}`,
    "--particle-alpha-low": `${(0.26 + (index % 7) * 0.055) * 0.7}`,
  }) as CSSProperties;

export const MeditationEnergyAnimation = () => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const activeTimerRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const reducedMotion = useReducedMotion();
  const particles = useMemo(() => Array.from({ length: 44 }, (_, index) => index), []);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.18 },
    );

    observer.observe(scene);

    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (activeTimerRef.current) {
        window.clearTimeout(activeTimerRef.current);
      }
    },
    [],
  );

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;

    if (!scene || reducedMotion) {
      return;
    }

    const rect = scene.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;

    scene.style.setProperty("--energy-pointer-x", x.toFixed(4));
    scene.style.setProperty("--energy-pointer-y", y.toFixed(4));
  };

  const handlePointerLeave = () => {
    const scene = sceneRef.current;

    if (!scene) {
      return;
    }

    scene.style.setProperty("--energy-pointer-x", "0");
    scene.style.setProperty("--energy-pointer-y", "0");
  };

  const triggerActivation = () => {
    if (reducedMotion) {
      return;
    }

    if (activeTimerRef.current) {
      window.clearTimeout(activeTimerRef.current);
    }

    setIsActive(true);
    activeTimerRef.current = window.setTimeout(() => setIsActive(false), 4200);
  };

  const isPaused = reducedMotion || !isInView;

  return (
    <div
      ref={sceneRef}
      className={`meditation-energy-scene${isActive ? " is-activated" : ""}${isPaused ? " is-paused" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={triggerActivation}
      aria-hidden="true"
    >
      <div className="meditation-energy-atmosphere" />
      <div className="meditation-energy-art-layer">
        <img
          src={energyFieldArt}
          className="meditation-energy-art"
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      </div>

      <div className="meditation-energy-particles">
        {particles.map((particle) => (
          <span key={particle} style={createParticleStyle(particle)} />
        ))}
      </div>

      <svg className="meditation-energy-geometry" viewBox="0 0 1000 563" focusable="false">
        <defs>
          <radialGradient id="energyPulseGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="42%" stopColor="#ffd36d" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#00ffe0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="energyLineGradient" x1="0%" x2="100%" y1="50%" y2="50%">
            <stop offset="0%" stopColor="#f4b84f" stopOpacity="0" />
            <stop offset="18%" stopColor="#f4b84f" stopOpacity="0.58" />
            <stop offset="50%" stopColor="#fff4bf" stopOpacity="0.82" />
            <stop offset="82%" stopColor="#f4b84f" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#f4b84f" stopOpacity="0" />
          </linearGradient>
          <filter id="energySoftGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="meditation-energy-geometry-main">
          {geometryLines.map((line) => (
            <ellipse
              key={`${line.rx}-${line.ry}-${line.rotate}`}
              className={line.className}
              cx="500"
              cy="288"
              rx={line.rx}
              ry={line.ry}
              transform={`rotate(${line.rotate} 500 288)`}
            />
          ))}
          <path className="line-network" d="M315 168 L500 58 L685 168 L730 323 L500 479 L270 323 Z" />
          <path className="line-network line-network-alt" d="M500 58 L612 352 L315 168 L685 168 L388 352 L500 58" />
          <circle className="energy-crown-glow" cx="500" cy="72" r="26" />
          <circle className="energy-click-ring" cx="500" cy="300" r="76" />
        </g>

        <g className="meditation-energy-ground">
          <ellipse cx="500" cy="474" rx="320" ry="58" />
          <ellipse cx="500" cy="474" rx="230" ry="37" />
          <ellipse cx="500" cy="474" rx="132" ry="22" />
          <circle className="energy-root-reflection" cx="500" cy="487" r="18" />
        </g>
      </svg>

      <div className="meditation-energy-aura" />
      <div className="meditation-energy-orbitals">
        {orbitDots.map((dot) => (
          <span
            key={dot.id}
            className={`meditation-energy-orbit-dot${dot.reverse ? " is-reverse" : ""}`}
            style={
              {
                "--orbit-width": dot.width,
                "--orbit-depth": dot.depth,
                "--dot-unscale": dot.unscale,
                "--orbit-top": dot.top,
                "--orbit-duration": dot.duration,
                "--orbit-active-duration": dot.active,
                "--orbit-phase": dot.phase,
                "--dot-size": dot.size,
                "--dot-color": dot.color,
              } as CSSProperties
            }
          />
        ))}
      </div>

    </div>
  );
};
