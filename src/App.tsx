import { useEffect } from "react";
import {
  AudioWaveform,
  BookOpenText,
  Clock3,
  Compass,
  Infinity as InfinityIcon,
  Layers3,
  Orbit,
  ShieldCheck,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import introCover from "../Repositório/optimized/5.webp";
import { CosmicBackground } from "./components/CosmicBackground";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MeditationEnergyAnimation } from "./components/MeditationEnergyAnimation";
import { ModuleShowcase } from "./components/ModuleShowcase";
import { OfferCard } from "./components/OfferCard";
import { OriginalSlideshow } from "./components/OriginalSlideshow";
import { Section } from "./components/Section";
import { TrackedSectionLink } from "./components/TrackedSectionLink";
import {
  getAffiliateAttributionAgeDays,
  persistAffiliateAttributionFromUrl,
} from "./lib/affiliateAttribution";
import { persistAttributionAssistTouch } from "./lib/attributionAssist";
import { loadMarketingScripts } from "./lib/marketing";
import { persistUtmParamsFromUrl, trackEvent } from "./lib/tracking";

let hasBootedTracking = false;

const useTrackingBoot = () => {
  useEffect(() => {
    if (hasBootedTracking) return;

    hasBootedTracking = true;
    loadMarketingScripts();

    const params = persistUtmParamsFromUrl();
    const affiliateCapture = persistAffiliateAttributionFromUrl();
    const affiliateAttribution = affiliateCapture.attribution;
    persistAttributionAssistTouch();
    trackEvent("page_view_ready", {
      page: "landing",
      checkout_owner: affiliateAttribution ? "affiliate" : "producer",
      affiliate_afid: affiliateAttribution?.afid,
      affiliate_label: affiliateAttribution?.affiliateLabel,
      affiliate_attribution_age_days: affiliateAttribution
        ? getAffiliateAttributionAgeDays(affiliateAttribution)
        : undefined,
      affiliate_attribution_model: affiliateAttribution
        ? affiliateAttribution.attributionWindowDays === null
          ? "perpetual"
          : "windowed"
        : undefined,
      ...params,
    });

    if (affiliateCapture.status === "captured" || affiliateCapture.status === "refreshed") {
      trackEvent("affiliate_attribution_captured", {
        affiliate_afid: affiliateAttribution?.afid,
        affiliate_label: affiliateAttribution?.affiliateLabel,
        affiliate_attribution_status: affiliateCapture.status,
        affiliate_attribution_model:
          affiliateAttribution?.attributionWindowDays === null ? "perpetual" : "windowed",
        affiliate_window_days: affiliateAttribution?.attributionWindowDays ?? undefined,
      });
    } else if (affiliateCapture.status === "rejected") {
      trackEvent("affiliate_attribution_rejected", {
        reason: "unregistered_or_invalid_afid",
      });
    }

    const sections = document.querySelectorAll<HTMLElement>("[data-track-section]");
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.getAttribute("data-track-section");
          if (entry.isIntersecting && section && !seen.has(section)) {
            seen.add(section);
            trackEvent("section_view", { section });
          }
        });
      },
      { threshold: 0.16 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
};

