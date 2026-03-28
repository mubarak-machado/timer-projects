# Plano de Implementação por Etapas
## Timer Projects

**Versão:** 1.0
**Data:** Março 2026
**Base:** `docs/SDD.md`
**Tasks detalhadas:** `docs/tarefas/ETAPA-{0..4}.md`

---

## Visão geral do roadmap

```
Etapa 0 — Fundação          [PRIORIDADE MÁXIMA]
  Persistência do timer + PWA completo

Etapa 1 — Configurações     [PRIORIDADE ALTA]
  Tela de Settings + controle de fonte + tema claro

Etapa 2 — Desktop OmniFocus [PRIORIDADE MÉDIA]
  Sidebar com perspectivas + Inspector lateral

Etapa 3 — UX Mobile         [PRIORIDADE MÉDIA]
  Edição de sessões + reordenação + paleta de cores

Etapa 4 — Módulos Futuros   [PRIORIDADE BAIXA — pós-validação]
  Relatórios + Clientes + Faturamento + Supabase
```

**Critério de avanço:** cada etapa deve estar estável em uso real antes de avançar para a próxima.

---

## Etapa 0 — Fundação

**Objetivo:** Tornar o app robusto para uso diário. Sem essas correções, o app perde dados ao recarregar e não pode ser instalado como PWA.

**Duração estimada:** 1–2 sessões de desenvolvimento

### 0.1 — Persistência do timer no reload

**Problema:** O Zustand store (`src/store/timer.ts`) vive apenas em memória. Se o browser recarregar com timer ativo, o estado é perdido — a sessão se perde silenciosamente.

**Solução:** Ao iniciar o timer, salvar `{ projetoId, inicio }` em `localStorage` via `storage.ts`. Ao recarregar, o store inicializa verificando essa chave. Ao parar, limpar a chave.

**Arquivos afetados:**
- `src/store/timer.ts` — adicionar persistência via middleware Zustand persist ou manual
- `src/lib/storage.ts` — nova chave `timer_app_active_timer`

**Critério de aceite:** Timer ativo sobrevive a `Cmd+R` / F5 / fechar e reabrir a aba.

---

### 0.2 — PWA: manifest.json

**Problema:** O app não tem `manifest.json`. Não pode ser instalado em iOS, Android ou desktop.

**Solução:** Criar `public/manifest.json` com nome, ícones, cores e `display: standalone`. Referenciar no `index.html`.

**Conteúdo mínimo:**
```json
{
  "name": "Timer Projects",
  "short_name": "Timer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [...]
}
```

**Arquivos afetados:** `public/manifest.json` (novo), `index.html`

---

### 0.3 — PWA: Service Worker básico

**Problema:** Sem service worker, o app depende de conexão para carregar. O MVP deve funcionar 100% offline.

**Solução:** Usar Vite PWA plugin (`vite-plugin-pwa`) para geração automática do service worker com estratégia `CacheFirst` para assets estáticos.

**Arquivos afetados:** `vite.config.ts`, `package.json` (nova dependência `vite-plugin-pwa`)

**Critério de aceite:** App carrega normalmente com DevTools em modo offline.

---

**Tasks detalhadas:** `docs/tarefas/ETAPA-0.md`

---

## Etapa 1 — Configurações & Tema

**Objetivo:** Dar ao usuário controle total sobre a experiência visual — especialmente crítico para baixa visão.

**Duração estimada:** 2–3 sessões de desenvolvimento

### 1.1 — Hook `useSettings` e persistência

Criar `src/hooks/useSettings.ts` que lê/escreve `ConfiguracaoUsuario` em `localStorage`. Exposição via Context para toda a árvore de componentes.

```typescript
interface ConfiguracaoUsuario {
  tamanho_fonte: 1 | 2 | 3 | 4 | 5
  tema: "escuro" | "claro"
  densidade: "normal" | "compacto"
}
```

---

### 1.2 — Aplicação dinâmica do tema

Criar lógica que aplica `data-theme="light"` no `<html>` ou `<body>` baseado na configuração. Os tokens CSS já estão definidos em `src/styles/tokens.css` — falta apenas o toggle.

---

### 1.3 — Escala dinâmica de fonte

Aplicar multiplicador de fonte via CSS custom property `--font-scale` no root. Todos os tokens de fonte usam `calc(valor-base * var(--font-scale))`.

| Nível | Multiplicador |
|-------|--------------|
| 1 — Pequeno | 0.85 |
| 2 — Médio | 0.925 |
| 3 — Padrão | 1.0 |
| 4 — Grande | 1.15 |
| 5 — Máximo | 1.35 |

---

### 1.4 — Componente `Settings`

Nova tela/modal acessível a partir de botão no header/sidebar. Seções:
- **Aparência:** seletor de tema com preview ao vivo
- **Tipografia:** 5 botões de tamanho com preview ao vivo ("Aa")
- **Densidade:** toggle Normal / Compacto
- **Áreas:** CRUD de áreas (mover de AreaList para cá)
- **Dados:** exportar JSON completo, limpar dados locais

