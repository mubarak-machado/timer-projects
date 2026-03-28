# Etapa 0 — Fundação
## Persistência do Timer + PWA Completo

**Prioridade:** Máxima
**Prerequisito:** Nenhum
**Referência:** `docs/PLANO-IMPLEMENTACAO.md#etapa-0`

---

## Por que esta etapa é crítica

Sem estas correções:
- O timer perde o estado ao recarregar a página (sessões se perdem silenciosamente)
- O app não pode ser instalado como PWA em iOS, Android ou desktop
- O app não funciona offline (depende do servidor para carregar)

---

## Tasks

### TASK-0.1 — Persistência do timer ativo no localStorage

**Arquivo principal:** `src/store/timer.ts`
**Arquivos de suporte:** `src/lib/storage.ts`

**O que fazer:**

1. Em `src/lib/storage.ts`, adicionar funções para a chave `timer_app_active_timer`:
   ```typescript
   // Salvar timer ativo
   saveActiveTimer(data: { projetoId: string; inicio: string }): void
   // Carregar timer ativo
   getActiveTimer(): { projetoId: string; inicio: string } | null
   // Limpar timer ativo
   clearActiveTimer(): void
   ```

2. Em `src/store/timer.ts`, modificar o estado inicial para verificar o localStorage:
   ```typescript
   // No estado inicial do Zustand, verificar se há timer salvo:
   const savedTimer = getActiveTimer()
   // Se existir, restaurar { projetoId, inicio: new Date(savedTimer.inicio) }
   ```

3. Em `startTimer()`: chamar `saveActiveTimer()` após atualizar o estado.

4. Em `stopTimer()`: chamar `clearActiveTimer()` antes de retornar.

**Critério de aceite:**
- [ ] Iniciar timer, pressionar `Cmd+R` (ou F5), timer continua correndo com o tempo correto
- [ ] Parar o timer após reload salva a sessão corretamente (duração inclui o período antes do reload)
- [ ] Timer sem estado salvo não exibe timer fantasma ao abrir o app
- [ ] `clearActiveTimer()` é chamado ao parar o timer — sem vazamento de estado

**Atenção:** O campo `inicio` deve ser serializado como ISO string no localStorage e desserializado como `new Date()` ao carregar.

---

### TASK-0.2 — Criar `public/manifest.json`

**Arquivo:** `public/manifest.json` (novo)
**Arquivo de suporte:** `index.html`

**O que fazer:**

1. Criar `public/manifest.json`:
   ```json
   {
     "name": "Timer Projects",
     "short_name": "Timer",
     "description": "Controle de tempo por projeto com cálculo de custo",
     "start_url": "/",
     "display": "standalone",
     "orientation": "portrait-primary",
     "background_color": "#000000",
     "theme_color": "#000000",
     "icons": [
       {
         "src": "/icons/icon-192.png",
         "sizes": "192x192",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-512.png",
         "sizes": "512x512",
         "type": "image/png",
         "purpose": "any maskable"
       }
     ]
   }
   ```

2. Criar ícones em `public/icons/`:
   - `icon-192.png` — 192×192px
   - `icon-512.png` — 512×512px
   - Design: fundo preto `#000000`, símbolo de timer ou relógio em `#0a84ff`

3. Adicionar no `<head>` do `index.html`:
   ```html
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#000000" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="black" />
   <link rel="apple-touch-icon" href="/icons/icon-192.png" />
   ```

**Critério de aceite:**
- [ ] Chrome DevTools → Application → Manifest exibe os dados corretos sem erros
- [ ] "Adicionar à tela de início" funciona no Chrome Android
- [ ] "Adicionar à tela de início" funciona no Safari iOS
- [ ] Ícone aparece corretamente na tela de início

---

### TASK-0.3 — Instalar e configurar `vite-plugin-pwa`

**Arquivo principal:** `vite.config.ts`
**Arquivo de suporte:** `package.json`

**O que fazer:**

1. Instalar dependência:
   ```bash
   npm install -D vite-plugin-pwa
   ```

2. Atualizar `vite.config.ts`:
   ```typescript
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: false, // Usar o manifest.json manual da TASK-0.2
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
           runtimeCaching: [
             {
               urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'google-fonts-cache',
                 expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
               },
             },
           ],
         },
       }),
     ],
     // ...resto da config
   })
   ```

**Critério de aceite:**
- [ ] `npm run build` gera `dist/sw.js` (service worker)
- [ ] Chrome DevTools → Application → Service Workers mostra o SW registrado
- [ ] Com DevTools em modo offline, o app carrega normalmente (após primeiro carregamento online)
- [ ] Não há erros no console relacionados ao service worker

---

### TASK-0.4 — Teste de regressão pós-Etapa 0

Verificar que nada quebrou:

- [ ] Timer inicia e para normalmente
- [ ] Sessões são salvas corretamente
- [ ] CRUD de áreas e projetos funciona
- [ ] Exportação CSV funciona
- [ ] Layout mobile e desktop corretos
- [ ] Banner de timer ativo aparece ao navegar com timer ativo

---

## Ordem de execução recomendada

```
TASK-0.1 → TASK-0.2 → TASK-0.3 → TASK-0.4
```

TASK-0.1 é independente. TASK-0.2 e TASK-0.3 podem ser feitas em paralelo. TASK-0.4 após todas.
