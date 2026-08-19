# Tracking

Este projeto instala e organiza o rastreamento da landing page para Meta Pixel e Google Analytics 4.

## IDs Instalados

- Meta Pixel: `848117227912665`
- GA4: `G-C6XY55NJG0`

O token da API de Conversões da Meta não fica no front-end. Ele deve permanecer apenas na Kiwify ou em um backend privado.

## Rastreamento Padrão Ativo

Meta Pixel e GA4 não são carregados diretamente no `index.html`. O carregamento fica em `src/lib/marketing.ts`.

Não existe banner de consentimento ativo nesta versão. O rastreamento fica permitido por padrão: GA4 e Meta Pixel carregam no boot, e os cookies/identificadores de marketing disponíveis podem ser lidos para preservar a atribuição do funil.

Se a estratégia de consentimento voltar no futuro, será necessário recriar a camada de UI, storage e gating de cookies/scripts. A política pública de privacidade permanece disponível em `/politica-de-privacidade.html`.

## Captura De UTMs

Na primeira visita com parâmetros de rastreio, a landing page lê a URL atual e captura:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `fbclid`
- `fbp`
- `fbc`
- `_fbp`
- `_fbc`
- `gclid`
- `gbraid`
- `wbraid`
- `src`
- `sck`
- `s1`
- `s2`
- `s3`

A captura acontece em `persistUtmParamsFromUrl()`, chamado no boot da aplicação em `src/App.tsx`.

O site também lê os cookies `_fbp` e `_fbc` criados pelo Pixel quando disponíveis. Se a visita chegar com `fbclid` e ainda não existir `_fbc`, o código monta um `fbc` compatível e estável para repassar ao checkout. O valor é enviado como `fbc` e também como `_fbc`; o mesmo vale para `fbp` e `_fbp`, aumentando a compatibilidade com plataformas que leem pelo nome do parâmetro ou pelo nome do cookie.

## Persistência

Os parâmetros capturados são salvos em `localStorage` e `sessionStorage` com a chave `eu_sou_vibrante_tracking_params`.

Se uma nova visita trouxer parâmetros válidos na URL, esses valores atualizam os dados armazenados. Se nenhum parâmetro existir na URL, o site usa os valores já persistidos e os cookies atuais de atribuição.

## Repasse Para A Kiwify

Antes do redirecionamento, `TrackedCheckoutButton` chama `buildCheckoutUrlForCta()`, que combina os parâmetros salvos com a organização de atribuição e monta a URL final da Kiwify.

Contrato atual:

- `src` representa a origem/canal de tráfego.
- `s1` identifica o CTA clicado quando a campanha não enviou `s1`.
- `s2` identifica a seção do CTA quando a campanha não enviou `s2`.
- `s3` recebe `landing_page` quando a campanha não enviou `s3`.
- `fbp` é repassado para matching do Meta Pixel quando disponível, mas não é usado como critério de tráfego pago.
- `fbp`/`fbc` também são enviados como `_fbp`/`_fbc` para melhorar a captura pela Kiwify ou por integrações server-side.

## Atribuição De Afiliados

Afiliados autorizados ficam cadastrados em `src/data/affiliates.ts`. A entrada oficial atual é:

```text
0KuZXSqT
```

Uma visita com `?afid=0KuZXSqT` salva a atribuição sem prazo de expiração definido pela aplicação na chave `eu_sou_vibrante_affiliate_attribution`. O identificador preserva maiúsculas e minúsculas e só é aceito quando estiver cadastrado e ativo.

Essa persistência é first-party e permanece no mesmo navegador e dispositivo enquanto os dados do site existirem. Limpeza de dados, navegação privada, troca de navegador ou troca de dispositivo impedem que uma landing sem `afid` recupere essa associação. Atribuição realmente permanente entre dispositivos exige identificação do comprador e persistência no servidor.

No clique de checkout:

- atribuição ativa: a URL da Kiwify recebe `afid=0KuZXSqT`;
- sem atribuição ativa: o checkout segue como venda do produtor, sem `afid`;
- `afid` desconhecido, inválido ou desativado: não é repassado;
- um novo `afid` válido substitui o anterior, seguindo último clique entre afiliados.

O `afid` é tratado em uma camada separada das UTMs para impedir que parâmetros arbitrários capturem comissões. Para cadastrar um novo afiliado, adicione outro item em `AFFILIATE_REGISTRY` com o código exato fornecido pela Kiwify.

Eventos e payloads de checkout recebem:

- `checkout_owner=affiliate|producer`;
- `affiliate_afid`, quando aplicável;
- `affiliate_label`, quando aplicável;
- `affiliate_attribution_age_days`, quando aplicável.
- `affiliate_attribution_model=perpetual`, quando aplicável.

## Atribuição Assistida First-Party

A landing salva um toque pago da Meta em `localStorage`, na chave `eu_sou_vibrante_paid_meta_touch`, quando a visita chega com sinais de tráfego pago Meta, como `src=paid_meta`, `utm_source=meta` + `utm_medium=paid_social` ou `fbclid` sem indicação orgânica.

