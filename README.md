"# SWDG - Sistema Web de Gestão

Monorepo para sistema completo de gestão com Kanban, times, tarefas e dashboard.

## Estrutura

```
swdg/
├── packages/
│   ├── backend/     # API Node.js + TypeScript + Prisma
│   └── frontend/    # (Em breve) React/Next.js
├── package.json     # Configuração do monorepo
└── README.md
```

## Tecnologias

### Backend
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT + bcrypt (autenticação)

### Frontend (Em breve)
- React/Next.js
- TypeScript
- Tailwind CSS
- React DnD (drag and drop)

## Quick Start

```bash
# Instalar dependências
npm install

# Configurar banco de dados
cd packages/backend
cp .env.example .env
# Edite o .env com suas configurações

# Executar migrations
npm run backend:prisma:migrate

# Executar seed
npx prisma db seed --schema=packages/backend/prisma/schema.prisma

# Iniciar em desenvolvimento
npm run backend:dev
```

## Funcionalidades

- ✅ Autenticação JWT com refresh tokens
- ✅ Registro e login de usuários
- ✅ Times com roles e permissões
- ✅ Quadro Kanban dinâmico
- ✅ Seções com limite WIP
- ✅ Cards arrastáveis com labels
- ✅ Sistema de tarefas com subtarefas
- ✅ Atribuições e prioridades
- ✅ Tags para categorização
- ✅ Comentários em cards
- 🔲 Dashboard com métricas
- 🔲 Frontend completo

## Scripts

```bash
# Backend
npm run backend:dev           # Desenvolvimento
npm run backend:build         # Build
npm run backend:start         # Produção
npm run backend:prisma:studio # Interface do banco

# Monorepo
npm install                   # Instala tudo
```

## Documentação

Consulte o README de cada package para detalhes:
- [Backend](./packages/backend/README.md)" 
