# SWDG - Frontend Web

Sistema Web de Gestão - Interface React moderna com design escuro e componentes próprios.

## 📋 Características

- ✅ Autenticação com JWT
- ✅ Login e Registro com slide animation
- ✅ Dashboard interativo
- ✅ Design em tons escuros com gradientes
- ✅ Componentes reutilizáveis
- ✅ TypeScript
- ✅ React Router para navegação
- ✅ Integração com API backend
- ✅ Responsivo (mobile-first)

## 🚀 Instalação

As dependências já foram instaladas!

## 🛠️ Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto rodará em `http://localhost:5173/`

## 📦 Build

Para compilar para produção:

```bash
npm run build
```

## 🏗️ Estrutura de Pastas

```
src/
├── components/
│   ├── auth/           # Componentes de autenticação
│   ├── common/         # Componentes reutilizáveis
│   └── dashboard/      # Componentes do dashboard
├── context/            # Context API
├── hooks/              # Custom hooks
├── pages/              # Páginas
├── services/           # Serviços (API calls)
├── styles/             # Estilos globais
└── types/              # TypeScript types
```

## 🎨 Design System

### Cores
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple)
- **Background**: #0f172a (Dark Navy)
- **Cards**: #1e293b (Dark Slate)

## 🔐 Autenticação

Sistema JWT com refresh token automático

## 🔗 Backend

API backend em: `http://localhost:3333/api`

## 📱 Responsividade

Design responsivo para Desktop, Tablet e Mobile

## 🚀 Próximos Passos

1. Implementar Kanban, Tarefas e Equipes
2. Adicionar notificações
3. Tema light
4. Paginação e filtros

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