Janela padrão:

```bash
VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS=365
```

Feature flag:

```bash
VITE_ENABLE_ATTRIBUTION_ASSIST=true
```

Para desligar:

```bash
VITE_ENABLE_ATTRIBUTION_ASSIST=false
```

Classificação enviada para a Kiwify:

- `paid_meta_direct`: mantém `src=paid_meta`.
- `organic_ig_direct`: mantém/inferirá `src=organic_ig`.
- `paid_meta_assist`: envia `src=paid_meta_assist_Xd`, em que `X` é a quantidade de dias entre o primeiro clique pago Meta salvo e o checkout.
- `unknown_direct`: segue a atribuição atual disponível.

Quando ocorre assistência, as UTMs da visita atual não são apagadas. Exemplo: uma pessoa clicou em anúncio em 30/06/2026, saiu e voltou pela bio em 15/07/2026. O checkout recebe `src=paid_meta_assist_15d`, mas preserva `utm_source=ig`, `utm_medium=social` e `utm_content=link_in_bio` quando esses parâmetros vierem na URL.

Modo debug local:

```text
/?debug_attribution=1
```

O debug aparece apenas no console do navegador e não envia dados para serviços externos.

Exemplo:

```text
https://pay.kiwify.com.br/s7qqPEZ?src=paid_meta&s1=cta_hero_primary&s2=section_hero&s3=landing_page&utm_source=meta&utm_medium=cpc&utm_campaign=portal_consciencia&fbclid=...
```

## Eventos Criados

- `page_view_ready`: disparado quando a aplicação inicializa e os UTMs já foram processados.
- `cta_click`: disparado em cliques de CTA rastreáveis.
- `checkout_intent`: evento interno/dataLayer/GA4 disparado antes de enviar o usuário ao checkout Kiwify.
- `faq_open`: disparado quando uma pergunta do FAQ é aberta.
- `section_view`: disparado uma vez por seção via `IntersectionObserver`.
- `affiliate_attribution_captured`: registra uma entrada ou renovação válida de afiliado.
- `affiliate_attribution_rejected`: registra a tentativa de usar um `afid` não cadastrado, sem enviar o código rejeitado.

Além desses eventos internos:

- Meta Pixel dispara `PageView` ao carregar os scripts de marketing.
- GA4 dispara `begin_checkout` no clique de checkout.
- `cta_click`, `faq_open` e `section_view` também são enviados ao Meta como eventos customizados.
- A landing não dispara `InitiateCheckout`, `Purchase`, `pix`, `credit_card` ou `boleto` pelo Meta Pixel; esses eventos devem ficar sob responsabilidade da Kiwify.

## Payload De CTA

Todo CTA de checkout envia metadados como:

- `cta_id`
- `cta_label`
- `section`
- `destination`
- `currency`
- `value`
- `content_name`
- `content_ids`
- `event_id`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `fbclid`
- `fbp`
- `fbc`
- `_fbp`
- `_fbc`
- `gclid`
- `gbraid`
- `wbraid`
- `src`
- `sck`
- `s1`
- `s2`
- `s3`

## dataLayer

Se `window.dataLayer` existir, o site executa:

```js
window.dataLayer.push({
  event: "checkout_intent",
  cta_id: "...",
  cta_label: "...",
  section: "...",
  destination: "...",
});
```

O mesmo padrão vale para `page_view_ready`, `cta_click`, `faq_open` e `section_view`.

## Compra Aprovada Na Meta

A landing page consegue rastrear PageView, cliques, seções, FAQ e intenção interna de checkout. Eventos padrão de checkout e compra acontecem fora do site, no ambiente da Kiwify.

Para a Meta identificar a venda, configure na Kiwify:

1. Pixel ID `848117227912665`.
2. Token da integração direta/API de Conversões no campo privado da Kiwify.
3. Evento de compra/aprovação como `Purchase`.
4. Moeda `BRL` e valor real do pedido.
5. Repassar UTMs/parâmetros do checkout quando a Kiwify oferecer essa opção.

Não coloque o token da API de Conversões em `index.html`, JavaScript de navegador, variáveis `VITE_` ou repositório Git.

## Diagnóstico CAPI Da Meta

Alertas como "envie parâmetros de dados do usuário ausentes" e recomendações da Parameter Builder Library são sobre eventos enviados por servidor/API de Conversões. A landing não controla o payload CAPI da Kiwify, mas ajuda repassando `fbclid`, `fbp`, `fbc`, `_fbp` e `_fbc` na URL de checkout.

Se o Gerenciador de Eventos mostrar que eventos `SERVER` chegam sem `user_data`, `fbc`, `fbp`, `event_id`, email ou telefone, a correção principal deve ser feita na Kiwify ou no provedor server-side. O site não deve inventar email/telefone nem disparar `Purchase` no navegador para compensar esse alerta.

