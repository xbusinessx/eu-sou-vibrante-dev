import { AFFILIATE_REGISTRY, type AffiliateDefinition } from "../data/affiliates";
import { extractTrackingParamsFromUrl } from "./utm";

export type AffiliateAttribution = {
  afid: string;
  affiliateLabel: string;
  firstTouchTimestamp: number;
  latestTouchTimestamp: number;
  expiresAt: number | null;
  attributionWindowDays: number | null;
  landingPageUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type AffiliateCaptureResult = {
  status: "absent" | "captured" | "refreshed" | "rejected";
  attribution: AffiliateAttribution | null;
};

const STORAGE_KEY = "eu_sou_vibrante_affiliate_attribution";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const VALID_AFID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;
const affiliateRegistry = new Map<string, AffiliateDefinition>(
  AFFILIATE_REGISTRY.map((affiliate) => [affiliate.afid, affiliate]),
);

const canUseStorage = (storage: Storage | undefined): storage is Storage => {
  if (!storage) {
    return false;
  }

  try {
    const testKey = "__esv_affiliate_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const sanitizeAfid = (value: string | null): string | undefined => {
  const trimmed = value?.trim();

  if (!trimmed || !VALID_AFID_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
};

const getEnabledAffiliate = (afid: string | undefined): AffiliateDefinition | undefined => {
  if (!afid) {
    return undefined;
  }

  const affiliate = affiliateRegistry.get(afid);
  return affiliate?.enabled ? affiliate : undefined;
};

const getExpirationTimestamp = (
  latestTouchTimestamp: number,
  affiliate: AffiliateDefinition,
): number | null =>
  affiliate.attributionWindowDays === null
    ? null
    : latestTouchTimestamp + affiliate.attributionWindowDays * MS_PER_DAY;

const getCurrentUrlAfid = (): { afid?: string; hasAfidParam: boolean } => {
  if (typeof window === "undefined") {
    return { hasAfidParam: false };
  }

  try {
    const url = new URL(window.location.href);
    return {
      afid: sanitizeAfid(url.searchParams.get("afid")),
      hasAfidParam: url.searchParams.has("afid"),
    };
  } catch {
    return { hasAfidParam: false };
  }
};

const getSafeLandingPageUrl = (): string => {
  if (typeof window === "undefined") {
    return "https://eusouvibrante.com/";
  }

  return `${window.location.origin}${window.location.pathname}`;
};

const removeStoredAttribution = () => {
  if (typeof window === "undefined" || !canUseStorage(window.localStorage)) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage availability must never affect the checkout experience.
  }
};

const readStoredAttribution = (now = Date.now()): AffiliateAttribution | null => {
  if (typeof window === "undefined" || !canUseStorage(window.localStorage)) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as AffiliateAttribution;
    const afid = sanitizeAfid(parsed.afid ?? null);
    const affiliate = getEnabledAffiliate(afid);

    if (
      !affiliate ||
      !Number.isFinite(parsed.firstTouchTimestamp) ||
      !Number.isFinite(parsed.latestTouchTimestamp)
    ) {
      removeStoredAttribution();
      return null;
    }

    const expiresAt = getExpirationTimestamp(parsed.latestTouchTimestamp, affiliate);

    if (expiresAt !== null && now > expiresAt) {
      removeStoredAttribution();
      return null;
    }

    return {
      ...parsed,
      afid: affiliate.afid,
      affiliateLabel: affiliate.label,
      attributionWindowDays: affiliate.attributionWindowDays,
      expiresAt,
    };
  } catch {
    removeStoredAttribution();
    return null;
  }
};

const writeStoredAttribution = (attribution: AffiliateAttribution) => {
  if (typeof window === "undefined" || !canUseStorage(window.localStorage)) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Affiliate attribution is additive and must never block navigation.
  }
};

export const persistAffiliateAttributionFromUrl = (
  now = Date.now(),
): AffiliateCaptureResult => {
  const { afid, hasAfidParam } = getCurrentUrlAfid();

  if (!hasAfidParam) {
    return {
      status: "absent",
      attribution: readStoredAttribution(now),
    };
  }

  const affiliate = getEnabledAffiliate(afid);

  if (!affiliate) {
    return {
      status: "rejected",
      attribution: readStoredAttribution(now),
    };
  }

  const existing = readStoredAttribution(now);
  const isSameAffiliate = existing?.afid === affiliate.afid;
  const trackingParams =
    typeof window !== "undefined" ? extractTrackingParamsFromUrl(window.location.href) : {};
  const attribution: AffiliateAttribution = {
    afid: affiliate.afid,
    affiliateLabel: affiliate.label,
    firstTouchTimestamp: isSameAffiliate ? existing.firstTouchTimestamp : now,
    latestTouchTimestamp: now,
    expiresAt: getExpirationTimestamp(now, affiliate),
    attributionWindowDays: affiliate.attributionWindowDays,
    landingPageUrl: isSameAffiliate ? existing.landingPageUrl : getSafeLandingPageUrl(),
    utmSource: trackingParams.utm_source ?? (isSameAffiliate ? existing.utmSource : undefined),
    utmMedium: trackingParams.utm_medium ?? (isSameAffiliate ? existing.utmMedium : undefined),
    utmCampaign:
      trackingParams.utm_campaign ?? (isSameAffiliate ? existing.utmCampaign : undefined),
  };

  writeStoredAttribution(attribution);

  return {
    status: isSameAffiliate ? "refreshed" : "captured",
    attribution,
  };
};

export const getActiveAffiliateAttribution = (
  now = Date.now(),
): AffiliateAttribution | null => readStoredAttribution(now);

export const getAffiliateAttributionAgeDays = (
  attribution: AffiliateAttribution,
  now = Date.now(),
): number => Math.max(0, Math.floor((now - attribution.firstTouchTimestamp) / MS_PER_DAY));

export const applyAffiliateAttributionToCheckoutUrl = (
  urlString: string,
  now = Date.now(),
): string => {
  persistAffiliateAttributionFromUrl(now);

  const url = new URL(urlString);
  const attribution = readStoredAttribution(now);

  // Never trust an afid embedded in a checkout base URL or supplied by a caller.
  url.searchParams.delete("afid");

  if (attribution) {
    url.searchParams.set("afid", attribution.afid);
  }

  return url.toString();
};
