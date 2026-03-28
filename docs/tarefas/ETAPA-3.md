# Etapa 3 — Melhorias de UX Mobile
## Edição de Sessões + Reordenação + Paleta + Duração Direta

**Prioridade:** Média
**Prerequisito:** Etapa 1 completa (Etapa 2 pode ser paralela)
**Referência:** `docs/PLANO-IMPLEMENTACAO.md#etapa-3`

---

## Objetivo

Preencher as lacunas de usabilidade identificadas no fluxo mobile: editar sessões existentes, reordenar áreas/projetos, garantir contraste nas cores dos projetos e simplificar o lançamento manual com entrada de duração direta.

---

## Tasks

### TASK-3.1 — Edição de sessões existentes

**Arquivos:** `src/components/ProjectDetail.tsx`, `src/components/ManualEntry.tsx`, `src/hooks/useSessions.ts`

**O que fazer:**

1. Em `src/hooks/useSessions.ts`, adicionar função `updateSession`:
   ```typescript
   updateSession(id: string, dados: Partial<Pick<Sessao, 'inicio' | 'fim' | 'duracao_segundos' | 'nota'>>): void
   ```
   A função deve recalcular `duracao_segundos` se `inicio` ou `fim` forem atualizados.

2. Em `src/components/ProjectDetail.tsx`, adicionar botão de edição em cada item do histórico:
   - Botão com ícone Lucide `Pencil`, alinhado à direita do item
   - `min-width: 48px`, `min-height: 48px`
   - Ao clicar, abre `ManualEntry` pré-preenchido com os dados da sessão

3. Em `src/components/ManualEntry.tsx`, adicionar prop opcional `sessaoExistente`:
   ```typescript
   interface ManualEntryProps {
     projetoId: string
     sessaoExistente?: Sessao   // Se fornecido, modo edição
     onSalvar: () => void
     onCancelar: () => void
   }
   ```
   - Se `sessaoExistente` fornecido: preencher campos com dados existentes, botão "Salvar alterações"
   - Se não fornecido: comportamento atual (novo lançamento), botão "Salvar registro"

**Critério de aceite:**
- [ ] Editar sessão existente salva as alterações sem criar nova sessão
- [ ] `duracao_segundos` é recalculado corretamente após edição
- [ ] Botão de edição tem area de toque mínima de 48×48px
- [ ] Cancelar edição não altera os dados originais

---

### TASK-3.2 — Reordenação de áreas

**Arquivos:** `src/components/Settings.tsx`, `src/hooks/useAreas.ts`

**O que fazer:**

1. Em `src/hooks/useAreas.ts`, adicionar função `reordenarAreas`:
   ```typescript
   reordenarAreas(idParaMover: string, direcao: "cima" | "baixo"): void
   ```
   A função deve atualizar o campo `ordem` de todas as áreas afetadas e persistir.

2. Em `src/components/Settings.tsx` (seção Áreas), adicionar botões ↑ e ↓ em cada item da lista:
   - Botão ↑: desabilitado se já for o primeiro item
   - Botão ↓: desabilitado se já for o último item
   - `min-width: 40px`, `min-height: 48px`
   - Ícones Lucide `ChevronUp` / `ChevronDown`

3. Garantir que `AreaList` renderiza as áreas na ordem do campo `ordem` (não por `criado_em`).

**Critério de aceite:**
- [ ] Mover área para cima/baixo reflete imediatamente na lista
- [ ] Ordem persiste após reload
- [ ] Botões desabilitados nas extremidades não são clicáveis (cursor correto, estilo opaco)

---

### TASK-3.3 — Reordenação de projetos dentro de uma área

**Arquivos:** `src/components/ProjectList.tsx`, `src/hooks/useProjects.ts`

**O que fazer:**

1. Em `src/hooks/useProjects.ts`, adicionar função `reordenarProjetos`:
   ```typescript
   reordenarProjetos(areaId: string, idParaMover: string, direcao: "cima" | "baixo"): void
   ```
   Reordenar apenas projetos dentro da mesma área.

   Adicionar campo `ordem: number` ao tipo `Projeto` em `src/types/index.ts` (se ainda não existir). Projetos sem `ordem` definida recebem `ordem = 0` como padrão.

2. Em `src/components/ProjectList.tsx`, adicionar botões ↑ e ↓ em cada item (mesmo padrão da TASK-3.2).

