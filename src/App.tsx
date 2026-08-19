import { useEffect } from "react";
import introCover from "../Repositório/optimized/5.webp";
import originCover from "../Repositório/optimized/6.webp";
import earthCover from "../Repositório/optimized/12.webp";
import meditationField from "./assets/optimized/meditation-energy-vector.webp";
import portalTitle from "./assets/original/portal-title.png";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ModuleShowcase } from "./components/ModuleShowcase";
import { OfferCard } from "./components/OfferCard";
import { OriginalSlideshow } from "./components/OriginalSlideshow";
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
    let isActive = true;

    const scrollToHash = () => {
      if (!isActive) return;
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
    void document.fonts?.ready.then(scrollToHash);
    window.addEventListener("load", scrollToHash);
    window.addEventListener("hashchange", scrollToHash);
    document.addEventListener("click", handleRepeatedAnchor);
    return () => {
      isActive = false;
      window.removeEventListener("load", scrollToHash);
      window.removeEventListener("hashchange", scrollToHash);
      document.removeEventListener("click", handleRepeatedAnchor);
    };
  }, []);
};

const useReadingMarks = () => {
  useEffect(() => {
    const entries = Array.from(document.querySelectorAll<HTMLElement>("[data-reading-entry]"));
    if (!entries.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const activeLine = window.innerHeight * 0.56;
      entries.forEach((entry) => {
        const bounds = entry.getBoundingClientRect();
        const center = bounds.top + bounds.height / 2;
        entry.classList.toggle("is-read", center < activeLine - 90);
        entry.classList.toggle(
          "is-reading",
          center >= activeLine - 90 && center <= activeLine + 140,
        );
      });
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
};

const recognitionPoints = [
  {
    title: "Conhecimento sem integração",
    text: "Referências, técnicas e ideias se acumulam, mas ainda não formam uma visão coerente.",
    note: "muita coisa, pouco centro",
  },
  {
    title: "Ruído antes da percepção",
    text: "A urgência externa ocupa o espaço necessário para observar o que acontece dentro.",
    note: "escutar também é método",
  },
  {
    title: "Direção sem presença",
    text: "As decisões continuam chegando enquanto o sentido que deveria orientá-las fica difuso.",
    note: "o essencial pede espaço",
  },
];

const fieldEntries = [
  {
    number: "I",
    title: "Perceber",
    text: "O Portal propõe observar a experiência antes de tentar explicá-la. Corpo, atenção e presença entram na mesma página.",
    note: "comece pelo que já está aqui",
  },
  {
    number: "II",
    title: "Relacionar",
    text: "Os temas não aparecem como respostas soltas. Eles são aproximados para revelar relações entre identidade, mente, corpo e escolha.",
    note: "o mapa surge entre as partes",
  },
  {
    number: "III",
    title: "Integrar",
    text: "A leitura encontra práticas de respiração, meditação e observação para que o estudo possa atravessar a rotina, sem promessas automáticas.",
    note: "leitura que volta ao cotidiano",
  },
];

const productSpecs = [
  ["19 módulos", "Uma progressão que parte dos fundamentos e avança até a integração."],
  ["8 eixos", "Uma arquitetura temática para entender como os assuntos se conectam."],
  ["Práticas e frequências", "Recursos de apoio para levar a reflexão além da leitura."],
  ["Acesso vitalício", "Liberdade para pausar, voltar e reler em outros momentos."],
];

const journeySteps = [
  ["Receba", "O acesso chega automaticamente ao seu e-mail após a confirmação."],
  ["Leia", "Percorra os módulos na ordem sugerida ou siga o eixo que chama você."],
  ["Perceba", "Leve os exercícios de presença e observação para a rotina."],
  ["Revisite", "Volte ao conteúdo quando um novo momento pedir outra leitura."],
];

const App = () => {
  useTrackingBoot();
  useHashAnchorScroll();
  useReadingMarks();

  return (
    <div className="site-root">
      <a className="skip-link" href="#conteudo-principal">Ir para o conteúdo</a>

      <div className="paper-grain" aria-hidden="true" />
      <div className="reading-thread" aria-hidden="true">
        <small>fio de leitura</small>
        <span><i /></span>
        <b />
      </div>
      <Header />

      <main id="conteudo-principal">
        <Hero />

        <section id="chamado" data-track-section="chamado" className="ink-spread">
          <div className="ink-spread-inner">
            <header className="essay-heading" data-reading-entry>
              <p className="folio-kicker"><span>01</span> Notas sobre o ruído</p>
              <h2>Vivemos em um tempo onde quase tudo está acessível.</h2>
              <p className="essay-opening">
                Teorias, técnicas, práticas, ciência, tradições antigas. Mas, mesmo com tanto ao
                alcance, o essencial ainda pode permanecer desalinhado.
              </p>
              <em className="margin-note">leia devagar</em>
            </header>

            <div className="recognition-manuscript">
              <p className="recognition-thesis" data-reading-entry>
                O problema nem sempre é falta de informação. Às vezes, é não conseguir enxergar
                como as partes conversam — e onde você está no meio delas.
              </p>
              <div className="recognition-notes">
                {recognitionPoints.map((item, index) => (
                  <article key={item.title} data-reading-entry>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <div><h3>{item.title}</h3><p>{item.text}</p></div>
                    <em>{item.note}</em>
                  </article>
                ))}
              </div>
              <blockquote data-reading-entry>
                “Nenhum excesso substitui a ausência de conexão.”
              </blockquote>
            </div>
          </div>
        </section>

        <section id="campo" data-track-section="campo" className="field-manuscript">
          <div className="field-manuscript-inner">
            <div className="field-plate-column">
              <figure className="field-plate">
                <div className="paper-tape" aria-hidden="true" />
                <img
                  src={meditationField}
                  alt="Prancha artística original com figura em meditação, centros de energia e órbitas douradas"
                  loading="lazy"
                  decoding="async"
                />
                <svg className="field-pencil-circle" viewBox="0 0 360 520" aria-hidden="true">
                  <path d="M182 50C83 61 38 162 51 283c13 120 75 190 154 178 86-13 124-118 101-231C283 117 242 42 182 50Z" />
                  <path d="M170 39C74 77 31 180 61 308c25 103 90 166 160 137" />
                </svg>
                <figcaption><span>Prancha II</span><p>Estudo visual do campo · acervo original</p></figcaption>
                <em className="plate-note plate-note-a">corpo</em>
                <em className="plate-note plate-note-b">atenção</em>
                <em className="plate-note plate-note-c">presença</em>
              </figure>
            </div>

            <div className="field-entries">
              <header data-reading-entry>
                <p className="folio-kicker"><span>02</span> Caderno de campo</p>
                <h2>Mas o que é esse campo — e por que ele importa?</h2>
                <p>
                  Dentro da visão proposta pelo programa, o campo é uma forma de compreender a
                  trama que relaciona percepção, presença e experiência.
                </p>
              </header>

              {fieldEntries.map((entry) => (
                <article key={entry.number} data-reading-entry>
                  <span>{entry.number}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.text}</p>
                  <em>{entry.note}</em>
                </article>
              ))}

              <div className="field-entry-cta" data-reading-entry>
                <p>O mapa completo foi organizado em oito eixos de estudo.</p>
                <TrackedSectionLink
                  href="#conteudo"
                  label="Abrir o índice dos 8 eixos"
                  ctaId="field_explore_axes"
                  section="campo"
                  variant="secondary"
                  endIcon="down"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="portal" data-track-section="portal" className="portal-folio">
          <div className="portal-folio-inner">
            <div className="portal-collage" aria-label="Capas reais do Portal da Consciência">
              <div className="portal-wordmark-sheet">
                <img src={portalTitle} alt="Portal da Consciência" />
                <small>arquivo de estudos e práticas</small>
              </div>
              <figure className="folio-cover folio-cover-back">
                <img src={earthCover} alt="Capa do módulo O Projeto Terra" loading="lazy" decoding="async" />
              </figure>
              <figure className="folio-cover folio-cover-mid">
                <img src={originCover} alt="Capa do módulo O Inefável Ser Absoluto" loading="lazy" decoding="async" />
              </figure>
              <figure className="folio-cover folio-cover-front">
                <div className="paper-tape" aria-hidden="true" />
                <img src={introCover} alt="Capa de introdução do Portal da Consciência" loading="lazy" decoding="async" />
                <figcaption>folha de rosto · 01/20</figcaption>
              </figure>
              <em className="collage-note">um acervo para revisitar ↗</em>
            </div>

            <div className="portal-copy">
              <p className="folio-kicker"><span>03</span> O Portal</p>
              <h2>É nesse contexto que nasce o Portal da Consciência.</h2>
              <p className="portal-lead">
                Como um ponto de retorno: um programa digital de estudos e práticas que organiza
                temas profundos em uma progressão clara, acessível on-line e sem prazo para acabar.
              </p>

              <div className="product-ledger">
                {productSpecs.map(([title, text], index) => (
                  <article key={title} data-reading-entry>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <div><h3>{title}</h3><p>{text}</p></div>
                  </article>
                ))}
              </div>
              <em className="portal-copy-note">não é uma coleção solta</em>
            </div>
          </div>
        </section>

        <section id="conteudo" data-track-section="conteudo" className="curriculum-stage">
          <div className="curriculum-stage-inner">
            <header className="curriculum-heading">
              <p className="folio-kicker"><span>04</span> Índice anotado</p>
              <h2>8 eixos. 19 módulos.<br /><em>Uma única progressão.</em></h2>
              <p>Abra um eixo para ler seus temas. O índice também responde às setas do teclado.</p>
            </header>

            <ModuleShowcase />

            <div className="module-deck">
              <div className="module-deck-copy">
                <span>prova de acervo · 19 + introdução</span>
                <h3>As capas reais de cada etapa da jornada.</h3>
                <p>
                  Um contato visual do conteúdo que você encontra dentro da plataforma. Navegue
                  manualmente e observe cada módulo.
                </p>
                <em>folheie sem pressa →</em>
              </div>
              <OriginalSlideshow />
            </div>
          </div>
        </section>

        <section id="ritmo" data-track-section="ritmo" className="journey-stage">
          <div className="journey-stage-inner">
            <header>
              <p className="folio-kicker"><span>05</span> Ritmo de leitura</p>
              <h2>O percurso não exige pressa.<br /><em>Exige presença.</em></h2>
            </header>

            <ol className="journey-path">
              {journeySteps.map(([title, text], index) => (
                <li key={title} data-reading-entry>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>

            <aside className="transparency-note">
              <strong>Uma proposta espiritual, não uma promessa de resultado.</strong>
              <p>
                O Portal oferece estudo, reflexão e práticas integrativas. A experiência é
                individual e o conteúdo não substitui orientação médica ou psicológica.
              </p>
              <em>clareza também faz parte</em>
            </aside>
          </div>
        </section>

        <section id="investimento" data-track-section="investimento" className="investment-stage">
          <OfferCard />
        </section>

        <section id="duvidas" data-track-section="duvidas" className="faq-stage">
          <div className="faq-stage-inner">
            <header>
              <p className="folio-kicker"><span>07</span> Perguntas à margem</p>
              <h2>Em caso de dúvida,<br /><em>respire.</em></h2>
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
