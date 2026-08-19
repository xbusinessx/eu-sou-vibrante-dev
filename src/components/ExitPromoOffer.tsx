import { AnimatePresence, motion } from "framer-motion";
import { BadgePercent, Check, Copy, Sparkles, Timer, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/tracking";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";

const PROMO_CODE = "VIBRANTES25";
const DISCOUNT_PERCENT = 25;
const ACTIVE_ACTIVITY_WINDOW_MS = 28_000;
const OFFER_COOLDOWN_MS = 18 * 60 * 60 * 1000;
const STORAGE_LAST_SHOWN_KEY = "eu_sou_vibrante_exit_promo_last_shown";
const SESSION_DISMISSED_KEY = "eu_sou_vibrante_exit_promo_dismissed";

const MIN_TOTAL_TIME_MS = 150_000;
const MIN_ACTIVE_TIME_MS = 70_000;
const MIN_SCROLL_DEPTH = 78;
const MIN_ENGAGEMENT_SCORE = 14;

const REQUIRED_READING_SECTIONS = [
  "chamado",
  "campo",
  "portal",
  "conteudo",
  "investimento",
] as const;

type RequiredReadingSection = (typeof REQUIRED_READING_SECTIONS)[number];

const REQUIRED_SECTION_READ_TIME_MS: Record<RequiredReadingSection, number> = {
  chamado: 22_000,
  campo: 45_000,
  portal: 18_000,
  conteudo: 24_000,
  investimento: 22_000,
};

type EngagementMetrics = {
  activeTimeMs: number;
  interactionCount: number;
  lastActivityAt: number;
  maxScrollDepth: number;
  sectionReadTimeMs: Partial<Record<RequiredReadingSection, number>>;
  sectionsSeen: Set<string>;
  startedAt: number;
};

type EngagementSnapshot = {
  activeTimeSeconds: number;
  completedReadingSections: RequiredReadingSection[];
  interactionCount: number;
  readingTimeSeconds: number;
  requiredSectionsCompleted: number;
  requiredSectionsTotal: number;
  sectionReadSeconds: Record<RequiredReadingSection, number>;
  score: number;
  scrollDepth: number;
  sectionsSeen: string[];
  sectionsViewed: number;
  totalTimeSeconds: number;
  trigger: string;
};

const canUseStorage = (storage: Storage | undefined): storage is Storage => {
  if (!storage) {
    return false;
  }

  try {
    const testKey = "__esv_exit_promo_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const readStorageNumber = (storage: Storage | undefined, key: string): number | null => {
  if (!canUseStorage(storage)) {
    return null;
  }

  const value = Number(storage.getItem(key));

  return Number.isFinite(value) ? value : null;
};

const writeStorageValue = (
  storage: Storage | undefined,
  key: string,
  value: string,
) => {
  if (!canUseStorage(storage)) {
    return;
  }

  storage.setItem(key, value);
};

const hasSessionDismissal = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return canUseStorage(window.sessionStorage)
    ? window.sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1"
    : false;
};

const wasOfferShownRecently = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const lastShownAt = readStorageNumber(window.localStorage, STORAGE_LAST_SHOWN_KEY);

  return lastShownAt !== null && Date.now() - lastShownAt < OFFER_COOLDOWN_MS;
};

const getScrollDepth = () => {
  const documentElement = document.documentElement;
  const pageHeight = Math.max(
    documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight,
  );

  return Math.min(
    100,
    Math.round(((window.scrollY + window.innerHeight) / pageHeight) * 100),
  );
};

const getSectionReadTime = (
  metrics: EngagementMetrics,
  section: RequiredReadingSection,
) => metrics.sectionReadTimeMs[section] ?? 0;

const getCompletedReadingSections = (
  sectionReadTimeMs: EngagementMetrics["sectionReadTimeMs"],
) =>
  REQUIRED_READING_SECTIONS.filter(
    (section) => (sectionReadTimeMs[section] ?? 0) >= REQUIRED_SECTION_READ_TIME_MS[section],
  );

const getTotalReadingTimeMs = (metrics: EngagementMetrics) =>
  REQUIRED_READING_SECTIONS.reduce(
    (total, section) => total + getSectionReadTime(metrics, section),
    0,
  );

const getCurrentReadingSection = (): RequiredReadingSection | null => {
  let currentSection: RequiredReadingSection | null = null;
  let highestViewportCoverage = 0;

  REQUIRED_READING_SECTIONS.forEach((section) => {
    const element = document.getElementById(section);

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const visiblePixels = Math.max(
      0,
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
    );
    const viewportCoverage = visiblePixels / window.innerHeight;

    if (viewportCoverage > highestViewportCoverage) {
      highestViewportCoverage = viewportCoverage;
      currentSection = section;
    }
  });

  return highestViewportCoverage >= 0.24 ? currentSection : null;
};

