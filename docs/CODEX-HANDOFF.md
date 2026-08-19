# Handoff técnico — Portal da Consciência

Atualizado em 19/08/2026. O código é a fonte de verdade.

## Contrato atual do produto

A landing apresenta o Portal da Consciência como um **programa digital de estudos e práticas**:

- 19 módulos organizados em 8 eixos;
- práticas integrativas e frequências sonoras de apoio;
- entrega em plataforma on-line;
- acesso vitalício;
- garantia de 7 dias;
- preço exibido: R$ 147 à vista ou 12x de R$ 15,20.

Antes de publicar, confirme esses itens no produto e no checkout Kiwify. Depoimentos não são montados porque ainda precisam de validação de formato e autenticidade. O antigo contador sintético de pessoas on-line e o interceptador de saída também não são montados.

## Direção visual

A direção se chama **Caderno de Campo da Consciência**: um arquivo editorial de investigação do invisível, com base carvão, folhas de papel mineral, gravuras do acervo original e anotações manuscritas curtas.

Paleta principal:

- carvão `#12100E`;
- papel `#F0E5CE`;
- ocre `#D3A038`;
- violeta de arquivo `#74506F`;
- ferrugem de correção `#A8513F`.

Tipografia:

- Alegreya: teses, títulos e corpo editorial;
- Instrument Sans: corpo funcional, navegação e controles;
- Kalam: somente notas marginais curtas.

A assinatura é o **fio de leitura**: uma linha ocre que nasce no hero e reaparece como marcador fixo de progresso. As marcas `.is-reading` e `.is-read`, atualizadas por `useReadingMarks`, dão presença ao parágrafo em leitura sem controlar ou alterar a rolagem nativa.

## Stack e comandos

- Vite + React + TypeScript;
- Framer Motion;
- Lucide React;
- Tailwind permanece no toolchain, mas a landing usa o sistema autoral em `src/styles/globals.css`;
- Node 22.x no deploy.

Three.js e o antigo sistema `src/visuals/chakraField/` permanecem instalados e compiláveis, mas não são importados pela landing. Portanto, não existe canvas nem chunk Three no runtime atual.

Comandos de validação:

```bash
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Arquitetura da página

Ordem principal em `src/App.tsx`:

1. `Header` fixo, índice e progresso de leitura;
2. `Hero` como abertura de caderno, com CTA direto e fotografia original;
3. ensaio sobre ruído e integração;
4. prancha de campo sticky que acompanha os registros de leitura;
5. dossiê real do produto com três capas originais;
6. `ModuleShowcase` como índice editorial dos 8 eixos;
7. `OriginalSlideshow` como contato manual das 20 capas;
8. jornada de uso;
9. `OfferCard` como folha de acesso;
10. FAQ e rodapé.

IDs preservados: `topo`, `chamado`, `campo`, `portal`, `conteudo`, `ritmo`, `investimento`, `duvidas` e `aviso-legal`.

A navegação por hash é repetida depois de `document.fonts.ready`, evitando que a troca de fonte desloque o destino em carregamentos diretos com fragmento.

## Componentes sensíveis

### `Hero.tsx`

- H1 textual e único;
- recupera `hero-desktop.webp`, `hero-mobile.webp` e `portal-title.png`;
- CTA `hero_checkout` direto ao checkout;
- CTA secundário `hero_explore_content` para `#conteudo`;
- fatos do produto visíveis e sem claims artificiais.

### `ModuleShowcase.tsx`

- índice vertical com tabs semânticas e roving tabindex;
- suporte a setas, Home e End;
- painel ativo identificado por `tabpanel`;
- ressalva dentro do eixo “Biologia da Ascensão”.

### `OriginalSlideshow.tsx`

- monta apenas a capa ativa e duas adjacentes;
- navegação deliberadamente manual, sem autoplay;
- suporte a setas, Home e End;
- região de carrossel rotulada e live region para a capa ativa;
- imagens derivadas em `Repositório/optimized/`.

### `OfferCard.tsx`

- CTA `offer_primary` acima da dobra do bloco em desktop e mobile;
- preço, parcelamento e garantia legíveis antes do manifesto recolhível;
- gravura original em `offer-bg.webp`;
- sem preço anterior riscado ou urgência artificial.

### `Header.tsx`

- CTA desktop `header_checkout`;
- CTA mobile `mobile_header_checkout`;
- menu informa `aria-expanded`/`aria-controls`;
- Escape fecha e devolve foco ao botão;
- navegar move foco ao destino;
- publica `--page-progress` para o fio de leitura.

## Tracking e checkout

O boot fica em `src/App.tsx`. Ele:

- preserva UTMs;
- captura atribuição de afiliado;
- registra `page_view_ready`;
- observa `[data-track-section]` e envia `section_view` uma única vez por seção;
- carrega os scripts de marketing centralizados.

Arquivos de referência:

- `src/lib/tracking.ts`;
- `src/lib/checkout.ts`;
- `src/lib/affiliateAttribution.ts`;
- `src/lib/attributionAssist.ts`;
- `src/lib/marketing.ts`;
- `docs/TRACKING.md`;
- `docs/KIWIFY-UTM.md`.

O link do checkout deve vir de `VITE_CHECKOUT_URL`. Nunca exponha tokens privados em variáveis `VITE_`.

## Responsividade e acessibilidade

Breakpoints principais:

- 1100px: compactação das composições;
- 900px: navegação vira menu e layouts principais passam para uma coluna;
- 680px: telefone;
- 390px: simplificação do lockup e de detalhes marginais.

Base de acessibilidade:

- `lang="pt-BR"`;
- skip link para `#conteudo-principal`;
- um único H1;
- landmarks semânticos;
- foco visível;
- menu com retorno de foco;
- tabs e carrossel operáveis por teclado;
- `prefers-reduced-motion` no DOM;
- SVGs e marcas decorativas escondidos da árvore acessível;
- zero scroll hijacking.

Testes visuais concluídos em 1536×864, 912×900, 390×844 e 320×667. Confirme ao alterar layout que `document.documentElement.scrollWidth <= innerWidth`.

## Assets e performance

- Os PNGs originais permanecem como fonte.
- Derivados WebP ficam em `src/assets/optimized/` e `Repositório/optimized/`.
- A landing reutiliza a figura áurea, a prancha de chakras, o wordmark, o símbolo e as capas reais.
- O carrossel evita montar as 20 capas ao mesmo tempo.
- O build atual não emite o antigo chunk lazy de Three.js.

Garanta que os WebP otimizados entrem no commit/deploy; imports ausentes quebram CI.

## Checklist antes de publicar

1. Rodar typecheck, lint e build.
2. Revisar a landing em desktop, tablet e telefones estreitos.
3. Testar `prefers-reduced-motion`.
4. Navegar menu, tabs e capas apenas por teclado.
5. Confirmar todos os CTAs e parâmetros no checkout Kiwify.
6. Validar preço, parcelamento, garantia, formato e acesso vitalício.
7. Validar claims e anúncios contra `docs/META-ADS-COMPLIANCE-CHECKLIST.md`.
8. Conferir política de privacidade e IDs de analytics do ambiente.
