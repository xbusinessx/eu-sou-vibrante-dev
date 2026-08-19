# Playbook De Campanha Meta Ads - Portal Da Consciencia

Este documento registra a estrutura recomendada de campanha para vender o produto digital **Portal da Consciencia** usando Meta Ads, com foco em rastreamento limpo, leitura de criativos, separacao entre trafego organico/pago e uso correto das UTMs ja suportadas pela landing page.

## Resumo Executivo

Plano recomendado para inicio:

- 1 campanha principal de prospeccao BR.
- 3 conjuntos de anuncios frios.
- 3 anuncios por conjunto.
- 2 formatos por anuncio: feed 4:5 e story/reels 9:16.
- 9 anuncios ativos na campanha principal.
- 18 artes totais para a campanha principal.
- Orcamento inicial recomendado: **R$ 180/dia por 7 dias**.
- Campanha de remarketing opcional: **R$ 30/dia** quando houver volume minimo.
- Campanha Portugal opcional: **R$ 35/dia** separada, por causa do tamanho menor do lookalike.

Estrutura recomendada no primeiro ciclo:

```text
Campanha BR Prospecção: R$ 180/dia
  Conjunto 1 - Lookalike compradores 1% BR: R$ 70/dia
  Conjunto 2 - Broad/Advantage+ Audience BR: R$ 70/dia
  Conjunto 3 - Interesses autoconhecimento BR: R$ 40/dia

Campanha BR Remarketing: R$ 30/dia, opcional
Campanha PT Lookalike: R$ 35/dia, opcional
```

Se o investimento total precisar ser menor, usar apenas:

```text
R$ 120/dia
  Lookalike compradores 1% BR: R$ 60/dia
  Broad/Advantage+ Audience BR: R$ 60/dia
```

Neste caso, nao iniciar o conjunto de interesses. E melhor concentrar dados em poucos conjuntos do que dividir demais o orcamento.

## Premissas Do Projeto

- Produto: Portal da Consciencia.
- Oferta atual: `12x de R$ 15,20` ou `R$ 147 a vista`.
- Checkout: Kiwify.
- Pixel instalado: `848117227912665`.
- GA4 instalado: `G-C6XY55NJG0`.
- A landing captura e repassa: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `fbp`, `fbc`, `gclid`, `gbraid`, `wbraid`, `src`, `sck`, `s1`, `s2`, `s3`.
- A landing preserva a origem de trafego em `src`.
- A landing preenche `s1`, `s2` e `s3` no clique de checkout quando a campanha nao enviou esses parametros.

Regra importante:

- Nos anuncios, preencher `src=paid_meta`.
- Nos anuncios, nao preencher `s1`, `s2` e `s3`.
- Deixar `s1`, `s2` e `s3` para a landing identificar qual CTA levou ao checkout.

Isso evita confundir origem de trafego com posicao do botao.

## Antes De Subir A Campanha

1. Confirmar se a Kiwify esta enviando evento `Purchase` para a Meta.
2. Confirmar se a Kiwify esta usando o mesmo Pixel ID da landing: `848117227912665`.
3. Confirmar se a API de Conversoes/token esta configurada somente na Kiwify ou em backend privado.
4. Nunca colocar token da API de Conversoes em `VITE_`, `index.html`, JavaScript publico ou Git.
5. Validar no Gerenciador de Eventos:
   - `PageView` na landing.
   - `cta_click`/eventos de comportamento na landing.
   - `InitiateCheckout` somente ao abrir o checkout da Kiwify.
   - `Purchase` quando a compra for aprovada na Kiwify.
6. Conferir se o dominio `eusouvibrante.com` esta verificado no Business Manager.
7. Criar ou atualizar os publicos:
   - Compradores Kiwify, 354 pessoas.
   - Lookalike 1% BR dos compradores.
   - Lookalike 1% PT dos compradores.
   - Visitantes do site 30 dias.
   - Engajados Instagram/Facebook 365 dias.
   - InitiateCheckout 30 dias, se o evento ja existir.
