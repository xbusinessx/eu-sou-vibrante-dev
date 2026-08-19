import footerMark from "../assets/original/footer-mark.png";
import footerSymbol from "../assets/original/footer-symbol.png";

export const Footer = () => (
  <footer className="site-footer" id="aviso-legal">
    <div className="site-footer-inner">
      <div className="site-footer-brand">
        <div className="site-footer-logos" aria-label="Marcas Eu Sou Vibrante e Portal da Consciência">
          <img src={footerMark} alt="Eu Sou Vibrante" className="site-footer-mark" loading="lazy" />
          <span aria-hidden="true" />
          <img
            src={footerSymbol}
            alt="Portal da Consciência"
            className="site-footer-symbol"
            loading="lazy"
          />
        </div>
        <p>Estudo, percepção e presença em uma jornada para revisitar.</p>
      </div>

      <div className="site-footer-legal">
        <strong>Aviso de transparência</strong>
        <p>
          O Portal da Consciência oferece conteúdo educacional e espiritual para estudo e
          reflexão. Não promete resultados específicos e não substitui diagnóstico, tratamento ou
          orientação de profissionais de saúde. A marca não possui relação institucional com Meta,
          Facebook ou Google.
        </p>
      </div>

      <div className="site-footer-bottom">
        <p>© 2026 Eu Sou Vibrante. Todos os direitos reservados.</p>
        <nav className="site-footer-links" aria-label="Links legais">
          <a href="/politica-de-privacidade.html" target="_blank" rel="noreferrer">
            Política de Privacidade
          </a>
          <a href="#duvidas">Suporte</a>
          <a href="#topo">Voltar ao topo ↑</a>
        </nav>
      </div>
    </div>
  </footer>
);
