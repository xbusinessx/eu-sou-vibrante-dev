import { motion, useReducedMotion } from "framer-motion";
import heroImage from "../assets/original/hero-desktop.png";
import heroMobileImage from "../assets/original/hero-mobile.png";
import portalTitle from "../assets/original/portal-title.png";
import { LivePresenceWidget } from "./LivePresenceWidget";
import { TrackedSectionLink } from "./TrackedSectionLink";

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="topo"
      data-track-section="hero"
      className="hero-section relative overflow-hidden pb-12 pt-28 md:min-h-[90vh] md:pb-0 md:pt-28"
    >
      <div className="hero-original-bg absolute inset-0">
        <picture className="block h-full w-full">
          <source media="(max-width: 767px)" srcSet={heroMobileImage} sizes="100vw" />
          <img
            src={heroImage}
            alt="Arte original do Portal da Consciência com figura luminosa e campo vibracional dourado"
            className="hero-original-image h-full w-full object-cover object-[72%_center]"
            decoding="async"
            fetchPriority="high"
            loading="eager"
            sizes="100vw"
          />
        </picture>
        <div className="hero-original-glow" />
        <div className="hero-mobile-energy" aria-hidden="true" />
        <div className="hero-mobile-sparks" aria-hidden="true" />
        <div className="hero-original-veil absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.58)_35%,rgba(0,0,0,0.03)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="hero-content relative flex w-full items-start pb-8 md:min-h-[calc(90vh-7rem)] md:pb-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="hero-copy w-full min-w-0"
        >
          <div className="mb-5 flex items-center md:mb-7">
            <img
              src={portalTitle}
              alt="Portal da Consciência"
              className="max-h-20 w-auto max-w-[min(82vw,360px)] object-contain md:max-h-24"
            />
          </div>
          <h1 className="hero-title">
            Um portal vivo de reconexão com a realidade que vibra dentro de você.
          </h1>
          <p className="mt-6 max-w-[21rem] text-base leading-7 text-pearl/[0.76] md:max-w-2xl md:text-xl md:leading-8">
            Para quem está pronto para sair do ruído, acessar o campo e reorganizar sua
            realidade de dentro para fora.
          </p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row md:mt-9">
            <TrackedSectionLink
              href="#chamado"
              label="Saiba mais"
              ctaId="hero_learn_more"
              section="hero"
              variant="primary"
              endIcon="down"
            />
          </div>

          <LivePresenceWidget />
        </motion.div>
      </div>
    </section>
  );
};
