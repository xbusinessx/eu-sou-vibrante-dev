import {
  extractTrackingParamsFromUrl,
  hasVisitAttributionSignal,
  type TrackingParams,
} from "./utm";

type PaidMetaTouch = {
  first_touch_source: string;
  first_touch_medium?: string;
  first_touch_campaign?: string;
  first_touch_content?: string;
  first_touch_term?: string;
  first_touch_s1?: string;
  first_touch_s2?: string;
  first_touch_s3?: string;
  first_touch_timestamp: number;
  latest_paid_meta_touch_timestamp: number;
  fbclid?: string;
  landing_page_url: string;
};

type AttributionType =
  | "paid_meta_direct"
  | "paid_meta_assist"
  | "organic_ig_direct"
  | "unknown_direct";

type AttributionDecision = {
  attribution_type: AttributionType;
  assist_window_days: number;
  assist_age_days?: number;
  assist_src?: string;
  paid_meta_touch?: PaidMetaTouch;
};

const STORAGE_KEY = "eu_sou_vibrante_paid_meta_touch";
const DEFAULT_ASSIST_WINDOW_DAYS = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ASSIST_ENABLED = import.meta.env.VITE_ENABLE_ATTRIBUTION_ASSIST !== "false";

const parseAssistWindowDays = (): number => {
  const rawValue = Number(import.meta.env.VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS);

  if (Number.isFinite(rawValue) && rawValue > 0) {
    return Math.round(rawValue);
  }

  return DEFAULT_ASSIST_WINDOW_DAYS;
};

export const ATTRIBUTION_ASSIST_WINDOW_DAYS = parseAssistWindowDays();

