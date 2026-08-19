import {
  AudioWaveform,
  Check,
  Infinity as InfinityIcon,
  LockKeyhole,
  Monitor,
  ShieldCheck,
  Zap,
} from "lucide-react";
import offerBg from "../assets/optimized/offer-bg.webp";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";

const includedItems = [
  "19 módulos organizados em 8 eixos de estudo",
  "Práticas integrativas e frequências sonoras de apoio",
  "Acesso imediato à plataforma após a confirmação",
  "Acesso vitalício para estudar e revisitar no seu ritmo",
];

const accessFacts = [
  { label: "100% on-line", icon: Monitor },
  { label: "Acesso imediato", icon: Zap },
  { label: "Pagamento seguro", icon: LockKeyhole },
  { label: "Acesso vitalício", icon: InfinityIcon },
];

export const OfferCard = () => (
  <div className="offer-card section-container">
    <img src={offerBg} alt="" loading="lazy" decoding="async" className="offer-art" aria-hidden="true" />
    <div className="offer-grid" aria-hidden="true" />

    <div className="offer-copy">
      <p className="eyebrow">Seu acesso ao Portal</p>
      <h2 className="section-title">
        O mapa completo, <em>aberto para você.</em>
      </h2>
      <p className="offer-lead">
        Uma única entrada para percorrer todo o conteúdo disponível hoje e revisitar a jornada
        sempre que um novo momento pedir outra leitura.
      </p>

      <ul className="offer-inclusions">
        {includedItems.map((item) => (
          <li key={item}>
            <span><Check aria-hidden="true" /></span>
            {item}
          </li>
        ))}
      </ul>

      <div className="offer-facts">
        {accessFacts.map(({ label, icon: Icon }) => (
          <span key={label}><Icon aria-hidden="true" />{label}</span>
        ))}
      </div>
    </div>

    <div className="price-card">
      <div className="price-card-top">
        <AudioWaveform aria-hidden="true" />
        <span>Acesso completo</span>
      </div>

      <div className="price-value">
        <p>De <s>R$ 397</s> por</p>
        <div><span>R$</span><strong>147</strong></div>
        <small>à vista</small>
      </div>

      <p className="price-installment">ou em até <strong>12x de R$ 15,20</strong></p>

      <TrackedCheckoutButton
        label="Acessar o Portal agora"
        ctaId="offer_primary"
        section="investimento"
        className="offer-primary-cta"
      />

      <div className="price-guarantee">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>7 dias para conhecer por dentro</strong>
          <p>Se não fizer sentido para você, solicite o reembolso integral dentro do prazo.</p>
        </div>
      </div>

      <p className="price-safe-note">
        <LockKeyhole aria-hidden="true" />
        Compra processada em ambiente seguro
      </p>
    </div>
  </div>
);
