# Handoff completo para Codex

> **Atualização de 19/08/2026:** a landing foi redesenhada por completo. A fonte de verdade é o código atual. O produto agora é apresentado como um programa digital de estudos e práticas com 19 módulos organizados em 8 eixos; o antigo contador de presença e a oferta de saída não são mais montados. O novo sistema visual está concentrado em `src/styles/globals.css`, `Hero.tsx`, `MeditationEnergyAnimation.tsx`, `ModuleShowcase.tsx` e `OriginalSlideshow.tsx`. Os assets servidos estão em WebP e podem ser regenerados com `scripts/optimize_assets.py`. As descrições históricas abaixo são contexto legado quando divergirem desses arquivos.

Este documento foi escrito para que outro Codex, em outro chat ou outra conta, consiga entrar neste repositório e entender a estrutura do site sem depender do histórico desta conversa. Ele descreve arquitetura, fluxo de dados, rastreamento, responsividade, assets, riscos conhecidos e validações esperadas antes de publicar.

Se houver divergência entre este documento e o código, o código vence. Atualize este arquivo quando mudar arquitetura, tracking, contratos de CTA, IDs de seção, assets essenciais ou comportamento mobile.

## Resumo do projeto

O repositório contém uma landing page premium em React para o produto **Portal da Consciência**, do domínio `eusouvibrante.com`. A aplicação é uma single page sem roteador, com foco em conversão para checkout Kiwify.

Stack principal:

- Vite + React + TypeScript.
- Tailwind CSS com classes utilitárias e CSS customizado em `src/styles/globals.css`.
- Framer Motion para animações de entrada, accordion e transições.
- Logo animado fiel à marca real, baseado no asset `brand-logo-mark.png`.
- Lucide React para ícones.
- Tracking de UTMs, Meta Pixel, GA4, Google Ads/GTM opcional e eventos internos.

O contrato de experiência mais importante é a paridade mobile: o conteúdo principal disponível no desktop deve continuar disponível no mobile, reorganizado em coluna, com menu hambúrguer e CTA fixo inferior que não cobre FAQ/suporte.

## Estrutura de pastas

```text
.
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.ts
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ eslint.config.js
├─ README.md
├─ .env.example
├─ docs/
│  ├─ CODEX-HANDOFF.md
│  ├─ TRACKING.md
│  ├─ KIWIFY-UTM.md
│  ├─ HOSTINGER-DEPLOY.md
│  ├─ META-ADS-CAMPAIGN-PLAYBOOK.md
│  └─ META-ADS-COMPLIANCE-CHECKLIST.md
├─ public/
│  ├─ favicon-original.png
│  ├─ favicon.svg
│  ├─ og-image.png
│  └─ politica-de-privacidade.html
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ vite-env.d.ts
   ├─ styles/
   │  └─ globals.css
   ├─ components/
   │  ├─ AnimatedFieldVisual.tsx
   │  ├─ AnimatedLogo.tsx
   │  ├─ CosmicBackground.tsx
   │  ├─ FAQ.tsx
   │  ├─ Footer.tsx
   │  ├─ Header.tsx
   │  ├─ Hero.tsx
   │  ├─ ModuleShowcase.tsx
   │  ├─ OfferCard.tsx
   │  ├─ OriginalSlideshow.tsx
   │  ├─ Section.tsx
   │  └─ TrackedCheckoutButton.tsx
   ├─ data/
   │  ├─ faq.ts
   │  ├─ modules.ts
   │  └─ sections.ts
   ├─ lib/
   │  ├─ attributionAssist.ts
   │  ├─ checkout.ts
   │  ├─ marketing.ts
   │  ├─ tracking.ts
   │  └─ utm.ts
   └─ assets/
      ├─ hero-portal.png
      └─ original/
         ├─ hero-desktop.png
         ├─ portal-title.png
         ├─ offer-bg.png
         ├─ footer-mark.png
         ├─ footer-symbol.png
         ├─ slide-01.png ... slide-10.png (legado, não usado pelo slideshow atual)
         └─ outros assets preservados
   └─ Repositório/
      └─ 5.png ... 24.png (capas individuais do slideshow de módulos)
```

Pastas geradas/ignoradas:

- `node_modules/`: dependências locais.
- `dist/`: build final do Vite.
- `.npm-cache/` e `.codex-runtime/`: cache/runtime local.
- `.git/`: controle de versão.

Essas pastas não devem ser tratadas como fonte do produto nem editadas manualmente.

## Scripts e tooling

`package.json` define:

