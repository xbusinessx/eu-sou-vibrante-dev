import { Infinity as InfinityIcon, LockKeyhole, Monitor, ShieldCheck, Zap } from "lucide-react";
import offerBg from "../assets/original/offer-bg.png";
import { TrackedCheckoutButton } from "./TrackedCheckoutButton";

const offerBadges = [
  { label: "Conteúdo 100% On-line", icon: Monitor },
  { label: "Acesso Imediato", icon: Zap },
  { label: "Pagamento Seguro", icon: LockKeyhole },
  { label: "Acesso Vitalício", icon: InfinityIcon },
];

export const OfferCard = () => (
  <div className="offer-original mx-auto max-w-6xl overflow-hidden rounded-lg border border-amber-300/25 bg-black/75 shadow-gold">
    <img
      src={offerBg}
      alt=""
      loading="lazy"
      className="offer-original-bg"
      aria-hidden="true"
    />

    <div className="offer-original-content relative p-7 text-center md:p-10">
      <p className="offer-kicker">Acesso ao Portal da Consciência</p>
      <h2 className="mx-auto max-w-4xl font-display text-3xl font-semibold leading-tight text-pearl md:text-5xl">
        Se esse é o seu momento, o portal está aberto
      </h2>
      <p className="offer-subtitle mx-auto mt-5">
        Entre agora, receba acesso imediato e siga com a segurança de uma garantia simples: se não
        fizer sentido para sua jornada, você recebe seu investimento de volta.
      </p>

      <div className="offer-price-panel mx-auto mt-8">
        <div className="offer-value-row">
          <span className="offer-old-price">
            Valor original <s>R$ 397</s>
          </span>
          <span className="offer-discount-badge">Economize R$ 250 • 63% OFF</span>
        </div>

        <div className="offer-current-price">
          <span>Hoje à vista</span>
          <strong>R$ 147</strong>
        </div>

        <div className="offer-installment-line">
          <span>ou em até</span>
          <strong>12x de R$ 15,20</strong>
        </div>
      </div>

      <TrackedCheckoutButton
        label="Acessar o Portal agora"
        ctaId="offer_primary"
        section="investimento"
        variant="primary"
        className="mx-auto mt-8 justify-center"
      />

      <div className="offer-badges mx-auto mt-9">
        {offerBadges.map(({ label, icon: Icon }) => (
          <span key={label}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>

      <div className="offer-guarantee mx-auto mt-7">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        <span>7 dias de garantia incondicional</span>
      </div>

      <p className="offer-safe-note mx-auto mt-8">
        Compra segura, acesso vitalício e 7 dias para sentir se o Portal conversa com você.
      </p>

      <p className="offer-bridge mx-auto mt-10">
        Este material foi canalizado, escrito e organizado para ser a ponte entre quem você é
        hoje... e a essência vibracional que aguarda ser plenamente revelada por você.
      </p>
    </div>
  </div>
);
