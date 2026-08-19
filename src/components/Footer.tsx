import footerSymbol from "../assets/original/footer-symbol.png";
import portalCover from "../assets/original/portal-cover.png";

export const Footer = () => (
  <footer className="site-footer" id="aviso-legal">
    <div className="site-footer-inner">
      <div className="footer-signature">
        <img className="footer-wordmark" src={portalCover} alt="Portal da Consciência" loading="lazy" decoding="async" />
        <p>Um caderno de estudos para perceber, relacionar e revisitar.</p>
      </div>

      <img className="footer-symbol" src={footerSymbol} alt="" aria-hidden="true" loading="lazy" decoding="async" />

      <div className="site-footer-legal">
        <strong>Nota de transparência</strong>
        <p>
          Conteúdo educacional e espiritual para estudo e reflexão. Não promete resultados
          específicos e não substitui diagnóstico, tratamento ou orientação profissional. A marca
          não possui relação institucional com Meta, Facebook ou Google.
        </p>
      </div>

      <div className="site-footer-bottom">
        <p>© 2026 Eu Sou Vibrante · caderno 01</p>
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