- `npm run dev`: sobe o Vite em modo desenvolvimento.
- `npm run build`: roda `tsc -b` e depois `vite build`.
- `npm run lint`: roda ESLint.
- `npm run preview`: serve o build gerado.
- `npm run typecheck`: roda apenas `tsc -b`.

Engines:

- Node `22.x`.
- npm `>=10`.

Dependências de runtime:

- `@vitejs/plugin-react`
- `framer-motion`
- `lucide-react`
- `react`
- `react-dom`
- `vite`

Dependências de desenvolvimento:

- TypeScript 5.7.
- ESLint 10.
- Tailwind 3.4.
- PostCSS + Autoprefixer.

## Entrada da aplicação

### `index.html`

É o HTML base do Vite. Contém:

- `lang="pt-BR"`.
- Meta viewport responsivo.
- Title e description do Portal da Consciência.
- Canonical `https://eusouvibrante.com/`.
- Open Graph e Twitter card usando `/og-image.png`.
- Favicon `/favicon-original.png`.
- Link `rel="privacy-policy"` para `/politica-de-privacidade.html`.
- Entrada Vite em `/src/main.tsx`.

Observação importante: GA4 e Meta Pixel não ficam mais hardcoded no `index.html`. Eles são carregados por `src/lib/marketing.ts` no boot da aplicação. Não existe banner de consentimento ativo nesta versão; o rastreamento fica permitido por padrão para preservar a leitura do funil.

### `src/main.tsx`

Responsável por:

- Importar React/ReactDOM.
- Importar `App`.
- Importar `src/styles/globals.css`.
- Renderizar `<App />` dentro de `React.StrictMode`.

`React.StrictMode` pode executar efeitos duas vezes em desenvolvimento. `App.tsx` usa uma flag de módulo para impedir boot duplicado de tracking.

### `src/App.tsx`

É o orquestrador da landing page. Ele:

- Importa todos os componentes principais.
- Inicializa tracking/UTM.
- Observa seções para disparar eventos `section_view`.
- Controla visibilidade do CTA fixo mobile.
- Monta todas as seções em ordem.

Ordem renderizada:

1. `CosmicBackground`
2. `Header`
3. `Hero`
4. Seção `#chamado`
5. Seção `#campo`
6. Seção `#portal`
7. Seção `#conteudo`
8. Seção `#investimento`
9. Seção `#urgencia`
10. Seção `#duvidas`
11. `Footer`
12. CTA fixo mobile, quando visível

IDs com tracking:

- `hero`
- `chamado`
- `campo`
- `portal`
- `conteudo`
- `investimento`
- `urgencia`
- `duvidas`

## Componentes

### `CosmicBackground.tsx`

Renderiza um fundo fixo decorativo com ruído, campos de estrelas e linhas de energia. É `aria-hidden`, não interativo e fica atrás do conteúdo.

Classes principais:

- `.cosmic-background`
- `.cosmic-noise`
- `.star-field`
- `.energy-line`

### `Header.tsx`

Header fixo no topo. Contém:

- Logo animado fiel à marca real (`AnimatedLogo`).
- Navegação desktop em telas `lg`.
- CTA desktop para checkout.
- Botão hambúrguer mobile.
- Menu mobile colapsável com links e CTA.

Links de navegação:

- O Portal -> `#portal`
- Campo -> `#campo`
- O Que Abre -> `#conteudo`
- Investimento -> `#investimento`
- Suporte -> `#duvidas`

CTAs:

- Desktop: `ctaId="header_checkout"`, `section="header"`.
- Mobile: `ctaId="mobile_menu_checkout"`, `section="mobile_menu"`.

### `AnimatedLogo.tsx`

Renderiza a marca real em PNG transparente (`brand-logo-mark.png`) com animação sutil de brilho/respiração em CSS.

Responsabilidades:

- Preservar a silhueta fiel da logo usada pela marca.
- Evitar reconstruções aproximadas da logo em SVG/Canvas/3D.
- Manter `object-fit: contain` para não distorcer a proporção.
- Expor a prop `compact`, usada no header.

Pontos sensíveis:

- Se a marca oficial mudar, gere um novo asset transparente a partir do arquivo oficial e substitua `brand-logo-mark.png`.
- Alterações de tamanho devem ser testadas em desktop e mobile porque a logo vive dentro do header fixo.

### `Hero.tsx`

Primeira dobra da página. Usa:

- `hero-desktop.png` como background full cover.
- `portal-title.png` como imagem/título visual.
- H1 e copy principal.
- CTA primário para checkout.
- Link secundário "Saiba mais" para `#chamado`.