8. Criar publico de exclusao:
   - Compradores 180 dias.
   - Compradores 365 dias, se disponivel.

## Convencao De Nomes

Usar nomes sem acento, sem espaco e com data. Isso melhora leitura no Ads Manager, GA4, Kiwify e planilhas.

### Campanhas

```text
PC_BR_PROSPECTING_TEST_202606
PC_BR_REMARKETING_202606
PC_PT_LAL_TEST_202606
PC_BR_SCALE_CBO_202606
```

### Conjuntos

```text
AS_BR_LAL_1P_BUYERS_354
AS_BR_BROAD_ADVANTAGE
AS_BR_INTERESTS_SELFKNOWLEDGE
AS_BR_RETARGET_30D
AS_PT_LAL_1P_BUYERS_354
```

### Anuncios

```text
AD01_PORTAL_ABERTO_FEED
AD01_PORTAL_ABERTO_STORY
AD02_CAMPO_PERCEPCAO_FEED
AD02_CAMPO_PERCEPCAO_STORY
AD03_CLAREZA_RUIDO_FEED
AD03_CLAREZA_RUIDO_STORY
```

Na Meta, o ideal e criar **1 anuncio por conceito**, usando personalizacao de criativo por posicionamento para anexar a arte 4:5 no Feed e a arte 9:16 em Stories/Reels. Se a conta nao permitir essa configuracao com clareza, criar anuncios separados por formato.

## Estrutura Da Campanha Principal

### Campanha 1 - Prospecção BR

Nome:

```text
PC_BR_PROSPECTING_TEST_202606
```

Objetivo:

```text
Vendas
```

Local de conversao:

```text
Website
```

Evento de otimizacao:

```text
Purchase
```

Se `Purchase` ainda nao estiver chegando corretamente pela Kiwify, usar temporariamente:

```text
InitiateCheckout
```

Assim que `Purchase` estiver validado, voltar para otimizacao de compra.

Tipo de orcamento no primeiro ciclo:

```text
Orcamento no conjunto de anuncios
```

Motivo: no primeiro teste, queremos forcar leitura minima dos tres tipos de publico. Depois dos 7 primeiros dias, os vencedores devem ir para uma campanha de escala com orcamento de campanha Advantage+.

Posicionamentos:

```text
Advantage+ Placements
```

Motivo: a Meta consegue distribuir entrega entre Feed, Stories, Reels, Facebook, Instagram, Messenger e Audience Network conforme oportunidade. Como o projeto tera artes 4:5 e 9:16, a campanha fica preparada para mais posicionamentos.

### Conjunto 1 - Lookalike Compradores BR

Nome:

```text
AS_BR_LAL_1P_BUYERS_354
```

Orcamento:

```text
R$ 70/dia
```

Publico:

```text
Lookalike 1% Brasil baseado nos 354 compradores
```

Localizacao:

```text
Brasil
```

Idade:

```text
24+
```

Idioma:

```text
Portugues
```

Exclusoes:

```text
Compradores 180/365 dias
```

Observacao:

Este e o conjunto com maior intencao estatistica inicial porque parte de compradores reais. Mesmo com 354 compradores, o lookalike de 1% BR com 1,1 a 1,3 milhao de pessoas e suficiente para testar.

### Conjunto 2 - Broad/Advantage BR

Nome:

```text
AS_BR_BROAD_ADVANTAGE
```

Orcamento:

```text
R$ 70/dia
```

Publico:

```text
Aberto / Advantage+ Audience
```

Localizacao:

```text
Brasil
```

Idade:

```text
24+
```

Idioma:

```text
Portugues
```

Exclusoes:

```text
Compradores 180/365 dias
```

Direcionamento:

```text
Sem interesses obrigatorios
```

Observacao:

Este conjunto deixa a Meta encontrar padroes usando criativo, pixel e comportamento. Ele e importante porque, em contas atuais, publico amplo frequentemente compete bem com interesses e lookalikes quando os criativos sao claros.

