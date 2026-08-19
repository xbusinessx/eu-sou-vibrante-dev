import { ArrowDown, ArrowRight } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import { trackCtaClick } from "../lib/tracking";

type LinkVariant = "primary" | "secondary" | "ghost";
type EndIcon = "down" | "right";

type TrackedSectionLinkProps = {
  label: string;
  ctaId: string;
  section: string;
  href: string;
  variant?: LinkVariant;
  className?: string;
  endIcon?: EndIcon;
  onTrackedClick?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href" | "onClick">;

const variantClasses: Record<LinkVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export const TrackedSectionLink = ({
  label,
  ctaId,
  section,
  href,
  variant = "primary",
  className = "",
  endIcon = "down",
  onTrackedClick,
  ...anchorProps
}: TrackedSectionLinkProps) => {
  const Icon = endIcon === "right" ? ArrowRight : ArrowDown;

  const handleClick = () => {
    trackCtaClick({
      cta_id: ctaId,
      cta_label: label,
      section,
      destination: href,
    });

    onTrackedClick?.();
  };

  return (
    <a
      {...anchorProps}
      href={href}
      aria-label={anchorProps["aria-label"] ?? label}
      className={`${variantClasses[variant]} ${className}`}
      onClick={handleClick}
    >
      <span className="btn-label">{label}</span>
      <span className="btn-icon" aria-hidden="true"><Icon /></span>
    </a>
  );
};