Comportamento responsivo importante:

- Em desktop há `md:min-h-[90vh]`.
- Em mobile não há min-height grande, para permitir que todo o conteúdo textual apareça e a página role normalmente.
- O conteúdo textual tem `min-w-0` e limites de largura para evitar overflow horizontal.
- A imagem de fundo reposiciona no mobile via `.hero-original-image`.

CTA:

- `ctaId="hero_primary"`
- `section="hero"`

### `Section.tsx`

Wrapper padrão de seções. Recebe:

- `id`
- `eyebrow`
- `title`
- `description`
- `className`
- `children`

Ele adiciona:

- `data-track-section={id}` para o observer de tracking.
- Classes base `section-shell`.
- Animação Framer Motion `whileInView`, exceto quando o usuário prefere redução de movimento ou quando a classe contém `after-hero-section`.
- O gatilho de viewport usa `amount: "some"`. Isso é intencional: seções longas em mobile, como `#conteudo`, podem nunca alcançar um threshold percentual alto e ficariam invisíveis com `opacity: 0`.

Ao criar nova seção com tracking, use este componente sempre que possível.

### `AnimatedFieldVisual.tsx`

Visual central da seção `#campo`. Não usa imagem; é um visual construído com HTML/SVG/CSS:

- Campo energético/chakra.
- Linhas, anéis, partículas e blooms.
- `role="img"` com `aria-label`.
- Arrays internos `particles` e `chakraNodes`.

CSS associado fica em `globals.css`, principalmente classes iniciadas por:

- `.field-visual-*`
- `.chakra-*`
- `.animated-field-visual`
- `.chakra-field-visual`

### `OriginalSlideshow.tsx`

Coverflow automático com capas individuais importadas de `Repositório/5.png` até `Repositório/24.png`.

Detalhes:

- `5.png` é a introdução; `6.png` até `24.png` são os módulos 1 a 19.
- O componente calcula offsets circulares com `getCircularOffset`.
- O slide ativo fica centralizado e maior; slides laterais ficam menores com opacidade reduzida.
- A navegação usa setas e autoplay por `AUTOPLAY_INTERVAL_MS`.
- As imagens atuais já são capas 2:3 em 1000x1500, então não há mais recorte por `crop-left`/`crop-right`.

Ponto de performance: as capas individuais são menores e mais nítidas que os antigos sprites `slide-01.png` a `slide-10.png`, mas ainda são PNGs grandes. O build pode alertar sobre assets grandes. Isso não é erro funcional, mas impacta carregamento.

### `ModuleShowcase.tsx`

Renderiza os módulos de `src/data/modules.ts`.

Layout:

- Desktop: grid de 3 colunas.
- Até 900px: 2 colunas.
- Até 640px: 1 coluna.
- O 7º card ocupa 2 colunas em desktop/tablet e volta a 1 no mobile.

Cada card usa:

- Número do módulo.
- Título.
- Subtítulo.
- Lista de tópicos.

### `OfferCard.tsx`

Card principal de oferta na seção `#investimento`.

Usa:

- `offer-bg.png` como background.
- Preço antigo riscado.
- Preço atual.
- CTA principal.
- Badges com ícones Lucide.
- Garantia e ponte de copy.

CTA:

- `ctaId="offer_primary"`
- `section="investment"`

### `FAQ.tsx`

Accordion de dúvidas.

Dados vêm de `src/data/faq.ts`.

Comportamento:

- Primeiro item abre por padrão (`openIndex = 0`).
- Ao abrir uma pergunta, dispara `faq_open`.
- Usa Framer Motion/AnimatePresence.
- Respeita redução de movimento.
- Botão de suporte abre WhatsApp em nova aba.

Suporte:

- URL: `https://wa.me/5582996935989?text=Ol%C3%A1!%20Tenho%20interesse%20em%20acessar%20o%20Portal%20da%20Consci%C3%AAncia%20e%20gostaria%20de%20entender%20melhor%20como%20funciona.`
- Evento manual `cta_click` com `cta_id="faq_whatsapp_support"`.

### `Footer.tsx`

Rodapé com:

- `footer-mark.png`
- `footer-symbol.png`
- Texto legal.
- Copyright 2026.
- Links para Política de Privacidade e Suporte.
- Direitos autorais.

ID:

- `aviso-legal`

No mobile, `globals.css` adiciona padding inferior maior ao footer para acomodar o CTA fixo quando ele está ativo perto do fim da página.

### `TrackedCheckoutButton.tsx`

Componente padrão para CTAs de checkout.

Responsabilidades:

- Construir URL final de checkout com UTMs e parâmetros rastreáveis.
- Disparar evento `cta_click`.
- Disparar intenção de checkout:
  - evento interno `checkout_intent`;
  - GA4 `begin_checkout`.
- Não disparar Meta `InitiateCheckout`; esse evento deve ficar com a Kiwify ao abrir o checkout.
- Navegar para a URL Kiwify.

Props:

- `label`: texto visível.
- `ctaId`: identificador único do CTA.
- `section`: seção/origem.
- `variant`: `primary`, `secondary` ou `ghost`.
- `className`.
- `newTab`.

Regra prática: qualquer CTA que vá para checkout deve usar este componente, salvo se houver uma razão explícita para tratamento diferente.

O componente não deve usar `src` para identificar a posição do botão. A posição do CTA deve ir em `s1/s2/s3`; `src` deve representar origem de tráfego.

## Dados

### `src/data/modules.ts`

Define:

- Tipo `PortalModule`.
- Array `portalModules` com 8 módulos.

Módulos renderizados:

1. Fundamentos da Realidade
2. Desdobramento da Consciência
3. Estrutura da Realidade
4. Caminho de Retorno
5. Hierarquias e Inteligências Cósmicas
6. Os Reinos e a Trama Viva
7. Biologia da Ascensão
8. Práticas e Reconhecimentos

Editar conteúdo dos cards do bloco "O Que Abre" normalmente passa por este arquivo.

### `src/data/faq.ts`

Define:

- Tipo `FaqItem`.
- Array `faqItems` com 8 perguntas e respostas.

Esse array alimenta diretamente `FAQ.tsx`.

### `src/data/sections.ts`

Define:

- `portalBenefits`
- `fieldCards`
- `transformationPairs`

No estado atual do código, esses dados não são importados por `App.tsx` nem pelos componentes renderizados. Trate como dados legados/reservados. Não presuma que aparecem na interface.

## Checkout, UTMs e tracking

### Variáveis de ambiente

`.env.example` mostra:

```env
VITE_CHECKOUT_URL=https://pay.kiwify.com.br/s7qqPEZ
VITE_GA4_ID=G-C6XY55NJG0
VITE_META_PIXEL_ID=848117227912665
VITE_GTM_ID=
VITE_GOOGLE_ADS_ID=
VITE_ENABLE_ATTRIBUTION_ASSIST=true
VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS=365
META_CONVERSIONS_API_ACCESS_TOKEN=
```

Regras:

- Variáveis com prefixo `VITE_` ficam expostas no bundle frontend.
- Nunca colocar token privado de Meta Conversions API em variável `VITE_`.
- `META_CONVERSIONS_API_ACCESS_TOKEN` é privado e deve ficar apenas em backend/integração segura.

### `src/lib/marketing.ts`

Carrega scripts de marketing e analytics no navegador.

Responsabilidades:

- Carregar GA4 e Meta Pixel dinamicamente em `loadMarketingScripts()`.
- Usar `VITE_GA4_ID` e `VITE_META_PIXEL_ID` quando disponíveis, com fallback para `G-C6XY55NJG0` e `848117227912665`.

Regra atual: GA4 e Meta Pixel carregam por padrão no boot da aplicação. Não existe gating por consentimento nesta versão.

### `src/lib/checkout.ts`

Define:

- `DEFAULT_CHECKOUT_URL = "https://pay.kiwify.com.br/s7qqPEZ"`.
- `CHECKOUT_URL`, usando `VITE_CHECKOUT_URL` quando presente.
- `buildCheckoutUrl(baseUrl, extraParams)`.
- `buildCheckoutUrlForCta({ ctaId, section })`.
- `resolveCheckoutAttributionParams({ ctaId, section })`.

`buildCheckoutUrl`:

1. Lê parâmetros já armazenados por `getStoredUtmParams`.
2. Mescla com `extraParams`.
3. Chama `appendTrackingParamsToUrl`.
4. Retorna a URL final.

`buildCheckoutUrlForCta` é o caminho recomendado para botões de checkout. Ele preserva campanhas existentes e organiza fallback assim:

- `src`: origem do tráfego (`paid_meta`, `paid_google`, `organic_instagram`, `meta_referral`, `site_direct`, etc.).
- `s1`: CTA clicado, por exemplo `cta_hero_primary`.
- `s2`: seção do CTA, por exemplo `section_hero`.
- `s3`: `landing_page`.

Se `src`, `s1`, `s2` ou `s3` já vierem na URL da campanha, os valores da campanha são preservados.

