import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import slide05 from "../../Repositório/optimized/5.webp";
import slide06 from "../../Repositório/optimized/6.webp";
import slide07 from "../../Repositório/optimized/7.webp";
import slide08 from "../../Repositório/optimized/8.webp";
import slide09 from "../../Repositório/optimized/9.webp";
import slide10 from "../../Repositório/optimized/10.webp";
import slide11 from "../../Repositório/optimized/11.webp";
import slide12 from "../../Repositório/optimized/12.webp";
import slide13 from "../../Repositório/optimized/13.webp";
import slide14 from "../../Repositório/optimized/14.webp";
import slide15 from "../../Repositório/optimized/15.webp";
import slide16 from "../../Repositório/optimized/16.webp";
import slide17 from "../../Repositório/optimized/17.webp";
import slide18 from "../../Repositório/optimized/18.webp";
import slide19 from "../../Repositório/optimized/19.webp";
import slide20 from "../../Repositório/optimized/20.webp";
import slide21 from "../../Repositório/optimized/21.webp";
import slide22 from "../../Repositório/optimized/22.webp";
import slide23 from "../../Repositório/optimized/23.webp";
import slide24 from "../../Repositório/optimized/24.webp";

const slides = [
  { src: slide05, title: "Introdução", label: "O mapa começa aqui" },
  { src: slide06, title: "O Inefável Ser Absoluto", label: "Módulo 1" },
  { src: slide07, title: "O Desdobramento da Consciência", label: "Módulo 2" },
  { src: slide08, title: "Campos Sutis e Estrutura Primordial", label: "Módulo 3" },
  { src: slide09, title: "Consciências Organizadoras", label: "Módulo 4" },
  { src: slide10, title: "Os Reinos da Manifestação", label: "Módulo 5" },
  { src: slide11, title: "Dinâmica e Leis Universais", label: "Módulo 6" },
  { src: slide12, title: "O Projeto Terra", label: "Módulo 7" },
  { src: slide13, title: "Humanos Primordiais e as Eras", label: "Módulo 8" },
  { src: slide14, title: "A Arquitetura do Sistema Matrix", label: "Módulo 9" },
  { src: slide15, title: "Avatares", label: "Módulo 10" },
  { src: slide16, title: "Guias", label: "Módulo 11" },
  { src: slide17, title: "Sinais e Chamados Individuais", label: "Módulo 12" },
  { src: slide18, title: "Neurociência e Mente Expandida", label: "Módulo 13" },
  { src: slide19, title: "Física Quântica e Multirrealidades", label: "Módulo 14" },
  { src: slide20, title: "Biologia da Ascensão", label: "Módulo 15" },
  { src: slide21, title: "Processos de Desprogramação", label: "Módulo 16" },
  { src: slide22, title: "Autoconsciência Cósmica", label: "Módulo 17" },
  { src: slide23, title: "O Chamado e a Síntese do Ser", label: "Módulo 18" },
  { src: slide24, title: "Eternidade e Novos Ciclos", label: "Módulo 19" },
];

const AUTOPLAY_INTERVAL_MS = 7200;

export const OriginalSlideshow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const visibleSlides = useMemo(
    () =>
      [-1, 0, 1].map((offset) => {
        const index = (activeIndex + offset + slides.length) % slides.length;
        return { ...slides[index], index, offset };
      }),
    [activeIndex],
  );

  useEffect(() => {
    if (shouldReduceMotion || isPaused || isHovered) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isHovered, isPaused, shouldReduceMotion]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const activeSlide = slides[activeIndex];

  return (
    <div
      className="original-slideshow"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Prévia das capas dos módulos"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={() => setIsHovered(false)}
    >
      <div className="slideshow-stage">
        <div className="slideshow-orbit" aria-hidden="true" />
        <div className="slideshow-covers" aria-hidden="true">
          {visibleSlides.map((slide) => (
            <figure
              key={slide.index}
              className={`slide-cover ${
                slide.offset === 0 ? "is-active" : slide.offset < 0 ? "is-prev" : "is-next"
              }`}
            >
              <img
                src={slide.src}
                alt=""
                loading={slide.offset === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="slideshow-arrow slideshow-arrow-prev"
          aria-label="Ver módulo anterior"
          onClick={goToPrevious}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="slideshow-arrow slideshow-arrow-next"
          aria-label="Ver próximo módulo"
          onClick={goToNext}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="slideshow-meta">
        <div aria-live={isHovered ? "polite" : "off"} aria-atomic="true">
          <p>{activeSlide.label}</p>
          <h4>{activeSlide.title}</h4>
        </div>

        <div className="slideshow-status">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {slides.length}</span>
          <div aria-hidden="true">
            <i style={{ width: `${((activeIndex + 1) / slides.length) * 100}%` }} />
          </div>
          {!shouldReduceMotion && (
            <button
              type="button"
              aria-label={isPaused ? "Retomar reprodução automática" : "Pausar reprodução automática"}
              onClick={() => setIsPaused((current) => !current)}
            >
              {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
