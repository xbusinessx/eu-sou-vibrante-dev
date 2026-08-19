import { AnimatedLogo } from "./AnimatedLogo";

export const Footer = () => (
  <footer className="site-footer" id="aviso-legal">
    <div className="site-footer-inner">
      <div className="footer-signature">
        <AnimatedLogo compact className="footer-symbol" />
        <div>
          <span>Eu Sou Vibrante</span>
          <strong>Portal da Consciência</strong>
        </div>
      </div>

      <p className="footer-statement">Uma arquitetura para estudar, perceber e revisitar.</p>

      <div className="site-footer-legal">
        <strong>Transparência</strong>
        <p>
          Conteúdo educacional e espiritual para estudo e reflexão. Não promete resultados
          específicos e não substitui diagnóstico, tratamento ou orientação profissional. A marca
          não possui relação institucional com Meta, Facebook ou Google.
        </p>
      </div>

      <div className="site-footer-bottom">
        <p>© 2026 Eu Sou Vibrante</p>
        <nav aria-label="Links legais">
          <a href="/politica-de-privacidade.html" target="_blank" rel="noreferrer">
            Privacidade
          </a>
          <a href="#duvidas">Suporte</a>
          <a href="#topo">Topo ↑</a>
        </nav>
      </div>
    </div>
  </footer>
);