`fbp` sozinho não indica compra por anúncio; ele é apenas identificador de navegador do Meta Pixel.

### `src/lib/attributionAssist.ts`

Camada first-party para identificar assistência de Meta Ads sem mudar a janela oficial da Meta.

Regras:

- Salva toque pago Meta em `localStorage` com a chave `eu_sou_vibrante_paid_meta_touch`.
- Janela padrão: 365 dias, contados a partir do primeiro toque pago Meta salvo.
- Entrada paga atual mantém `src=paid_meta`.
- Entrada orgânica/direct com toque pago válido envia `src=paid_meta_assist_Xd`, em que `X` é a quantidade de dias entre o primeiro toque pago salvo e o checkout.
- UTMs da visita atual são preservadas para manter leitura de last click.
- Debug local: `?debug_attribution=1`.

Flags:

- `VITE_ENABLE_ATTRIBUTION_ASSIST=false` desliga a camada.
- `VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS=365` ajusta a janela.

### `src/lib/utm.ts`

Lista rastreada:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `fbclid`
- `fbc`
- `fbp`
- `_fbc`
- `_fbp`
- `gclid`
- `gbraid`
- `wbraid`
- `src`
- `sck`
- `s1`
- `s2`
- `s3`

Funções principais:

- `persistUtmParamsFromUrl()`: extrai parâmetros da URL atual, lê cookies `_fbp`/`_fbc` quando disponíveis, cria `fbc` estável a partir de `fbclid` quando possível e salva em storage.
- `getStoredUtmParams()`: lê localStorage/sessionStorage e devolve parâmetros salvos.
- `appendTrackingParamsToUrl(url, params)`: adiciona parâmetros permitidos à URL.
- `extractTrackingParamsFromUrl(url)`: extrai apenas chaves rastreáveis.

Armazenamento:

- Chave: `eu_sou_vibrante_tracking_params`.
- Usa localStorage e sessionStorage quando disponíveis.
- Valores são sanitizados: trim, limite de 160 caracteres e remoção de caracteres perigosos como `<`, `>`, aspas e crase.

### `src/lib/tracking.ts`

Tipos de evento:

- `page_view_ready`
- `cta_click`
- `checkout_intent`
- `faq_open`
- `section_view`

Produto rastreado:

- Nome: `Portal da Consciência`
- Categoria: `digital_course`
- Moeda: `BRL`
- Valor: `147`

Funções principais:

- `trackEvent`: evento interno, `dataLayer`, GA4 `gtag` e Meta `trackCustom` para eventos customizados.
- `trackMetaEvent`: envia eventos padrão Meta permitidos e bloqueia eventos reservados ao checkout, como `InitiateCheckout`, `Purchase`, `pix`, `credit_card` e `boleto`.
- `trackGoogleEvent`: envia eventos GA4, como `begin_checkout`.
- `trackCtaClick`: padroniza clique de CTA.
- `trackCheckoutIntent`: gera `event_id`, envia intenção interna/dataLayer e GA4, sem enviar `InitiateCheckout` para a Meta.

Envios para Meta/GA4 só ocorrem quando `window.fbq`/`window.gtag` existem. Ambos são inicializados por `loadMarketingScripts()` no boot da aplicação.

Em desenvolvimento, `trackEvent` faz log no console.

### Boot de tracking em `App.tsx`

`useTrackingBoot` faz:

1. `persistUtmParamsFromUrl()`.
2. `trackEvent("page_view_ready", ...)`.
3. Cria `IntersectionObserver` para elementos com `[data-track-section]`.
4. Dispara `section_view` uma vez por seção, com threshold `0.42`.

Flag importante:

- `hasBootedTracking` é uma variável de módulo.
- Ela impede boot duplicado no `React.StrictMode` durante desenvolvimento.

### CTAs e IDs

CTAs de checkout conhecidos:

- Hero: `hero_primary`
- Header desktop: `header_checkout`
- Menu mobile: `mobile_menu_checkout`
- Oferta: `offer_primary`
- Urgência/final: `urgency_final`
- Sticky mobile: `sticky_mobile_checkout`

CTA de suporte:

- FAQ WhatsApp: `faq_whatsapp_support`

CTA interno que não vai direto para checkout:

- Portal para oferta: `portal_scroll_to_offer`, rola para `#investimento`.

Ao criar um novo CTA de checkout:

1. Use `TrackedCheckoutButton`.
2. Defina `ctaId` único.
3. Defina `section` coerente.
4. Garanta que a navegação final preserve UTMs.

### Compra final

