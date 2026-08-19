import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { portalModules } from "../data/modules";

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

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
    <div className="module-explorer">
      <div className="module-tabs" role="tablist" aria-label="Eixos do Portal da Consciência">
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
              <span>Eixo {romanNumerals[index]}</span>
              <strong>{module.title}</strong>
              <ArrowUpRight aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="module-panel-shell">
        <div className="module-panel-grid" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeAxis.title}
            id={`axis-panel-${activeIndex}`}
            role="tabpanel"
            aria-labelledby={`axis-tab-${activeIndex}`}
            className="module-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="module-panel-heading">
              <p>Eixo {romanNumerals[activeIndex]} / 08</p>
              <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            </div>
            <h3>{activeAxis.title}</h3>
            <p className="module-panel-subtitle">{activeAxis.subtitle}</p>
            <ul>
              {activeAxis.bullets.map((bullet) => (
                <li key={bullet}>
                  <Check aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            {activeAxis.title === "Biologia da Ascensão" && (
              <p className="module-panel-note">
                Estes tópicos são apresentados como perspectivas espirituais e temas de estudo,
                não como orientação ou alegação médica ou científica.
              </p>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
};