### Conjunto 3 - Interesses Autoconhecimento BR

Nome:

```text
AS_BR_INTERESTS_SELFKNOWLEDGE
```

Orcamento:

```text
R$ 40/dia
```

Publico:

```text
Brasil, 24+, Portugues
```

Interesses sugeridos:

```text
Autoconhecimento
Meditacao
Mindfulness
Desenvolvimento pessoal
Espiritualidade
Terapias integrativas
Yoga
Filosofia
Consciencia
```

Exclusoes:

```text
Compradores 180/365 dias
```

Observacao:

Este conjunto recebe menos verba porque e mais sujeito a sobreposicao e limitacao. Ele existe para testar o angulo nichado, nao para carregar a conta inteira.

## Campanha De Remarketing

Subir esta campanha se houver volume minimo. Se a landing acabou de ir ao ar e ainda nao tem trafego, esperar acumular pelo menos algumas centenas de visitantes ou engajados.

Nome:

```text
PC_BR_REMARKETING_202606
```

Orcamento:

```text
R$ 30/dia
```

Objetivo:

```text
Vendas
```

Evento:

```text
Purchase
```

Conjunto:

```text
AS_BR_RETARGET_30D
```

Publicos incluidos:

```text
Visitantes do site 30 dias
Engajados Instagram/Facebook 365 dias
Pessoas que iniciaram checkout 30 dias
Pessoas que assistiram videos/reels 50% ou mais, se houver
```

Exclusoes:

```text
Compradores 180/365 dias
```

Anuncios:

```text
AD04_GARANTIA_RETORNO
AD05_ACESSO_IMEDIATO
AD06_FECHAMENTO_PORTAL
```

Tom:

- Mais direto.
- Reforcar acesso imediato.
- Reforcar garantia de 7 dias.
- Reforcar compra segura.
- Evitar urgencia falsa.

## Campanha Portugal

Rodar separada do Brasil. O lookalike de Portugal com aproximadamente 88 mil pessoas e pequeno, entao precisa de orcamento controlado.

Nome:

```text
PC_PT_LAL_TEST_202606
```

Orcamento:

```text
R$ 35/dia
```

Conjunto:

```text
AS_PT_LAL_1P_BUYERS_354
```

Publico:

```text
Lookalike 1% Portugal baseado nos 354 compradores
```

Localizacao:

```text
Portugal
```

Idioma:

```text
Portugues
```

Exclusoes:

```text
Compradores 180/365 dias
```

Anuncios:

Usar os mesmos 3 conceitos criativos do Brasil, mas revisar a copy para soar neutra no portugues de Portugal.

## Campanha De Escala

Depois dos 7 primeiros dias, criar uma campanha de escala com os melhores aprendizados.

Nome:

```text
PC_BR_SCALE_CBO_202606
```

Tipo de orcamento:

```text
Advantage+ Campaign Budget
```

Orcamento inicial:

```text
R$ 180/dia a R$ 300/dia
```

Estrutura:

```text
AS_BR_WINNERS_BROAD_LAL
AS_BR_WINNERS_CREATIVE_TEST
```

Regra:

- Levar apenas os melhores 2 a 4 anuncios.
- Nao levar todos os criativos testados.
- Aumentar orcamento em blocos de 20% a 30% a cada 48 horas se o CPA estiver dentro da meta.
- Se o CPA subir muito depois do aumento, manter verba por mais 24 a 48 horas antes de desfazer, salvo se houver erro claro.

## Anuncios Da Campanha Principal

Cada conjunto da campanha principal deve ter os mesmos 3 conceitos para leitura justa:

```text
AS_BR_LAL_1P_BUYERS_354
  AD01_PORTAL_ABERTO
  AD02_CAMPO_PERCEPCAO
  AD03_CLAREZA_RUIDO

AS_BR_BROAD_ADVANTAGE
  AD01_PORTAL_ABERTO
  AD02_CAMPO_PERCEPCAO
  AD03_CLAREZA_RUIDO

AS_BR_INTERESTS_SELFKNOWLEDGE
  AD01_PORTAL_ABERTO
  AD02_CAMPO_PERCEPCAO
  AD03_CLAREZA_RUIDO
```