const useHashAnchorScroll = () => {
  useEffect(() => {
    const scrollToHash = () => {
      const rawTarget = window.location.hash.slice(1);
      if (!rawTarget) return;

      let targetId = rawTarget;
      try {
        targetId = decodeURIComponent(rawTarget);
      } catch {
        // Malformed external hashes should not interrupt the landing page.
      }

      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ block: "start" });
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
};

const quickFacts = [
  { value: "19", label: "módulos na jornada", icon: BookOpenText },
  { value: "8", label: "eixos de estudo", icon: Orbit },
  { value: "Vitalício", label: "acesso à plataforma", icon: InfinityIcon },
  { value: "7 dias", label: "de garantia", icon: ShieldCheck },
];

const recognitionPoints = [
  {
    icon: Layers3,
    title: "Conhecimento sem integração",
    text: "Muitas referências, técnicas e ideias — mas pouca relação clara entre elas.",
  },
  {
    icon: Waves,
    title: "Ruído antes da percepção",
    text: "A urgência do lado de fora ocupa o espaço que permitiria escutar o que acontece dentro.",
  },
  {
    icon: Compass,
    title: "Direção sem centro",
    text: "Decisões se acumulam, enquanto o sentido que deveria orientá-las fica difuso.",
  },
];

const journeySteps = [
  {
    icon: Zap,
    title: "Entre",
    text: "Após a confirmação, seus dados de acesso chegam por e-mail.",
  },
  {
    icon: BookOpenText,
    title: "Percorra",
    text: "Avance pelos 19 módulos no seu ritmo e volte sempre que precisar.",
  },
  {
    icon: Sparkles,
    title: "Experimente",
    text: "Leve as práticas e os reconhecimentos para a sua rotina, sem pressa.",
  },
  {
    icon: Clock3,
    title: "Revisite",
    text: "Use o acesso vitalício para reler o mapa em novos momentos da jornada.",
  },
];

const App = () => {
  useTrackingBoot();
  useHashAnchorScroll();

  return (
    <div className="site-root">
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>
      <CosmicBackground />
      <Header />

      <main id="conteudo-principal">
        <Hero />

        <section
          className="signal-strip"
          aria-label="Informações rápidas sobre o Portal"
          data-track-section="visao-geral"
        >
          <div className="signal-strip-inner">
            {quickFacts.map(({ value, label, icon: Icon }) => (
              <div className="signal-item" key={label}>
                <Icon aria-hidden="true" />
                <span>
                  <strong>{value}</strong>
                  <small>{label}</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <Section id="chamado" className="recognition-section">
          <div className="section-container recognition-layout">
            <div className="section-heading recognition-heading">
              <p className="eyebrow">O ponto de partida</p>
              <h2 className="section-title">
                Quando há informação demais, <em>o centro some de vista.</em>
              </h2>
              <p className="section-lead">
                O Portal nasceu para quem não busca mais uma resposta solta, mas uma estrutura que
                ajude a relacionar presença, corpo, mente e percepção.
              </p>
            </div>

            <div className="recognition-list">
              {recognitionPoints.map(({ icon: Icon, title, text }, index) => (
                <article className="recognition-item" key={title}>
                  <span className="recognition-index">Sinal {String.fromCharCode(65 + index)}</span>
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section id="campo" className="field-section">
          <div className="section-container field-layout">
            <div className="field-copy">
              <p className="eyebrow">A visão do Portal</p>
              <h2 className="section-title">
                Um mapa vivo para perceber <em>as relações invisíveis.</em>
              </h2>
              <p className="section-lead">
                O Portal organiza uma visão espiritual e integrativa da experiência. Em vez de
                acumular conceitos, você observa como presença, identidade, vibração, corpo e
                percepção se conectam dentro dessa proposta.
              </p>

              <div className="field-principles" aria-label="Princípios do método">
                <span><i />Compreender antes de idealizar</span>
                <span><i />Perceber antes de reagir</span>
                <span><i />Integrar antes de avançar</span>
              </div>

              <TrackedSectionLink
                href="#conteudo"
                label="Conhecer os 8 eixos"
                ctaId="field_explore_axes"
                section="campo"
                variant="secondary"
                endIcon="down"
              />
            </div>

            <div className="field-map-wrap">
              <MeditationEnergyAnimation />
              <p className="field-map-caption">
                <span aria-hidden="true" />
                Mapa responsivo à sua presença
              </p>
            </div>
          </div>
        </Section>

        <Section id="portal" className="product-section">
          <div className="section-container product-layout">
            <div className="product-visual" aria-label="Capa de introdução do Portal da Consciência">
              <div className="product-orbit product-orbit-a" aria-hidden="true" />
              <div className="product-orbit product-orbit-b" aria-hidden="true" />
              <div className="product-cover-stack" aria-hidden="true">
                <span />
                <span />
                <img src={introCover} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="product-coordinate product-coordinate-top">MÓDULO / 01</div>
              <div className="product-coordinate product-coordinate-bottom">ACESSO VITALÍCIO</div>
            </div>

            <div className="product-copy">
              <p className="eyebrow">O produto</p>
              <h2 className="section-title">
                Não é um feed infinito. <em>É uma jornada com arquitetura.</em>
              </h2>
              <p className="section-lead">
                O Portal da Consciência é um programa digital de estudos e práticas, entregue em
                uma plataforma para você percorrer no seu tempo.
              </p>

              <div className="product-includes">
                <div>
                  <BookOpenText aria-hidden="true" />
                  <span><strong>19 módulos</strong> do fundamento à integração</span>
                </div>
                <div>
                  <Orbit aria-hidden="true" />
                  <span><strong>8 eixos</strong> que organizam o mapa completo</span>
                </div>
                <div>
                  <AudioWaveform aria-hidden="true" />
                  <span><strong>Práticas e frequências</strong> como apoio ao estudo</span>
                </div>
                <div>
                  <InfinityIcon aria-hidden="true" />
                  <span><strong>Acesso vitalício</strong> para revisitar quando quiser</span>
                </div>
              </div>

              <TrackedSectionLink
                href="#investimento"
                label="Ver acesso e investimento"
                ctaId="product_view_offer"
                section="portal"
                endIcon="down"
              />
            </div>
          </div>
        </Section>

        <Section id="conteudo" className="curriculum-section">
          <div className="section-container">
            <div className="section-heading curriculum-heading">
              <p className="eyebrow">Por dentro da jornada</p>
              <h2 className="section-title">
                Dezenove módulos. <em>Oito eixos. Um só mapa.</em>
              </h2>
              <p className="section-lead">
                Navegue pelos eixos abaixo para entender a lógica do conteúdo sem precisar
                decifrar uma lista interminável de tópicos.
              </p>
            </div>

            <ModuleShowcase />

            <div className="preview-block">
              <div className="preview-intro">
                <p className="eyebrow">Prévia visual</p>
                <h3>Veja a linguagem de cada módulo antes de entrar.</h3>
                <p>
                  O acervo foi organizado como uma coleção visual, com uma identidade própria para
                  cada etapa do percurso.
                </p>
              </div>
              <OriginalSlideshow />
            </div>
          </div>
        </Section>

        <Section id="ritmo" className="journey-section">
          <div className="section-container">
            <div className="section-heading journey-heading">
              <p className="eyebrow">Como funciona</p>
              <h2 className="section-title">
                O caminho é profundo. <em>O acesso é simples.</em>
              </h2>
            </div>

            <ol className="journey-steps">
              {journeySteps.map(({ icon: Icon, title, text }, index) => (
                <li key={title}>
                  <div className="journey-step-top">
                    <span>0{index + 1}</span>
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>

            <div className="clarity-note">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Uma proposta espiritual, não uma promessa de resultado.</strong>
                <p>
                  O Portal oferece estudo, reflexão e práticas integrativas. Sua experiência é
                  individual e o conteúdo não substitui orientação médica ou psicológica.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section id="investimento" className="offer-section">
          <OfferCard />
        </Section>

        <Section id="duvidas" className="faq-section">
          <div className="section-container">
            <div className="section-heading faq-heading">
              <p className="eyebrow">Dúvidas frequentes</p>
              <h2 className="section-title">
                Clareza antes de <em>atravessar o portal.</em>
              </h2>
              <p className="section-lead">
                Formato, acesso, garantia e proposta — as respostas essenciais estão aqui.
              </p>
            </div>
            <FAQ />
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
