# Etapa 2 — Desktop OmniFocus
## Sidebar com Perspectivas + Inspector Lateral

**Prioridade:** Média
**Prerequisito:** Etapa 1 completa
**Referência:** `docs/PLANO-IMPLEMENTACAO.md#etapa-2`

---

## Objetivo

Elevar a experiência desktop ao padrão OmniFocus: navegação rápida por perspectivas (Hoje, Esta Semana) e edição inline via inspector lateral — sem trocar de tela para editar dados.

---

## Tasks

### TASK-2.1 — Perspectivas: modelo de dados e filtros

**Arquivo:** `src/types/index.ts`, `src/lib/utils.ts`

**O que fazer:**

1. Adicionar tipo de perspectiva em `src/types/index.ts`:
   ```typescript
   export type Perspectiva = "hoje" | "semana" | "todos"
   ```

2. Criar funções de filtro em `src/lib/utils.ts`:
   ```typescript
   // Retorna sessões do dia de hoje (baseado na data local do usuário)
   function filtrarSessoesHoje(sessoes: Sessao[]): Sessao[]

   // Retorna sessões dos últimos 7 dias
   function filtrarSessoesSemana(sessoes: Sessao[]): Sessao[]
   ```

3. Criar função para agrupar sessões por projeto:
   ```typescript
   function agruparSessoesPorProjeto(
     sessoes: Sessao[],
     projetos: Projeto[]
   ): { projeto: Projeto; sessoes: Sessao[]; totalSegundos: number; totalCusto: number }[]
   ```

**Critério de aceite:**
- [ ] `filtrarSessoesHoje` retorna apenas sessões com `inicio` no dia atual (timezone local)
- [ ] `filtrarSessoesSemana` retorna sessões dos últimos 7 dias (incluindo hoje)
- [ ] Funções não mutam os arrays originais

---

### TASK-2.2 — Sidebar atualizada com seção Perspectivas

**Arquivo:** `src/components/DesktopSidebar.tsx`

**O que fazer:**

Reestruturar o sidebar em duas seções:

```
┌──────────────────────┐
│  PERSPECTIVAS        │  ← label de seção, fonte meta, uppercase, cinza
│  • Hoje              │  ← com badge de contagem de sessões
│  • Esta Semana       │  ← com badge de contagem de sessões
│  • Todos os Projetos │
├──────────────────────┤
│  ÁREAS               │
│  ▼ MPF               │  ← expansível/colapsável
│     • Projeto A      │
│  ▼ Congregação       │
│     • Tarefa X       │
└──────────────────────┘
```

**Detalhes de implementação:**
- Cada perspectiva é um item clicável (48px altura mínima)
- Item selecionado usa `background: var(--color-surface-2)`, texto `--color-accent`
- Badge de contagem: pílula pequena à direita com número de sessões (omitir se zero)
- Áreas são expansíveis — estado de expansão persiste em `localStorage` como `timer_app_sidebar_state`
- `onSelectPerspectiva(p: Perspectiva)` callback para o pai

**Critério de aceite:**
- [ ] Clicar em "Hoje" seleciona a perspectiva e atualiza a área principal
- [ ] Clicar em "Esta Semana" seleciona a perspectiva e atualiza a área principal
- [ ] "Todos os Projetos" exibe todos os projetos (comportamento atual)
- [ ] Estado de expansão das áreas persiste entre reloads
- [ ] Item selecionado visualmente destacado

---

### TASK-2.3 — View de perspectiva na área principal

**Arquivo:** `src/components/DesktopPerspectiveView.tsx` (novo)

**O que fazer:**

Criar componente que exibe sessões filtradas por perspectiva, agrupadas por projeto:

```
┌────────────────────────────────┐
│  Hoje — 28 mar 2026            │  ← título com data/período
│  3 projetos · 2h 45min · R$ 412│  ← resumo da perspectiva
├────────────────────────────────┤
│  PROJETO A                     │  ← nome do projeto em destaque
│    09:00–10:30 · 1h30 · R$225  │
│    Nota: reunião de planejamento│
├────────────────────────────────┤
│  PROJETO B                     │
│    14:00–15:15 · 1h15 · R$187  │
└────────────────────────────────┘
```

