import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import offerArt from "../assets/optimized/offer-bg.webp";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";

const includedItems = [
  "19 módulos organizados em 8 eixos de estudo",
  "Práticas integrativas e frequências sonoras de apoio",
  "Acesso imediato à plataforma após a confirmação",
  "Acesso vitalício para estudar e revisitar no seu ritmo",
];

export const OfferCard = () => (
  <div className="access-letter">
    <aside className="access-engraving" aria-hidden="true">
      <img src={offerArt} alt="" loading="lazy" decoding="async" />
      <span>fig. 06</span>
      <em>se esse é o seu momento,<br />o portal está aberto</em>
    </aside>

    <div className="access-sheet">
      <header>
        <p className="folio-kicker"><span>06</span> Folha de acesso</p>
        <h2>O mapa está aberto.<br /><em>A travessia é sua.</em></h2>
        <p>
          Entre uma vez e revisite o conteúdo sempre que um novo momento pedir outra leitura.
        </p>
      </header>

      <div className="access-price-block">
        <p>Acesso completo · pagamento único</p>
        <div className="access-price-value">
          <small>R$</small>
          <strong>147</strong>
          <span>à vista</span>
        </div>
        <p className="access-price-installment">
          ou em até <strong>12x de R$ 15,20</strong>
        </p>
      </div>

      <TrackedCheckoutButton
        label="Acessar o Portal agora"
        ctaId="offer_primary"
        section="investimento"
        className="offer-primary-cta"
      />

      <div className="access-guarantee">
        <ShieldCheck aria-hidden="true" />
        <p>
          <strong>7 dias para conhecer por dentro.</strong>
          Se não fizer sentido, solicite o reembolso integral dentro do prazo.
        </p>
      </div>

      <details className="access-manifest-details">
        <summary>O que está incluído</summary>
        <ul className="access-manifest">
          {includedItems.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </details>

      <p className="access-security">
        <LockKeyhole aria-hidden="true" /> Compra processada em ambiente seguro
      </p>
      <div className="guarantee-stamp" aria-hidden="true"><b>7</b><span>dias</span></div>
    </div>
  </div>
);