**Critério de aceite:**
- [ ] Projetos da mesma área são reordenáveis independentemente
- [ ] Projetos de áreas diferentes não se afetam mutuamente
- [ ] Ordem persiste após reload

---

### TASK-3.4 — Paleta de cores com contraste garantido

**Arquivos:** `src/components/ProjectList.tsx`, `src/lib/utils.ts`

**O que fazer:**

1. Definir paleta curada em `src/lib/utils.ts`:
   ```typescript
   export const PALETA_PROJETOS: string[] = [
     "#0a84ff",  // Azul iOS
     "#30d158",  // Verde iOS
     "#ff9f0a",  // Laranja iOS
     "#ff453a",  // Vermelho iOS
     "#bf5af2",  // Roxo iOS
     "#ff375f",  // Rosa iOS
     "#64d2ff",  // Azul claro iOS
     "#ffd60a",  // Amarelo iOS
     "#ac8e68",  // Marrom
     "#6c6c70",  // Cinza médio
     "#32ade6",  // Azul alternativo
     "#34c759",  // Verde alternativo
   ]
   ```

   Todas as cores foram selecionadas para ter contraste ≥ 4.5:1 contra `#000000`. Verificar com [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) antes de incluir qualquer cor.

2. Substituir o input hex livre no formulário de novo projeto por um seletor visual:
   - Grid 4×3 de círculos coloridos (32×32px cada, touch target 48×48px)
   - Cor selecionada com borda branca de 2px + check icon ao centro
   - Cor padrão: `#0a84ff` (primeiro item da paleta)

3. Remover input hex manual — a paleta é a única opção no MVP.

**Critério de aceite:**
- [ ] Todas as cores da paleta têm contraste verificado ≥ 4.5:1 contra `#000000`
- [ ] Seletor visual funciona em mobile (touch) e desktop (mouse)
- [ ] Cor selecionada visualmente distinguível das demais
- [ ] Projetos existentes com cores fora da paleta continuam exibindo sua cor atual (não quebrar dados)

---

### TASK-3.5 — Input de duração direta no `ManualEntry`

**Arquivo:** `src/components/ManualEntry.tsx`

**O que fazer:**

Adicionar modo alternativo de entrada: duração direta em vez do par início/fim.

**UI:**
```
Modo de entrada:
  [● Início e Fim]  [○ Duração]    ← toggle com 2 opções

Se "Início e Fim":
  Hora início: [__:__]   Hora fim: [__:__]   (comportamento atual)

Se "Duração":
  Hora início: [__:__]
  Duração:     [__h] [__min]
  (Fim calculado automaticamente ao salvar)
```

**Lógica de cálculo:**
```typescript
fim = new Date(inicio.getTime() + horas * 3600000 + minutos * 60000)
duracao_segundos = horas * 3600 + minutos * 60
```

**Critério de aceite:**
- [ ] Modo "Duração" calcula o `fim` corretamente ao salvar
- [ ] Validação: duração > 0 obrigatória
- [ ] Validação: duração não pode resultar em `fim` maior que "agora" (alerta, não bloqueio)
- [ ] Ambos os modos geram sessões idênticas em estrutura de dados

---

### TASK-3.6 — Contador de projetos ativos na AreaList

**Arquivo:** `src/components/AreaList.tsx`

**O que fazer:**

Adicionar contador de projetos em cada item de área:
```
MPF            3 projetos ›
Congregação    1 projeto  ›
```

- Texto do contador em `font-size: var(--font-size-meta)`, cor `--color-text-secondary`
- Singular/plural correto em português ("1 projeto" vs "2 projetos")
- Exibir apenas projetos, não sessões (contar `projetos.filter(p => p.area_id === area.id).length`)

---

### TASK-3.7 — Teste de regressão pós-Etapa 3

- [ ] Edição de sessão não cria duplicatas
- [ ] Reordenação não afeta sessões associadas aos projetos
- [ ] Paleta de cores não quebra projetos com cores existentes fora da paleta
- [ ] Timer continua funcionando em todos os fluxos
- [ ] Dados do localStorage não corrompidos
- [ ] App funciona offline

---

## Ordem de execução recomendada

As tasks 3.1 a 3.6 são independentes entre si e podem ser feitas em qualquer ordem. Recomendado por impacto:

```
TASK-3.1 → TASK-3.5 → TASK-3.4 → TASK-3.2 → TASK-3.3 → TASK-3.6 → TASK-3.7
```
