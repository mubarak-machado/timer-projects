# Etapa 4 — Módulos Futuros
## Relatórios + Clientes + Faturamento + Supabase

**Prioridade:** Baixa — pós-validação do MVP
**Prerequisito:** Etapas 0–3 completas + 2 semanas de uso real validado
**Referência:** `docs/SDD.md#9-módulos-futuros`

---

## Aviso importante

**Não iniciar esta etapa antes de usar o app em condições reais** (MPF e congregação) por pelo menos 2 semanas. O objetivo da validação é:

1. Confirmar que as funcionalidades do Core satisfazem o uso cotidiano
2. Identificar fricções não antecipadas
3. Decidir conscientemente se expandir vale o esforço vs. estabilizar o Core

---

## Módulo 1 — Relatórios

**Objetivo:** Filtros de período e resumos para tomada de decisão.

### TASK-4.1 — Filtros de período

**Arquivo:** `src/components/Relatorios.tsx` (novo)

Criar view de relatórios acessível via nova perspectiva na sidebar desktop e botão na tela de configurações mobile.

**Filtros disponíveis:**
- Hoje
- Esta semana (Dom–Sáb ou Seg–Dom, configurável)
- Este mês
- Período personalizado (data início + data fim)

**Agrupamentos:**
- Por projeto (padrão)
- Por área
- Por contexto (pessoal / profissional / cliente)

**Dados exibidos por item:**
- Total de horas
- Total de custo (se taxa horária definida)
- Número de sessões

**Totalizador no rodapé:**
- Soma de horas do período
- Soma de custo do período

---

### TASK-4.2 — Exportação detalhada do relatório

**Arquivo:** `src/lib/export.ts` (estender)

Adicionar função de exportação do relatório completo:
```typescript
exportRelatorioCSV(sessoes: Sessao[], projetos: Projeto[], areas: Area[], periodo: string): string
```

CSV com colunas: Área, Projeto, Contexto, Data, Início, Fim, Duração, Custo, Nota.

---

### TASK-4.3 — Gráfico de barras simples

Gráfico horizontal de barras mostrando horas por projeto no período selecionado.

**Implementação:** SVG puro (sem biblioteca externa) — barras horizontais, labels de projeto, valores de horas. Respeitar `--color-accent` para barras e `--color-text-secondary` para labels.

**Requisitos de acessibilidade:**
- Cada barra deve ter `aria-label` com o valor exato
- Não depender de cor como único indicador

---

## Módulo 2 — Clientes

**Objetivo:** Gestão de clientes e agrupamento de projetos para uso em consultoria.

### TASK-4.4 — Entidade Cliente

**Arquivo:** `src/types/index.ts`, `src/hooks/useClientes.ts` (novo)

```typescript
interface Cliente {
  id: string
  nome: string
  segmento?: string       // Ex: "varejo", "saúde", "educação"
  taxa_horaria_padrao?: number
  criado_em: string
}
```

Hook `useClientes` com mesmo padrão de `useAreas`: `addCliente`, `updateCliente`, `deleteCliente`, `getCliente`.

---

### TASK-4.5 — Vincular projetos a clientes

**Arquivo:** `src/components/ProjectList.tsx`, `src/components/Settings.tsx`

- Campo `cliente_id` em `Projeto` já existe no modelo (reservado)
- Adicionar seletor de cliente no formulário de criar/editar projeto
- Filtro de projetos por cliente na sidebar desktop (perspectiva "Por Cliente")

---

### TASK-4.6 — Rentabilidade por cliente

**Arquivo:** `src/lib/utils.ts`

```typescript
function calcularRentabilidadeCliente(
  cliente: Cliente,
  projetos: Projeto[],
  sessoes: Sessao[]
): {
  totalHoras: number
  totalCusto: number
  projetosAtivos: number
}
```

Exibir na view de relatórios ao filtrar por cliente.

---

## Módulo 3 — Faturamento

**Objetivo:** Exportação formatada para apresentação ao cliente.

### TASK-4.7 — Relatório de cobrança

**Arquivo:** `src/lib/export.ts` (estender)

Gerar relatório formatado por cliente e período:
```typescript
exportRelatorioCobranca(
  cliente: Cliente,
  projetos: Projeto[],
  sessoes: Sessao[],
  periodo: { inicio: Date; fim: Date }
): string  // Retorna HTML ou Markdown formatado
```

Conteúdo:
- Cabeçalho: nome do cliente, período, data de emissão
- Tabela de projetos com horas e custo
- Total geral
- Rodapé com dados do prestador (configurável em Settings)

---

### TASK-4.8 — Exportação para PDF (opcional)

Usando a API `window.print()` com CSS de impressão otimizado — sem biblioteca externa. Alternativa: gerar Markdown para copiar e colar.

---

## Módulo 4 — Sincronização Supabase

**Objetivo:** Multi-dispositivo e backup em nuvem.

**Prerequisito:** Módulos 1–3 validados em uso real. Não iniciar antes.

### TASK-4.9 — Migração do storage.ts para Supabase

**Estratégia:** Interface comum — `storage.ts` exporta as mesmas funções, mas a implementação interna é trocada de `localStorage` para Supabase Client.

```typescript
// Interface que não muda (usada pelos hooks)
export interface StorageAdapter {
  getAreas(): Promise<Area[]>
  saveArea(area: Area): Promise<void>
  deleteArea(id: string): Promise<void>
  // ... demais entidades
}

// Implementação 1: localStorage (atual)
export const localStorageAdapter: StorageAdapter = { ... }

// Implementação 2: Supabase (futura)
export const supabaseAdapter: StorageAdapter = { ... }
```

Os hooks (`useAreas`, `useProjects`, `useSessions`) não precisam mudar — apenas a implementação do adapter.

---

### TASK-4.10 — Auth básica (single user)

Autenticação mínima para proteção dos dados:
- Login com email + senha (Supabase Auth)
- Row Level Security para isolar dados por usuário
- Sessão persistente no localStorage (Supabase gerencia)
- Sem registro público — o usuário é o dono da instância

---

### TASK-4.11 — Migração de dados do localStorage para Supabase

Utilitário de migração único executado uma vez:
```typescript
async function migrarLocalParaSupabase(): Promise<void>
```
- Lê todos os dados do localStorage
- Insere no Supabase
- Exibe progresso ao usuário
- Em caso de erro, preserva os dados locais (não destrói)

---

## Critérios gerais dos módulos

- [ ] Nenhum módulo quebra dados do Core ao ser ativado
- [ ] Módulos são independentes entre si (exceto dependências explicitadas)
- [ ] Todas as novas telas respeitam os tokens de design e regras de acessibilidade
- [ ] Todos os novos inputs têm `min-height: 48px` e `font-size: var(--font-size-base)`
- [ ] Nenhum título truncado em nenhuma nova tela
