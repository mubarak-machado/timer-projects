# CLAUDE.md — Controle de Tempo por Projeto

Contexto permanente do projeto. Leia antes de qualquer tarefa.
Documento completo: `docs/BRIEFING.md`

---

## O que é este projeto

PWA de controle de tempo por projeto com cálculo de custo. Ferramenta pessoal
com acessibilidade como fundação — não como retrofit. Desenvolvida para uso com
baixa visão. Referência de design: OmniFocus (iOS).

Uso atual: MPF (projetos orçamentários) e congregação (tarefas administrativas).
Uso futuro possível: consultoria para pequenos negócios.

---

## Stack

- React + Tailwind CSS + shadcn/ui
- Persistência: `localStorage` (MVP) → Supabase (futuro)
- Deploy: Vercel
- Tipo: PWA

---

## Modelo de dados (MVP)

```typescript
type Contexto = "pessoal" | "profissional" | "cliente"

interface Area {
  id: string         // uuid
  nome: string
  ordem: number
  criado_em: string  // ISO timestamp
}

interface Projeto {
  id: string
  area_id: string
  nome: string
  cor: string        // hex — sempre verificar contraste
  taxa_horaria?: number
  contexto: Contexto
  cliente_id?: string  // reservado para Módulo 2
  criado_em: string
}

interface Sessao {
  id: string
  projeto_id: string
  inicio: string     // ISO timestamp
  fim?: string       // null = timer ativo
  duracao_segundos: number  // calculado ao salvar
  nota?: string
}

// Custo = soma(durações em horas) × taxa_horária
// Cliente: entidade ainda não implementada — não criar no MVP
```

---

## Regras de acessibilidade (não negociáveis)

- Fundo padrão: `#000000` (preto puro — não cinza escuro)
- Fonte mínima: `1rem` para metadados, `1.25rem` para corpo, `1.5rem` para títulos
- Timer/cronômetro: mínimo `4rem` — nunca menor
- Touch targets: mínimo `48×48px` em todos os elementos interativos
- Contraste mínimo WCAG AA (4.5:1) em todos os estados (normal, hover, disabled)
- **Títulos nunca truncados com `…`** — o item cresce verticalmente; se necessário
  usar `line-clamp: 2` como máximo absoluto, nunca `line-clamp: 1`
- Separação entre itens: linha fina (`#2c2c2e`) + espaçamento — nunca cards com borda

### Paleta base (tema escuro padrão)

```css
--color-bg: #000000
--color-surface: #111111
--color-surface-2: #1c1c1e
--color-separator: #2c2c2e
--color-text-primary: #ffffff
--color-text-secondary: #8e8e93
--color-accent: #0a84ff
--color-danger: #ff453a
--color-success: #30d158
--color-tag-bg: #2c2c2e
--color-tag-text: #ebebf5
```

---

## Navegação

### Mobile (< 1024px) — 3 níveis hierárquicos
```
Nível 1: Lista de Áreas
  → Nível 2: Lista de Projetos da Área
    → Nível 3: Detalhe do Projeto (histórico + [Iniciar Timer] + [Lançar Manual])
      → Timer em tela cheia
      → Ao navegar com timer ativo: banner persistente no topo
        (nome do projeto + cronômetro correndo → toque retorna ao timer)
```

### Desktop (≥ 1024px)
- Sidebar com áreas e projetos
- Área principal dividida: timer (50% top) + histórico (50% bottom)

### Regras invariantes
- **Um timer ativo por vez** — ao tentar iniciar segundo, exibir aviso com opção de parar o atual
- Estado do timer em contexto global (Zustand ou React Context) — não local ao componente
- Salvar timer → retorna automaticamente ao Nível 3

---

## Escopo do MVP

**Entra:**
- CRUD de áreas e projetos
- Timer start/stop (um por vez)
- Custo em tempo real (sessão + total do projeto)
- Lançamento manual de sessão (data, início/fim ou duração, nota)
- Exportação CSV
- Configurações: tamanho de fonte (5 níveis), tema (escuro/claro), gerenciar áreas

