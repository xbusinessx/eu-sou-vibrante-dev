import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { portalModules } from "../data/modules";

export const ModuleShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const activeAxis = portalModules[activeIndex];

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % portalModules.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + portalModules.length) % portalModules.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = portalModules.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    document.getElementById(`axis-tab-${nextIndex}`)?.focus();
  };

  return (
    <div className="axis-console">
      <div className="axis-rail" role="tablist" aria-label="Eixos do Portal da Consciência">
        {portalModules.map((module, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={module.title}
              id={`axis-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`axis-panel-${index}`}
              tabIndex={isActive ? 0 : -1}
              className={isActive ? "is-active" : ""}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="axis-node" aria-hidden="true" />
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{module.title}</strong>
            </button>
          );
        })}
      </div>

      <div className="axis-viewport">
        <div className="axis-viewport-index" aria-hidden="true">
          {String(activeIndex + 1).padStart(2, "0")}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeAxis.title}
            id={`axis-panel-${activeIndex}`}
            role="tabpanel"
            aria-labelledby={`axis-tab-${activeIndex}`}
            className="axis-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            <header>
              <p>Eixo {String(activeIndex + 1).padStart(2, "0")} de 08</p>
              <h3>{activeAxis.title}</h3>
              <span>{activeAxis.subtitle}</span>
            </header>
            <ol className="axis-topics">
              {activeAxis.bullets.map((bullet, index) => (
                <li key={bullet}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{bullet}</span>
                </li>
              ))}
            </ol>
            {activeAxis.title === "Biologia da Ascensão" && (
              <p className="axis-disclaimer">
                Perspectivas espirituais e temas de estudo; não são orientação ou alegação
                médica ou científica.
              </p>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
};
