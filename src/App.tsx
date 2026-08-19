import { useEffect } from "react";
import { CosmicBackground } from "./components/CosmicBackground";
import { ExitPromoOffer } from "./components/ExitPromoOffer";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MeditationEnergyAnimation } from "./components/MeditationEnergyAnimation";
import { ModuleShowcase } from "./components/ModuleShowcase";
import { OfferCard } from "./components/OfferCard";
import { OriginalSlideshow } from "./components/OriginalSlideshow";
import { Section } from "./components/Section";
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
    if (hasBootedTracking) {
      return;
    }

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
      { threshold: 0.18 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);
};

const useHashAnchorScroll = () => {
  useEffect(() => {
    const scrollToHash = () => {
      const targetId = window.location.hash.slice(1);

      if (!targetId) {
        return;
      }

      let decodedTargetId = targetId;

      try {
        decodedTargetId = decodeURIComponent(targetId);
      } catch {
        // Malformed external hashes should not break page rendering.
      }

      window.requestAnimationFrame(() => {
        const target = document.getElementById(decodedTargetId);
        target?.scrollIntoView({ block: "start" });
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);
};

const useReadingProgressMarkers = () => {
  useEffect(() => {
    const trackedParagraphs = Array.from(
      document.querySelectorAll<HTMLElement>(".copy-flow p, .result-stack p, .result-note"),
    );

    if (trackedParagraphs.length === 0) {
      return;
    }

    let animationFrame = 0;

    const updateProgress = () => {
      animationFrame = 0;

      const readLine = window.innerHeight * 0.58;
      const activeStart = window.innerHeight * 0.28;
      const activeEnd = window.innerHeight * 0.72;

      trackedParagraphs.forEach((paragraph) => {
        const rect = paragraph.getBoundingClientRect();
        const paragraphCenter = rect.top + rect.height / 2;
        const isRead = paragraphCenter <= readLine;
        const isReading = paragraphCenter >= activeStart && paragraphCenter <= activeEnd;

        paragraph.classList.toggle("is-read", isRead);
        paragraph.classList.toggle("is-reading", isReading);
      });
    };

    const scheduleUpdate = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      trackedParagraphs.forEach((paragraph) => {
        paragraph.classList.remove("is-read", "is-reading");
      });
    };
  }, []);
};

const App = () => {
  useTrackingBoot();
  useHashAnchorScroll();
  useReadingProgressMarkers();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-pearl">
      <CosmicBackground />
      <Header />

      <main>
        <Hero />

        <Section id="chamado" className="after-hero-section">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-title text-left">
              Vivemos em um tempo onde quase tudo está acessível.
            </h2>
            <div className="copy-flow mt-8">
              <p>
                Teorias, técnicas, práticas, linhas espirituais, ciência, tradições antigas...
                estão por toda parte.
              </p>
              <p>Mas mesmo com tanto ao alcance, o essencial continua desalinhado.</p>
              <p>
                Há uma evidente distorção na forma como as pessoas percebem e vivem a própria
                realidade.
              </p>
              <p>
                Elas acumulam conhecimento, buscam explicações, mergulham em técnicas e métodos,
                mas, no fundo, continuam desconectadas, ansiosas, fragmentadas.
              </p>
              <p>Aparentam funcionalidade, mas seguem vibracionalmente distantes de si mesmas.</p>
              <p>Essa ruptura não é apenas mental, emocional ou física.</p>
              <p>É estrutural. É vibracional.</p>
              <p>
                Poucos percebem que o que sentem, o que pensam e até o que vivem no corpo físico
                são respostas de um mesmo centro:{" "}
                <strong>
                  o campo vibracional que organiza a experiência de dentro para fora.
                </strong>
              </p>
            </div>
          </div>
        </Section>

        <Section id="campo" className="field-static-section pt-0">
          <div className="field-static-layout mx-auto max-w-7xl">
            <div className="field-static-copy">
              <h2 className="section-title text-left">
                Mas o que é esse campo? E por que ele importa?
              </h2>
              <div className="copy-flow mt-8">
                <p>O campo vibracional é a arquitetura sutil da realidade.</p>
                <p>
                  É ele que sustenta a matéria, a mente, as emoções, o tempo, as experiências.
                </p>
                <p>
                  É no campo que as informações são armazenadas, as frequências se propagam e a
                  realidade se organiza, mesmo que você não esteja consciente disso.
                </p>
              </div>
            </div>

            <MeditationEnergyAnimation />
          </div>

          <div className="field-static-next mx-auto mt-16 max-w-7xl">
            <h2 className="section-title text-left">
              O problema é que a maioria das pessoas nunca aprendeu a escutar esse campo.
            </h2>
            <div className="copy-flow mt-8">
              <p>
                Elas foram ensinadas a pensar com a mente lógica, a seguir padrões externos, a
                buscar fora. Mas nunca a perceber o que vibra dentro de si.
              </p>
              <p>O resultado?</p>
            </div>
            <div className="result-stack mt-7">
              <p>Vivem num estado de colapso perceptivo, onde tudo parece desconectado.</p>
              <p>Corpo, mente, propósito, relações, decisões... nada conversa com nada.</p>
              <p>
                Quanto mais se desconectam da vibração, mais tentam compensar com informação,
                controle e consumo.
              </p>
            </div>
            <div className="result-note mt-8">
              <p>
                Só que nenhum excesso substitui a ausência de conexão. Nenhuma técnica, por mais
                avançada, supre a falta de alinhamento com o que é essencial.
              </p>
              <p>
                A crise que muitos enfrentam hoje não é por escassez de acesso, é por excesso de
                dispersão.
              </p>
              <p>
                É o campo que precisa ser escutado novamente. A vibração, reorganizada. A
                percepção, refinada.
              </p>
            </div>
          </div>
        </Section>

        <Section id="portal" className="section-band overflow-hidden">
          <div className="mx-auto max-w-4xl">
            <div className="portal-section-content">
              <h2 className="section-title">
                É nesse contexto que nasce o Portal da Consciência.
              </h2>
              <div className="copy-flow mt-8">
                <p>
                  Como um ponto de retorno. Uma possibilidade real de reorganizar a percepção. De
                  escutar o campo novamente. De relembrar aquilo que nunca deixou de vibrar, mas
                  que foi coberto pelo excesso, pela aceleração e pelo ruído.
                </p>
                <p>
                  Um espaço onde os conhecimentos mais profundos e estruturais sobre a realidade
                  são transmitidos de forma clara, direta e organizada.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="conteudo"
          title="Abaixo, um vislumbre do que o Portal abre"
          className="pt-0"
        >
          <OriginalSlideshow />
          <ModuleShowcase />
        </Section>

        <Section id="investimento" className="pt-0">
          <OfferCard />
        </Section>

        <Section id="duvidas" className="pt-0 pb-12 md:pb-12">
          <div className="mx-auto mb-12 max-w-5xl text-center">
            <h2 className="section-title">Em caso de dúvida, respire...</h2>
            <p className="mt-4 text-xl leading-8 text-pearl/[0.76]">
              E veja se alguma das respostas abaixo toca o que você precisa saber.
            </p>
          </div>
          <FAQ />
        </Section>
      </main>

      <Footer />

      <ExitPromoOffer />
    </div>
  );
};

export default App;