**Não entra no MVP:**
- Relatórios avançados / gráficos
- Entidade Cliente
- Sincronização em nuvem
- Multi-usuário

---

## Convenções de código

- Componentes em `src/components/` — um arquivo por componente
- Estado global do timer em `src/store/timer.ts`
- Persistência encapsulada em `src/lib/storage.ts` — nunca chamar localStorage diretamente nos componentes
- Tokens CSS em `src/styles/tokens.css` — importar no root
- Nomes em português para domínio (Area, Projeto, Sessao), inglês para utilitários

---

## O que não fazer

- Não usar `text-overflow: ellipsis` ou `line-clamp: 1` em títulos de área, projeto ou nota
- Não usar cards com borda/sombra para separar itens de lista
- Não criar a entidade Cliente no MVP
- Não iniciar Supabase antes de validar o MVP em uso real
- Não usar fonte abaixo de `1rem` em nenhum elemento visível

---

## Status de implementação

**Última atualização:** Março 2026

| Etapa | Descrição | Status |
|-------|-----------|--------|
| Core MVP | Timer, sessões, áreas, projetos, exportação CSV | ✅ Implementado |
| Etapa 0 | Persistência do timer no reload + PWA completo | ⏳ Pendente |
| Etapa 1 | Tela de Configurações + tema claro + controle de fonte | ⏳ Pendente |
| Etapa 2 | Desktop: sidebar com perspectivas + inspector lateral | ⏳ Pendente |
| Etapa 3 | UX mobile: edição de sessões, reordenação, paleta de cores | ⏳ Pendente |
| Etapa 4 | Módulos futuros: Relatórios, Clientes, Faturamento, Supabase | 🔒 Bloqueado |

**Próxima tarefa:** iniciar pela **Etapa 0** — é pré-requisito para todas as demais.

---

## Protocolo de implementação (leia isto antes de qualquer tarefa de código)

Quando o usuário pedir para continuar, implementar, ou iniciar o desenvolvimento
— seja com "continue", "próxima task", "implemente" ou qualquer variação —
siga este protocolo sem precisar de instrução adicional:

1. **Leia a tabela de status acima.** Identifique a primeira etapa com status ⏳.
2. **Abra o arquivo de tasks da etapa:** `docs/tarefas/ETAPA-N.md`
   (onde N é o número da etapa pendente).
3. **Leia o arquivo inteiro.** Identifique a primeira task sem `[x]`.
4. **Implemente a task** seguindo as especificações do arquivo e as convenções
   deste CLAUDE.md.
5. **Ao concluir cada task:** marque `[x]` na task dentro do arquivo de tasks
   E atualize a tabela de status neste CLAUDE.md (⏳ → ✅ quando toda a etapa
   estiver concluída).
6. **Ao concluir todas as tasks de uma etapa:** pergunte ao usuário se deve
   avançar para a próxima etapa ou pausar.

**Mapa de documentação:**

| Documento | Conteúdo |
|-----------|----------|
| `CLAUDE.md` (este arquivo) | Contexto rápido + status + protocolo |
| `docs/SDD.md` | Especificação completa do produto |
| `docs/PLANO-IMPLEMENTACAO.md` | Roadmap por etapas com critérios |
| `docs/tarefas/ETAPA-0.md` | Tasks: persistência do timer + PWA |
| `docs/tarefas/ETAPA-1.md` | Tasks: configurações, tema, fonte |
| `docs/tarefas/ETAPA-2.md` | Tasks: sidebar perspectivas + inspector |
| `docs/tarefas/ETAPA-3.md` | Tasks: edição de sessões, reordenação, paleta |
| `docs/tarefas/ETAPA-4.md` | Tasks: módulos futuros (relatórios, clientes) |

---

## Para atualizar este arquivo

Peça ao Claude Code: *"Atualize o CLAUDE.md para refletir [decisão/mudança]"*
Decisões detalhadas e histórico de raciocínio ficam em `docs/BRIEFING.md`.
