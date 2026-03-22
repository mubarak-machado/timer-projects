# Projeto: Aplicação de Controle de Tempo por Projeto

**Versão:** 1.0 — Briefing inicial  
**Data:** Março 2026  
**Autor:** Mubarak  
**Status:** Planejamento — pré-desenvolvimento

---

## 1. Contexto e Motivação

### Problema central
As ferramentas de controle de tempo existentes no mercado (Toggl, Harvest, Clockify, entre outras) apresentam barreiras significativas de acessibilidade para usuários com baixa visão: interfaces densas, contrastes insuficientes, fontes pequenas e interações que exigem precisão visual fina.

### Proposta
Criar uma ferramenta pessoal de controle de tempo por projeto, com cálculo de custo e rentabilidade, que coloque acessibilidade como fundação — não como retrofit. A ferramenta deve ser simples no uso cotidiano e capaz de crescer em complexidade quando necessário.

### Natureza do projeto
- **Uso primário:** Ferramenta pessoal (não há compromisso comercial inicial)
- **Abertura futura:** Pode evoluir para produto se demonstrar viabilidade — inclusive como ferramenta de apoio a consultoria para pequenos negócios
- **Contextos de uso previstos:**
  - Trabalho no MPF (projetos longos de execução orçamentária)
  - Atividades na congregação (tarefas pontuais de preparação e administração)
  - Futuramente: atividade de consultoria focada no desenvolvimento de pequenas empresas

### Visão de longo prazo
O autor desenvolve — ou pretende desenvolver — trabalho de consultoria para pequenas empresas, com foco em soluções práticas para o crescimento do negócio. Nesse contexto, a aplicação pode evoluir para uma ferramenta de gestão de tempo e rentabilidade **por cliente**, entregando inteligência sobre onde o tempo é investido e qual o retorno gerado. Essa visão **não afeta o escopo do MVP**, mas orienta as decisões arquiteturais para que o caminho futuro esteja aberto.

---

## 2. Requisitos Fundamentais

### Acessibilidade (não negociável)
- Contraste mínimo WCAG AA (4.5:1) como padrão — não como tema alternativo
- Fonte base mínima de 1.25rem (20px), escalável via configuração
- Alvos de toque mínimos de 48×48px em todas as interações
- Navegação por teclado completa
- Suporte a `prefers-contrast` e `prefers-reduced-motion`
- Paleta de cores calculada para garantir contraste em todos os estados (hover, active, disabled)

### Modularidade como arquitetura
A modularidade não é um compromisso de entrega — é uma decisão arquitetural que evita engessamento futuro. O MVP entrega apenas o núcleo. Módulos adicionais são possíveis, não prometidos.

### Funcionamento offline
O MVP deve funcionar sem conexão. Persistência via `localStorage` na fase inicial, com possibilidade de migração para Supabase futuramente.

---

## 3. Arquitetura de Dados

### Modelo nuclear

```
Projeto
  ├── id (uuid)
  ├── nome (string)
  ├── cor (string hex — contraste calculado automaticamente)
  ├── taxa_horaria (number, opcional)
  ├── contexto (enum: "pessoal" | "profissional" | "cliente")
  ├── cliente_id (ref → Cliente, opcional — para uso futuro)
  ├── criado_em (timestamp)
  └── Sessões[]
        ├── id (uuid)
        ├── projeto_id (ref)
        ├── inicio (timestamp)
        ├── fim (timestamp | null)
        ├── duracao_segundos (number, calculado)
        └── nota (string, opcional)

Cliente                          ← entidade separada, opcional no MVP
  ├── id (uuid)
  ├── nome (string)
  ├── segmento (string, opcional)
  └── criado_em (timestamp)

Custo = soma(durações em horas) × taxa_horária
Rentabilidade por cliente = receita estimada − custo total de tempo alocado
```

> **Nota de implementação:** No MVP, `Cliente` não precisa ser uma entidade gerenciada — basta o campo `contexto` em Projeto. A entidade `Cliente` é criada apenas quando o Módulo 2 for desenvolvido. A estrutura acima documenta o destino, não o ponto de partida.

Esta estrutura suporta o MVP hoje e suportará, sem quebra, os módulos futuros previstos (clientes, faturas, múltiplas taxas, relatórios).

### Persistência por fase

| Fase | Mecanismo | Justificativa |
|------|-----------|---------------|
| MVP | `localStorage` + exportação JSON | Zero dependência, funciona offline, deploy imediato |
| Futura | Supabase | Multi-dispositivo, colaboração, backup em nuvem |