A landing page não registra compra final. A compra acontece no Kiwify/API. Eventos de `Purchase` devem ser tratados pela integração de checkout/backend/Kiwify, não por esta página.

## Responsividade e experiência mobile

Este projeto deve manter paridade de experiência entre desktop e mobile. "Paridade" aqui significa que o conteúdo principal disponível no desktop deve continuar disponível no mobile, ainda que reorganizado em coluna, com menu hambúrguer e CTA fixo.

Contratos atuais:

- O body tem `min-width: 320px`.
- Header é fixo no topo.
- Hero tem padding superior suficiente para não ficar atrás do header.
- Hero só usa `md:min-h-[90vh]` em desktop; mobile deixa o conteúdo ditar a altura.
- CTA fixo inferior aparece apenas em mobile (`md:hidden`).
- CTA fixo inferior aparece depois da área inicial/hero e some antes da seção `#investimento`, onde já existe CTA de compra no próprio bloco.
- FAQ/suporte não devem ficar cobertos pelo CTA fixo.
- Não deve haver scroll horizontal de documento.
- O menu mobile deve mostrar os mesmos destinos principais da nav desktop.
- Seções têm `scroll-margin-top` para que âncoras não fiquem escondidas atrás do header fixo.

### Controle do CTA fixo mobile

`useStickyCta` em `App.tsx` calcula:

- `heroBottom`: fim da seção hero.
- `revealAt`: ponto mínimo para exibir o CTA, baseado no viewport e no fim do hero.
- `support`: seção `#duvidas`.
- `purchase`: seção `#investimento`.
- `hideAt`: ponto antes da seção de compra, ou antes da seção de dúvidas caso a seção de compra não exista.

O CTA fica visível apenas quando:

```text
scrollY >= revealAt && scrollY < hideAt
```

Se alterar a ordem das seções ou o ID da FAQ, revise esse hook.

### Breakpoints importantes no CSS

`globals.css` tem ajustes principais em:

- `@media (prefers-reduced-motion: reduce)`: reduz animações e scroll smooth.
- `@media (max-width: 900px)`: ajusta altura do visual de campo e grid de módulos para 2 colunas.
- `@media (max-width: 640px)`: ajusta títulos, hero image, cards visuais, slideshow, copy, grid de módulos e footer.

Regras mobile relevantes:

- `.hero-title`: `clamp(1.95rem, 8.8vw, 2.28rem)`.
- `.section-title`: `clamp(1.85rem, 8.6vw, 2.35rem)`.
- `.copy-flow`: `font-size: 1rem`, `line-height: 1.68`.
- `.field-art-shell`: `min-height: 360px`.
- `.original-slideshow img`: `width: 82vw`.
- `.original-slideshow-track`: no mobile, `animation: none`.
- `.module-grid`: 1 coluna.
- `.site-footer`: `padding-bottom: 8.5rem`.

### Como validar mobile

Valide no mínimo:

- 390 x 844.
- 375 x 812.
- 430 x 932.
- Desktop 1365 x 900 ou similar.

Checklist:

- A primeira dobra mobile mostra logo, menu e conteúdo do hero.
- CTA do hero aparece no fluxo normal.
- CTA fixo aparece depois do hero.
- CTA fixo não cobre FAQ/suporte.
- Menu hambúrguer abre, fecha e contém links/CTA.
- Todas as seções renderizadas no desktop existem no mobile.
- Não há scroll horizontal.
- FAQ abre/fecha.
- Carrossel não quebra layout.
- Header fixo não cobre âncoras de forma grave.

## Estilos

### `tailwind.config.ts`

Configura:

- Content scan: `index.html` e `src/**/*.{ts,tsx}`.
- Cores: `space`, `midnight`, `pearl`, `aurora`, `lavender`, `gold`.
- Fontes:
  - `sans`: Raleway.
  - `display`: Poppins.
- Shadows: `glow`, `gold`.
- Background: `cosmic-radial`.

### `src/styles/globals.css`

Estrutura:

1. Import Google Fonts.
2. Imports Tailwind.
3. Base global (`:root`, `body`, foco, seleção).
4. `@layer components` com classes reutilizáveis:
   - `.section-shell`
   - `.section-band`
   - `.eyebrow`
   - `.section-title`
   - `.section-description`
   - `.hero-title`
   - `.nav-link`
   - `.btn-primary`
   - `.btn-secondary`
   - `.btn-ghost`
   - `.icon-button`
   - classes legadas como `.statement-card`, `.feature-card`, `.benefit-row`, `.transformation-row`
