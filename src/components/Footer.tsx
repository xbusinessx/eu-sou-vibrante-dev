import footerMark from "../assets/original/footer-mark.png";
import footerSymbol from "../assets/original/footer-symbol.png";

export const Footer = () => (
  <footer className="site-footer" id="aviso-legal">
    <div className="site-footer-inner">
      <div className="site-footer-logos" aria-label="Marcas Eu Sou Vibrante e Portal da Consciência">
        <img src={footerMark} alt="Eu Sou Vibrante" className="site-footer-mark" loading="lazy" />
        <img
          src={footerSymbol}
          alt="Portal da Consciência"
          className="site-footer-symbol"
          loading="lazy"
        />
      </div>

      <p className="site-footer-legal">
        <strong>Aviso legal:</strong> O Portal da Consciência não tem nenhuma relação institucional
        com o Google e Facebook. Ao abordar questões financeiras, de qualquer um dos nossos
        produtos, sites, vídeos, programas ou outros conteúdos, fazemos todos os esforços para
        garantir que estes representem fielmente a sua capacidade de transformação humana e
        espiritual. No entanto, não garantimos que você obterá resultados específicos sem a
        aplicação consistente dos recursos e técnicas oferecidos em nosso treinamento.
      </p>

      <p className="site-footer-copyright">Copyright 2026 © Eu Sou Vibrante</p>
      <nav className="site-footer-links" aria-label="Links legais">
        <a href="/politica-de-privacidade.html" target="_blank" rel="noreferrer">
          Política de Privacidade
        </a>
        <a href="#duvidas">Suporte</a>
      </nav>
      <p className="site-footer-rights">Todos os direitos reservados.</p>
    </div>
  </footer>
);
