import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";
import { TrackedSectionLink } from "./TrackedSectionLink";

const navItems = [
  { label: "O Portal", href: "#portal" },
  { label: "Campo Vibracional", href: "#campo" },
  { label: "O Que Abre", href: "#conteudo" },
  { label: "Investimento", href: "#investimento" },
  { label: "Suporte", href: "#duvidas" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-amber-300/10 bg-black/75 backdrop-blur-2xl">
      <div className="site-header-inner flex h-[76px] w-full items-center justify-between">
        <a href="#topo" className="group flex shrink-0 items-center" aria-label="Eu Sou Vibrante">
          <AnimatedLogo compact className="h-10 w-16" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <TrackedSectionLink
            href="#chamado"
            label="Saiba mais"
            ctaId="header_learn_more"
            section="header"
            endIcon="down"
          />
        </div>

        <button
          type="button"
          className="icon-button shrink-0 lg:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-black/95 px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="Navegação mobile">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm text-pearl/80 hover:bg-white/10 hover:text-pearl"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <TrackedSectionLink
            href="#chamado"
            label="Saiba mais"
            ctaId="mobile_header_learn_more"
            section="mobile_header"
            variant="primary"
            className="mt-4 w-full justify-center"
            endIcon="down"
            onTrackedClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </header>
  );
};
