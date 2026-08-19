export const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "fbp",
  "fbc",
  "_fbp",
  "_fbc",
  "gclid",
  "gbraid",
  "wbraid",
  "src",
  "sck",
  "s1",
  "s2",
  "s3",
] as const;

export type TrackingParamKey = (typeof TRACKING_PARAM_KEYS)[number];
export type TrackingParams = Partial<Record<TrackingParamKey, string>>;

const STORAGE_KEY = "eu_sou_vibrante_tracking_params";
const VISIT_ATTRIBUTION_PARAM_KEYS: TrackingParamKey[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "src",
  "sck",
];

const canUseStorage = (storage: Storage | undefined): storage is Storage => {
  if (!storage) {
    return false;
  }

  try {
    const testKey = "__esv_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const sanitizeValue = (value: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().slice(0, 160);
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/[<>"'`]/g, "");
};

const readCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!match) {
    return undefined;
  }

  const rawValue = match.split("=").slice(1).join("=");

  try {
    return sanitizeValue(decodeURIComponent(rawValue));
  } catch {
    return sanitizeValue(rawValue);
  }
};

const createFbcFromFbclid = (fbclid: string): string =>
  `fb.1.${Date.now()}.${fbclid}`;

const extractFbclidFromFbc = (fbc: string): string | undefined => {
  const parts = fbc.split(".");

  if (parts.length < 4 || parts[0] !== "fb") {
    return undefined;
  }

  return parts.slice(3).join(".");
};

const readRuntimeAttributionParams = (): TrackingParams => {
  if (typeof window === "undefined") {
    return {};
  }

  const currentParams = extractTrackingParamsFromUrl(window.location.href);
  const storedParams = getStoredTrackingParamsFromStorage();
  const fbp =
    readCookie("_fbp") ??
    currentParams.fbp ??
    currentParams._fbp ??
    storedParams.fbp ??
    storedParams._fbp;
  const cookieFbc = readCookie("_fbc");
  const directFbc = cookieFbc ?? currentParams.fbc ?? currentParams._fbc;
  const urlFbclid = currentParams.fbclid;
  const storedFbc = storedParams.fbc ?? storedParams._fbc;
  const storedFbclid = storedParams.fbclid;
  const fbc =
    directFbc ??
    (urlFbclid && storedFbc && extractFbclidFromFbc(storedFbc) === urlFbclid
      ? storedFbc
      : undefined) ??
    (urlFbclid ? createFbcFromFbclid(urlFbclid) : undefined) ??
    storedFbc ??
    (storedFbclid ? createFbcFromFbclid(storedFbclid) : undefined);

  return {
    ...currentParams,
    ...(fbp ? { fbp, _fbp: fbp } : {}),
    ...(fbc ? { fbc, _fbc: fbc } : {}),
  };
};

const readStored = (storage: Storage | undefined): TrackingParams => {
  if (!canUseStorage(storage)) {
    return {};
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as TrackingParams;
    return TRACKING_PARAM_KEYS.reduce<TrackingParams>((acc, key) => {
      const value = sanitizeValue(parsed[key] ?? null);
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const writeStored = (storage: Storage | undefined, params: TrackingParams) => {
  if (!canUseStorage(storage)) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // Storage may be full or blocked; tracking must never break the page.
  }
};

export const extractTrackingParamsFromUrl = (url?: string): TrackingParams => {
  const sourceUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  if (!sourceUrl) {
    return {};
  }

  let searchParams: URLSearchParams;

  try {
    searchParams = new URL(
      sourceUrl,
      typeof window !== "undefined" ? window.location.origin : "https://eusouvibrante.com",
    ).searchParams;
  } catch {
    return {};
  }

  return TRACKING_PARAM_KEYS.reduce<TrackingParams>((acc, key) => {
    const value = sanitizeValue(searchParams.get(key));
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const getStoredUtmParams = (): TrackingParams => {
  if (typeof window === "undefined") {
    return {};
  }

  const currentUrlParams = extractTrackingParamsFromUrl(window.location.href);
  const runtimeParams = readRuntimeAttributionParams();

  if (hasVisitAttributionSignal(currentUrlParams)) {
    return runtimeParams;
  }

  return {
    ...getStoredTrackingParamsFromStorage(),
    ...runtimeParams,
  };
};

export const hasVisitAttributionSignal = (params: TrackingParams): boolean =>
  VISIT_ATTRIBUTION_PARAM_KEYS.some((key) => Boolean(params[key]));

const getStoredTrackingParamsFromStorage = (): TrackingParams => {
  if (typeof window === "undefined") {
    return {};
  }

  const localParams = readStored(window.localStorage);
  const sessionParams = readStored(window.sessionStorage);

  return {
    ...sessionParams,
    ...localParams,
  };
};

export const persistUtmParamsFromUrl = (): TrackingParams => {
  if (typeof window === "undefined") {
    return {};
  }

  const currentParams = readRuntimeAttributionParams();
  const existing = getStoredTrackingParamsFromStorage();
  const currentUrlParams = extractTrackingParamsFromUrl(window.location.href);
  const merged = hasVisitAttributionSignal(currentUrlParams)
    ? currentParams
    : {
        ...existing,
        ...currentParams,
      };

  if (Object.keys(merged).length > 0) {
    writeStored(window.localStorage, merged);
    writeStored(window.sessionStorage, merged);
  }

  return merged;
};

export const appendTrackingParamsToUrl = (
  baseUrl: string,
  params: TrackingParams,
): string => {
  const url = new URL(baseUrl);

  TRACKING_PARAM_KEYS.forEach((key) => {
    const value = sanitizeValue(params[key] ?? null);
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};
