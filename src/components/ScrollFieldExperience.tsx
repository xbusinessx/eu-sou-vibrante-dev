import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ScrollState } from "../visuals/chakraField/types";

type SceneControllerInstance =
  import("../visuals/chakraField/SceneController").SceneController;

type WebGLStatus = "poster" | "loading" | "ready" | "fallback";

interface ScrollFieldExperienceProps {
  className?: string;
  rootSelector?: string;
  chapterSelector?: string;
  posterSrc?: string;
  zIndex?: number;
}

const FALLBACK_CHAPTER_COUNT = 7;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const selectElement = (selector: string) => {
  try {
    return document.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
};

const selectElements = (root: HTMLElement, selector: string) => {
  try {
    return Array.from(root.querySelectorAll<HTMLElement>(selector));
  } catch {
    return [];
  }
};

const readDeclaredChapter = (element: HTMLElement, fallback: number) => {
  const rawValue = element.getAttribute("data-field-chapter");
  if (rawValue === null || rawValue.trim() === "") return fallback;

  const declared = Number(rawValue);
  return Number.isFinite(declared) ? Math.max(0, Math.floor(declared)) : fallback;
};

export const ScrollFieldExperience = ({
  className = "",
  rootSelector = "[data-field-scroll-root]",
  chapterSelector = "[data-field-chapter]",
  posterSrc,
  zIndex = 0,
}: ScrollFieldExperienceProps) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<SceneControllerInstance | null>(null);
  const scopeActiveRef = useRef(true);
  const latestStateRef = useRef<ScrollState>({
    progress: 0,
    chapter: 0,
    localProgress: 0,
  });
  const [status, setStatus] = useState<WebGLStatus>("poster");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    let loadFrame = window.requestAnimationFrame(() => {
      loadFrame = 0;
      setStatus("loading");

      void import("../visuals/chakraField/SceneController")
        .then(({ SceneController }) => {
          if (cancelled) return;

          const controller = new SceneController({
            canvas,
            container,
            onReady: () => {
              if (!cancelled) setStatus("ready");
            },
            onError: () => {
              if (!cancelled) setStatus("fallback");
            },
          });

          if (cancelled) {
            controller.dispose();
            return;
          }

          controllerRef.current = controller;
          controller.setScrollState(latestStateRef.current);
          controller.setActive(scopeActiveRef.current && !document.hidden);
        })
        .catch(() => {
          if (!cancelled) setStatus("fallback");
        });
    });

    return () => {
      cancelled = true;
      if (loadFrame) window.cancelAnimationFrame(loadFrame);
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root =
      selectElement(rootSelector) ?? document.querySelector<HTMLElement>("main") ?? document.body;
    const chapters = selectElements(root, chapterSelector);
    let updateFrame = 0;

    const updateScrollState = () => {
      updateFrame = 0;

      const rootRect = root.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const scrollableDistance = Math.max(rootRect.height - viewportHeight, 1);
      const progress = clamp01(-rootRect.top / scrollableDistance);
      const probeLine = viewportHeight * 0.54;

      let chapter: number;
      let localProgress: number;

      if (chapters.length > 0) {
        let activeIndex = 0;

        chapters.forEach((chapterElement, index) => {
          if (chapterElement.getBoundingClientRect().top <= probeLine) {
            activeIndex = index;
          }
        });

        const activeChapter = chapters[activeIndex];
        const chapterRect = activeChapter.getBoundingClientRect();
        chapter = readDeclaredChapter(activeChapter, activeIndex);
        localProgress = clamp01(
          (probeLine - chapterRect.top) / Math.max(chapterRect.height, 1),
        );
      } else {
        const chapterFloat = progress * (FALLBACK_CHAPTER_COUNT - 1);
        chapter = Math.min(FALLBACK_CHAPTER_COUNT - 1, Math.floor(chapterFloat));
        localProgress = chapter === FALLBACK_CHAPTER_COUNT - 1 ? 1 : chapterFloat - chapter;
      }

      latestStateRef.current = { progress, chapter, localProgress };
      controllerRef.current?.setScrollState(progress, chapter, localProgress);

      const fadeIn = clamp01((viewportHeight - rootRect.top) / (viewportHeight * 0.72));
      const fadeOut = clamp01(rootRect.bottom / (viewportHeight * 0.88));
      container.style.setProperty(
        "--scroll-field-visibility",
        Math.min(fadeIn, fadeOut).toFixed(4),
      );
    };

    const scheduleUpdate = () => {
      if (updateFrame) return;
      updateFrame = window.requestAnimationFrame(updateScrollState);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        scopeActiveRef.current = entry.isIntersecting;
        controllerRef.current?.setActive(entry.isIntersecting && !document.hidden);
      },
      { rootMargin: "65% 0px", threshold: 0 },
    );

    const handleVisibilityChange = () => {
      controllerRef.current?.setActive(scopeActiveRef.current && !document.hidden);
      if (!document.hidden) scheduleUpdate();
    };

    observer.observe(root);
    updateScrollState();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (updateFrame) window.cancelAnimationFrame(updateFrame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chapterSelector, rootSelector]);

  const transitionDuration = shouldReduceMotion ? "0ms" : "700ms";
  const isReady = status === "ready";
  const posterStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: isReady ? 0 : 0.72,
    transition: `opacity ${transitionDuration} ease`,
  };

  return (
    <div
      ref={containerRef}
      className={`scroll-field-experience${className ? ` ${className}` : ""}`}
      data-webgl-state={status}
      aria-hidden="true"
      style={
        {
          "--scroll-field-visibility": 1,
          position: "fixed",
          inset: 0,
          zIndex,
          width: "100%",
          height: "100svh",
          overflow: "hidden",
          opacity: "var(--scroll-field-visibility)",
          pointerEvents: "none",
          contain: "strict",
        } as CSSProperties
      }
    >
      {posterSrc ? (
        <img
          className="scroll-field-poster"
          src={posterSrc}
          alt=""
          decoding="async"
          draggable={false}
          style={{
            ...posterStyle,
            objectFit: "cover",
            objectPosition: "center",
            filter: "saturate(0.88) brightness(0.48) contrast(1.08)",
            transform: "scale(1.025)",
          }}
        />
      ) : (
        <div className="scroll-field-poster scroll-field-poster-fallback" style={posterStyle}>
          <span aria-hidden="true" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="scroll-field-canvas"
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          opacity: isReady ? 1 : 0,
          transition: `opacity ${transitionDuration} ease`,
        }}
      />
    </div>
  );
};
