/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHECKOUT_URL?: string;
  readonly VITE_GTM_ID?: string;
  readonly VITE_GA4_ID?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_GOOGLE_ADS_ID?: string;
  readonly VITE_GOOGLE_ADS_LABEL?: string;
  readonly VITE_ENABLE_ATTRIBUTION_ASSIST?: string;
  readonly VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