Total:

```text
3 conjuntos x 3 anuncios = 9 anuncios
9 anuncios x 2 formatos = 18 artes
```

## Criativos

### AD01 - Portal Aberto

Objetivo:

Converter pessoas parecidas com compradores e publico amplo com um angulo claro de entrada.

Texto na arte:

```text
O portal esta aberto
```

Texto secundario:

```text
Uma jornada de reconexao com clareza e profundidade
```

CTA visual:

```text
Acessar o Portal
```

Primary text:

```text
O Portal da Consciencia foi criado como uma experiencia digital de reconexao, estudo e aprofundamento perceptivo.

Entre agora e receba acesso imediato.
```

Headline:

```text
O portal esta aberto
```

Description:

```text
Acesso imediato e garantia de 7 dias.
```

Botao Meta:

```text
Saiba mais
```

### AD02 - Campo De Percepcao

Objetivo:

Atrair o publico de autoconhecimento, espiritualidade leve e desenvolvimento pessoal sem afirmar caracteristicas pessoais sensiveis.

Texto na arte:

```text
Um campo para reorganizar a percepcao
```

Texto secundario:

```text
Conheca o Portal da Consciencia
```

CTA visual:

```text
Acessar agora
```

Primary text:

```text
Um material digital para estudar, sentir e organizar a percepcao sobre a realidade de dentro para fora.

Conheca o Portal da Consciencia.
```

Headline:

```text
Reorganize a percepcao
```

Description:

```text
Conteudo digital com acesso imediato.
```

Botao Meta:

```text
Saiba mais
```

### AD03 - Clareza No Ruido

Objetivo:

Abrir conversa com publico amplo, usando uma promessa segura e universal.

Texto na arte:

```text
Clareza no meio do ruido
```

Texto secundario:

```text
Uma experiencia digital para olhar para dentro com profundidade
```

CTA visual:

```text
Entrar no Portal
```

Primary text:

```text
No excesso de informacao, existe um espaco para voltar ao essencial com clareza, profundidade e presenca.

Acesse o Portal da Consciencia.
```

Headline:

```text
Clareza no meio do ruido
```

Description:

```text
Entre no Portal da Consciencia.
```

Botao Meta:

```text
Saiba mais
```

## Prompt Para Gerar As 18 Artes

Usar este prompt para gerar os 3 conceitos em feed e story/reels.

```text
Crie artes publicitarias para Meta Ads do produto digital "Portal da Consciencia", baseado em uma landing page premium, escura, mistica e sofisticada.

Contexto do produto:
O Portal da Consciencia e um material digital de reconexao, autoconhecimento e expansao perceptiva. A identidade visual usa fundo preto profundo, dourado energetico, luz vibracional, atmosfera cosmica, simbolo branco minimalista, estetica premium, espiritual sem parecer religiosa, moderna e cinematografica. O CTA principal e "Acessar o Portal".

Gerar 3 conceitos criativos, cada conceito com 2 formatos:
1. Feed 4:5, 1080x1350.
2. Story/Reels 9:16, 1080x1920.

Direcao visual geral:
- Fundo escuro com energia dourada/vibracional, parecido com aura, campo energetico, geometria sutil e luz.
- Visual premium, limpo, profundo, nao poluido.
- Usar contraste forte entre preto, branco, dourado e um detalhe verde neon no CTA.
- Deixar area segura para texto, sem encostar nas bordas.
- Nao usar aparencia religiosa, igrejas, santos, cruzes, promessas milagrosas ou linguagem de cura.
- Nao usar antes/depois.
- Nao usar textos que parecam diagnosticar a pessoa.
- A arte deve parecer de um produto digital serio, sofisticado e transformador.

Identidade:
- Incluir a logo/simbolo branco no topo ou canto superior.
- Tipografia bold, limpa, moderna, sem serifas.
- Textos grandes, poucos elementos, alta legibilidade no celular.
- Maximo 2 blocos de texto por arte.

Criativo 1: Portal Aberto
Texto principal: "O portal esta aberto"
Texto secundario: "Uma jornada de reconexao com clareza e profundidade"
CTA visual: "Acessar o Portal"

Criativo 2: Campo De Percepcao
Texto principal: "Um campo para reorganizar a percepcao"
Texto secundario: "Conheca o Portal da Consciencia"
CTA visual: "Acessar agora"

Criativo 3: Clareza No Ruido
Texto principal: "Clareza no meio do ruido"
Texto secundario: "Uma experiencia digital para olhar para dentro com profundidade"
CTA visual: "Entrar no Portal"

Entregar cada conceito em feed e story/reels, mantendo a mesma identidade e adaptando a composicao para cada formato.
No Story/Reels, deixar o texto centralizado entre o topo e o meio, com CTA mais proximo do terco inferior.
No Feed, usar composicao equilibrada com logo no topo, headline grande no centro e CTA na parte inferior.
```

