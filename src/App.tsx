import { useEffect, type CSSProperties } from "react";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ModuleShowcase } from "./components/ModuleShowcase";
import { OfferCard } from "./components/OfferCard";
import { OriginalSlideshow } from "./components/OriginalSlideshow";
import { ScrollFieldExperience } from "./components/ScrollFieldExperience";
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

    const handleRepeatedAnchor = (event: MouseEvent) => {
      const origin = event.target;
      if (!(origin instanceof Element)) return;

      const anchor = origin.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#" || window.location.hash !== hash) return;

      let targetId = hash.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch {
        // Keep the raw fragment when an external link provides malformed encoding.
      }

      const destination = document.getElementById(targetId);
      if (!destination) return;

      event.preventDefault();
      destination.scrollIntoView({ block: "start" });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    document.addEventListener("click", handleRepeatedAnchor);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      document.removeEventListener("click", handleRepeatedAnchor);
    };
  }, []);
};

const recognitionPoints = [
  {
    title: "Conhecimento sem integração",
    text: "Referências, técnicas e ideias se acumulam, mas não formam uma visão coerente.",
  },
  {
    title: "Ruído antes da percepção",
    text: "A urgência externa ocupa o espaço necessário para observar o que acontece dentro.",
  },
  {
    title: "Direção sem centro",
    text: "As decisões continuam chegando enquanto o sentido que deveria orientá-las fica difuso.",
  },
];

const productSpecs = [
  ["19 módulos", "Uma progressão que parte dos fundamentos e avança até a integração."],
  ["8 eixos", "Uma arquitetura temática para entender como os assuntos se conectam."],
  ["Práticas e frequências", "Recursos de apoio para levar a reflexão além da leitura."],
  ["Acesso vitalício", "Liberdade para pausar, voltar e reler em outros momentos."],
];

const journeySteps = [
  ["Receba", "Após a confirmação, o acesso chega automaticamente ao seu e-mail."],
  ["Percorra", "Avance pelos módulos na ordem sugerida ou siga o eixo que chama você."],
  ["Experimente", "Leve os exercícios de presença e observação para a rotina."],
  ["Revisite", "Volte ao conteúdo quando um novo momento pedir outra leitura."],
];