---

## 4. Escopo do MVP

### O que entra

| Funcionalidade | Descrição |
|----------------|-----------|
| Projetos | Criar, editar, arquivar projetos com nome, cor e taxa horária opcional |
| Timer | Start/stop por projeto; apenas um timer ativo por vez |
| Custo em tempo real | Exibição do custo acumulado da sessão atual e total do projeto |
| Resumo | Visão diária e semanal simples: horas e custo por projeto |
| Exportação | CSV ou cópia de texto formatado |
| Acessibilidade | Conforme requisitos da seção 2 |

### O que fica de fora no MVP

- Relatórios analíticos avançados
- Multi-usuário
- Integração com notas fiscais ou faturamento
- Dashboard com gráficos
- Módulos de rentabilidade por cliente
- Sincronização em nuvem

---

## 5. Estrutura Modular Prevista (pós-MVP)

```
Core (MVP — sempre presente)
├── Projetos + Timer (com campo contexto: pessoal/profissional/cliente)
└── Custo acumulado e resumo simples

Módulo 1: Relatórios
  └── Filtros por período, exportação detalhada, gráficos

Módulo 2: Clientes
  └── Gestão de clientes, agrupamento de projetos por cliente
  └── Base para uso em consultoria de pequenos negócios
  └── Rentabilidade por cliente: ADIADA — depende de estruturação
     completa da entidade Cliente; decisão consciente, não descarte

Módulo 3: Faturamento e Entrega
  └── Relatório de cobrança por cliente e período
  └── Exportação formatada para apresentação ao cliente
  └── Integração futura com NF (opcional)
```

> **Princípio:** Cada módulo é independente. O Core funciona sem nenhum módulo instalado. Módulos não quebram dados existentes quando adicionados.

---

## 6. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | React + Tailwind CSS | Familiaridade em desenvolvimento, classes de acessibilidade nativas |
| Componentes | shadcn/ui | Acessibilidade por padrão (ARIA, teclado), customizável |
| Persistência MVP | localStorage | Offline, sem dependência de backend |
| Persistência futura | Supabase | Já integrado ao ambiente de trabalho do autor |
| Deploy | Vercel | Gratuito para projetos pessoais, integração direta com GitHub |
| Tipo de app | PWA (Progressive Web App) | Funciona em iPad, Mac e Android; instalável sem loja |

---

## 7. Variáveis CSS de Acessibilidade (definir antes de qualquer componente)

```css
:root {
  --font-size-base: 1.25rem;        /* 20px — mínimo para baixa visão */
  --font-size-lg: 1.5rem;           /* 24px — títulos de item */
  --font-size-xl: 1.875rem;         /* 30px — cabeçalhos de seção */
  --font-size-timer: 4rem;          /* 64px — cronômetro, nunca menor */
  --font-size-cost: 2rem;           /* 32px — custo em tempo real */
  --font-size-meta: 1rem;           /* 16px — tags, datas, metadados */
  --min-touch-target: 48px;         /* WCAG 2.5.5 */

  /* Tema padrão: Alto Contraste Escuro — inspirado no OmniFocus */
  --color-bg: #000000;              /* Preto puro — não cinza escuro */
  --color-surface: #111111;         /* Superfície levemente elevada */
  --color-surface-2: #1c1c1e;       /* Cards, pílulas de tag */
  --color-separator: #2c2c2e;       /* Linhas entre itens — sutil */
  --color-text-primary: #ffffff;    /* Títulos e valores principais */
  --color-text-secondary: #8e8e93;  /* Metadados, labels, datas */
  --color-accent: #0a84ff;          /* Azul iOS — botão primário */
  --color-danger: #ff453a;          /* Vermelho iOS — vencido, alerta */
  --color-success: #30d158;         /* Verde iOS — timer ativo */
  --color-tag-bg: #2c2c2e;          /* Fundo das pílulas de tag */
  --color-tag-text: #ebebf5;        /* Texto das pílulas de tag */

  --radius-pill: 999px;             /* Pílulas de tag */
  --radius-button: 12px;            /* Botões de ação */
  --spacing-item: 1.25rem;          /* Espaçamento vertical entre itens */
  --spacing-section: 2rem;          /* Espaçamento entre seções/áreas */
}

/* Tema Alto Contraste Claro */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-surface: #f2f2f7;
  --color-surface-2: #e5e5ea;
  --color-separator: #c6c6c8;
  --color-text-primary: #000000;
  --color-text-secondary: #6c6c70;
  --color-accent: #007aff;
  --color-danger: #ff3b30;
  --color-success: #34c759;
  --color-tag-bg: #e5e5ea;
  --color-tag-text: #1c1c1e;
}
```

