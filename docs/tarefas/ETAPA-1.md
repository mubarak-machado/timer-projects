# Etapa 1 — Configurações & Tema
## Tela de Settings + Controle de Fonte + Tema Claro

**Prioridade:** Alta
**Prerequisito:** Etapa 0 completa
**Referência:** `docs/PLANO-IMPLEMENTACAO.md#etapa-1`

---

## Objetivo

Dar ao usuário controle total sobre a experiência visual — crítico para uso com baixa visão. O usuário deve poder ajustar fonte, tema e densidade sem sair do app.

---

## Tasks

### TASK-1.1 — Hook `useSettings` e tipo `ConfiguracaoUsuario`

**Arquivo:** `src/hooks/useSettings.ts` (novo)
**Arquivo de suporte:** `src/lib/storage.ts`, `src/types/index.ts`

**O que fazer:**

1. Adicionar tipo em `src/types/index.ts`:
   ```typescript
   export interface ConfiguracaoUsuario {
     tamanho_fonte: 1 | 2 | 3 | 4 | 5  // 1=pequeno → 5=máximo
     tema: "escuro" | "claro"
     densidade: "normal" | "compacto"
   }

   export const CONFIG_PADRAO: ConfiguracaoUsuario = {
     tamanho_fonte: 3,
     tema: "escuro",
     densidade: "normal",
   }
   ```

2. Adicionar em `src/lib/storage.ts`:
   ```typescript
   getSettings(): ConfiguracaoUsuario  // Retorna CONFIG_PADRAO se não existir
   saveSettings(config: ConfiguracaoUsuario): void
   ```

3. Criar `src/hooks/useSettings.ts`:
   ```typescript
   export function useSettings() {
     const [config, setConfig] = useState<ConfiguracaoUsuario>(getSettings)

     const update = (partial: Partial<ConfiguracaoUsuario>) => {
       const nova = { ...config, ...partial }
       setConfig(nova)
       saveSettings(nova)
     }

     return { config, update }
   }
   ```

**Critério de aceite:**
- [ ] `getSettings()` retorna `CONFIG_PADRAO` na primeira vez
- [ ] Mudar uma configuração persiste após reload da página
- [ ] TypeScript não apresenta erros de tipo

---

### TASK-1.2 — Aplicação do tema via `data-theme`

**Arquivo:** `src/App.tsx`
**Arquivo de suporte:** `src/styles/tokens.css`

**O que fazer:**

1. Em `App.tsx`, usar `useSettings()` para ler o tema atual.
2. Aplicar `document.documentElement.setAttribute('data-theme', config.tema)` em um `useEffect` que dispara quando `config.tema` muda.
3. O `src/styles/tokens.css` já tem `[data-theme="light"]` definido — nenhuma mudança necessária lá.

**Critério de aceite:**
- [ ] Trocar para tema claro muda visualmente todas as cores do app imediatamente
- [ ] Preferência persiste após reload
- [ ] Nenhum flash de tema errado ao carregar (aplicar tema antes do primeiro render)

---

### TASK-1.3 — Escala dinâmica de fonte via CSS variable

**Arquivo:** `src/styles/tokens.css`, `src/App.tsx`

**O que fazer:**

1. Em `src/styles/tokens.css`, adicionar `--font-scale: 1` em `:root`.
2. Reescrever todos os tokens de `--font-size-*` para usar `calc()`:
   ```css
   :root {
     --font-scale: 1;
     --font-size-timer: calc(4rem * var(--font-scale));
     --font-size-cost: calc(2rem * var(--font-scale));
     --font-size-xl: calc(1.875rem * var(--font-scale));
     --font-size-lg: calc(1.5rem * var(--font-scale));
     --font-size-base: calc(1.25rem * var(--font-scale));
     --font-size-meta: calc(1rem * var(--font-scale));
   }
   ```
3. Em `App.tsx`, mapear `tamanho_fonte` (1–5) para um multiplicador e aplicar em `useEffect`:
   ```typescript
   const escala = [0.85, 0.925, 1.0, 1.15, 1.35][config.tamanho_fonte - 1]
   document.documentElement.style.setProperty('--font-scale', String(escala))
   ```

