import logoMark from "../assets/original/brand-logo-mark.png";

type AnimatedLogoProps = {
  className?: string;
  compact?: boolean;
};

export const AnimatedLogo = ({ className = "", compact = false }: AnimatedLogoProps) => (
  <div
    className={`animated-logo-shell${compact ? " animated-logo-shell-compact" : ""} ${className}`.trim()}
    aria-hidden="true"
  >
    <img
      src={logoMark}
      alt=""
      className="animated-logo-mark"
      draggable={false}
    />
    <span className="animated-logo-aura" />
  </div>
);
