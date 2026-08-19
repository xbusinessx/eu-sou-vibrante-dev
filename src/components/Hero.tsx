import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImage from "../assets/optimized/hero-desktop.webp";
import heroMobileImage from "../assets/optimized/hero-mobile.webp";
import portalTitle from "../assets/original/portal-title.png";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";
import { TrackedSectionLink } from "./TrackedSectionLink";

const heroSpecs = [
  ["19", "módulos"],
  ["08", "eixos"],
  ["∞", "acesso vitalício"],
  ["07", "dias de garantia"],
] as const;

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="topo"
      data-track-section="hero"
      data-field-chapter="0"
      className="neo-hero field-notebook-hero scene-chapter"
    >
      <div className="neo-hero-noise hero-paper-grain" aria-hidden="true" />
      <svg
        className="hero-field-thread"
        viewBox="0 0 1440 980"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="hero-field-thread-ghost"
          d="M1376 76C1178 110 1218 300 1318 314C1418 328 1402 166 1290 192C1178 218 1206 452 1014 468C822 484 850 640 684 650C518 660 484 842 126 906"
        />
        <path
          className="hero-field-thread-ink"
          d="M1376 76C1178 110 1218 300 1318 314C1418 328 1402 166 1290 192C1178 218 1206 452 1014 468C822 484 850 640 684 650C518 660 484 842 126 906"
        />
      </svg>

      <div className="neo-hero-shell field-notebook-hero-shell">
        <div className="hero-editorial-grid">
          <motion.div
            className="neo-hero-copy field-notebook-hero-copy"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-system-line hero-folio-line">
              <span>Caderno de campo · edição 01</span>
              <span>Programa digital de estudos e práticas</span>
            </div>

            <img
              src={portalTitle}
              alt="Portal da Consciência"
              className="hero-wordmark"
              decoding="async"
              loading="eager"
            />

            <p className="hero-handwritten-note">Leia devagar — o campo começa aqui.</p>

            <h1 className="neo-hero-title field-notebook-hero-title">
              <span>Um portal vivo</span>
              <span>de reconexão com a realidade</span>
              <span>que vibra dentro de você.</span>
            </h1>

            <div className="hero-intro-grid field-notebook-hero-intro">
              <p className="hero-thesis">
                Para quem está pronto para sair do ruído, acessar o campo e reorganizar sua
                realidade de dentro para fora.
              </p>
              <div className="hero-conversion-block">
                <p>
                  Uma jornada por 19 módulos e 8 eixos sobre consciência, presença, percepção e
                  integração — para percorrer no seu ritmo.
                </p>
                <div className="hero-actions">
                  <TrackedCheckoutButton
                    label="Entrar no Portal — R$ 147"
                    ctaId="hero_checkout"
                    section="hero"
                    className="hero-primary-cta"
                  />
                  <TrackedSectionLink
                    href="#conteudo"
                    label="Explorar o percurso"
                    ctaId="hero_explore_content"
                    section="hero"
                    variant="secondary"
                    endIcon="down"
                    className="hero-secondary-cta"
                  />
                </div>
                <p className="hero-assurance">
                  Acesso imediato por e-mail · compra segura · 7 dias de garantia
                </p>
              </div>
            </div>
          </motion.div>

          <motion.figure
            className="hero-field-photo"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 1.05, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hero-field-photo-tape" aria-hidden="true" />
            <picture className="hero-field-photo-picture">
              <source media="(max-width: 767px)" srcSet={heroMobileImage} sizes="92vw" />
              <img
                src={heroImage}
                alt="Figura humana luminosa envolvida por linhas douradas que representam o campo da consciência"
                className="hero-field-photo-image"
                decoding="async"
                loading="eager"
                sizes="(max-width: 767px) 92vw, (max-width: 1200px) 44vw, 560px"
              />
            </picture>
            <figcaption className="hero-field-photo-caption">
              <span>fig. 01</span>
              <strong>O campo organiza de dentro para fora.</strong>
            </figcaption>
            <span className="hero-field-photo-mark" aria-hidden="true">
              campo
            </span>
          </motion.figure>
        </div>

        <div
          className="hero-specs hero-field-ledger"
          aria-label="Informações principais do programa"
        >
          {heroSpecs.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <a className="hero-scroll-trigger" href="#chamado" aria-label="Avançar para a narrativa">
          <span>Abrir o primeiro capítulo</span>
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};