5. Classes customizadas da landing:
   - hero
   - logo
   - campo/chakra
   - copy/resultados
   - capa do portal
   - slideshow
   - módulos
   - oferta
   - FAQ
   - footer
   - fundo cósmico
6. Keyframes.
7. Media queries.

Ponto sensível: algumas classes CSS não são usadas atualmente, principalmente utilitários legados e visuais `.portal-orbit`/`.portal-panel`. Não remova sem testar se há planos de reuso ou sem confirmar que não são necessárias.

## Acessibilidade e movimento

Boas práticas já presentes:

- `button` e `a` têm `focus-visible` claro.
- O fundo cósmico é `aria-hidden`.
- O visual de campo tem `role="img"` e `aria-label`.
- FAQ usa botões reais.
- O header mobile usa `aria-label` no botão de menu.
- `prefers-reduced-motion` reduz animações.
- Framer Motion usa `useReducedMotion` em seções, hero e FAQ.

Pontos a preservar:

- Não trocar botões de FAQ por `<div>`.
- Não remover `aria-label` do visual de campo.
- Não remover o fallback de redução de movimento.
- Se adicionar imagens informativas, usar `alt` real. Se forem decorativas, usar `alt=""`.

## Assets

### Assets usados atualmente

`public/`:

- `favicon-original.png`: favicon usado em `index.html`.
- `og-image.png`: Open Graph/Twitter card.

`src/assets/original/`:

- `hero-desktop.png`: background do hero.
- `portal-title.png`: imagem/título no hero.
- `brand-logo-mark.png`: logo oficial recortada/transparente usada no header.
- `offer-bg.png`: background da oferta.
- `footer-mark.png`: footer.
- `footer-symbol.png`: footer.
- `slide-01.png` até `slide-10.png`: sprites legados preservados, mas o slideshow atual não importa estes arquivos.

`Repositório/`:

- `5.png`: capa de introdução do slideshow.
- `6.png` até `24.png`: capas individuais dos módulos 1 a 19 usadas por `OriginalSlideshow.tsx`.

### Assets preservados mas não usados diretamente

No estado atual, há assets que não aparecem importados pelo app:

- `src/assets/hero-portal.png`
- `portal-cover.png`
- `catalog-logo-1.png`
- `catalog-logo-2.png`
- `detail-17.png` até `detail-21.png`
- `golden-field.png`
- `slide-01.png` até `slide-10.png`
- `favicon-original.png` dentro de `src/assets/original`
- Possivelmente outros arquivos de catálogo/detalhe

Não apague esses arquivos automaticamente. Eles podem ser material original, histórico visual ou reserva para futuras páginas.

### Performance dos assets

Os slides e algumas imagens são grandes. O build pode emitir aviso de chunk/assets grandes, especialmente após bundling. Esse aviso não impede build, mas pode afetar performance real.

Possíveis melhorias futuras:

- Converter slides para WebP/AVIF.
- Gerar tamanhos responsivos.
- Carregar slideshow sob demanda.
- Revisar se todos os assets preservados precisam ficar no repositório.

## Configurações

### TypeScript

`tsconfig.json` referencia:

- `tsconfig.app.json`
- `tsconfig.node.json`

`tsconfig.app.json`:

- Target ES2020.
- DOM libs.
- `jsx: react-jsx`.
- `strict: true`.
- `noEmit: true`.
- Include `src`.

`tsconfig.node.json`:

- Usado para configs Node (`vite.config.ts`, `tailwind.config.ts`).
- `strict: true`.
- `noEmit: true`.

### ESLint

`eslint.config.js`:

- Ignora `dist`, `node_modules`, `.npm-cache`, `.codex-runtime`.
- Usa JS recommended.
- Usa TypeScript recommended.
- Usa React Hooks recommended.
- Usa React Refresh com `only-export-components` como warning, permitindo constantes exportadas.

### Vite

`vite.config.ts` é simples:

- `defineConfig`.
- plugin `react()`.

Não há roteamento, proxy ou aliases customizados.

## Deploy

Referência principal: `docs/HOSTINGER-DEPLOY.md`.

Fluxo esperado:

1. Node 22.
2. Instalar dependências com `npm ci` ou `npm install`.
3. Gerar build com `npm run build`.
4. Publicar `dist`.

Se a Hostinger exigir entry server, a documentação de deploy inclui orientação para fallback Express. No estado atual, o app é um build estático Vite.

## Validação antes de entregar

Comandos mínimos:

```bash
npm run lint
npm run typecheck
npm run build
```

Para alteração visual/mobile, também validar no navegador:

