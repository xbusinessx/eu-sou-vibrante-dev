const GA4_ID = import.meta.env.VITE_GA4_ID || "G-C6XY55NJG0";
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "848117227912665";

let hasInitializedGa4 = false;
let hasInitializedMetaPixel = false;

type GtagBootstrap = (...args: unknown[]) => void;

type FbqBootstrap = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: FbqBootstrap;
  queue?: unknown[];
  version?: string;
};

const loadScriptOnce = (id: string, src: string) => {
  if (typeof document === "undefined" || document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const getGlobalWindow = () =>
  window as Window &
    typeof globalThis & {
      dataLayer?: unknown[];
      gtag?: GtagBootstrap;
      __ESV_GA4_INITIALIZED__?: boolean;
      __ESV_META_PIXEL_INITIALIZED__?: boolean;
    };

const ensureGoogleTag = () => {
  const globalWindow = getGlobalWindow();

  globalWindow.dataLayer = globalWindow.dataLayer || [];
  globalWindow.gtag =
    globalWindow.gtag ||
    function gtag(...args: unknown[]) {
      globalWindow.dataLayer?.push(args);
    };

  return globalWindow;
};

const loadGa4 = () => {
  const globalWindow = ensureGoogleTag();

  if (hasInitializedGa4 || globalWindow.__ESV_GA4_INITIALIZED__) {
    hasInitializedGa4 = true;
    return;
  }

  loadScriptOnce("ga4-script", `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  globalWindow.gtag?.("js", new Date());
  globalWindow.gtag?.("config", GA4_ID);
  hasInitializedGa4 = true;
  globalWindow.__ESV_GA4_INITIALIZED__ = true;
};

const loadMetaPixel = () => {
  const globalWindow = window as Window &
    typeof globalThis & {
      _fbq?: FbqBootstrap;
      fbq?: FbqBootstrap;
      __ESV_META_PIXEL_INITIALIZED__?: boolean;
    };

  if (hasInitializedMetaPixel || globalWindow.__ESV_META_PIXEL_INITIALIZED__) {
    hasInitializedMetaPixel = true;
    return;
  }

  if (!globalWindow.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }

      fbq.queue?.push(args);
    }) as FbqBootstrap;

    globalWindow.fbq = fbq;
    globalWindow._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
  }

  loadScriptOnce("meta-pixel-script", "https://connect.facebook.net/en_US/fbevents.js");
  globalWindow.fbq("init", META_PIXEL_ID);
  globalWindow.fbq("track", "PageView");
  hasInitializedMetaPixel = true;
  globalWindow.__ESV_META_PIXEL_INITIALIZED__ = true;
};

export const loadMarketingScripts = () => {
  if (typeof window === "undefined") {
    return;
  }

  loadGa4();
  loadMetaPixel();
};
