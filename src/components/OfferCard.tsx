import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";

const includedItems = [
  "19 módulos organizados em 8 eixos de estudo",
  "Práticas integrativas e frequências sonoras de apoio",
  "Acesso imediato à plataforma após a confirmação",
  "Acesso vitalício para estudar e revisitar no seu ritmo",
];

export const OfferCard = () => (
  <div className="access-gate">
    <div className="access-price">
      <div className="access-price-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="access-price-label">Acesso completo · pagamento único</p>
      <div className="access-price-value">
        <small>R$</small>
        <strong>147</strong>
        <span>à vista</span>
      </div>
      <p className="access-price-installment">
        ou em até <strong>12x de R$ 15,20</strong>
      </p>

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
      <p className="access-security">
        <LockKeyhole aria-hidden="true" /> Compra processada em ambiente seguro
      </p>
    </div>

    <div className="access-gate-copy">
      <div className="section-signal">
        <span>06</span>
        <p>Acesso ao núcleo completo</p>
      </div>
      <h2>
        O mapa está aberto.<br />
        <span>A travessia é sua.</span>
      </h2>
      <p className="access-gate-lead">
        Entre uma vez e revisite o conteúdo sempre que um novo momento pedir outra leitura.
      </p>

      <ul className="access-manifest">
        {includedItems.map((item) => (
          <li key={item}>
            <Check aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