const getEngagementScore = (metrics: EngagementMetrics) => {
  const totalTimeMs = Date.now() - metrics.startedAt;
  const sectionsSeen = metrics.sectionsSeen;
  const readingTimeMs = getTotalReadingTimeMs(metrics);
  const completedReadingSections = getCompletedReadingSections(metrics.sectionReadTimeMs);
  let score = 0;

  if (totalTimeMs >= 120_000) {
    score += 3;
  } else if (totalTimeMs >= MIN_TOTAL_TIME_MS) {
    score += 2;
  } else if (totalTimeMs >= 45_000) {
    score += 1;
  }

  if (metrics.activeTimeMs >= 60_000) {
    score += 3;
  } else if (metrics.activeTimeMs >= MIN_ACTIVE_TIME_MS) {
    score += 2;
  } else if (metrics.activeTimeMs >= 20_000) {
    score += 1;
  }

  if (metrics.maxScrollDepth >= 80) {
    score += 3;
  } else if (metrics.maxScrollDepth >= MIN_SCROLL_DEPTH) {
    score += 2;
  } else if (metrics.maxScrollDepth >= 45) {
    score += 1;
  }

  if (sectionsSeen.size >= 7) {
    score += 3;
  } else if (sectionsSeen.size >= REQUIRED_READING_SECTIONS.length) {
    score += 2;
  } else if (sectionsSeen.size >= 4) {
    score += 1;
  }

  if (sectionsSeen.has("conteudo")) {
    score += 1;
  }

  if (sectionsSeen.has("investimento")) {
    score += 2;
  }

  if (readingTimeMs >= 130_000) {
    score += 4;
  } else if (readingTimeMs >= 105_000) {
    score += 3;
  } else if (readingTimeMs >= 75_000) {
    score += 2;
  } else if (readingTimeMs >= 45_000) {
    score += 1;
  }

  if (completedReadingSections.length === REQUIRED_READING_SECTIONS.length) {
    score += 4;
  } else if (completedReadingSections.length >= 4) {
    score += 2;
  }

  if (metrics.interactionCount >= 4) {
    score += 2;
  } else if (metrics.interactionCount >= 2) {
    score += 1;
  }

  return score;
};

const createSnapshot = (
  metrics: EngagementMetrics,
  trigger: string,
): EngagementSnapshot => {
  const completedReadingSections = getCompletedReadingSections(metrics.sectionReadTimeMs);
  const sectionReadSeconds = REQUIRED_READING_SECTIONS.reduce(
    (acc, section) => ({
      ...acc,
      [section]: Math.round(getSectionReadTime(metrics, section) / 1000),
    }),
    {} as Record<RequiredReadingSection, number>,
  );

  return {
    activeTimeSeconds: Math.round(metrics.activeTimeMs / 1000),
    completedReadingSections,
    interactionCount: metrics.interactionCount,
    readingTimeSeconds: Math.round(getTotalReadingTimeMs(metrics) / 1000),
    requiredSectionsCompleted: completedReadingSections.length,
    requiredSectionsTotal: REQUIRED_READING_SECTIONS.length,
    sectionReadSeconds,
    score: getEngagementScore(metrics),
    scrollDepth: metrics.maxScrollDepth,
    sectionsSeen: Array.from(metrics.sectionsSeen),
    sectionsViewed: metrics.sectionsSeen.size,
    totalTimeSeconds: Math.round((Date.now() - metrics.startedAt) / 1000),
    trigger,
  };
};

const hasDecisionJourney = (snapshot: EngagementSnapshot) => {
  const sections = new Set(snapshot.sectionsSeen);

  return (
    sections.has("investimento") &&
    snapshot.completedReadingSections.length === REQUIRED_READING_SECTIONS.length
  );
};

const isEligibleForPromo = (snapshot: EngagementSnapshot) =>
  snapshot.totalTimeSeconds * 1000 >= MIN_TOTAL_TIME_MS &&
  snapshot.activeTimeSeconds * 1000 >= MIN_ACTIVE_TIME_MS &&
  snapshot.scrollDepth >= MIN_SCROLL_DEPTH &&
  snapshot.requiredSectionsCompleted === snapshot.requiredSectionsTotal &&
  snapshot.score >= MIN_ENGAGEMENT_SCORE &&
  hasDecisionJourney(snapshot);

