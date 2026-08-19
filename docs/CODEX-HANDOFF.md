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

A direção se chama **NÚCLEO 19/8**. Ela substitui a estética figurativa preto+dourado por uma linguagem tecnológica-mística baseada em:

- Deep Field `#03050A`;
- Mineral `#0B1020`;
- Moonstone `#ECECF4`;
- Ultraviolet `#7867F2`;
- Ion Teal `#62D8C7`;
- Ritual Gold `#E8C477`, reservado ao núcleo e aos CTAs de compra.

Tipografia:

- Bricolage Grotesque: display;
- Instrument Sans: corpo;
- IBM Plex Mono: dados e sinais curtos.

O hero parte da tese “Consciência não é uma linha. É um campo.” A cena 3D representa o próprio conteúdo: oito órbitas e dezenove nós em torno de um núcleo de vidro/obsidiana.

## Stack e comandos

- Vite + React + TypeScript;
- Three.js, carregado de forma lazy;
- Framer Motion;
- Lucide React;
- Tailwind permanece no toolchain, mas a landing usa majoritariamente o sistema autoral em `src/styles/globals.css`;
- Node 22.x no deploy.

Comandos de validação:

```bash
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Arquitetura da página

`src/App.tsx` é o orquestrador. O `main` possui `data-field-scroll-root`; cada capítulo narrativo declara `data-field-chapter`:

| Capítulo | ID | Papel da cena |
| --- | --- | --- |
| 0 | `#topo` | núcleo fechado e deslocado para o hero |
| 1 | `#chamado` | ruptura e abertura inicial |
| 2 | `#campo` | expansão da arquitetura 8/19 |
| 3 | `#portal` | aproximação do produto |
| 4 | `#conteudo` | reorganização dos eixos e módulos |
| 5 | `#ritmo` | núcleo menor acompanhando a jornada |
| 6 | `#investimento` | convergência e fechamento na oferta |

Depois da narrativa vêm FAQ e rodapé, com fundos mais opacos para encerrar a experiência sem ruído.

Ordem principal:

1. `Header` fixo com progresso de leitura;
2. `Hero` com CTA direto e quatro fatos do produto;
3. capítulos de reconhecimento e arquitetura;
4. objeto do produto gerado em HTML/CSS 3D;
5. `ModuleShowcase` com os 8 eixos;
6. `OriginalSlideshow` com as capas reais;
7. jornada de uso;
8. `OfferCard`;
9. FAQ;
10. `Footer`.

## Cena scroll-linked

Entrada React: `src/components/ScrollFieldExperience.tsx`.

Responsabilidades:

- importar `SceneController` de forma lazy;
- manter um único canvas fixo durante a narrativa;
- calcular progresso global, capítulo ativo e progresso local;
- pausar fora do escopo e quando a aba fica oculta;
- tratar perda de contexto WebGL;
- oferecer fallback abstrato em CSS;
- respeitar `prefers-reduced-motion`.

Arquivos principais em `src/visuals/chakraField/`:

- `SceneController.ts`: ciclo de vida, renderer e composição;
- `ScrollDirector.ts`: sete poses e interpolação suave;
- `NucleusSystem.ts`: oito órbitas, dezenove nós e núcleo facetado;
- `ToroidalFieldSystem.ts`: volume toroidal;
- `HolographicShellSystem.ts`: casca holográfica;
- `BackgroundSystem.ts`: campo espacial discreto;
- `EnergyParticleSystem.ts`: partículas;
- `CameraController.ts`: câmera e enquadramento;
- `QualityManager.ts`: tiers de performance e movimento reduzido.

A cena não monta mais figura humana, pilha de chakras ou anéis de ativação legados. O perfil desktop usa aproximadamente 11 draw calls; o perfil mobile usa aproximadamente 7. O mobile limita DPR e FPS.

Não há scroll hijacking. A rolagem continua nativa e o canvas usa `pointer-events: none`.

## Componentes sensíveis

### `Hero.tsx`

- H1 textual e indexável;
- CTA `hero_checkout` direto ao checkout;
- CTA secundário `hero_explore_content` para `#conteudo`;
- acesso, garantia, módulos e eixos visíveis sem claims artificiais.

### `ModuleShowcase.tsx`

- tabs semânticas com roving tabindex;
- suporte a setas, Home e End;
- painel ativo identificado por `tabpanel`;
- ressalva dentro do eixo “Biologia da Ascensão”.

### `OriginalSlideshow.tsx`

- monta apenas a capa ativa e duas adjacentes;
- pausa automática disponível;
- autoplay desativado com movimento reduzido;
- região de carrossel rotulada;
- imagens derivadas em `Repositório/optimized/`.

### `OfferCard.tsx`

- CTA `offer_primary`;
- desktop em duas colunas;
- mobile prioriza preço, CTA e garantia antes do manifesto;
- sem preço anterior riscado ou urgência artificial.

### `Header.tsx`

- CTA desktop `header_checkout`;
- CTA mobile `mobile_header_checkout`;
- menu informa `aria-expanded`/`aria-controls`;
- Escape fecha e devolve foco ao botão;
- navegar move foco ao destino.

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

- 1120px: navegação vira menu;
- 900px: composições principais passam para uma coluna;
- 640px: ajustes de telefone.

Base de acessibilidade:

- `lang="pt-BR"`;
- skip link para `#conteudo-principal`;
- um único H1;
- landmarks semânticos;
- foco visível;
- menu com retorno de foco;
- tabs operáveis por teclado;
- carrossel pausável;
- `prefers-reduced-motion` no DOM e no WebGL;
- canvas decorativo com `aria-hidden="true"`.

Ao alterar transforms ou objetos 3D, teste 1440×900, 1536×776, 912×900, 390×844 e 320×568. Confirme também que `document.documentElement.scrollWidth <= innerWidth`.

## Assets e performance

- Os PNGs originais permanecem como fonte.
- Derivados WebP ficam em `src/assets/optimized/` e `Repositório/optimized/`.
- Regeneração: `python scripts/optimize_assets.py`.
- O hero não carrega raster principal.
- O fallback WebGL é abstrato e gerado em CSS.
- A cena Three está em chunk lazy separado.
- O carrossel evita montar as 20 capas ao mesmo tempo.

Garanta que os WebP otimizados entrem no commit/deploy; imports ausentes quebram CI.

## Checklist antes de publicar

1. Rodar typecheck, lint e build.
2. Revisar a landing em desktop, tablet e telefones estreitos.
3. Confirmar carregamento WebGL e fallback sem WebGL.
4. Testar `prefers-reduced-motion`.
5. Navegar menu e tabs apenas por teclado.
6. Pausar e avançar o carrossel.
7. Confirmar todos os CTAs e parâmetros no checkout Kiwify.
8. Validar preço, parcelamento, garantia, formato e acesso vitalício.
9. Validar claims e anúncios contra `docs/META-ADS-COMPLIANCE-CHECKLIST.md`.
10. Conferir política de privacidade e IDs de analytics do ambiente.
