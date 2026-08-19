import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { useRef, useState } from "react";
import {
  getActiveAffiliateAttribution,
  getAffiliateAttributionAgeDays,
} from "../lib/affiliateAttribution";
import {
  buildCheckoutUrlForCta,
  resolveCheckoutAttributionParams,
  type CheckoutExtraParams,
} from "../lib/checkout";
import { trackCheckoutIntent, trackCtaClick } from "../lib/tracking";

type ButtonVariant = "primary" | "secondary" | "ghost";

type TrackedCheckoutButtonProps = {
  label: string;
  ctaId: string;
  section: string;
  variant?: ButtonVariant;
  className?: string;
  newTab?: boolean;
  checkoutParams?: CheckoutExtraParams;
  onBeforeCheckout?: (destination: string) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick">;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export const TrackedCheckoutButton = ({
  label,
  ctaId,
  section,
  variant = "primary",
  className = "",
  newTab = false,
  checkoutParams,
  onBeforeCheckout,
  type = "button",
  ...buttonProps
}: TrackedCheckoutButtonProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);

  const handleClick = () => {
    if (isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    setIsNavigating(true);

    const attributionParams = resolveCheckoutAttributionParams({ ctaId, section });
    const destination = buildCheckoutUrlForCta({
      ctaId,
      section,
      extraParams: checkoutParams,
    });
    const affiliateAttribution = getActiveAffiliateAttribution();

    const payload = {
      cta_id: ctaId,
      cta_label: label,
      section,
      destination,
      coupon_code: checkoutParams?.coupon,
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
      ...attributionParams,
    };

    onBeforeCheckout?.(destination);
    trackCtaClick(payload);

    const navigate = () => {
      if (newTab) {
        window.open(destination, "_blank", "noopener,noreferrer");
        isNavigatingRef.current = false;
        setIsNavigating(false);
        return;
      }

      window.location.assign(destination);
    };

    void trackCheckoutIntent(payload).finally(navigate);
  };

  return (
    <button
      {...buttonProps}
      type={type}
      aria-label={buttonProps["aria-label"] ?? label}
      className={`${variantClasses[variant]} ${className}`}
      disabled={buttonProps.disabled || isNavigating}
      onClick={handleClick}
    >
      <span className="btn-label">{label}</span>
      <span className="btn-icon" aria-hidden="true"><ArrowUpRight /></span>
    </button>
  );
};
