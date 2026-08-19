import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{
  id: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}>;

export const Section = ({
  id,
  eyebrow,
  title,
  description,
  className = "",
  children,
}: SectionProps) => {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = !shouldReduceMotion && !className.includes("after-hero-section");

  return (
    <motion.section
      id={id}
      data-track-section={id}
      className={`section-shell ${className}`}
      initial={shouldAnimate ? { opacity: 0, y: 28 } : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {(eyebrow || title || description) && (
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2 className="section-title">{title}</h2>}
          {description && <p className="section-description">{description}</p>}
        </div>
      )}
      {children}
    </motion.section>
  );
};
