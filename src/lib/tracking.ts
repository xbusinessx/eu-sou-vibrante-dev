import {
  getStoredUtmParams,
  persistUtmParamsFromUrl,
  type TrackingParams,
} from "./utm";

type EventValue =
  | string
  | number
  | boolean
  | (() => void)
  | undefined
  | null
  | EventValue[]
  | { [key: string]: EventValue };

type EventParams = Record<string, EventValue>;
type MetaEventOptions = { eventID?: string };

type FbqFunction = {
  (
    action: "track" | "trackCustom",
    eventName: string,
    params?: EventParams,
    options?: MetaEventOptions,
  ): void;
  (action: "init", pixelId: string): void;
};

type GtagFunction = {
  (command: "event" | "config" | "set", eventName: string, params?: EventParams): void;
  (command: "js", date: Date): void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: FbqFunction;
    gtag?: GtagFunction;
  }
}

const pruneParams = (params: EventParams = {}): EventParams =>
  Object.entries(params).reduce<EventParams>((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

const PRODUCT_EVENT_PARAMS: EventParams = {
  currency: "BRL",
  value: 147,
  content_name: "Portal da Consciência",
  content_category: "Curso online",
  content_type: "product",
  content_ids: ["portal-da-consciencia"],
  num_items: 1,
};

const GA4_CHECKOUT_ITEMS: EventValue[] = [
  {
    item_id: "portal-da-consciencia",
    item_name: "Portal da Consciência",
    item_category: "Curso online",
    price: 147,
    quantity: 1,
  },
];

const META_CUSTOM_EVENTS = new Set([
  "cta_click",
  "exit_promo_code_copy",
  "exit_promo_checkout",
  "exit_promo_dismiss",
  "exit_promo_eligible",
  "exit_promo_view",
  "faq_open",
  "section_view",
]);
const BLOCKED_SITE_META_EVENTS = new Set([
  "InitiateCheckout",
  "Purchase",
  "boleto",
  "credit_card",
  "pix",
]);
const GOOGLE_EVENT_TIMEOUT_MS = 900;

const makeEventId = (eventName: string): string =>
  `esv_${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const trackEvent = (eventName: string, params: EventParams = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload = pruneParams({
    ...getStoredUtmParams(),
    ...params,
  });

  try {
    window.dataLayer?.push({
      event: eventName,
      ...payload,
    });
  } catch {
    // Optional third-party integrations must never interrupt UX.
  }

  try {
    window.gtag?.("event", eventName, payload);
  } catch {
    // Optional third-party integrations must never interrupt UX.
  }

  if (META_CUSTOM_EVENTS.has(eventName) && !BLOCKED_SITE_META_EVENTS.has(eventName)) {
    try {
      window.fbq?.("trackCustom", eventName, payload);
    } catch {
      // Optional third-party integrations must never interrupt UX.
    }
  }

  if (import.meta.env.DEV) {
    console.info("[tracking]", eventName, payload);
  }
};

export const trackMetaEvent = (
  eventName: string,
  params: EventParams = {},
  options?: MetaEventOptions,
) => {
  if (typeof window === "undefined") {
    return;
  }

  if (BLOCKED_SITE_META_EVENTS.has(eventName)) {
    if (import.meta.env.DEV) {
      console.warn("[tracking] blocked Meta Pixel event from landing page", eventName);
    }
    return;
  }

  try {
    window.fbq?.("track", eventName, pruneParams(params), options);
  } catch {
    // Meta Pixel is intentionally optional.
  }
};

export const trackGoogleEvent = (eventName: string, params: EventParams = {}): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.gtag?.("event", eventName, pruneParams(params));
    return Boolean(window.gtag);
  } catch {
    // GA4/Google Ads are intentionally optional.
    return false;
  }
};

export const trackCtaClick = (params: EventParams) => {
  trackEvent("cta_click", params);
};

export const trackCheckoutIntent = (params: EventParams): Promise<void> => {
  const eventId = makeEventId("checkout_intent");
  const payload = pruneParams({
    ...PRODUCT_EVENT_PARAMS,
    ...getStoredUtmParams(),
    ...params,
    event_id: eventId,
  });

  // Checkout/payment standard events belong to Kiwify, preventing duplicate
  // InitiateCheckout/Purchase signals from the landing page.
  trackEvent("checkout_intent", payload);

  return new Promise((resolve) => {
    let isResolved = false;

    const resolveOnce = () => {
      if (isResolved) {
        return;
      }

      isResolved = true;
      resolve();
    };

    const hasSentGoogleEvent = trackGoogleEvent("begin_checkout", {
      ...payload,
      items: GA4_CHECKOUT_ITEMS,
      event_callback: resolveOnce,
      event_timeout: GOOGLE_EVENT_TIMEOUT_MS,
    });

    if (!hasSentGoogleEvent) {
      resolveOnce();
      return;
    }

    window.setTimeout(resolveOnce, GOOGLE_EVENT_TIMEOUT_MS + 100);
  });
};

export { getStoredUtmParams, persistUtmParamsFromUrl };
export type { TrackingParams };