**Critério de aceite:**
- [ ] Mudar nível de fonte altera visivelmente o tamanho de todos os textos
- [ ] No nível 5, o cronômetro está em `calc(4rem * 1.35)` = ~5.4rem (86px)
- [ ] No nível 1, `--font-size-meta` está em `calc(1rem * 0.85)` = 0.85rem — **atenção:** validar se viola o mínimo. Se violar, estabelecer `max(0.85rem, 0.875rem)` como piso
- [ ] Preferência persiste após reload

---

### TASK-1.4 — Toggle de densidade

**Arquivo:** `src/styles/tokens.css`, `src/App.tsx`

**O que fazer:**

1. Adicionar em `tokens.css`:
   ```css
   :root {
     --spacing-item: 1.25rem;
     --spacing-section: 2rem;
   }
   [data-densidade="compacto"] {
     --spacing-item: 0.625rem;
     --spacing-section: 1rem;
   }
   ```
2. Em `App.tsx`, aplicar `data-densidade` no `<html>` baseado em `config.densidade`.
3. Garantir que todos os componentes que usam espaçamento entre itens utilizem `var(--spacing-item)` e `var(--spacing-section)` — não valores hardcoded.

**Critério de aceite:**
- [ ] Modo compacto reduz visivelmente o espaçamento entre itens
- [ ] Modo normal retorna ao espaçamento original
- [ ] Touch targets de 48px são mantidos mesmo no modo compacto (espaçamento externo reduz, não o botão em si)

---

### TASK-1.5 — Componente `Settings`

**Arquivo:** `src/components/Settings.tsx` (novo)
**Integração:** `src/App.tsx` (adicionar rota/view "settings")

**O que fazer:**

Criar tela de configurações com as seguintes seções. A tela é uma view do roteador de `App.tsx` (não um modal).

**Seção: Aparência**
```
Tema
  [● Escuro]  [○ Claro]        ← botões tipo radio, 48px altura mínima
```

**Seção: Tipografia**
```
Tamanho do texto
  [P]  [M]  [G]  [GG]  [MÁX]  ← 5 botões, o selecionado em --color-accent
  Preview: "Aa — Timer Projects"  ← texto em tempo real com a fonte atual
```

**Seção: Visualização**
```
Densidade
  [● Normal]  [○ Compacto]     ← botões tipo radio
```

**Seção: Áreas** (mover de AreaList para cá)
```
Lista de áreas com:
  - Nome editável inline
  - Botões ↑↓ para reordenar
  - Botão excluir (com confirmação)
  - [+ Nova Área]
```

**Seção: Dados**
```
  [Exportar todos os dados como JSON]  ← download do localStorage completo
  [Limpar todos os dados]  ← botão --color-danger, confirmação obrigatória
```

**Integração em App.tsx:**
- Adicionar view `"settings"` ao tipo `Page`
- Adicionar botão de engrenagem (ícone Lucide `Settings`) no header de `AreaList` e no sidebar desktop

**Critério de aceite:**
- [ ] Todas as alterações têm efeito imediato e visual (sem precisar salvar)
- [ ] Ao voltar para o app, as configurações estão aplicadas
- [ ] Botão "Limpar dados" exige confirmação explícita (não pode ser acidental)
- [ ] Botão de engrenagem visível no mobile (AreaList) e desktop (topo da sidebar)
- [ ] Touch targets ≥ 48px em todos os controles

---

### TASK-1.6 — Teste de regressão pós-Etapa 1

- [ ] Tema escuro (padrão) não regrediu visualmente
- [ ] Tema claro funciona em todas as telas
- [ ] Todos os níveis de fonte são legíveis e não quebram o layout
- [ ] Timer funciona em todos os temas e níveis de fonte
- [ ] Dados existentes não foram perdidos
- [ ] App funciona offline (PWA da Etapa 0)

---

## Ordem de execução recomendada

```
TASK-1.1 → TASK-1.2 → TASK-1.3 → TASK-1.4 → TASK-1.5 → TASK-1.6
```

As tasks 1.2, 1.3 e 1.4 dependem da 1.1. A 1.5 integra todas.
