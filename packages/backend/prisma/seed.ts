import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@swdg.com' },
    update: {},
    create: {
      email: 'admin@swdg.com',
      password: hashedPassword,
      name: 'Administrador',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create a demo team
  const demoTeam = await prisma.team.upsert({
    where: { slug: 'demo-team' },
    update: {},
    create: {
      name: 'Time Demo',
      description: 'Time de demonstração do sistema',
      slug: 'demo-team',
    },
  });

  console.log('✅ Demo team created:', demoTeam.name);

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { teamId_name: { teamId: demoTeam.id, name: 'Admin' } },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrador do time com todas as permissões',
      permissions: JSON.stringify(['*']),
      isDefault: false,
      teamId: demoTeam.id,
    },
  });

  await prisma.role.upsert({
    where: { teamId_name: { teamId: demoTeam.id, name: 'Membro' } },
    update: {},
    create: {
      name: 'Membro',
      description: 'Membro padrão do time',
      permissions: JSON.stringify([
        'task:read',
        'task:create',
        'task:update',
        'kanban:read',
        'kanban:update',
      ]),
      isDefault: true,
      teamId: demoTeam.id,
    },
  });

  console.log('✅ Default roles created');

  // Add admin to demo team
  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: adminUser.id, teamId: demoTeam.id } },
    update: {},
    create: {
      userId: adminUser.id,
      teamId: demoTeam.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin added to demo team');

  // Create a demo Kanban board
  const kanbanBoard = await prisma.kanbanBoard.create({
    data: {
      name: 'Quadro Principal',
      description: 'Quadro Kanban principal do time',
      teamId: demoTeam.id,
      sections: {
        create: [
          { name: 'Backlog', color: '#6366f1', position: 0 },
          { name: 'A Fazer', color: '#f59e0b', position: 1 },
          { name: 'Em Progresso', color: '#3b82f6', position: 2, limit: 5 },
          { name: 'Em Revisão', color: '#8b5cf6', position: 3 },
          { name: 'Concluído', color: '#22c55e', position: 4 },
        ],
      },
    },
    include: { sections: true },
  });

  console.log('✅ Kanban board created with sections');

  // Create some demo cards
  type BoardSection = (typeof kanbanBoard.sections)[number];

  const backlogSection = kanbanBoard.sections.find(
    (section: BoardSection) => section.name === 'Backlog'
  );
  const todoSection = kanbanBoard.sections.find(
    (section: BoardSection) => section.name === 'A Fazer'
  );

  if (backlogSection && todoSection) {
    await prisma.kanbanCard.createMany({
      data: [
        {
          title: 'Configurar ambiente de desenvolvimento',
          description: 'Instalar dependências e configurar variáveis de ambiente',
          sectionId: backlogSection.id,
          position: 0,
          priority: 'HIGH',
          createdById: adminUser.id,
        },
        {
          title: 'Implementar tela de login',
          description: 'Criar componentes de formulário e integrar com API',
          sectionId: todoSection.id,
          position: 0,
          priority: 'MEDIUM',
          createdById: adminUser.id,
        },
        {
          title: 'Documentar API',
          description: 'Criar documentação Swagger/OpenAPI',
          sectionId: backlogSection.id,
          position: 1,
          priority: 'LOW',
          createdById: adminUser.id,
        },
      ],
    });

    console.log('✅ Demo cards created');
  }

  // Create some tags
  await prisma.tag.createMany({
    data: [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#22c55e' },
      { name: 'Melhoria', color: '#3b82f6' },
      { name: 'Documentação', color: '#f59e0b' },
      { name: 'Urgente', color: '#dc2626' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Tags created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