- Desktop.
- Mobile 390 x 844.
- Menu mobile.
- Scroll completo.
- FAQ.
- CTAs.
- Console sem erros relevantes.

Se houver aviso de chunk grande no build, registrar como aviso conhecido. Se houver erro de TypeScript, lint ou runtime, corrigir antes de entregar.

## Regras práticas para futuros Codex

1. Não edite `dist/` como fonte. Edite `src/` e rode build.
2. Não remova tracking/UTM sem revisar `docs/TRACKING.md` e `docs/KIWIFY-UTM.md`.
3. CTAs de checkout devem usar `TrackedCheckoutButton`.
4. Mudanças de seção devem manter IDs coerentes com nav, tracking e `useStickyCta`.
5. Se criar seção rastreada, use `Section` para ganhar `data-track-section`.
6. Se trocar a URL de checkout, prefira `.env`/`VITE_CHECKOUT_URL` ou `DEFAULT_CHECKOUT_URL`.
7. Se mexer no mobile, verifique paridade de conteúdo com desktop.
8. Se mexer no header, teste menu mobile e logo canvas.
9. Se mexer na logo do header, preserve a proporção real da marca e teste desktop/mobile.
10. Se mexer nos slides, cuide de performance e layout mobile.
11. Se mexer em `index.html`, não recoloque scripts de GA4/Meta Pixel fora de `src/lib/marketing.ts`.
12. Nunca exponha token privado de Meta Conversions API no frontend.

## Pontos conhecidos e riscos

- `src/data/sections.ts` está sem uso no render atual.
- Algumas classes CSS parecem legadas/reservadas.
- Alguns assets estão preservados mas sem import atual.
- GA4 e Meta Pixel carregam por padrão em `src/lib/marketing.ts`.
- Não existe banner de consentimento ativo; se ele voltar no futuro, será necessário recriar UI, storage e gating de scripts/cookies.
- Build pode alertar sobre arquivos grandes por causa de slides/imagens.
- O CTA fixo mobile depende da existência de `#duvidas`; mudar esse ID exige ajuste em `useStickyCta`.
- `React.StrictMode` pode duplicar effects em dev; a flag `hasBootedTracking` evita boot duplicado de tracking.

## Estado recente do mobile

Houve ajuste recente para garantir a experiência mobile:

- O hero mobile permite rolagem natural e exibe conteúdo textual/CTA.
- O CTA fixo mobile só aparece após o hero.
- O CTA fixo mobile é ocultado antes da seção `#investimento`, evitando duplicar/cobrir a área principal de compra, FAQ e suporte.
- O layout mobile deve preservar todos os blocos de conteúdo renderizados no desktop.

Quando revisar esse comportamento, compare o texto principal renderizado em desktop e mobile e garanta que não há conteúdo importante escondido por `display: none`, altura fixa ou overflow indevido.

## Documentos complementares

- `docs/TRACKING.md`: rastreamento, eventos, UTMs, Meta/GA4/GTM.
- `docs/KIWIFY-UTM.md`: preservação de UTMs e parâmetros no checkout Kiwify.
- `docs/META-ADS-CAMPAIGN-PLAYBOOK.md`: estrutura de campanhas Meta Ads, UTMs e rotina de otimização.
- `docs/META-ADS-COMPLIANCE-CHECKLIST.md`: checklist de privacidade, cookies, anúncio, landing e checkout antes de subir campanha.
- `docs/HOSTINGER-DEPLOY.md`: deploy na Hostinger.
- `public/politica-de-privacidade.html`: política pública de privacidade e cookies.
- `README.md`: visão resumida para humanos.

## Mapa rápido de decisão

Se a tarefa for:

- Alterar copy de uma seção: comece por `src/App.tsx`.
- Alterar módulos: comece por `src/data/modules.ts`.
- Alterar FAQ: comece por `src/data/faq.ts`.
- Alterar CTA de checkout: revise `TrackedCheckoutButton`, `checkout.ts`, `utm.ts` e tracking.
- Alterar hero: revise `Hero.tsx`, assets `hero-desktop.png`/`portal-title.png` e CSS `.hero-*`.
- Alterar mobile: revise `Hero.tsx`, `App.tsx` (`useStickyCta`) e media queries em `globals.css`.
- Alterar tracking: revise `tracking.ts`, `utm.ts`, `checkout.ts`, `marketing.ts`, `index.html`, `docs/TRACKING.md` e `docs/KIWIFY-UTM.md`.
- Alterar deploy: revise `docs/HOSTINGER-DEPLOY.md`, `package.json` e `vite.config.ts`.