const App = () => {
  useTrackingBoot();
  useHashAnchorScroll();

  return (
    <div className="site-root">
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>

      <ScrollFieldExperience
        rootSelector="[data-field-scroll-root]"
        chapterSelector="[data-field-chapter]"
      />
      <div className="site-chromatic-noise" aria-hidden="true" />
      <Header />

      <main id="conteudo-principal" data-field-scroll-root>
        <Hero />

        <section
          id="chamado"
          data-track-section="chamado"
          data-field-chapter="1"
          className="story-chapter story-chapter-noise"
        >
          <div className="chapter-ghost-word" aria-hidden="true">RUÍDO</div>
          <div className="chapter-frame chapter-frame-right">
            <div className="section-signal">
              <span>01</span>
              <p>O ponto de ruptura</p>
            </div>
            <h2 className="chapter-title">
              Informação demais também pode <span>esconder o essencial.</span>
            </h2>
            <p className="chapter-lead">
              O Portal começa onde as respostas soltas deixam de bastar. A proposta é reorganizar
              percepção, presença, corpo e consciência dentro de um mesmo campo de estudo.
            </p>

            <div className="signal-sequence">
              {recognitionPoints.map((item, index) => (
                <article key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="campo"
          data-track-section="campo"
          data-field-chapter="2"
          className="story-chapter story-chapter-field"
        >
          <div className="chapter-frame chapter-frame-left">
            <div className="section-signal">
              <span>02</span>
              <p>A arquitetura invisível</p>
            </div>
            <h2 className="chapter-title">
              Quando as partes se conectam, <span>o campo aparece.</span>
            </h2>
            <p className="chapter-lead">
              Em vez de adicionar mais uma camada de informação, o programa propõe relações: entre
              identidade e presença, mente e corpo, percepção e escolha.
            </p>

            <div className="architecture-counts" aria-label="Arquitetura do conteúdo">
              <div><strong>08</strong><span>órbitas temáticas</span></div>
              <div><strong>19</strong><span>pontos de estudo</span></div>
              <div><strong>01</strong><span>jornada integrada</span></div>
            </div>

            <TrackedSectionLink
              href="#conteudo"
              label="Abrir os 8 eixos"
              ctaId="field_explore_axes"
              section="campo"
              variant="secondary"
              endIcon="down"
            />
          </div>
        </section>

        <section
          id="portal"
          data-track-section="portal"
          data-field-chapter="3"
          className="product-stage"
        >
          <div className="product-stage-frame">
            <div className="product-object" aria-label="Visualização da arquitetura do programa">
              <span className="product-object-depth product-object-depth-a" aria-hidden="true" />
              <span className="product-object-depth product-object-depth-b" aria-hidden="true" />
              <div className="product-glass-shell">
                <div className="product-glass-meta">
                  <span>PORTAL / CORE</span>
                  <span>19·08</span>
                </div>

                <div className="product-nucleus" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, index) => (
                    <span
                      className="product-orbit"
                      key={index}
                      style={{
                        "--orbit-size": `${38 + index * 7.4}%`,
                        "--orbit-rotate": `${index * 12}deg`,
                        "--orbit-alt-rotate": `${index * -9}deg`,
                        "--orbit-opacity": 1 - index * 0.065,
                      } as CSSProperties}
                    />
                  ))}
                  <div className="product-node-field">
                    {Array.from({ length: 19 }, (_, index) => (
                      <i
                        key={index}
                        style={{ "--node-angle": `${index * (360 / 19)}deg` } as CSSProperties}
                      />
                    ))}
                  </div>
                  <b />
                </div>

                <div className="product-glass-copy">
                  <small>PROGRAMA DIGITAL</small>
                  <strong>Portal da<br />Consciência</strong>
                  <p>19 módulos conectados em 8 eixos de estudo e prática.</p>
                </div>

                <div className="product-glass-progress" aria-hidden="true">
                  <span>ARQUITETURA ATIVA</span>
                  <i><b /></i>
                  <span>08 / 19</span>
                </div>
              </div>
              <div className="product-object-scan" aria-hidden="true" />
            </div>

            <div className="product-stage-copy">
              <div className="section-signal">
                <span>03</span>
                <p>O produto</p>
              </div>
              <h2 className="chapter-title">
                Não é uma coleção solta. <span>É uma arquitetura para atravessar.</span>
              </h2>
              <p className="chapter-lead">
                Um programa digital de estudos e práticas, entregue em uma plataforma on-line para
                você percorrer sem prazo de expiração.
              </p>

              <div className="product-specs">
                {productSpecs.map(([title, text], index) => (
                  <article key={title}>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <div><h3>{title}</h3><p>{text}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="conteudo"
          data-track-section="conteudo"
          data-field-chapter="4"
          className="curriculum-stage"
        >
          <div className="curriculum-stage-inner">
            <header className="curriculum-heading">
              <div className="section-signal">
                <span>04</span>
                <p>Arquitetura do conteúdo</p>
              </div>
              <h2>
                8 eixos. 19 módulos.<br />
                <span>Uma única progressão.</span>
              </h2>
              <p>
                Selecione um eixo para abrir seus temas. Use as setas do teclado para navegar entre
                eles.
              </p>
            </header>

            <ModuleShowcase />

            <div className="module-deck">
              <div className="module-deck-copy">
                <span>19 + introdução</span>
                <h3>Uma identidade visual para cada etapa da jornada.</h3>
                <p>
                  Veja as capas que organizam o acervo antes de entrar. O carrossel carrega apenas
                  os três módulos visíveis.
                </p>
              </div>
              <OriginalSlideshow />
            </div>
          </div>
        </section>

        <section
          id="ritmo"
          data-track-section="ritmo"
          data-field-chapter="5"
          className="journey-stage"
        >
          <div className="journey-stage-inner">
            <header>
              <div className="section-signal">
                <span>05</span>
                <p>Como funciona</p>
              </div>
              <h2>Sem pressa artificial.<br /><span>Sem caminho confuso.</span></h2>
            </header>

            <ol className="journey-path">
              {journeySteps.map(([title, text], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>

            <div className="transparency-note">
              <strong>Uma proposta espiritual, não uma promessa de resultado.</strong>
              <p>
                O Portal oferece estudo, reflexão e práticas integrativas. A experiência é
                individual e o conteúdo não substitui orientação médica ou psicológica.
              </p>
            </div>
          </div>
        </section>

        <section
          id="investimento"
          data-track-section="investimento"
          data-field-chapter="6"
          className="investment-stage"
        >
          <OfferCard />
        </section>

        <section id="duvidas" data-track-section="duvidas" className="faq-stage">
          <div className="faq-stage-inner">
            <header>
              <div className="section-signal">
                <span>07</span>
                <p>Antes de entrar</p>
              </div>
              <h2>Clareza também faz<br /><span>parte da travessia.</span></h2>
              <p>Formato, acesso, garantia e proposta — sem letras escondidas.</p>
            </header>
            <FAQ />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