const canUseStorage = (storage: Storage | undefined): storage is Storage => {
  if (!storage) {
    return false;
  }

  try {
    const testKey = "__esv_attribution_assist_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const sanitizeValue = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim().slice(0, 180);

  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/[<>"'`]/g, "");
};

const normalizeSegment = (value: string | undefined): string =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const includesAny = (value: string | undefined, needles: string[]) => {
  const normalized = normalizeSegment(value);
  return needles.some((needle) => normalized.includes(needle));
};

const isPaidMedium = (value: string | undefined) =>
  includesAny(value, ["paid", "cpc", "ppc", "ads", "ad", "cpm", "display"]);

const isMetaSource = (value: string | undefined) =>
  includesAny(value, ["meta", "facebook", "fb", "instagram", "ig"]);

export const isPaidMetaTouch = (params: TrackingParams): boolean => {
  const src = normalizeSegment(params.src);

  if (src.includes("assist")) {
    return false;
  }

  if (
    src === "paid_meta" ||
    src === "meta_paid" ||
    src === "paid_facebook" ||
    src === "paid_instagram"
  ) {
    return true;
  }

  if (src.startsWith("paid_") && isMetaSource(src)) {
    return true;
  }

  if (isMetaSource(params.utm_source) && isPaidMedium(params.utm_medium)) {
    return true;
  }

  if (params.fbclid && !includesAny(params.utm_medium, ["organic", "social", "referral"])) {
    return true;
  }

  return false;
};

const isOrganicInstagramTouch = (params: TrackingParams): boolean => {
  const src = normalizeSegment(params.src);

  if (src === "organic_ig" || src === "organic_instagram") {
    return true;
  }

  return isMetaSource(params.utm_source) && includesAny(params.utm_medium, ["organic", "social"]);
};

const getSafeLandingPageUrl = (): string => {
  if (typeof window === "undefined") {
    return "https://eusouvibrante.com/";
  }

  return `${window.location.origin}${window.location.pathname}`;
};

const readPaidMetaTouch = (): PaidMetaTouch | null => {
  if (typeof window === "undefined" || !canUseStorage(window.localStorage)) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as PaidMetaTouch;
    if (
      !Number.isFinite(parsed.first_touch_timestamp) ||
      !Number.isFinite(parsed.latest_paid_meta_touch_timestamp)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writePaidMetaTouch = (touch: PaidMetaTouch) => {
  if (typeof window === "undefined" || !canUseStorage(window.localStorage)) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // Attribution assist is additive and must never break checkout.
  }
};

const isTouchWithinWindow = (touch: PaidMetaTouch, now = Date.now()): boolean =>
  now - touch.first_touch_timestamp <= ATTRIBUTION_ASSIST_WINDOW_DAYS * MS_PER_DAY;

export const getAttributionAssistAgeDays = (touch: PaidMetaTouch, now = Date.now()): number => {
  const firstTouchDate = new Date(touch.first_touch_timestamp);
  const conversionDate = new Date(now);
  const firstTouchUtcDay = Date.UTC(
    firstTouchDate.getFullYear(),
    firstTouchDate.getMonth(),
    firstTouchDate.getDate(),
  );
  const conversionUtcDay = Date.UTC(
    conversionDate.getFullYear(),
    conversionDate.getMonth(),
    conversionDate.getDate(),
  );

  return Math.max(0, Math.floor((conversionUtcDay - firstTouchUtcDay) / MS_PER_DAY));
};

export const getAttributionAssistSrc = (touch: PaidMetaTouch, now = Date.now()): string =>
  `paid_meta_assist_${getAttributionAssistAgeDays(touch, now)}d`;

const buildPaidMetaTouch = (
  params: TrackingParams,
  existingTouch: PaidMetaTouch | null,
  now: number,
): PaidMetaTouch => {
  const validExistingTouch =
    existingTouch && isTouchWithinWindow(existingTouch, now) ? existingTouch : null;

  return {
    first_touch_source:
      validExistingTouch?.first_touch_source ?? sanitizeValue(params.src) ?? "paid_meta",
    first_touch_medium:
      validExistingTouch?.first_touch_medium ?? sanitizeValue(params.utm_medium),
    first_touch_campaign:
      validExistingTouch?.first_touch_campaign ?? sanitizeValue(params.utm_campaign),
    first_touch_content:
      validExistingTouch?.first_touch_content ?? sanitizeValue(params.utm_content),
    first_touch_term: validExistingTouch?.first_touch_term ?? sanitizeValue(params.utm_term),
    first_touch_s1: validExistingTouch?.first_touch_s1 ?? sanitizeValue(params.s1),
    first_touch_s2: validExistingTouch?.first_touch_s2 ?? sanitizeValue(params.s2),
    first_touch_s3: validExistingTouch?.first_touch_s3 ?? sanitizeValue(params.s3),
    first_touch_timestamp: validExistingTouch?.first_touch_timestamp ?? now,
    latest_paid_meta_touch_timestamp: now,
    fbclid: sanitizeValue(params.fbclid) ?? validExistingTouch?.fbclid,
    landing_page_url: validExistingTouch?.landing_page_url ?? getSafeLandingPageUrl(),
  };
};

const shouldDebugAttribution = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("debug_attribution") === "1";
};

const debugAttribution = (label: string, payload: Record<string, unknown>) => {
  if (!shouldDebugAttribution()) {
    return;
  }

  console.info(`[attribution-assist] ${label}`, payload);
};

export const persistAttributionAssistTouch = (now = Date.now()): PaidMetaTouch | null => {
  if (!ASSIST_ENABLED || typeof window === "undefined") {
    return null;
  }

  const currentUrlParams = extractTrackingParamsFromUrl(window.location.href);

  if (!isPaidMetaTouch(currentUrlParams)) {
    debugAttribution("no_paid_meta_touch_to_persist", { currentUrlParams });
    return null;
  }

  const nextTouch = buildPaidMetaTouch(currentUrlParams, readPaidMetaTouch(), now);
  writePaidMetaTouch(nextTouch);
  debugAttribution("paid_meta_touch_persisted", { currentUrlParams, nextTouch });

  return nextTouch;
};

export const resolveAttributionDecision = (
  checkoutParams: TrackingParams,
  now = Date.now(),
): AttributionDecision => {
  const currentUrlParams =
    typeof window !== "undefined" ? extractTrackingParamsFromUrl(window.location.href) : {};
  const currentVisitHasSignal = hasVisitAttributionSignal(currentUrlParams);
  const currentVisitIsPaidMeta = currentVisitHasSignal && isPaidMetaTouch(currentUrlParams);
  const paidMetaTouch = readPaidMetaTouch();
  const validPaidMetaTouch =
    paidMetaTouch && isTouchWithinWindow(paidMetaTouch, now) ? paidMetaTouch : null;

  if (currentVisitIsPaidMeta || isPaidMetaTouch(checkoutParams)) {
    return {
      attribution_type: "paid_meta_direct",
      assist_window_days: ATTRIBUTION_ASSIST_WINDOW_DAYS,
      paid_meta_touch: paidMetaTouch ?? undefined,
    };
  }

  if (validPaidMetaTouch) {
    const assistAgeDays = getAttributionAssistAgeDays(validPaidMetaTouch, now);

    return {
      attribution_type: "paid_meta_assist",
      assist_window_days: ATTRIBUTION_ASSIST_WINDOW_DAYS,
      assist_age_days: assistAgeDays,
      assist_src: getAttributionAssistSrc(validPaidMetaTouch, now),
      paid_meta_touch: validPaidMetaTouch,
    };
  }

  if (isOrganicInstagramTouch(checkoutParams)) {
    return {
      attribution_type: "organic_ig_direct",
      assist_window_days: ATTRIBUTION_ASSIST_WINDOW_DAYS,
    };
  }

  return {
    attribution_type: "unknown_direct",
    assist_window_days: ATTRIBUTION_ASSIST_WINDOW_DAYS,
  };
};

export const applyAttributionAssistToCheckoutParams = (
  checkoutParams: TrackingParams,
): TrackingParams => {
  if (!ASSIST_ENABLED) {
    return checkoutParams;
  }

  const decision = resolveAttributionDecision(checkoutParams);

  if (decision.attribution_type !== "paid_meta_assist") {
    debugAttribution("checkout_params_resolved", {
      decision,
      finalParams: checkoutParams,
    });
    return checkoutParams;
  }

  const finalParams = {
    ...checkoutParams,
    src: decision.assist_src,
  };

  debugAttribution("checkout_params_resolved", {
    decision,
    originalParams: checkoutParams,
    finalParams,
  });

  return finalParams;
};
