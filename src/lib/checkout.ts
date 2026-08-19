import { applyAttributionAssistToCheckoutParams } from "./attributionAssist";
import { applyAffiliateAttributionToCheckoutUrl } from "./affiliateAttribution";
import { appendTrackingParamsToUrl, getStoredUtmParams, type TrackingParams } from "./utm";

export const DEFAULT_CHECKOUT_URL = "https://pay.kiwify.com.br/s7qqPEZ";

export const CHECKOUT_URL =
  import.meta.env.VITE_CHECKOUT_URL?.trim() || DEFAULT_CHECKOUT_URL;

export type CheckoutExtraParams = TrackingParams & {
  coupon?: string;
};

const sanitizeCheckoutValue = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim().slice(0, 80);

  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/[<>"'`]/g, "");
};

const appendCheckoutExtraParams = (
  urlString: string,
  extraParams: CheckoutExtraParams = {},
): string => {
  const coupon = sanitizeCheckoutValue(extraParams.coupon);

  if (!coupon) {
    return urlString;
  }

  const url = new URL(urlString);
  url.searchParams.set("coupon", coupon);

  return url.toString();
};

export const buildCheckoutUrl = (
  baseUrl = CHECKOUT_URL,
  extraParams: CheckoutExtraParams = {},
): string => {
  const storedParams = getStoredUtmParams();

  try {
    const trackedUrl = appendTrackingParamsToUrl(baseUrl, applyAttributionAssistToCheckoutParams({
      ...storedParams,
      ...extraParams,
    }));

    return appendCheckoutExtraParams(
      applyAffiliateAttributionToCheckoutUrl(trackedUrl),
      extraParams,
    );
  } catch {
    return appendCheckoutExtraParams(
      applyAffiliateAttributionToCheckoutUrl(DEFAULT_CHECKOUT_URL),
      extraParams,
    );
  }
};

const normalizeAttributionSegment = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

const includesAny = (value: string | undefined, needles: string[]) => {
  if (!value) {
    return false;
  }

  const normalized = normalizeAttributionSegment(value);
  return needles.some((needle) => normalized.includes(needle));
};

const inferCheckoutSource = (params: TrackingParams): string => {
  const source = params.utm_source ? normalizeAttributionSegment(params.utm_source) : "";
  const medium = params.utm_medium ? normalizeAttributionSegment(params.utm_medium) : "";

  if (params.gclid || params.gbraid || params.wbraid) {
    return source ? `paid_${source}` : "paid_google";
  }

  if (includesAny(medium, ["cpc", "ppc", "paid", "ads", "ad", "cpm", "display"])) {
    return source ? `paid_${source}` : "paid_traffic";
  }

  if (includesAny(medium, ["organic", "social"])) {
    return source ? `organic_${source}` : "organic_traffic";
  }

  if (includesAny(medium, ["email"])) {
    return source ? `email_${source}` : "email";
  }

  if (includesAny(medium, ["referral"])) {
    return source ? `referral_${source}` : "referral";
  }

  if (source) {
    return `organic_${source}`;
  }

  if (params.fbclid) {
    return "paid_meta";
  }

  if (params.fbc) {
    return "meta_referral";
  }

  return "site_direct";
};

export const resolveCheckoutAttributionParams = ({
  ctaId,
  section,
  storedParams = getStoredUtmParams(),
}: {
  ctaId: string;
  section: string;
  storedParams?: TrackingParams;
}): TrackingParams => {
  const ctaSegment = normalizeAttributionSegment(ctaId);
  const sectionSegment = normalizeAttributionSegment(section);

  return {
    src: storedParams.src ?? inferCheckoutSource(storedParams),
    s1: storedParams.s1 ?? `cta_${ctaSegment}`,
    s2: storedParams.s2 ?? `section_${sectionSegment}`,
    s3: storedParams.s3 ?? "landing_page",
  };
};

export const buildCheckoutUrlForCta = ({
  ctaId,
  section,
  baseUrl = CHECKOUT_URL,
  extraParams = {},
}: {
  ctaId: string;
  section: string;
  baseUrl?: string;
  extraParams?: CheckoutExtraParams;
}): string => {
  const storedParams = getStoredUtmParams();
  const attributionParams = resolveCheckoutAttributionParams({
    ctaId,
    section,
    storedParams,
  });

  try {
    const trackedUrl = appendTrackingParamsToUrl(baseUrl, applyAttributionAssistToCheckoutParams({
      ...storedParams,
      ...attributionParams,
      ...extraParams,
    }));

    return appendCheckoutExtraParams(
      applyAffiliateAttributionToCheckoutUrl(trackedUrl),
      extraParams,
    );
  } catch {
    const fallbackUrl = appendTrackingParamsToUrl(DEFAULT_CHECKOUT_URL, applyAttributionAssistToCheckoutParams({
      ...attributionParams,
      ...extraParams,
    }));

    return appendCheckoutExtraParams(
      applyAffiliateAttributionToCheckoutUrl(fallbackUrl),
      extraParams,
    );
  }
};
