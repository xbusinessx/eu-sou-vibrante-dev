import { motion, useReducedMotion } from "framer-motion";
import { portalModules } from "../data/modules";

export const ModuleShowcase = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="module-grid mx-auto mt-12 max-w-7xl">
      {portalModules.map((module, index) => (
        <motion.article
          key={module.title}
          className="module-card"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.24 }}
          transition={{
            duration: 0.62,
            delay: Math.min(index * 0.06, 0.36),
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={shouldReduceMotion ? undefined : { y: -6 }}
        >
          <div className="module-card-glow" aria-hidden="true" />
          <div className="module-card-content">
            <p className="module-card-kicker">{String(index + 1).padStart(2, "0")}</p>
            <h3>{module.title}</h3>
            <p className="module-subtitle">{module.subtitle}</p>
            <ul>
              {module.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </motion.article>
      ))}
    </div>
  );
};