---

## 8. Fluxo de Navegação

### Filosofia de design — inspiração OmniFocus

O OmniFocus é a referência de acessibilidade para baixa visão no ecossistema Apple. A análise da tela de referência (vista de Previsão, tema escuro) revela princípios concretos que esta aplicação deve seguir:

**Princípios visuais observados diretamente:**

- **Fundo preto puro (#000000)** — máximo contraste possível, zero fadiga visual; não "cinza escuro", preto de verdade
- **Títulos em duas linhas naturais** — "Consignado BB / do Hagamenon" quebra para a segunda linha sem truncamento, sem reticências; o item cresce, não o texto encolhe
- **Hierarquia por peso tipográfico, não por cor** — cabeçalhos de seção ("A Vencer", "Notificações") em negrito pesado e fonte grande; títulos de item em peso regular mas igualmente grande; metadados (tags, data) em cinza menor e discreto
- **Separação por espaçamento e linha fina** — nenhum card com borda ou sombra; a separação entre itens é feita por linha fina (#333 aprox.) e espaçamento generoso; isso reduz ruído visual enormemente com fontes grandes
- **Tags como pílulas arredondadas** — "Financeiro" e "pagar" são visualmente distintos do título mas não competem com ele; fundo escuro médio, texto claro
- **Ícone antes de metadados** — o ícone de calendário antes da data permite identificação do tipo de dado sem precisar ler o label; útil para baixa visão
- **Barra inferior com ícones grandes e bem espaçados** — alvos de toque claramente ≥ 48px; identificação por ícone + label abaixo
- **Botão de densidade/visibilidade** — o ícone de "olho" na barra superior controla o que é exibido; padrão sofisticado que pode inspirar o controle de densidade da nossa app

**Princípios gerais derivados:**

- **Navegação hierárquica profunda e previsível** — o usuário sempre sabe em qual nível está; voltar é sempre seguro e intuitivo
- **Títulos que respiram** — nenhum texto é truncado; os itens se expandem verticalmente para acomodar o conteúdo no tamanho configurado
- **Densidade configurável** — o mesmo conteúdo pode ser exibido compacto ou espaçado, sem perda de informação
- **Dynamic Type como cidadão de primeira classe** — todos os textos escalam proporcionalmente; o layout se reorganiza para acomodar tamanhos extremos
- **Alvos de toque generosos mesmo em tamanho padrão** — não apenas quando a fonte está grande

---

### Navegação mobile — estrutura hierárquica em 3 níveis

```
Nível 1 — Tela de Áreas
  ├── Lista simples e espaçosa de áreas (Pessoal, Profissional, etc.)
  ├── Cada área: nome em fonte grande, quantidade de projetos ativos
  └── [+ Nova Área]

      ↓ toca na área

Nível 2 — Tela de Projetos da Área
  ├── Nome da área como título da tela (navegação nativa ← voltar)
  ├── Lista de projetos da área selecionada
  ├── Cada projeto: nome (multilinha se necessário), horas acumuladas
  └── [+ Novo Projeto]

      ↓ toca no projeto

Nível 3 — Tela do Projeto
  ├── Nome do projeto como título
  ├── Resumo: total de horas e custo acumulado (fonte grande)
  ├── [▶ Iniciar Timer] — botão primário, dominante
  ├── [+ Lançamento Manual]
  └── Lista de registros (data, duração, nota — multilinha se necessário)
```

---

### Navegação desktop — layout dividido (≥ 1024px)

```
┌─────────────────────┬──────────────────────────┐
│  Sidebar            │  Área principal           │
│  • Áreas            │                           │
│  • Projetos         │  [Timer ativo — 50% top]  │
│    por área         │  ─────────────────────    │
│                     │  [Histórico — 50% bottom] │
└─────────────────────┴──────────────────────────┘
```

---

### Timer — comportamento por plataforma

```
MOBILE — Timer em tela cheia (Nível 3 → inicia timer)
  ├── Cronômetro dominante (fonte máxima disponível)
  ├── Custo da sessão em tempo real
  └── [■ Parar e Salvar] — botão impossível de errar

  Ao navegar para outra tela com timer ativo:
  └── Banner persistente no topo
        ├── Alto contraste, sempre visível
        ├── Nome do projeto + cronômetro correndo
        └── Toque → retorna ao timer em tela cheia

DESKTOP — Timer no painel superior da tela do Projeto
  ├── Painel superior (≈50% da altura)
  ├── Cronômetro grande + custo em tempo real
  └── [■ Parar e Salvar]
```

---

### Lançamento Manual

```
├── Data (padrão: hoje) — seletor acessível
├── Hora de início + Hora de fim  OU  Duração direta
├── Nota (opcional, multilinha)
└── [Salvar Registro]
```

---

### Configurações

```
├── Gerenciar áreas (criar, renomear, reordenar)
├── Tamanho de fonte — escala própria da app
│     Pequeno / Médio / Grande / Muito Grande / Máximo
│     (independente do sistema, mas respeitando Dynamic Type se configurado)
├── Tema — Alto Contraste Escuro (padrão) / Alto Contraste Claro / Padrão
└── Exportação geral
```

---

### Regras de navegação

- **Um timer ativo por vez** — ao tentar iniciar segundo timer, exibir aviso com opção de parar o atual
- **Títulos multilinha** — nenhum nome de área, projeto ou registro é truncado; o item cresce verticalmente para acomodar o texto no tamanho de fonte configurado
- **Banner persistente no mobile** — sempre visível em qualquer tela enquanto há timer ativo; toque retorna ao timer em tela cheia
- **Retorno natural** — salvar timer ou lançamento manual → retorna automaticamente ao Nível 3 (Projeto)
- **Breakpoint semântico ≥ 1024px** — não é só visual; determina toda a estratégia de layout e navegação do timer

---

## 9. Tipografia e Dynamic Type

### Princípio central
Nenhum texto na aplicação é estático. Todo texto escala. O layout se adapta ao texto — nunca o contrário.

### Escala tipográfica (valores base — escalam proporcionalmente)

| Função | Tamanho base | Comportamento |
|--------|-------------|---------------|
| Título de área / projeto | 1.5rem | Cresce para 2–3 linhas se necessário |
| Corpo / registros | 1.25rem | Cresce para 2+ linhas se necessário |
| Timer (cronômetro) | 3–4rem | Sempre em destaque, nunca truncado |
| Custo em tempo real | 2rem | Sempre visível, alto contraste |
| Labels e metadados | 1rem | Mínimo absoluto — nunca abaixo disso |

### Regra de títulos multilinha (inspirada no OmniFocus)
Diferente da maioria dos apps que truncam títulos com `…` após uma linha, esta aplicação **nunca trunca**. O item de lista cresce verticalmente para acomodar o título completo no tamanho de fonte configurado. Isso é especialmente importante para nomes longos de projetos e notas de registros.

```css
/* Implementação CSS — títulos que respiram */
.item-title {
  display: -webkit-box;
  /* Sem -webkit-line-clamp nem text-overflow: ellipsis */
  white-space: normal;
  overflow: visible;
  word-break: break-word;
}

/* Limite opcional apenas em contextos muito específicos (ex: home compacta) */
.item-title--compact {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* máximo 2 linhas — nunca 1 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Integração com Dynamic Type do sistema
A aplicação respeita a configuração de tamanho de fonte do sistema operacional (iOS/Android/browser), mas também oferece controle interno independente — assim o usuário pode ter a fonte do sistema em tamanho padrão e a fonte da aplicação em tamanho máximo, sem conflito.

### Fase 0 — Pesquisa de fricções (2–3 horas)
**Ferramenta:** Perplexity — busca social (Reddit, fóruns)

Queries sugeridas:
```
"low vision users time tracking app frustrations" site:reddit.com
"accessibility issues time tracking software blind low vision"
"time tracking app high contrast large text accessibility"
```

**Objetivo:** Confirmar ou corrigir hipóteses de design com base em experiências reais relatadas. Tratar como inspiração, não como pesquisa representativa.

**Entregável:** 1 página de notas com insights sobre: elementos de UI que causam mais fricção, preferências de interação (teclado, voz, toque), tentativas anteriores de solução e por que falharam.

---

### Fase 1 — Validação da arquitetura de dados (1 dia)
- Revisar o modelo de dados da seção 3 com base nos insights da pesquisa
- Confirmar decisão de `localStorage` para MVP
- Definir paleta de cores com verificação de contraste (usar ferramenta: contrast-ratio.com ou similar)
- Documentar os 5 fluxos da seção 8 com detalhamento de cada estado

---

### Fase 2 — MVP funcional no Claude Code (3–5 dias)

**Sessão 1:** Estrutura base + persistência
- Setup React + Tailwind + shadcn/ui
- Variáveis CSS de acessibilidade
- CRUD de projetos com localStorage

**Sessão 2:** Timer e custo
- Lógica de timer (start/stop, uma sessão ativa por vez)
- Cálculo de custo em tempo real
- Exibição grande e legível de tempo e custo

**Sessão 3:** Resumo e exportação
- Agrupamento diário/semanal
- Exportação CSV e cópia de texto
- Revisão de acessibilidade: contraste, touch targets, navegação por teclado

---

### Fase 3 — Validação de uso real (2 semanas)
- Usar nos contextos reais: MPF e congregação
- Registrar fricções encontradas
- Decisão ao final: estabilizar, refinar ou expandir para módulos

---

## 10. Plano de Execução

### Fase 0 — Pesquisa de fricções (2–3 horas)
**Ferramenta:** Perplexity — busca social (Reddit, fóruns)

Queries sugeridas:
```
"low vision users time tracking app frustrations" site:reddit.com
"accessibility issues time tracking software blind low vision"
"time tracking app high contrast large text accessibility"
```

**Objetivo:** Confirmar ou corrigir hipóteses de design. Tratar como inspiração, não como pesquisa representativa.

---

### Fase 1 — Validação da arquitetura de dados (1 dia)
- Revisar modelo de dados com base nos insights da pesquisa
- Confirmar decisão de `localStorage` para MVP
- Definir paleta de cores com verificação de contraste
- Validar fluxo hierárquico de 3 níveis no mobile

---

### Fase 2 — MVP funcional no Claude Code (3–5 dias)

**Sessão 1:** Estrutura base + persistência
- Setup React + Tailwind + shadcn/ui
- Variáveis CSS de acessibilidade e tipografia (seções 7 e 9)
- CRUD de áreas e projetos com localStorage

**Sessão 2:** Timer e custo
- Lógica de timer (start/stop, estado global via Context/Zustand)
- Banner persistente no mobile
- Cálculo de custo em tempo real

**Sessão 3:** Navegação, lançamento manual e exportação
- Navegação hierárquica 3 níveis (mobile) e layout dividido (desktop)
- Lançamento manual com seletor de hora acessível
- Exportação CSV
- Revisão completa: contraste, touch targets, títulos multilinha

---

### Fase 3 — Validação de uso real (2 semanas)
- Usar nos contextos reais: MPF e congregação
- Registrar fricções encontradas
- Decisão ao final: estabilizar, refinar ou expandir para módulos

---

## 11. Decisões em Aberto

| Decisão | Opções | Recomendação atual |
|---------|--------|-------------------|
| Tema padrão | Claro / Escuro / Alto contraste | Alto contraste como padrão, os demais como alternativas |
| Entrada de tempo manual | Sim / Não no MVP | **Sim** — fluxo definido (tela própria com início/fim ou duração direta) |
| Múltiplos timers simultâneos | Sim / Não | **Não** — um timer ativo por vez; aviso ao tentar iniciar segundo |
| Cor dos projetos | Livre / Paleta restrita | Paleta restrita de cores com contraste garantido |
| Limite de projetos na home | 3 / 4 / 5 por área | **4** — equilibra visibilidade e espaço |
| Timer: desktop vs. mobile | Tela separada / Layout dividido | **Híbrido** — desktop divide tela (50/50), mobile usa tela cheia + banner persistente ao navegar |
| Filtro por contexto na home | Sempre visível / Oculto por padrão | Oculto por padrão — aparece só com múltiplas áreas ativas |
| Nome do app | A definir | — |

---

## 12. Referências e Ferramentas

- **Verificação de contraste:** [contrast-ratio.com](https://contrast-ratio.com) ou [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **WCAG 2.1 — Critérios relevantes:** 1.4.3 (Contraste mínimo), 1.4.4 (Redimensionamento de texto), 2.5.5 (Tamanho do alvo)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)
- **Supabase (futura integração):** Já conectado ao ambiente Claude do autor

---

*Documento gerado como briefing inicial para abertura de Projeto no Claude.ai. Deve ser colado nas instruções do projeto ou carregado como arquivo de contexto.*
