# Kiwify E UTMs

A Kiwify aceita UTMs e parâmetros de rastreio na URL do checkout. Esta landing preserva os parâmetros capturados e os repassa antes do redirecionamento.

Observação de rastreamento: nesta versão não existe banner de consentimento ativo. `_fbp` e `_fbc` podem ser lidos/repassados por padrão para preservar a leitura do funil. UTMs de URL continuam sendo preservadas para organização de campanha.

## Parâmetros Repassados

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
- `afid`, somente quando cadastrado, ativo e associado ao navegador

## Afiliado Atual

O afiliado autorizado usa a página de vendas, e não o checkout direto:

```text
https://www.eusouvibrante.com/?afid=0KuZXSqT
```

Configuração recomendada nos parâmetros de URL do anúncio Meta:

```text
utm_source=meta
utm_medium=paid_social
utm_campaign={{campaign.id}}
utm_term={{adset.id}}
utm_content={{ad.id}}
src=paid_meta_affiliate
afid=0KuZXSqT
```

Após a leitura da página, todos os CTAs acrescentam automaticamente o identificador ao checkout:

```text
https://pay.kiwify.com.br/s7qqPEZ?afid=0KuZXSqT&...
```

Visitas sem um afiliado autorizado seguem para o mesmo checkout sem `afid`. A atribuição first-party atual não expira por prazo definido pela aplicação: depois de um toque válido, o mesmo navegador continua enviando o `afid` em compras futuras.

O navegador ainda pode perder essa associação se seus dados forem apagados, se a navegação for privada ou se a pessoa trocar de navegador ou dispositivo. Garantia permanente entre dispositivos exige identificação do comprador e armazenamento no servidor.

## Organização Atual De Atribuição

A landing separa origem de tráfego e posição do CTA:

- `src`: representa a origem/canal da visita.
- `s1`: identifica o CTA clicado, quando a campanha não enviou `s1`.
- `s2`: identifica a seção do CTA, quando a campanha não enviou `s2`.
- `s3`: recebe `landing_page`, quando a campanha não enviou `s3`.

Valores de campanha sempre têm prioridade. Se a URL já chegar com `src`, `s1`, `s2` ou `s3`, esses valores são preservados.

Quando não existe `src`, a landing infere:

- `paid_google`: quando existe `gclid`, `gbraid` ou `wbraid` sem `utm_source`.
- `paid_{utm_source}`: quando `utm_medium` indica tráfego pago, como `cpc`, `paid`, `ads`, `cpm` ou `display`.
- `organic_{utm_source}`: quando `utm_medium` indica orgânico/social, ou quando só existe `utm_source`.
- `email_{utm_source}`: quando `utm_medium=email`.
- `referral_{utm_source}`: quando `utm_medium=referral`.
- `paid_meta`: quando há `fbclid`, mesmo sem UTMs de campanha.
- `meta_referral`: quando há apenas `fbc`, mas não há UTMs de campanha.
- `site_direct`: quando não há parâmetros de origem.

`fbp` sozinho não é tratado como origem paga. Ele é apenas o identificador do navegador criado pelo Meta Pixel, pode existir em tráfego orgânico, pago ou direto, e só é repassado quando disponível e autorizado.

Para melhorar a correspondência da API de Conversões, a landing também repassa os aliases `_fbp` e `_fbc`. Eles carregam os mesmos valores de `fbp` e `fbc`, mas com os nomes dos cookies do navegador, ajudando integrações que leem os parâmetros pelo padrão de cookie.

## Assistência Meta Ads 365 Dias

A Kiwify aceita `src`, `sck`, UTMs e `s1/s2/s3`. Como não há garantia de campos customizados no pedido, a marcação de assistência usa `src` de forma controlada.

Regra atual:

- Entrada Meta paga atual: mantém `src=paid_meta`.
- Entrada orgânica Instagram sem histórico pago: mantém/inferirá `src=organic_ig`.
- Entrada orgânica Instagram com clique Meta pago salvo nos últimos 365 dias: envia `src=paid_meta_assist_Xd`.

O `X` em `paid_meta_assist_Xd` é calculado no momento do checkout a partir da data do primeiro clique pago Meta salvo. Exemplo: se a pessoa clicou no anúncio em 30/06/2026 e comprou em 15/07/2026, o checkout recebe `src=paid_meta_assist_15d`.

As UTMs continuam representando a visita atual. Exemplo: se a pessoa volta pela bio, o checkout pode receber `src=paid_meta_assist_15d`, `utm_source=ig`, `utm_medium=social` e `utm_content=link_in_bio`. Assim a venda fica marcada como assistida por Meta Ads sem apagar o last click orgânico.

A camada fica em `src/lib/attributionAssist.ts` e pode ser desligada com:

```bash
VITE_ENABLE_ATTRIBUTION_ASSIST=false
```

A janela padrão é 365 dias e pode ser ajustada com:

```bash
VITE_ATTRIBUTION_ASSIST_WINDOW_DAYS=365
```

Para depuração local, acesse a landing com `?debug_attribution=1` e observe o console do navegador. O debug não envia dados para serviços externos.

## Como Montar URLs

O primeiro parâmetro usa `?`. Os demais usam `&`.

Exemplos:

```text
https://pay.kiwify.com.br/s7qqPEZ?src=organic_instagram&s1=cta_hero_primary&s2=section_hero&s3=landing_page
```

```text
https://pay.kiwify.com.br/s7qqPEZ?src=paid_meta&utm_source=meta&utm_medium=cpc&utm_campaign=portal_consciencia&fbclid=...
```

## Padronização Recomendada

- `src=paid_meta|paid_google|organic_instagram|site_direct`
- `sck={{campaign_or_adset_id}}`
- `utm_source=meta|google|tiktok|instagram|email`
- `utm_medium=cpc|social|email|referral|organic`
- `utm_campaign=nome_da_campanha`
- `utm_content=criativo_ou_posicionamento`
- `utm_term=palavra_chave`, quando aplicável

## Compra Aprovada

A landing page rastreia a intenção de checkout sem assumir eventos padrão de compra:

- Meta: `cta_click` como evento customizado de comportamento
- GA4: `begin_checkout`
- Interno/dataLayer: `checkout_intent`

A Kiwify deve ser responsável por `InitiateCheckout`, métodos de pagamento e `Purchase`. A compra aprovada acontece no ambiente da Kiwify. Para a Meta identificar venda, configure na Kiwify:

1. Pixel ID `848117227912665`.
2. Token da API de Conversões/integração direta em campo privado da Kiwify.
3. Evento final como `Purchase`.
4. Valor e moeda do pedido em `BRL`.
5. Teste no Gerenciador de Eventos da Meta, em **Eventos de teste**.

Não coloque o token da API de Conversões no código da landing. Ele é credencial privada.

## Diagnóstico De user_data Na Meta

Se a Meta mostrar alerta de `user_data` ausente em eventos `SERVER`, a origem é a API de Conversões que a Kiwify ou outro servidor está enviando. Do lado da landing, o máximo seguro é repassar `fbclid`, `fbp`, `fbc`, `_fbp` e `_fbc` para o checkout. Email, telefone, nome, sobrenome e deduplicação final precisam ser enviados pela Kiwify quando o usuário preencher o checkout.
