import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { faqItems } from "../data/faq";
import { trackEvent } from "../lib/tracking";
import { TrackedSectionLink } from "./TrackedSectionLink";

const WHATSAPP_SUPPORT_URL =
  "https://wa.me/5582996935989?text=Ol%C3%A1!%20Tenho%20interesse%20em%20acessar%20o%20Portal%20da%20Consci%C3%AAncia%20e%20gostaria%20de%20entender%20melhor%20como%20funciona.";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const toggleItem = (index: number, question: string) => {
    const nextIndex = openIndex === index ? null : index;
    setOpenIndex(nextIndex);

    if (nextIndex !== null) {
      trackEvent("faq_open", {
        faq_index: index,
        question,
      });
    }
  };

  return (
    <div className="faq-shell">
      <div className="faq-stack">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={item.question} className={`faq-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                onClick={() => toggleItem(index, item.question)}
              >
                <span className="font-medium">{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gold transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-panel-${index}`}
                    initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion ? undefined : { height: "auto", opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="faq-answer">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="faq-support">
        <div>
          <strong>Ainda quer conversar antes de decidir?</strong>
          <span>O suporte responde suas dúvidas sobre acesso, formato e pagamento.</span>
        </div>
        <TrackedSectionLink
          href={WHATSAPP_SUPPORT_URL}
          label="Falar com o suporte"
          ctaId="faq_whatsapp_support"
          section="duvidas"
          variant="primary"
          endIcon="right"
          target="_blank"
          rel="noreferrer"
          aria-label="Falar com o suporte pelo WhatsApp"
        />
      </div>
    </div>
  );
};
