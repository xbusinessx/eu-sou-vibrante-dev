import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { portalModules } from "../data/modules";

export const ModuleShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const activeChapter = portalModules[activeIndex];

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
    document.getElementById(`editorial-chapter-tab-${nextIndex}`)?.focus();
  };

  return (
    <div className="editorial-index" data-open-chapter={activeIndex + 1}>
      <div className="editorial-index-chapters">
        <div className="editorial-index-caption" aria-hidden="true">
          <span>Índice do percurso</span>
          <small>Oito eixos para abrir e revisitar</small>
        </div>

        <div
          className="editorial-index-tabs"
          role="tablist"
          aria-label="Eixos do Portal da Consciência"
          aria-orientation="vertical"
        >
          {portalModules.map((module, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={module.title}
                id={`editorial-chapter-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`editorial-chapter-panel-${index}`}
                tabIndex={isActive ? 0 : -1}
                className={`editorial-index-tab${isActive ? " is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className="editorial-index-tab-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="editorial-index-tab-copy">
                  <strong>{module.title}</strong>
                  <small>{module.subtitle}</small>
                </span>
                <span className="editorial-index-tab-marker" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="editorial-index-spread">
        <span className="editorial-index-paper-edge" aria-hidden="true" />
        <div className="editorial-index-folio" aria-hidden="true">
          <span>Portal da Consciência</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / 08</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeChapter.title}
            id={`editorial-chapter-panel-${activeIndex}`}
            role="tabpanel"
            aria-labelledby={`editorial-chapter-tab-${activeIndex}`}
            className="editorial-index-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="editorial-index-panel-header">
              <p className="editorial-index-kicker">
                Eixo {String(activeIndex + 1).padStart(2, "0")} de 08
              </p>
              <h3>{activeChapter.title}</h3>
              <p className="editorial-index-subtitle">{activeChapter.subtitle}</p>
            </header>

            <div className="editorial-index-annotation" aria-hidden="true">
              <span>anotações desta folha</span>
              <svg viewBox="0 0 180 22" focusable="false">
                <path d="M3 15C36 6 70 18 103 10C130 4 151 7 177 3" pathLength="1" />
              </svg>
            </div>

            <ol className="editorial-index-topics">
              {activeChapter.bullets.map((bullet, index) => (
                <li key={bullet}>
                  <small className="editorial-index-topic-number">
                    {String(index + 1).padStart(2, "0")}
                  </small>
                  <span className="editorial-index-topic-copy">{bullet}</span>
                </li>
              ))}
            </ol>

            {activeChapter.title === "Biologia da Ascensão" && (
              <p className="editorial-index-disclaimer">
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