const serializeSnapshot = (snapshot: EngagementSnapshot) => ({
  promo_trigger: snapshot.trigger,
  engagement_score: snapshot.score,
  active_time_seconds: snapshot.activeTimeSeconds,
  completed_reading_sections: snapshot.completedReadingSections.join("|"),
  reading_time_seconds: snapshot.readingTimeSeconds,
  required_sections_completed: snapshot.requiredSectionsCompleted,
  required_sections_total: snapshot.requiredSectionsTotal,
  section_read_seconds: REQUIRED_READING_SECTIONS.map(
    (section) => `${section}:${snapshot.sectionReadSeconds[section]}`,
  ).join("|"),
  total_time_seconds: snapshot.totalTimeSeconds,
  scroll_depth: snapshot.scrollDepth,
  sections_viewed: snapshot.sectionsViewed,
  sections_seen: snapshot.sectionsSeen.join("|"),
  interaction_count: snapshot.interactionCount,
  coupon_code: PROMO_CODE,
  discount_percent: DISCOUNT_PERCENT,
});

const isMobileLike = () =>
  window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;

export const ExitPromoOffer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snapshot, setSnapshot] = useState<EngagementSnapshot | null>(null);
  const isOpenRef = useRef(false);
  const shownThisPageRef = useRef(false);
  const eligibleTrackedRef = useRef(false);
  const mobileBackTrapArmedRef = useRef(false);
  const completedSectionTrackedRef = useRef(new Set<RequiredReadingSection>());
  const completedJourneyTrackedRef = useRef(false);
  const metricsRef = useRef<EngagementMetrics>({
    activeTimeMs: 0,
    interactionCount: 0,
    lastActivityAt: 0,
    maxScrollDepth: 0,
    sectionReadTimeMs: {},
    sectionsSeen: new Set<string>(),
    startedAt: 0,
  });

  const armMobileBackTrap = useCallback(() => {
    if (mobileBackTrapArmedRef.current || !isMobileLike()) {
      return;
    }

    try {
      const currentState =
        typeof window.history.state === "object" && window.history.state !== null
          ? window.history.state
          : {};

      window.history.pushState(
        { ...currentState, esvExitPromoTrap: true },
        "",
        window.location.href,
      );
      mobileBackTrapArmedRef.current = true;
    } catch {
      // Browser history trapping is progressive enhancement for mobile exits.
    }
  }, []);

  const showPromo = useCallback((trigger: string) => {
    if (
      shownThisPageRef.current ||
      isOpenRef.current ||
      hasSessionDismissal() ||
      wasOfferShownRecently()
    ) {
      return false;
    }

    const nextSnapshot = createSnapshot(metricsRef.current, trigger);

    if (!isEligibleForPromo(nextSnapshot)) {
      return false;
    }

    shownThisPageRef.current = true;
    isOpenRef.current = true;
    writeStorageValue(window.localStorage, STORAGE_LAST_SHOWN_KEY, String(Date.now()));
    setSnapshot(nextSnapshot);
    setIsOpen(true);

    trackEvent("exit_promo_view", serializeSnapshot(nextSnapshot));

    return true;
  }, []);

  const evaluateEligibility = useCallback(() => {
    if (
      eligibleTrackedRef.current ||
      shownThisPageRef.current ||
      hasSessionDismissal() ||
      wasOfferShownRecently()
    ) {
      return;
    }

    const nextSnapshot = createSnapshot(metricsRef.current, "eligibility_ready");

    if (!isEligibleForPromo(nextSnapshot)) {
      return;
    }

    eligibleTrackedRef.current = true;
    armMobileBackTrap();
    trackEvent("exit_promo_eligible", serializeSnapshot(nextSnapshot));
  }, [armMobileBackTrap]);

  const dismissPromo = useCallback((reason: string) => {
    if (snapshot) {
      trackEvent("exit_promo_dismiss", {
        ...serializeSnapshot(snapshot),
        dismiss_reason: reason,
      });
    }

    writeStorageValue(window.sessionStorage, SESSION_DISMISSED_KEY, "1");
    isOpenRef.current = false;
    setIsOpen(false);
  }, [snapshot]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);

      if (snapshot) {
        trackEvent("exit_promo_code_copy", serializeSnapshot(snapshot));
      }
    } catch {
      setCopied(false);
    }
  };

  const handleBeforeCheckout = (destination: string) => {
    writeStorageValue(window.sessionStorage, SESSION_DISMISSED_KEY, "1");

    if (snapshot) {
      trackEvent("exit_promo_checkout", {
        ...serializeSnapshot(snapshot),
        destination,
      });
    }
  };

  useEffect(() => {
    const metrics = metricsRef.current;
    const mountedAt = Date.now();

    if (metrics.startedAt === 0) {
      metrics.startedAt = mountedAt;
      metrics.lastActivityAt = mountedAt;
    }

    const markActivity = () => {
      metrics.lastActivityAt = Date.now();
    };

    const updateScrollDepth = () => {
      markActivity();
      metrics.maxScrollDepth = Math.max(metrics.maxScrollDepth, getScrollDepth());
      evaluateEligibility();
    };

    const handleInteraction = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;

      if (target?.closest(".exit-promo-dialog")) {
        return;
      }

      markActivity();
      metrics.interactionCount += 1;
      evaluateEligibility();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (isMobileLike() || event.clientY > 4 || event.relatedTarget !== null) {
        return;
      }

      showPromo("desktop_top_exit_intent");
    };

    const handlePopState = () => {
      if (!mobileBackTrapArmedRef.current) {
        return;
      }

      mobileBackTrapArmedRef.current = false;
      showPromo("mobile_back_exit_intent");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.getAttribute("data-track-section");

          if (entry.isIntersecting && section) {
            metrics.sectionsSeen.add(section);
            evaluateEligibility();
          }
        });
      },
      { threshold: [0.08, 0.18, 0.32, 0.45] },
    );

    document
      .querySelectorAll<HTMLElement>("[data-track-section]")
      .forEach((section) => observer.observe(section));

    metrics.maxScrollDepth = getScrollDepth();
    window.addEventListener("scroll", updateScrollDepth, { passive: true });
    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction);
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("popstate", handlePopState);

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        const currentReadingSection = getCurrentReadingSection();

        if (currentReadingSection) {
          metrics.sectionReadTimeMs[currentReadingSection] =
            (metrics.sectionReadTimeMs[currentReadingSection] ?? 0) + 1000;

          const currentSectionReadMs = metrics.sectionReadTimeMs[currentReadingSection] ?? 0;

          if (
            currentSectionReadMs >= REQUIRED_SECTION_READ_TIME_MS[currentReadingSection] &&
            !completedSectionTrackedRef.current.has(currentReadingSection)
          ) {
            completedSectionTrackedRef.current.add(currentReadingSection);
            trackEvent("reading_section_complete", {
              section: currentReadingSection,
              section_read_seconds: Math.round(currentSectionReadMs / 1000),
            });
          }
        }
      }

      if (!document.hidden && Date.now() - metrics.lastActivityAt <= ACTIVE_ACTIVITY_WINDOW_MS) {
        metrics.activeTimeMs += 1000;
      }

      const nextSnapshot = createSnapshot(metrics, "reading_journey_complete");

      if (!completedJourneyTrackedRef.current && hasDecisionJourney(nextSnapshot)) {
        completedJourneyTrackedRef.current = true;
        trackEvent("reading_journey_complete", serializeSnapshot(nextSnapshot));
      }

      evaluateEligibility();
    }, 1000);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener("scroll", updateScrollDepth);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [evaluateEligibility, showPromo]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissPromo("escape");
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismissPromo, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && snapshot && (
        <motion.aside
          className="exit-promo-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-promo-title"
          aria-describedby="exit-promo-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              dismissPromo("backdrop");
            }
          }}
        >
          <motion.div
            className="exit-promo-dialog"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="exit-promo-close"
              aria-label="Fechar oferta promocional"
              onClick={() => dismissPromo("close_button")}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="exit-promo-grid" aria-hidden="true" />

            <div className="exit-promo-content">
              <div className="exit-promo-heading-row">
                <div className="exit-promo-percent">
                  <span>{DISCOUNT_PERCENT}%</span>
                  <small>OFF</small>
                </div>
                <div>
                  <p className="exit-promo-kicker">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Cupom liberado pela sua jornada
                  </p>
                  <h2 id="exit-promo-title">
                    Antes de sair, entre com uma condição especial.
                  </h2>
                </div>
              </div>

              <p id="exit-promo-description" className="exit-promo-description">
                Você explorou o Portal com atenção. Por isso, esta visita desbloqueou um código
                promocional exclusivo para concluir seu acesso com 25% de desconto.
              </p>

              <div className="exit-promo-code-panel" aria-label={`Código promocional ${PROMO_CODE}`}>
                <span>Código promocional</span>
                <strong>{PROMO_CODE}</strong>
                <button type="button" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>

              <div className="exit-promo-benefits">
                <span>
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  Liberado apenas para visitas engajadas
                </span>
                <span>
                  <BadgePercent className="h-4 w-4" aria-hidden="true" />
                  O checkout já recebe o código aplicado
                </span>
              </div>

              <TrackedCheckoutButton
                label={`Usar ${PROMO_CODE} agora`}
                ctaId="exit_promo_discount"
                section="exit_promo"
                variant="primary"
                className="exit-promo-primary-cta"
                checkoutParams={{
                  coupon: PROMO_CODE,
                  s1: "cta_exit_promo_discount",
                  s2: "section_exit_promo",
                  s3: "retention_coupon",
                }}
                onBeforeCheckout={handleBeforeCheckout}
              />

              <button
                type="button"
                className="exit-promo-secondary-action"
                onClick={() => dismissPromo("continue_without_coupon")}
              >
                Continuar navegando sem usar o cupom
              </button>
            </div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
