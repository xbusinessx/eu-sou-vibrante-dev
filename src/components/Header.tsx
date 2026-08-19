import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";

const navItems = [
  { label: "O Portal", href: "#portal" },
  { label: "Conteúdo", href: "#conteudo" },
  { label: "Como funciona", href: "#ritmo" },
  { label: "Investimento", href: "#investimento" },
  { label: "Dúvidas", href: "#duvidas" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);

  const closeMenuAndFocusToggle = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => menuToggleRef.current?.focus());
  };

  const closeMenuAndFocusSection = (href: string) => {
    setIsOpen(false);
    window.requestAnimationFrame(() => {
      const destination = document.querySelector<HTMLElement>(href);
      if (!destination) return;
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    let frame = 0;

    const updateHeader = () => {
      frame = 0;
      const scrollRange = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
      progressRef.current?.style.setProperty("--reading-progress", String(progress));
      headerRef.current?.classList.toggle("is-scrolled", window.scrollY > 16);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHeader);
    };

    updateHeader();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenuAndFocusToggle();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header-inner">
        <a href="#topo" className="brand-lockup" aria-label="Portal da Consciência — início">
          <AnimatedLogo compact className="brand-mark" />
          <span>
            <small>Eu Sou Vibrante</small>
            <strong>Portal da Consciência</strong>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-action">
          <TrackedCheckoutButton
            label="Acessar agora"
            ctaId="header_checkout"
            section="header"
            className="header-cta"
          />
        </div>

        <button
          ref={menuToggleRef}
          type="button"
          className="menu-toggle"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-navigation ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <nav aria-label="Navegação mobile">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => closeMenuAndFocusSection(item.href)}
            >
              <span>{item.label}</span>
              <small>↘</small>
            </a>
          ))}
        </nav>
        <TrackedCheckoutButton
          label="Acessar por R$ 147"
          ctaId="mobile_header_checkout"
          section="mobile_header"
          className="mobile-header-cta"
          tabIndex={isOpen ? 0 : -1}
          onBeforeCheckout={closeMenuAndFocusToggle}
        />
      </div>

      <div className="header-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </header>
  );
};