## Como Conectar GTM No Futuro

GTM não é obrigatório neste projeto porque GA4 e Meta Pixel já são carregados por `src/lib/marketing.ts` no boot da aplicação.

1. Crie um container no Google Tag Manager.
2. Insira o snippet oficial no `index.html` somente se houver decisão clara de migrar parte do tracking para GTM.
3. Publique o container apenas depois de validar os eventos em Preview Mode.

Configure `VITE_GTM_ID=` apenas quando houver um container oficial.

## Triggers Sugeridos No GTM

- Trigger para evento `checkout_intent`: tipo **Custom Event**, event name `checkout_intent`.
- Trigger para cliques em CTA: tipo **Custom Event**, event name `cta_click`.
- Trigger para visualização de seções: tipo **Custom Event**, event name `section_view`.

## Mapeamento Para GA4

- `checkout_intent`: evento interno de intenção de checkout.
- `cta_click`: evento customizado para análise de cliques.
- `begin_checkout`: evento GA4 enviado com `currency`, `value` e `items`.

## Mapeamento Para Meta

- `PageView`: disparado por `loadMarketingScripts()` uma vez por carregamento real da landing.
- `cta_click`, `faq_open`, `section_view`: enviados como `trackCustom`.
- `InitiateCheckout` e `Purchase`: não são disparados pela landing; devem ser enviados pela Kiwify/API de Conversões quando o checkout abrir e quando a compra for aprovada.

## Mapeamento Para Google Ads

- Configure o clique em checkout como conversão intermediária usando o evento `checkout_intent`.
- A compra final deve ser configurada preferencialmente dentro da Kiwify, quando possível, porque a aprovação acontece no ambiente da plataforma.

## Validação Manual

Abra a landing com parâmetros:

```text
/?utm_source=meta&utm_medium=cpc&utm_campaign=portal_consciencia&sck=adset_01&fbclid=teste123
```

Clique em um CTA de checkout e confira:

- `window.dataLayer` recebeu `cta_click` e `checkout_intent`.
- O Meta Pixel Helper mostra `PageView` e eventos customizados de comportamento, como `cta_click`, sem `InitiateCheckout` antes da Kiwify.
- O GA4 DebugView mostra `page_view`, eventos internos e `begin_checkout`.
- A URL final da Kiwify recebeu UTMs e parâmetros de atribuição.

## Validação De Afiliados

1. Produtor sem atribuição:
   - Limpar `localStorage` ou abrir uma janela anônima.
   - Entrar em `/?utm_source=instagram&utm_medium=organic`.
   - Clicar em um CTA.
   - Esperado: checkout sem `afid` e evento com `checkout_owner=producer`.

2. Afiliado autorizado:
   - Entrar em `/?afid=0KuZXSqT&utm_source=meta&utm_medium=paid_social&src=paid_meta_affiliate`.
   - Clicar em um CTA.
   - Esperado: checkout com `afid=0KuZXSqT` e evento com `checkout_owner=affiliate`.

3. Retorno direto posterior:
   - Depois do cenário 2, voltar à landing sem parâmetros.
   - Clicar em um CTA.
   - Esperado: o `afid` continua presente.

4. Código não cadastrado:
   - Limpar o storage e entrar com `/?afid=CODIGO_INVALIDO`.
   - Clicar em um CTA.
   - Esperado: checkout sem `afid` e evento `affiliate_attribution_rejected`.

## Validação Da Atribuição Assistida

Use janela anônima ou limpe `localStorage` entre cenários quando necessário.

1. Meta paga direta:
   - Entrar com `/?utm_source=meta&utm_medium=paid_social&utm_campaign=carrinho&utm_content=ab_lo&src=paid_meta&fbclid=teste`.
   - Clicar no checkout.
   - Esperado: Kiwify recebe `src=paid_meta`.

2. Bio orgânica sem histórico pago:
   - Limpar storage.
   - Entrar com `/?utm_source=ig&utm_medium=social&utm_content=link_in_bio`.
   - Clicar no checkout.
   - Esperado: Kiwify recebe `src=organic_ig`.

3. Bio orgânica com assistência Meta:
   - Primeiro entrar com a URL paga do cenário 1.
   - Depois entrar com `/?utm_source=ig&utm_medium=social&utm_content=link_in_bio`.
   - Clicar no checkout.
   - Esperado: Kiwify recebe `src=paid_meta_assist_0d` no mesmo dia, ou `src=paid_meta_assist_Xd` em dias posteriores, e mantém as UTMs da bio.

4. Janela expirada:
   - Simular toque pago antigo acima de 365 dias no storage ou reduzir temporariamente `VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS`.
   - Entrar pela bio e clicar no checkout.
   - Esperado: não marcar `paid_meta_assist_Xd`.

5. Storage indisponível:
   - Bloquear storage no navegador.
   - Navegar e clicar no checkout.
   - Esperado: site não quebra e segue a atribuição atual.
