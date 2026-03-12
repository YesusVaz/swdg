# SWDG - Sistema Web de Gestão

## Backend

API RESTful construída com Node.js, TypeScript, Express, Prisma e PostgreSQL.

### Funcionalidades

- **Autenticação**: JWT com refresh tokens e bcrypt
- **Usuários**: Registro, login, perfil, alteração de senha
- **Times**: Criação de times, gerenciamento de membros e roles
- **Kanban**: Quadros, seções e cards arrastáveis com WIP limits
- **Tarefas**: CRUD completo com atribuições, tags e subtarefas

### Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### Instalação

```bash
# Na raiz do projeto (monorepo)
npm install

# Ou diretamente no backend
cd packages/backend
npm install
```

### Configuração

1. Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL="postgresql://usuario:senha@localhost:5432/swdg_db?schema=public"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=12
```

### Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular banco com dados iniciais
npx prisma db seed

# Abrir Prisma Studio (interface visual)
npm run prisma:studio
```

### Executar

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start
```

### Endpoints da API

Base URL: `http://localhost:3333/api`

#### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar usuário |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh-token` | Atualizar token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/logout-all` | Logout de todas sessões |
| GET | `/auth/profile` | Perfil do usuário |
| PATCH | `/auth/change-password` | Alterar senha |

#### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users` | Listar usuários |
| GET | `/users/search` | Buscar usuários |
| GET | `/users/:id` | Detalhes do usuário |
| PATCH | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Desativar usuário |

#### Times
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/teams` | Criar time |
| GET | `/teams` | Listar meus times |
| GET | `/teams/:id` | Detalhes do time |
| GET | `/teams/slug/:slug` | Buscar por slug |
| PATCH | `/teams/:id` | Atualizar time |
| DELETE | `/teams/:id` | Excluir time |
| GET | `/teams/:id/members` | Listar membros |
| POST | `/teams/:id/members` | Adicionar membro |
| PATCH | `/teams/:id/members/:userId` | Alterar role do membro |
| DELETE | `/teams/:id/members/:userId` | Remover membro |
| GET | `/teams/:id/roles` | Listar roles |
| POST | `/teams/:id/roles` | Criar role |
| PATCH | `/teams/:id/roles/:roleId` | Atualizar role |
| DELETE | `/teams/:id/roles/:roleId` | Excluir role |

#### Kanban
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/kanban/boards` | Criar quadro |
| GET | `/kanban/boards/team/:teamId` | Listar quadros do time |
| GET | `/kanban/boards/:id` | Detalhes do quadro |
| PATCH | `/kanban/boards/:id` | Atualizar quadro |
| DELETE | `/kanban/boards/:id` | Excluir quadro |
| POST | `/kanban/boards/:id/sections` | Criar seção |
| PATCH | `/kanban/sections/:sectionId` | Atualizar seção |
| DELETE | `/kanban/sections/:sectionId` | Excluir seção |
| PUT | `/kanban/boards/:id/sections/reorder` | Reordenar seções |
| POST | `/kanban/cards` | Criar card |
| GET | `/kanban/cards/:cardId` | Detalhes do card |
| PATCH | `/kanban/cards/:cardId` | Atualizar card |
| DELETE | `/kanban/cards/:cardId` | Excluir card |
| PUT | `/kanban/cards/:cardId/move` | Mover card |
| POST | `/kanban/cards/:cardId/assign` | Atribuir card |
| DELETE | `/kanban/cards/:cardId/assign/:userId` | Remover atribuição |
| POST | `/kanban/cards/:cardId/comments` | Adicionar comentário |
| PATCH | `/kanban/comments/:commentId` | Editar comentário |
| DELETE | `/kanban/comments/:commentId` | Excluir comentário |

#### Tarefas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tasks/my` | Minhas tarefas |
| POST | `/tasks` | Criar tarefa |
| GET | `/tasks/team/:teamId` | Listar tarefas do time |
| GET | `/tasks/:id` | Detalhes da tarefa |
| PATCH | `/tasks/:id` | Atualizar tarefa |
| DELETE | `/tasks/:id` | Excluir tarefa |
| POST | `/tasks/:id/assign` | Atribuir tarefa |
| DELETE | `/tasks/:id/assign/:userId` | Remover atribuição |
| POST | `/tasks/:id/tags` | Adicionar tag |
| DELETE | `/tasks/:id/tags/:tagId` | Remover tag |
| GET | `/tasks/tags` | Listar todas tags |
| POST | `/tasks/tags` | Criar tag |
| PATCH | `/tasks/tags/:id` | Atualizar tag |
| DELETE | `/tasks/tags/:id` | Excluir tag |

### Estrutura de Pastas

```
packages/backend/
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts          # Seeds para popular o banco
├── src/
│   ├── config/          # Configurações
│   ├── middlewares/     # Middlewares Express
│   ├── modules/         # Módulos da aplicação
│   │   ├── auth/        # Autenticação
│   │   ├── users/       # Usuários
│   │   ├── teams/       # Times e Roles
│   │   ├── kanban/      # Quadro Kanban
│   │   └── tasks/       # Tarefas
│   ├── routes/          # Rotas da API
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários
│   ├── app.ts           # Configuração Express
│   └── server.ts        # Entrada da aplicação
├── .env                 # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

### Modelo de Dados

- **User**: Usuários do sistema
- **Team**: Times/equipes
- **Role**: Funções com permissões
- **TeamMember**: Relação usuário-time com role
- **KanbanBoard**: Quadros Kanban
- **KanbanSection**: Colunas do quadro
- **KanbanCard**: Cards com prioridade e labels
- **Task**: Tarefas com subtarefas
- **Tag**: Tags para categorização
- **Comment**: Comentários em cards

### Usuário de Teste

Após executar o seed:
- **Email**: admin@swdg.com
- **Senha**: admin123