## Parametros De URL

O anuncio deve mandar o usuario para a landing, nao direto para o checkout.

URL do site:

```text
https://eusouvibrante.com/
```

Campo **URL parameters** no Meta Ads:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=pc_br_prospecting_test_202606&utm_term={{adset.name}}&utm_content={{ad.name}}&src=paid_meta&sck={{campaign.id}}__{{adset.id}}__{{ad.id}}
```

Para Portugal:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=pc_pt_lal_test_202606&utm_term={{adset.name}}&utm_content={{ad.name}}&src=paid_meta&sck={{campaign.id}}__{{adset.id}}__{{ad.id}}
```

Para remarketing:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=pc_br_remarketing_202606&utm_term={{adset.name}}&utm_content={{ad.name}}&src=paid_meta&sck={{campaign.id}}__{{adset.id}}__{{ad.id}}
```

Observacoes:

- `utm_source=meta`: identifica a plataforma.
- `utm_medium=paid_social`: separa trafego pago de organico.
- `utm_campaign`: identifica campanha.
- `utm_term`: recebe o nome do conjunto.
- `utm_content`: recebe o nome do anuncio/criativo.
- `src=paid_meta`: informa ao checkout que a origem e Meta Ads.
- `sck`: carrega IDs de campanha, conjunto e anuncio.
- Nao adicionar `s1`, `s2` e `s3` nos anuncios.

Quando o usuario clicar no CTA de checkout dentro da landing, o site monta a URL final da Kiwify preservando esses dados e adicionando:

```text
s1=cta_...
s2=section_...
s3=landing_page
```

Assim fica possivel saber:

- Qual campanha trouxe a visita.
- Qual conjunto trouxe a visita.
- Qual anuncio trouxe a visita.
- Qual CTA da landing levou ao checkout.

## Exemplos De URLs

### Clique vindo de anuncio Meta

Entrada na landing:

```text
https://eusouvibrante.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pc_br_prospecting_test_202606&utm_term=AS_BR_LAL_1P_BUYERS_354&utm_content=AD01_PORTAL_ABERTO&src=paid_meta&sck=120000000__120000001__120000002
```

Saida para Kiwify depois do clique no CTA:

```text
https://pay.kiwify.com.br/s7qqPEZ?utm_source=meta&utm_medium=paid_social&utm_campaign=pc_br_prospecting_test_202606&utm_term=AS_BR_LAL_1P_BUYERS_354&utm_content=AD01_PORTAL_ABERTO&src=paid_meta&sck=120000000__120000001__120000002&s1=cta_hero_primary&s2=section_hero&s3=landing_page&fbp=...
```

### Clique organico sem UTM

Saida para Kiwify:

```text
https://pay.kiwify.com.br/s7qqPEZ?src=site_direct&s1=cta_offer_primary&s2=section_investimento&s3=landing_page&fbp=...
```

### Clique organico com UTM do Instagram

Entrada na landing:

```text
https://eusouvibrante.com/?utm_source=instagram&utm_medium=organic&utm_campaign=bio_instagram
```

Saida para Kiwify:

```text
https://pay.kiwify.com.br/s7qqPEZ?utm_source=instagram&utm_medium=organic&utm_campaign=bio_instagram&src=organic_instagram&s1=cta_offer_primary&s2=section_investimento&s3=landing_page&fbp=...
```

## Padrao De Leitura Na Kiwify

Na Kiwify, a leitura deve ser:

```text
src = canal/origem
utm_campaign = campanha
utm_term = conjunto de anuncio
utm_content = anuncio/criativo
sck = IDs Meta de campanha/conjunto/anuncio
s1 = CTA clicado na landing
s2 = secao do CTA
s3 = landing_page
```

Exemplos de `src`:

```text
paid_meta
paid_google
organic_instagram
site_direct
meta_referral
```

`fbp` nao deve ser usado para classificar trafego como pago. Ele e apenas identificador do navegador criado pelo Pixel e pode existir em trafego pago, organico ou direto.

## Regras De Copy E Compliance

Evitar frases que parecam afirmar atributos pessoais da pessoa que esta vendo o anuncio.

Evitar:

```text
Voce esta perdido espiritualmente?
Voce sente que sua alma esta bloqueada?
Voce esta desconectado da sua essencia?
So pessoas espirituais vao entender.
```

Preferir:

```text
Um espaco de reconexao com clareza e profundidade.
Uma experiencia digital para organizar a percepcao.
Conheca o Portal da Consciencia.
Clareza no meio do ruido.
```

Tambem evitar:

- Promessas absolutas.
- Garantia de transformacao pessoal.
- Antes/depois emocional.
- Linguagem de cura.
- Afirmacoes religiosas.
- Excesso de urgencia artificial.

## Rotina De Otimizacao

### Dia 0 - Publicacao

Checklist:

- Todas as UTMs aplicadas antes de publicar.
- Todos os anuncios com nome correto.
- Todos os conjuntos excluindo compradores.
- Pixel e evento configurados.
- Landing abrindo corretamente no mobile.
- Checkout abrindo corretamente.
- Teste manual de URL com parametros.

Nao editar campanha logo depois de publicar, salvo erro grave.

### Dia 1

Verificar:

- Se todos os conjuntos estao entregando.
- Se todos os anuncios foram aprovados.
- Se PageView e eventos de comportamento da landing aparecem.
- Se InitiateCheckout aparece somente depois de abrir o checkout da Kiwify.
- Se a URL da Kiwify recebe UTMs.

Nao pausar criativos apenas por ansiedade de primeiro dia, a nao ser que haja gasto sem nenhum sinal de qualidade.

### Dia 3

Olhar por conjunto e anuncio:

- CTR link.
- CPC link.
- Visualizacao da pagina de destino.
- Clique no CTA.
- InitiateCheckout.
- Compra.
- CPA.

Regras iniciais:

- Anuncio com CTR link muito abaixo dos outros e sem checkout pode ser pausado.
- Anuncio com checkout, mas sem compra, deve continuar ate gastar volume suficiente.
- Conjunto com compra deve manter verba.
- Conjunto sem nenhuma intencao depois de gastar 1 a 1,5x o CPA alvo pode ser reduzido.

### Dia 7

Decisoes:

- Identificar os 2 a 4 melhores anuncios.
- Identificar se lookalike, broad ou interesses ganhou.
- Pausar os anuncios claramente perdedores.
- Criar campanha de escala com vencedores.
- Criar novas variacoes dos angulos vencedores.

## Indicadores De Controle

Como o produto custa R$ 147 a vista, os limites dependem da margem e do objetivo de caixa. Como ponto de partida:

```text
CPA compra ideal: abaixo de R$ 45
CPA compra aceitavel no teste: R$ 45 a R$ 70
CPA acima de R$ 70: revisar criativo, oferta, pagina ou checkout
```

Indicadores de diagnostico:

```text
CTR link baixo: problema de criativo/copy
CPC alto: criativo fraco ou publico muito disputado
Muitos cliques e poucas visualizacoes de pagina: problema de carregamento ou qualidade do clique
Muitas visitas e poucos cliques em CTA: problema de landing/oferta
Muitos checkouts e poucas compras: problema de checkout, preco, confianca ou pagamento
```

## Quando Escalar

Escalar quando houver:

- Pelo menos 3 compras no mesmo conjunto ou criativo.
- CPA dentro da faixa aceitavel.
- Consistencia por 48 horas.
- Evento `Purchase` chegando corretamente.

Escala recomendada:

```text
Dia 1 da escala: R$ 180/dia
Depois de 48h positivo: R$ 230/dia
Depois de mais 48h positivo: R$ 300/dia
Depois de mais 48h positivo: aumentar 20% a 30%
```

Se o orcamento inicial ja for R$ 300/dia, nao subir mais ate ter dados de compra suficientes.

## Quando Cortar

Cortar ou pausar se:

- Anuncio gastou R$ 80 a R$ 120 sem checkout e com CTR baixo.
- Conjunto gastou 1,5x a 2x o CPA aceitavel sem compra.
- A frequencia no remarketing passou de 5 e o CPA piorou.
- O criativo foi rejeitado por politica.
- Comentarios negativos indicam promessa confusa, linguagem sensivel ou percepcao de golpe.

Nao cortar:

- Anuncio com pouco gasto.
- Anuncio que gerou checkout mas ainda nao teve tempo de fechar compra.
- Conjunto em aprendizado com menos de 48 horas, salvo erro claro.

## Plano De Criativos Para Segundo Ciclo

Depois do primeiro teste, criar 3 novas variacoes baseadas nos vencedores:

```text
Vencedor AD01: criar AD01B com headline mais direta.
Vencedor AD02: criar AD02B com visual mais premium e menos texto.
Vencedor AD03: criar AD03B com foco em garantia/acesso imediato.
```

Nao trocar todos os criativos de uma vez. Manter o vencedor original rodando e adicionar variacoes.

## Estrutura Recomendada No Ads Manager

```text
PC_BR_PROSPECTING_TEST_202606
  AS_BR_LAL_1P_BUYERS_354 - R$ 70/dia
    AD01_PORTAL_ABERTO
    AD02_CAMPO_PERCEPCAO
    AD03_CLAREZA_RUIDO

  AS_BR_BROAD_ADVANTAGE - R$ 70/dia
    AD01_PORTAL_ABERTO
    AD02_CAMPO_PERCEPCAO
    AD03_CLAREZA_RUIDO

  AS_BR_INTERESTS_SELFKNOWLEDGE - R$ 40/dia
    AD01_PORTAL_ABERTO
    AD02_CAMPO_PERCEPCAO
    AD03_CLAREZA_RUIDO

PC_BR_REMARKETING_202606 - R$ 30/dia
  AS_BR_RETARGET_30D
    AD04_GARANTIA_RETORNO
    AD05_ACESSO_IMEDIATO
    AD06_FECHAMENTO_PORTAL

PC_PT_LAL_TEST_202606 - R$ 35/dia
  AS_PT_LAL_1P_BUYERS_354
    AD01_PORTAL_ABERTO
    AD02_CAMPO_PERCEPCAO
    AD03_CLAREZA_RUIDO
```

## Referencias

- Meta Advantage+ Campaign Budget: https://www.facebook.com/business/ads/meta-advantage-plus/budget
- Meta Advantage+ Placements: https://www.facebook.com/business/ads/meta-advantage-plus/placements
- Meta Simplified Ad Set Structure: https://www.facebook.com/business/ads/ad-set-structure
- Meta Advertising Standards: https://www.facebook.com/policies/ads/
- Meta dynamic URL parameters, apoio operacional: https://www.utmmind.com/blog/meta-ads-dynamic-url-parameters-guide

