import { ChevronLeft, ChevronRight } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import slide05 from "../../Repositório/5.png";
import slide06 from "../../Repositório/6.png";
import slide07 from "../../Repositório/7.png";
import slide08 from "../../Repositório/8.png";
import slide09 from "../../Repositório/9.png";
import slide10 from "../../Repositório/10.png";
import slide11 from "../../Repositório/11.png";
import slide12 from "../../Repositório/12.png";
import slide13 from "../../Repositório/13.png";
import slide14 from "../../Repositório/14.png";
import slide15 from "../../Repositório/15.png";
import slide16 from "../../Repositório/16.png";
import slide17 from "../../Repositório/17.png";
import slide18 from "../../Repositório/18.png";
import slide19 from "../../Repositório/19.png";
import slide20 from "../../Repositório/20.png";
import slide21 from "../../Repositório/21.png";
import slide22 from "../../Repositório/22.png";
import slide23 from "../../Repositório/23.png";
import slide24 from "../../Repositório/24.png";

const slides = [
  { src: slide05, alt: "Introdução" },
  { src: slide06, alt: "Módulo 1 O Inefável Ser Absoluto" },
  { src: slide07, alt: "Módulo 2 O Desdobramento da Consciência" },
  { src: slide08, alt: "Módulo 3 Campos Sutis e Estrutura Primordial" },
  { src: slide09, alt: "Módulo 4 Consciências Organizadoras" },
  { src: slide10, alt: "Módulo 5 Os Reinos da Manifestação" },
  { src: slide11, alt: "Módulo 6 Dinâmica e Leis Universais" },
  { src: slide12, alt: "Módulo 7 O Projeto Terra" },
  { src: slide13, alt: "Módulo 8 Humanos Primordiais e o Desenrolar das Eras" },
  { src: slide14, alt: "Módulo 9 A Arquitetura do Sistema Matrix" },
  { src: slide15, alt: "Módulo 10 Avatares" },
  { src: slide16, alt: "Módulo 11 Guias" },
  { src: slide17, alt: "Módulo 12 Sinais e Chamados Individuais" },
  { src: slide18, alt: "Módulo 13 Neurociência e Mente Expandida" },
  { src: slide19, alt: "Módulo 14 Física Quântica e Multirrealidades" },
  { src: slide20, alt: "Módulo 15 Biologia da Ascensão" },
  { src: slide21, alt: "Módulo 16 Processos de Desprogramação" },
  { src: slide22, alt: "Módulo 17 Autoconsciência Cósmica" },
  { src: slide23, alt: "Módulo 18 O Chamado e a Síntese do Ser" },
  { src: slide24, alt: "Módulo 19 Eternidade e Novos Ciclos" },
];

const AUTOPLAY_INTERVAL_MS = 7800;

type SlideCoverStyle = CSSProperties & {
  "--slide-offset": number;
  "--slide-distance": number;
  "--slide-scale": number;
  "--slide-opacity": number;
  "--slide-z-index": number;
  "--slide-rotate": string;
  "--slide-y": string;
  "--slide-depth": string;
};

const getCircularOffset = (index: number, activeIndex: number) => {
  const rawOffset = index - activeIndex;
  const halfwayPoint = Math.floor(slides.length / 2);

  if (rawOffset > halfwayPoint) {
    return rawOffset - slides.length;
  }

  if (rawOffset < -halfwayPoint) {
    return rawOffset + slides.length;
  }

  return rawOffset;
};

const getSlideCoverStyle = (offset: number): SlideCoverStyle => {
  const distance = Math.min(Math.abs(offset), 7);
  const scale = offset === 0 ? 1.22 : Math.max(0.5, 0.88 - distance * 0.06);
  const opacity = distance > 6 ? 0.12 : Math.max(0.26, 1 - distance * 0.14);
  const depth = 72 - distance * 24;

  return {
    "--slide-offset": offset,
    "--slide-distance": distance,
    "--slide-scale": Number(scale.toFixed(3)),
    "--slide-opacity": Number(opacity.toFixed(2)),
    "--slide-z-index": slides.length + 1 - distance,
    "--slide-rotate": `${offset * -4.5}deg`,
    "--slide-y": `${distance * 11}px`,
    "--slide-depth": `${depth}px`,
  };
};

export const OriginalSlideshow = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  useEffect(() => {
    const intervalId = window.setInterval(goToNext, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="original-slideshow" aria-label="Artes originais do Portal da Consciência">
      <div className="original-slideshow-stage">
        <button
          type="button"
          className="original-slideshow-control original-slideshow-control-prev"
          aria-label="Ver módulo anterior"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="original-slide-coverflow" aria-live="polite">
          {slides.map((slide, index) => {
            const offset = getCircularOffset(index, activeIndex);
            const distance = Math.abs(offset);
            const isActive = index === activeIndex;

            return (
              <figure
                key={slide.src}
                className={`original-slide-cover ${isActive ? "is-active" : ""}`}
                style={getSlideCoverStyle(offset)}
                aria-hidden={distance > 3}
              >
                <img src={slide.src} alt={slide.alt} loading={distance <= 1 ? "eager" : "lazy"} />
              </figure>
            );
          })}
        </div>

        <button
          type="button"
          className="original-slideshow-control original-slideshow-control-next"
          aria-label="Ver próximo módulo"
          onClick={goToNext}
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

    </div>
  );
};
