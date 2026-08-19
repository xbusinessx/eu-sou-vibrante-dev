import { motion, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import type { PointerEvent } from "react";
import heroImage from "../assets/optimized/hero-desktop.webp";
import heroMobileImage from "../assets/optimized/hero-mobile.webp";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";
import { TrackedSectionLink } from "./TrackedSectionLink";

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();
  const artRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !artRef.current) return;

    const rect = artRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    artRef.current.style.setProperty("--hero-shift-x", `${(x * 7).toFixed(2)}px`);
    artRef.current.style.setProperty("--hero-shift-y", `${(y * 5).toFixed(2)}px`);
    artRef.current.style.setProperty("--hero-rotate-y", `${(-6 + x * 3).toFixed(2)}deg`);
    artRef.current.style.setProperty("--hero-rotate-x", `${(-y * 2).toFixed(2)}deg`);
  };

  const resetPointer = () => {
    artRef.current?.style.setProperty("--hero-shift-x", "0px");
    artRef.current?.style.setProperty("--hero-shift-y", "0px");
    artRef.current?.style.setProperty("--hero-rotate-y", "-6deg");
    artRef.current?.style.setProperty("--hero-rotate-x", "0deg");
  };

  return (
    <section id="topo" data-track-section="hero" className="hero-section">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-sun" aria-hidden="true" />

      <div className="hero-shell">
        <motion.div
          className="hero-copy"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hero-kicker">
            <span aria-hidden="true" />
            Programa digital de estudos
            <i>•</i>
            Acesso vitalício
          </p>

          <h1 className="hero-title">
            Atravesse o ruído.<br />
            <em>Volte ao centro.</em>
          </h1>

          <p className="hero-description">
            Uma jornada visual por <strong>19 módulos organizados em 8 eixos</strong> para estudar
            consciência, percepção e presença com mais estrutura — no seu ritmo.
          </p>

          <div className="hero-actions">
            <TrackedCheckoutButton
              label="Acessar por R$ 147"
              ctaId="hero_checkout"
              section="hero"
              className="hero-primary-cta"
            />
            <TrackedSectionLink
              href="#conteudo"
              label="Explorar os 19 módulos"
              ctaId="hero_explore_content"
              section="hero"
              variant="secondary"
              endIcon="down"
              className="hero-secondary-cta"
            />
          </div>

          <div className="hero-assurances" aria-label="Condições de acesso">
            <span><Check aria-hidden="true" />Acesso imediato por e-mail</span>
            <span><ShieldCheck aria-hidden="true" />7 dias de garantia</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-art-column"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, x: 38 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <div
            className="hero-art-shell"
            ref={artRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
          >
            <span className="hero-portal-frame hero-portal-frame-back" />
            <span className="hero-portal-frame hero-portal-frame-mid" />

            <div className="hero-art-card">
              <picture>
                <source media="(max-width: 767px)" srcSet={heroMobileImage} />
                <img
                  src={heroImage}
                  alt=""
                  decoding="async"
                  loading="eager"
                />
              </picture>
              <div className="hero-art-shade" />
            </div>

            <span className="hero-orbit hero-orbit-a" />
            <span className="hero-orbit hero-orbit-b" />
            <span className="hero-orbit hero-orbit-c" />
            <span className="hero-energy-core" />

            <span className="hero-coordinate hero-coordinate-a">
              <i /> CAMPO / 08
            </span>
            <span className="hero-coordinate hero-coordinate-b">PRESENÇA / 01</span>
            <span className="hero-coordinate hero-coordinate-c">40.7° / AGORA</span>
          </div>
        </motion.div>
      </div>

      <a className="hero-scroll-cue" href="#chamado" aria-label="Continuar para a próxima seção">
        <span />
        <small>Iniciar travessia</small>
      </a>
    </section>
  );
};
