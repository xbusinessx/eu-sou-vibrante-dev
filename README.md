# Eu Sou Vibrante

Landing page premium para o produto **Portal da Consciência**, construída em Vite, React e TypeScript, com estética cósmica/espiritual sofisticada e arquitetura pronta para tracking futuro.

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Node.js 22.x para deploy
- npm

## Rodando localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

O output final é gerado em `dist/`.

## Preview local

```bash
npm run preview
```

## Deploy na Hostinger

Use a opção **Node.js Web App** com Node.js `22.x`.

- Install command: `npm ci` se houver `package-lock.json`, ou `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Como o projeto é front-end-only, ele não precisa de backend persistente. Se a Hostinger exigir um entry file, consulte `docs/HOSTINGER-DEPLOY.md` para o fallback com servidor estático.

## Tracking

O tracking está centralizado em:

- `src/lib/tracking.ts`
- `src/lib/utm.ts`
- `src/lib/marketing.ts`
- `src/lib/attributionAssist.ts`
- `src/lib/checkout.ts`
- `src/components/TrackedCheckoutButton.tsx`

O site captura UTMs, preserva parâmetros aceitos, carrega GA4/Meta Pixel por padrão via `src/lib/marketing.ts` e envia eventos para `window.dataLayer`, `window.gtag` e `window.fbq` quando disponíveis.

Não existe banner de consentimento ativo nesta versão. O rastreamento fica permitido por padrão para preservar a leitura do funil; uma camada de consentimento pode ser reimplementada no futuro.

Os placeholders de ambiente ficam em `.env.example`:

```bash
VITE_CHECKOUT_URL=https://pay.kiwify.com.br/s7qqPEZ
VITE_GTM_ID=
VITE_GA4_ID=G-C6XY55NJG0
VITE_META_PIXEL_ID=848117227912665
VITE_GOOGLE_ADS_ID=
VITE_GOOGLE_ADS_LABEL=
VITE_ENABLE_ATTRIBUTION_ASSIST=true
VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS=365
META_CONVERSIONS_API_ACCESS_TOKEN=
```

`META_CONVERSIONS_API_ACCESS_TOKEN` é somente para backend privado ou integração direta na Kiwify. Nunca use esse token em variável `VITE_` ou no JavaScript público.

## Atribuição assistida

O site salva o primeiro toque pago Meta first-party por até 365 dias. Se a pessoa voltar pela bio do Instagram e comprar dentro da janela, a URL da Kiwify recebe `src=paid_meta_assist_Xd`, em que `X` é a quantidade de dias entre o primeiro clique pago salvo e o checkout. As UTMs atuais da visita continuam preservadas.

Para desativar:

```bash
VITE_ENABLE_ATTRIBUTION_ASSIST=false
```

## Alterando o link da Kiwify

Use `VITE_CHECKOUT_URL` no arquivo `.env` do ambiente de deploy. O fallback centralizado fica em `src/lib/checkout.ts`.

## Estrutura

```text
src/
  assets/
  components/
  data/
  lib/
  styles/
  App.tsx
  main.tsx
docs/
  CODEX-HANDOFF.md
  HOSTINGER-DEPLOY.md
  KIWIFY-UTM.md
  META-ADS-COMPLIANCE-CHECKLIST.md
  META-ADS-CAMPAIGN-PLAYBOOK.md
  TRACKING.md
public/
  politica-de-privacidade.html
```

## Documentação

- `docs/CODEX-HANDOFF.md`: arquitetura completa, componentes, tracking, responsivo, assets, riscos e checklist para outro Codex assumir o projeto.
- `docs/TRACKING.md`: UTMs, eventos e mapeamento para GTM, GA4, Meta e Google Ads.
- `docs/KIWIFY-UTM.md`: parâmetros aceitos no checkout Kiwify.
- `docs/META-ADS-COMPLIANCE-CHECKLIST.md`: checklist de privacidade, cookies, anúncio, landing e checkout antes de subir campanha.
- `docs/META-ADS-CAMPAIGN-PLAYBOOK.md`: estrutura completa de campanha Meta Ads, conjuntos, anúncios, UTMs, orçamento e rotina de otimização.
- `docs/HOSTINGER-DEPLOY.md`: configuração de deploy em Node.js Web App.
- `public/politica-de-privacidade.html`: política pública de privacidade e cookies acessível em `/politica-de-privacidade.html`.
