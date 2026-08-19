# Checklist De Compliance Para Meta Ads

Este checklist reduz riscos de reprovação por destino pouco transparente, política ausente, rastreamento sem aviso, promessa agressiva ou inconsistência entre anúncio, landing e checkout.

Ele não garante aprovação automática. A Meta revisa texto, criativo, segmentação e também o destino do anúncio, incluindo landing page e site.

## Implementado No Projeto

- Página pública de privacidade: `/politica-de-privacidade.html`.
- Link de Política de Privacidade no rodapé.
- Não há banner de consentimento ativo nesta fase do funil.
- Rastreamento ativo por padrão para leitura do funil.
- Meta Pixel e GA4 são carregados por `src/lib/marketing.ts`.
- `_fbp` e `_fbc` são lidos por padrão quando disponíveis.
- Aviso legal no rodapé.
- Suporte por WhatsApp no FAQ e rodapé.
- Checkout com UTMs preservadas e origem organizada em `src`.
- CTA de anúncio deve levar para a landing, não direto para o checkout.

## Antes De Subir Campanha

1. Abrir `https://eusouvibrante.com/` em desktop e mobile.
2. Confirmar que a página carrega sem erro visual.
3. Confirmar que o botão de checkout funciona.
4. Confirmar que `/politica-de-privacidade.html` abre diretamente.
5. Confirmar que o link de Política de Privacidade aparece no rodapé.
6. Conferir se Pixel/GA4 aparecem no Meta Pixel Helper/GA DebugView.
7. Conferir que preço, garantia e produto no anúncio batem com a landing.
8. Conferir que a URL do anúncio usa UTMs padronizadas.

## Copy Segura Para O Nicho

Evitar frases que afirmem atributo pessoal sensível ou estado emocional/espiritual do usuário.

Evitar:

```text
Você está perdido espiritualmente?
Sua alma está bloqueada?
Você sofre porque está desconectado?
Só pessoas espiritualizadas vão entender.
```

Preferir:

```text
Um espaço de reconexão com clareza e profundidade.
Conheça o Portal da Consciência.
Clareza no meio do ruído.
Uma experiência digital para organizar a percepção.
```

## Landing Page

Manter sempre visível:

- Nome do produto.
- O que é vendido.
- Preço ou caminho claro até o preço.
- Botão de compra funcional.
- Garantia informada de forma simples.
- Suporte.
- Aviso legal.
- Política de Privacidade.

Evitar:

- Pop-ups que impedem navegação.
- Download automático.
- Redirecionamento inesperado antes de o usuário clicar.
- Promessa absoluta de transformação, cura, resultado financeiro ou espiritual.
- Conteúdo que pareça diagnóstico de saúde, religião, sofrimento emocional ou condição pessoal.
- Texto no anúncio prometendo algo que a landing não mostra.

## Rastreamento

Configuração recomendada para Meta Ads:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=pc_br_prospecting_test_202606&utm_term={{adset.name}}&utm_content={{ad.name}}&src=paid_meta&sck={{campaign.id}}__{{adset.id}}__{{ad.id}}
```

Regras:

- `src=paid_meta` nos anúncios pagos.
- Não enviar `s1`, `s2` e `s3` no anúncio.
- Deixar a landing preencher `s1`, `s2` e `s3` com o CTA real clicado.
- Não classificar tráfego como pago apenas porque existe `fbp`.
- Não colocar token privado da API de Conversões no frontend.

## Checkout E Kiwify

Confirmar:

- Pixel ID igual ao da landing: `848117227912665`.
- Evento final `Purchase` ativo na Kiwify.
- Valor real do pedido em `BRL`.
- API de Conversões/token configurado somente na Kiwify ou backend privado.
- Políticas e garantia coerentes com a landing.

## Referências

- Meta Ad Review: https://www.facebook.com/business/ads/review-policy-guidelines
- Meta Advertising Standards: https://www.facebook.com/policies/ads/
- Meta Business Tools: https://www.facebook.com/help/331509497253087/
- Meta Business Tools Terms: https://www.facebook.com/legal/terms/businesstools/
- Meta Privacy Policy: https://www.facebook.com/privacy/policy/
- ANPD - Aviso de Privacidade: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade/aviso-de-privacidade
- ANPD - Guia de Cookies: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf

