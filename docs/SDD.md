# SDD — Especificação de Design de Software
## Timer Projects — Controle de Tempo por Projeto

**Versão:** 1.0
**Data:** Março 2026
**Status:** Especificação ativa — base para implementação
**Referência visual:** OmniFocus (iOS/macOS)
**Audiência:** Claude Code, autor, colaboradores futuros

---

## 1. Contexto e Motivação

### Problema

Ferramentas de controle de tempo existentes (Toggl, Harvest, Clockify) apresentam barreiras críticas para usuários com baixa visão: interfaces densas, contraste insuficiente, fontes pequenas e interações que exigem precisão visual fina.

### Solução

PWA pessoal de controle de tempo com cálculo de custo, onde **acessibilidade é a fundação** — não um ajuste posterior. Design visual e estrutural inspirado no OmniFocus, que é a referência de acessibilidade para baixa visão no ecossistema Apple.

### Contextos de uso

| Contexto | Uso | Importância |
|----------|-----|-------------|
| MPF | Projetos longos de execução orçamentária | Alta — uso diário |
| Congregação | Tarefas pontuais de preparação/administração | Alta — uso frequente |
| Consultoria (futuro) | Gestão de tempo por cliente, rentabilidade | Médio — expansão futura |

---

## 2. Objetivos e Não-Objetivos

### Objetivos por módulo

| Módulo | Escopo | Status |
|--------|--------|--------|
| **Core (MVP)** | Áreas, projetos, timer, sessões, custo, exportação CSV | Parcialmente implementado |
| **Módulo 1 — Relatórios** | Filtros por período, gráficos, exportação detalhada | Futuro |
| **Módulo 2 — Clientes** | Entidade Cliente, agrupamento de projetos, rentabilidade | Futuro |
| **Módulo 3 — Faturamento** | Relatório de cobrança, exportação formatada, NF | Futuro |

### Não-objetivos (MVP)

- Relatórios analíticos avançados ou gráficos
- Entidade Cliente gerenciada
- Multi-usuário ou colaboração
- Sincronização em nuvem
- Integração com notas fiscais
- Múltiplos timers simultâneos

---

## 3. Arquitetura do Sistema

### Stack tecnológica

```
┌─────────────────────────────────────────────┐
│  Interface (React 19 + TypeScript 5.9)       │
│  Estilo: Tailwind CSS 4 + shadcn/ui          │
│  Ícones: Lucide React                        │
├─────────────────────────────────────────────┤
│  Estado Global: Zustand (timer ativo)        │
│  Estado Local: Custom hooks (CRUD)           │
├─────────────────────────────────────────────┤
│  Persistência MVP: localStorage              │
│  Persistência Futura: Supabase               │
├─────────────────────────────────────────────┤
│  Build: Vite 8 + @tailwindcss/vite           │
│  Deploy: Vercel (PWA)                        │
└─────────────────────────────────────────────┘
```

### Estrutura de pastas

```
src/
├── components/          # Um arquivo por componente
│   ├── ui/              # shadcn/ui primitivos
│   ├── AreaList.tsx
│   ├── ProjectList.tsx
│   ├── ProjectDetail.tsx
│   ├── ManualEntry.tsx
│   ├── ActiveTimerBanner.tsx
│   ├── DesktopSidebar.tsx
│   ├── DesktopProjectView.tsx
│   ├── Settings.tsx          ← a implementar
│   └── DesktopInspector.tsx  ← a implementar
├── hooks/               # CRUD encapsulado
│   ├── useAreas.ts
│   ├── useProjects.ts
│   ├── useSessions.ts
│   └── useSettings.ts   ← a implementar
├── lib/
│   ├── storage.ts        # Wrapper de localStorage — nunca chamar diretamente
│   ├── utils.ts          # Formatação e cálculos
│   └── export.ts         # Exportação CSV
├── store/
│   └── timer.ts          # Zustand — estado global do timer
├── types/
│   └── index.ts          # Interfaces TypeScript
└── styles/
    └── tokens.css        # Variáveis CSS — única fonte de verdade de design
```

### Princípios arquiteturais

1. **Um timer ativo por vez** — regra de negócio, não UX
2. **localStorage via abstração** — nunca chamar diretamente nos componentes
3. **CSS variables everywhere** — cores, fontes e espaçamentos via tokens, não hardcoded
4. **Módulos independentes** — o Core funciona sem nenhum módulo adicional
5. **Migração Supabase sem breaking change** — hooks trocam a fonte de dados, a interface não muda

---

## 4. Modelo de Dados

### Tipos atuais (`src/types/index.ts`)

```typescript
type Contexto = "pessoal" | "profissional" | "cliente"

interface Area {
  id: string         // UUID — crypto.randomUUID()
  nome: string
  ordem: number      // Para reordenação manual
  criado_em: string  // ISO timestamp
}

interface Projeto {
  id: string
  area_id: string
  nome: string
  cor: string              // Hex — deve ter contraste garantido
  taxa_horaria?: number    // R$/hora (opcional)
  contexto: Contexto
  cliente_id?: string      // Reservado para Módulo 2
  criado_em: string        // ISO timestamp
}

interface Sessao {
  id: string
  projeto_id: string
  inicio: string           // ISO timestamp
  fim?: string             // null = timer ativo
  duracao_segundos: number // Calculado ao salvar (não armazenar raw)
  nota?: string            // Texto livre, multilinha
}
```

### Configurações de usuário (a implementar)

```typescript
interface ConfiguracaoUsuario {
  tamanho_fonte: 1 | 2 | 3 | 4 | 5  // 1=pequeno, 5=máximo
  tema: "escuro" | "claro"
  densidade: "normal" | "compacto"   // OmniFocus "eye" pattern
}
```

### Fórmulas de cálculo

```
Custo de sessão = (duracao_segundos / 3600) × taxa_horaria
Custo total do projeto = Σ custo de todas as sessões
Duração total do projeto = Σ duracao_segundos de todas as sessões
```

### Persistência

| Chave localStorage | Tipo | Descrição |
|-------------------|------|-----------|
| `timer_app_areas` | `Area[]` | Lista de áreas |
| `timer_app_projects` | `Projeto[]` | Lista de projetos |
| `timer_app_sessions` | `Sessao[]` | Histórico de sessões |
| `timer_app_active_timer` | `{ projetoId, inicio }` | Timer ativo (a implementar) |
| `timer_app_settings` | `ConfiguracaoUsuario` | Preferências do usuário (a implementar) |

---

## 5. Sistema de Design

### Filosofia OmniFocus aplicada

O OmniFocus é a referência de acessibilidade para baixa visão. Os princípios observados e adotados neste projeto:

| Princípio OmniFocus | Implementação neste projeto |
|---------------------|----------------------------|
| Fundo preto puro (#000) | `--color-bg: #000000` como padrão |
| Títulos em 2 linhas naturais | `white-space: normal` sem `text-overflow: ellipsis` |
| Hierarquia por peso tipográfico | Tamanho + weight definem hierarquia, não só cor |
| Separação por linha fina | `--color-separator: #2c2c2e` + espaçamento, sem cards com borda |
| Tags como pílulas arredondadas | `--radius-pill: 999px`, fundo `--color-tag-bg` |
| Ícone antes de metadados | Ícone Lucide + label — facilita identificação sem ler |
| Densidade configurável ("olho") | Toggle compacto/normal (a implementar) |
| Sidebar com perspectivas | Filtros rápidos: Hoje / Semana / Por Área (a implementar) |
| Inspector lateral | Painel direito no desktop para editar sem mudar de tela (a implementar) |

### Paleta de cores — Tema Escuro (padrão)

```css
--color-bg: #000000          /* Preto puro — máximo contraste */
--color-surface: #111111     /* Superfície elevada */
--color-surface-2: #1c1c1e   /* Cards, pílulas */
--color-separator: #2c2c2e   /* Linha divisória */
--color-text-primary: #ffffff
--color-text-secondary: #8e8e93
--color-accent: #0a84ff      /* iOS Blue — ações primárias */
--color-danger: #ff453a      /* iOS Red — exclusão, alertas */
--color-success: #30d158     /* iOS Green — timer ativo */
--color-tag-bg: #2c2c2e
--color-tag-text: #ebebf5
```

### Paleta de cores — Tema Claro (a implementar)

```css
--color-bg: #ffffff
--color-surface: #f2f2f7
--color-surface-2: #e5e5ea
--color-separator: #c6c6c8
--color-text-primary: #000000
--color-text-secondary: #6c6c70
--color-accent: #007aff
--color-danger: #ff3b30
--color-success: #34c759
--color-tag-bg: #e5e5ea
--color-tag-text: #1c1c1e
```

### Escala tipográfica

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-size-timer` | `4rem` (64px) | Cronômetro — nunca menor |
| `--font-size-cost` | `2rem` (32px) | Custo em tempo real |
| `--font-size-xl` | `1.875rem` (30px) | Cabeçalhos de seção |
| `--font-size-lg` | `1.5rem` (24px) | Títulos de item |
| `--font-size-base` | `1.25rem` (20px) | Corpo de texto — mínimo para conteúdo |
| `--font-size-meta` | `1rem` (16px) | Metadados, tags, datas — mínimo absoluto |

### Multiplicadores por nível de fonte (a implementar)

| Nível | Multiplicador | Exemplo (base) |
|-------|--------------|----------------|
| 1 — Pequeno | 0.85× | 1.0625rem |
| 2 — Médio | 0.925× | 1.15625rem |
| 3 — Padrão | 1.0× | 1.25rem |
| 4 — Grande | 1.15× | 1.4375rem |
| 5 — Máximo | 1.35× | 1.6875rem |

### Regras de acessibilidade (não negociáveis)

- Contraste mínimo WCAG AA 4.5:1 em todos os estados (normal, hover, focus, disabled)
- Touch targets mínimos: `48×48px` em todos os elementos interativos
- `--font-size-meta` (1rem) é o mínimo absoluto — nenhum texto visível abaixo disso
- Títulos de área, projeto e nota: **nunca truncar com `…`** — o item cresce verticalmente
- `line-clamp: 2` apenas em contextos compactos específicos — nunca `line-clamp: 1`
- Cores de projetos devem ter contraste garantido com `--color-bg` e `--color-surface`

---

## 6. Especificação de Componentes

### Mobile — Navegação 3 Níveis

#### Nível 1: `AreaList`
**Arquivo:** `src/components/AreaList.tsx`

| Elemento | Especificação |
|----------|---------------|
| Título da tela | "Áreas" — `font-size-xl`, `font-weight: 700` |
| Item de área | Nome multilinha + contador de projetos ativos |
| Ação ao tocar | Navega para Nível 2 (ProjectList) |
| Botão Nova Área | Inline na lista, `48px` de altura mínima |
| Separação | Linha `--color-separator` entre itens |
| Reordenação | Botões ↑↓ ou drag (a implementar) |

**Estado atual:** Implementado. Falta: reordenação, contador de projetos.

---

#### Nível 2: `ProjectList`
**Arquivo:** `src/components/ProjectList.tsx`

| Elemento | Especificação |
|----------|---------------|
| Título | Nome da área — `font-size-xl` |
| Item de projeto | Cor (dot `12×12px`) + nome + duração total + custo total |
| Ação ao tocar | Navega para Nível 3 (ProjectDetail) |
| Botão Novo Projeto | Inline, com campos: nome, cor (paleta), taxa horária, contexto |
| Timer ativo | Badge visual no projeto com timer correndo |

**Estado atual:** Implementado. Falta: badge de timer ativo, paleta de cores com contraste.

---

#### Nível 3: `ProjectDetail`
**Arquivo:** `src/components/ProjectDetail.tsx`

| Elemento | Especificação |
|----------|---------------|
| Cronômetro | `font-size-timer` (4rem) centralizado, cor `--color-success` quando ativo |
| Custo da sessão | `font-size-cost` (2rem), atualizado em tempo real |
| Custo total | `font-size-xl`, exibe total acumulado do projeto |
| Botão Iniciar | `min-height: 64px`, cor `--color-accent` |
| Botão Parar | `min-height: 64px`, cor `--color-danger` |
| Lançamento Manual | Botão secundário abre `ManualEntry` |
| Exportar CSV | Botão discreto |
| Histórico | Lista de sessões, mais recente primeiro |
| Item de sessão | Data + duração + custo + nota (multilinha) |
| Edição de sessão | Deslizar ou botão de edição (a implementar) |

**Estado atual:** Implementado. Falta: edição de sessão, swipe para deletar.

---

#### `ActiveTimerBanner`
**Arquivo:** `src/components/ActiveTimerBanner.tsx`

| Elemento | Especificação |
|----------|---------------|
| Visibilidade | Sempre visível quando timer ativo e não está na tela do projeto |
| Posição | Fixed top, z-index alto |
| Altura | `min-height: 52px` |
| Cor de fundo | `--color-success` com opacidade ou variante escura |
| Conteúdo | Ponto pulsante + nome do projeto + cronômetro correndo |
| Ação ao tocar | Navega para o projeto com timer ativo |
| Área de conteúdo | Adiciona `padding-top: 52px` para não sobrepor |

**Estado atual:** Implementado.

---

#### `ManualEntry`
**Arquivo:** `src/components/ManualEntry.tsx`

| Campo | Especificação |
|-------|---------------|
| Data | Input date, padrão: hoje |
| Hora início | Input time |
| Hora fim | Input time — deve ser > hora início |
| OU Duração | Input de duração direta (hh:mm) — alternativa ao par início/fim |
| Nota | Textarea livre, multilinha, sem limite de linhas |
| Validação | Fim > início obrigatório; exibe erro inline |
| Botão Salvar | `min-height: 52px`, `--color-accent` |

**Estado atual:** Implementado (início/fim). Falta: input de duração direta.

---

### Desktop — Layout Dividido (≥ 1024px)

#### `DesktopSidebar` (atual → evoluir para perspectivas)
**Arquivo:** `src/components/DesktopSidebar.tsx`

**Estado atual:** Sidebar com áreas + projetos aninhados.

**Visão futura (OmniFocus-inspired):**
```
┌─────────────────────┐
│  PERSPECTIVAS       │  ← seção nova a implementar
│  • Hoje             │
│  • Esta Semana      │
│  • Todos os Projetos│
├─────────────────────┤
│  ÁREAS              │  ← mantém existente
│  ▼ MPF              │
│     • Projeto A     │
│     • Projeto B     │
│  ▼ Congregação      │
│     • Tarefa X      │
└─────────────────────┘
```

---

#### `DesktopProjectView`
**Arquivo:** `src/components/DesktopProjectView.tsx`

Layout dividido 50/50:
- **Painel superior:** Timer + custo em tempo real + botões
- **Painel inferior:** Histórico de sessões + lançamento manual

**Estado atual:** Implementado.

---

#### `DesktopInspector` (a implementar)
**Arquivo:** `src/components/DesktopInspector.tsx` (novo)

Painel lateral direito — aparece ao selecionar um projeto ou sessão:

```
┌─────────────────────────────────────────────────────┐
│  Sidebar   │  Timer + Histórico      │  Inspector   │
│  (16%)     │  (64%)                  │  (20%)       │
└─────────────────────────────────────────────────────┘
```

| Elemento | Especificação |
|----------|---------------|
| Acionamento | Clique em projeto (inspector de projeto) ou sessão (inspector de sessão) |
| Inspector de Projeto | Nome, cor, taxa horária, contexto — editável inline |
| Inspector de Sessão | Data, início, fim, duração, nota — editável inline |
| Fechar | Botão X ou clicar fora |
| Animação | Slide-in da direita — `prefers-reduced-motion` desativa |

---

#### `Settings` (a implementar)
**Arquivo:** `src/components/Settings.tsx` (novo)

| Seção | Conteúdo |
|-------|----------|
| Aparência | Tema (Escuro / Claro) com preview ao vivo |
| Tipografia | 5 níveis de tamanho de fonte com preview ao vivo |
| Densidade | Normal / Compacto (toggle tipo OmniFocus "eye") |
| Áreas | Criar, renomear, reordenar, excluir áreas |
| Dados | Exportar todos os dados (JSON), limpar dados |
| Sobre | Versão do app |

---

## 7. Fluxos de Navegação

### Mobile — Hierarquia 3 níveis

```
[Áreas]
   │ toca área
   ▼
[Projetos da Área]
   │ toca projeto
   ▼
[Detalhe do Projeto]
   │ pressiona Iniciar Timer
   ▼
[Timer ativo — tela cheia com cronômetro dominante]
   │ navega para outra tela (back)
   ▼
[Banner persistente no topo — toque retorna ao timer]
   │ pressiona Parar e Salvar
   ▼
[Retorna a Detalhe do Projeto — sessão aparece no histórico]
```

### Desktop — Layout com perspectivas

```
[Sidebar com perspectivas + áreas]
   │ seleciona projeto
   ▼
[DesktopProjectView — timer + histórico]
   │ clica em projeto/sessão
   ▼
[Inspector aparece à direita — edição inline]
```

### Regras invariantes de navegação

1. **Um timer ativo por vez** — ao tentar iniciar segundo, modal de confirmação com opção "Parar atual e iniciar novo"
2. **Títulos nunca truncados** — o item cresce verticalmente
3. **Salvar (timer ou lançamento manual) → retorna ao Nível 3 automaticamente**
4. **Banner de timer persistente** — visível em qualquer nível exceto a tela do próprio projeto

---

## 8. Estado Atual vs. Visão Completa

### Tabela de lacunas (delta)

| Funcionalidade | Estado | Etapa |
|----------------|--------|-------|
| Timer start/stop | ✅ Implementado | — |
| Sessões manuais | ✅ Implementado | — |
| CRUD de áreas | ✅ Implementado | — |
| CRUD de projetos | ✅ Implementado | — |
| Exportação CSV | ✅ Implementado | — |
| Cálculo de custo em tempo real | ✅ Implementado | — |
| Layout mobile 3 níveis | ✅ Implementado | — |
| Layout desktop 50/50 | ✅ Implementado | — |
| Banner timer ativo (mobile) | ✅ Implementado | — |
| **Persistência do timer no reload** | ❌ Faltando | Etapa 0 |
| **PWA (manifest + service worker)** | ❌ Faltando | Etapa 0 |
| **Tela de Configurações** | ❌ Faltando | Etapa 1 |
| **Controle de tamanho de fonte** | ❌ Faltando | Etapa 1 |
| **Tema claro + seletor** | ❌ Faltando | Etapa 1 |
| **Densidade configurável** | ❌ Faltando | Etapa 1 |
| **Sidebar com perspectivas** | ❌ Faltando | Etapa 2 |
| **Inspector lateral desktop** | ❌ Faltando | Etapa 2 |
| **Edição de sessões existentes** | ❌ Faltando | Etapa 3 |
| **Reordenação de áreas/projetos** | ❌ Faltando | Etapa 3 |
| **Paleta de cores com contraste** | ❌ Faltando | Etapa 3 |
| **Input de duração direta** | ❌ Faltando | Etapa 3 |
| **Resumo diário/semanal** | ❌ Faltando | Etapa 4 |
| **Entidade Cliente** | ❌ Faltando | Módulo 2 |
| **Relatórios avançados** | ❌ Faltando | Módulo 1 |
| **Supabase sync** | ❌ Faltando | Módulo 4 |

---

## 9. Módulos Futuros

### Módulo 1 — Relatórios

- Filtro de sessões por período (hoje, semana, mês, personalizado)
- Agrupamento por projeto, área, contexto
- Exportação detalhada (PDF + CSV)
- Gráfico simples de barras (horas por projeto)
- **Prerequisito:** Core estabilizado em uso real

### Módulo 2 — Clientes

- Entidade `Cliente` com nome, segmento, taxa horária padrão
- Agrupamento de projetos por cliente
- Rentabilidade por cliente: receita estimada × custo de tempo
- **Prerequisito:** Módulo 1 implementado

### Módulo 3 — Faturamento

- Relatório de cobrança por cliente e período
- Exportação formatada para apresentação ao cliente
- Integração futura com NF (escopo indefinido)
- **Prerequisito:** Módulo 2 implementado

### Módulo 4 — Sincronização Supabase

- Migrar `storage.ts` para cliente Supabase
- Auth básica (usuário único, sem multi-user)
- Backup em nuvem + acesso multi-dispositivo
- **Prerequisito:** MVP validado em uso real por 2+ semanas

---

## 10. Referências

- **WCAG 2.1 AA:** Critérios 1.4.3 (contraste), 1.4.4 (redimensionamento), 2.5.5 (tamanho do alvo)
- **OmniFocus:** Referência visual e estrutural — tema escuro, hierarquia tipográfica, inspector, perspectivas
- **Briefing completo:** `docs/BRIEFING.md`
- **Instruções ao Claude Code:** `CLAUDE.md`
- **Plano de implementação:** `docs/PLANO-IMPLEMENTACAO.md`
- **Tasks por etapa:** `docs/tarefas/ETAPA-{0..4}.md`