**Arquivo:** `src/components/Settings.tsx` (novo)

---

### 1.5 — Toggle de densidade

Implementar o padrão OmniFocus "eye button": toggle global que alterna entre visualização normal (espaçada) e compacta. A densidade afeta o `--spacing-item` e `--spacing-section`.

| Modo | `--spacing-item` | `--spacing-section` |
|------|-----------------|---------------------|
| Normal | 1.25rem | 2rem |
| Compacto | 0.625rem | 1rem |

---

**Tasks detalhadas:** `docs/tarefas/ETAPA-1.md`

---

## Etapa 2 — Desktop OmniFocus

**Objetivo:** Elevar a experiência desktop ao padrão OmniFocus com perspectivas e inspector lateral.

**Duração estimada:** 2–3 sessões de desenvolvimento

### 2.1 — Sidebar com perspectivas

Adicionar seção "Perspectivas" acima da lista de áreas no `DesktopSidebar`:

```
PERSPECTIVAS
  • Hoje            → sessões registradas hoje (em todos os projetos)
  • Esta Semana     → sessões dos últimos 7 dias
  • Todos os Projetos → vista flat de todos os projetos
ÁREAS
  ▼ MPF
      • Projeto A
  ▼ Congregação
      • Tarefa X
```

Cada perspectiva é um filtro de sessões com layout próprio na área principal.

---

### 2.2 — Inspector lateral

Painel deslizante da direita (20% da largura), ativado ao clicar num projeto ou sessão:

**Inspector de Projeto:**
- Nome (editável)
- Cor (paleta com contraste)
- Taxa horária (editável)
- Contexto (seletor)
- Total de horas e custo

**Inspector de Sessão:**
- Data (editável)
- Início e fim (editáveis)
- Duração calculada (somente leitura)
- Nota (textarea multilinha)
- Botão excluir sessão

---

### 2.3 — Layout desktop atualizado

```
┌────────┬──────────────────────────┬──────────────┐
│ 16%    │         64%              │     20%      │
│Sidebar │  DesktopProjectView      │  Inspector   │
│        │  (timer + histórico)     │  (collapse)  │
└────────┴──────────────────────────┴──────────────┘
```

O Inspector pode ser fechado, retornando ao layout 16/84.

---

**Tasks detalhadas:** `docs/tarefas/ETAPA-2.md`

---

## Etapa 3 — Melhorias de UX Mobile

**Objetivo:** Polir os fluxos móveis com funcionalidades faltantes identificadas em uso real.

**Duração estimada:** 1–2 sessões de desenvolvimento

### 3.1 — Edição de sessões

Permitir editar sessões já salvas. Abrir `ManualEntry` pré-preenchido com os dados da sessão.

### 3.2 — Reordenação de áreas e projetos

Botões ↑↓ para mover áreas e projetos dentro de suas listas. O campo `ordem` já existe no modelo — falta apenas a UI.

### 3.3 — Paleta de cores com contraste garantido

Substituir o input hex livre por uma paleta curada de 12–16 cores, todas com contraste verificado (≥ 4.5:1) contra `--color-bg` e `--color-surface`. Calcular contraste automaticamente ao renderizar o dot do projeto.

### 3.4 — Input de duração direta no ManualEntry

Adicionar opção alternativa ao par início/fim: campo único de duração no formato `hh:mm`. Calcular `fim = inicio + duracao` ao salvar.

### 3.5 — Contador de projetos ativos na AreaList

Exibir número de projetos por área no item da lista (ex: "MPF · 3 projetos").

---

**Tasks detalhadas:** `docs/tarefas/ETAPA-3.md`

---

## Etapa 4 — Módulos Futuros

**Prerequisito:** MVP validado em uso real por pelo menos 2 semanas (Etapas 0–3 completas).

**Sequência recomendada:**

1. **Módulo 1 — Relatórios** (filtros de período, agrupamentos, gráfico de barras)
2. **Módulo 2 — Clientes** (entidade Cliente, agrupamento de projetos)
3. **Módulo 3 — Faturamento** (relatório de cobrança por cliente)
4. **Módulo 4 — Supabase** (migração de localStorage, sync multi-dispositivo)

Cada módulo tem seu próprio arquivo de tasks em `docs/tarefas/ETAPA-4.md`.

---

## Critérios de Qualidade (todas as etapas)

Toda implementação deve satisfazer:

- [ ] Contraste WCAG AA (4.5:1) em todos os novos elementos
- [ ] Touch targets mínimos de 48×48px
- [ ] Nenhum título truncado com `…`
- [ ] Nenhuma fonte abaixo de `1rem`
- [ ] Timer continua funcionando corretamente após a mudança
- [ ] Dados existentes no localStorage não são perdidos
- [ ] Sem regressões visuais no modo escuro (padrão)
- [ ] Funciona offline (sem rede)
