import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";
import { TrackedSectionLink } from "./TrackedSectionLink";

const heroSpecs = [
  ["19", "módulos"],
  ["08", "eixos"],
  ["∞", "acesso vitalício"],
  ["07", "dias de garantia"],
];

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="topo"
      data-track-section="hero"
      data-field-chapter="0"
      className="neo-hero scene-chapter"
    >
      <div className="neo-hero-noise" aria-hidden="true" />
      <div className="neo-hero-shell">
        <motion.div
          className="neo-hero-copy"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 36 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-system-line">
            <span>Portal da Consciência</span>
            <span>Programa digital de estudos e práticas</span>
          </div>

          <h1 className="neo-hero-title">
            <span>Consciência</span>
            <span className="is-spectral">não é uma linha.</span>
            <span>É um campo.</span>
          </h1>

          <div className="hero-intro-grid">
            <p className="hero-thesis">
              O que hoje parece separado pode revelar outra arquitetura quando você enxerga as
              relações entre as partes.
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
                  label="Explorar a arquitetura"
                  ctaId="hero_explore_content"
                  section="hero"
                  variant="secondary"
                  endIcon="down"
                  className="hero-secondary-cta"
                />
              </div>
              <p className="hero-assurance">Acesso imediato por e-mail · compra segura · 7 dias</p>
            </div>
          </div>
        </motion.div>

        <div className="hero-specs" aria-label="Informações principais do programa">
          {heroSpecs.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <a className="hero-scroll-trigger" href="#chamado" aria-label="Avançar para a narrativa">
          <span>Role para abrir o núcleo</span>
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};
