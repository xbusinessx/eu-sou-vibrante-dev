export type AffiliateDefinition = {
  afid: string;
  label: string;
  enabled: boolean;
  attributionWindowDays: number | null;
};

// Add future Kiwify affiliates here. Only enabled IDs are accepted from URLs.
export const AFFILIATE_REGISTRY = [
  {
    afid: "0KuZXSqT",
    label: "affiliate_01",
    enabled: true,
    // null keeps attribution active without an application-defined expiration date.
    attributionWindowDays: null,
  },
] satisfies readonly AffiliateDefinition[];