**Detalhes:**
- Título dinâmico: "Hoje — {data}", "Esta Semana — {data inicio} a {data fim}", "Todos os Projetos"
- Cada sessão é clicável → abre o Inspector (TASK-2.5)
- Sem sessões: estado vazio amigável ("Nenhuma sessão registrada hoje")

---

### TASK-2.4 — Layout desktop atualizado (3 colunas)

**Arquivo:** `src/App.tsx`

**O que fazer:**

Atualizar o layout desktop para suportar 3 colunas quando o inspector estiver aberto:

```typescript
// Estado adicional no App.tsx para desktop:
type InspectorState =
  | { tipo: "fechado" }
  | { tipo: "projeto"; projetoId: string }
  | { tipo: "sessao"; sessaoId: string }
```

Layout com inspector fechado:
```
sidebar (20%) | área principal (80%)
```

Layout com inspector aberto:
```
sidebar (16%) | área principal (64%) | inspector (20%)
```

Usar transição CSS suave ao abrir/fechar o inspector (`transition: width 200ms ease`). Respeitar `prefers-reduced-motion: reduce` — sem animação se configurado.

---

### TASK-2.5 — Componente `DesktopInspector`

**Arquivo:** `src/components/DesktopInspector.tsx` (novo)

**O que fazer:**

Componente de painel lateral que renderiza formulário de edição baseado no tipo:

**Inspector de Projeto:**
```
┌──────────────────────┐
│  [X]  Projeto        │  ← botão fechar + título
├──────────────────────┤
│  Nome                │
│  [input texto]       │
│  Cor                 │
│  [paleta 4×4]        │
│  Taxa horária (R$/h) │
│  [input number]      │
│  Contexto            │
│  [seletor]           │
├──────────────────────┤
│  Total: 12h30 · R$1.875│
└──────────────────────┘
```

**Inspector de Sessão:**
```
┌──────────────────────┐
│  [X]  Sessão         │
├──────────────────────┤
│  Data                │
│  [input date]        │
│  Início              │
│  [input time]        │
│  Fim                 │
│  [input time]        │
│  Duração (calculada) │
│  [1h 30min]          │
│  Nota                │
│  [textarea]          │
├──────────────────────┤
│  [Salvar]  [Excluir] │
└──────────────────────┘
```

**Regras:**
- Edições são aplicadas ao clicar em "Salvar" (não auto-save)
- "Excluir" exige confirmação inline ("Tem certeza? [Cancelar] [Excluir]")
- Todos os inputs com `font-size: var(--font-size-base)` e `min-height: 48px`
- Título do inspector em `font-size: var(--font-size-lg)`

**Critério de aceite:**
- [ ] Editar nome do projeto e salvar reflete imediatamente na sidebar e na área principal
- [ ] Editar sessão e salvar reflete imediatamente no histórico
- [ ] Excluir sessão remove do histórico sem reload
- [ ] Fechar inspector com [X] retorna ao layout 2 colunas
- [ ] Inspector não sobrepõe o timer ativo

---

### TASK-2.6 — Teste de regressão pós-Etapa 2

- [ ] Layout 2 colunas (sem inspector) funciona igual ao anterior
- [ ] Timer funciona corretamente em todas as views e perspectivas
- [ ] Perspectiva "Todos os Projetos" = comportamento anterior de selecionar projeto
- [ ] Dados persistem corretamente após edições via inspector
- [ ] App funciona offline
- [ ] Nenhuma regressão em mobile (a Etapa 2 é exclusivamente desktop)

---

## Ordem de execução recomendada

```
TASK-2.1 → TASK-2.2 → TASK-2.3 → TASK-2.4 → TASK-2.5 → TASK-2.6
```
