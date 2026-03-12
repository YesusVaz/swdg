import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { calculatePagination } from '../../utils/response';
import { slugify, generateRandomSlug } from '../../utils/helpers';
import { PaginationParams } from '../../types';

export interface CreateTeamDTO {
  name: string;
  description?: string;
}

export interface UpdateTeamDTO {
  name?: string;
  description?: string;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface AddMemberDTO {
  userId: string;
  roleId: string;
}

class TeamService {
  // ========== TEAMS ==========

  async createTeam(data: CreateTeamDTO, creatorId: string) {
    // Generate unique slug
    let slug = slugify(data.name);
    const existingTeam = await prisma.team.findUnique({ where: { slug } });
    if (existingTeam) {
      slug = generateRandomSlug(data.name);
    }

    // Create team with admin role and add creator
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        roles: {
          create: [
            {
              name: 'Admin',
              description: 'Administrador do time',
              permissions: JSON.stringify(['*']),
              isDefault: false,
            },
            {
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
            },
          ],
        },
      },
      include: {
        roles: true,
      },
    });

    // Add creator as admin
    type TeamRole = (typeof team.roles)[number];

    const adminRole = team.roles.find((role: TeamRole) => role.name === 'Admin');
    if (adminRole) {
      await prisma.teamMember.create({
        data: {
          userId: creatorId,
          teamId: team.id,
          roleId: adminRole.id,
        },
      });
    }

    return team;
  }

  async findAllTeams(userId: string, params: PaginationParams) {
    const { page = 1, limit = 10 } = params;

    // Get teams where user is a member
    const memberOf = await prisma.teamMember.findMany({
      where: { userId, isActive: true },
      select: { teamId: true },
    });

    type TeamMembership = (typeof memberOf)[number];

    const teamIds = memberOf.map(
      (membership: TeamMembership) => membership.teamId
    );

    const total = await prisma.team.count({
      where: { id: { in: teamIds }, isActive: true },
    });

    const { skip, take, pagination } = calculatePagination(page, limit, total);

    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds }, isActive: true },
      include: {
        _count: {
          select: { members: true },
        },
      },
      skip,
      take,
    });

    return { data: teams, pagination };
  }

  async findTeamById(id: string) {
    const team = await prisma.team.findFirst({
      where: { id, isActive: true },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        roles: true,
        kanbanBoards: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Time não encontrado');
    }

    return team;
  }

  async findTeamBySlug(slug: string) {
    const team = await prisma.team.findFirst({
      where: { slug, isActive: true },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            role: true,
          },
        },
        roles: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Time não encontrado');
    }

    return team;
  }

  async updateTeam(id: string, data: UpdateTeamDTO) {
    const team = await prisma.team.findUnique({ where: { id } });

    if (!team) {
      throw new NotFoundError('Time não encontrado');
    }

    return prisma.team.update({
      where: { id },
      data,
    });
  }

  async deleteTeam(id: string) {
    const team = await prisma.team.findUnique({ where: { id } });

    if (!team) {
      throw new NotFoundError('Time não encontrado');
    }

    await prisma.team.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ========== MEMBERS ==========

  async addMember(teamId: string, data: AddMemberDTO) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundError('Time não encontrado');
    }

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role || role.teamId !== teamId) {
      throw new NotFoundError('Função não encontrada para este time');
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: data.userId, teamId } },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new ConflictError('Usuário já é membro deste time');
      }
      // Reactivate member
      return prisma.teamMember.update({
        where: { id: existingMember.id },
        data: { isActive: true, roleId: data.roleId },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          role: true,
        },
      });
    }

    return prisma.teamMember.create({
      data: {
        userId: data.userId,
        teamId,
        roleId: data.roleId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        role: true,
      },
    });
  }

  async removeMember(teamId: string, userId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) {
      throw new NotFoundError('Membro não encontrado');
    }

    await prisma.teamMember.update({
      where: { id: member.id },
      data: { isActive: false },
    });
  }

  async updateMemberRole(teamId: string, userId: string, roleId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) {
      throw new NotFoundError('Membro não encontrado');
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role || role.teamId !== teamId) {
      throw new NotFoundError('Função não encontrada para este time');
    }

    return prisma.teamMember.update({
      where: { id: member.id },
      data: { roleId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        role: true,
      },
    });
  }

  async getTeamMembers(teamId: string) {
    const members = await prisma.teamMember.findMany({
      where: { teamId, isActive: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
    });

    return members;
  }

  // ========== ROLES ==========

  async createRole(teamId: string, data: CreateRoleDTO) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundError('Time não encontrado');
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { teamId_name: { teamId, name: data.name } },
    });

    if (existingRole) {
      throw new ConflictError('Já existe uma função com este nome');
    }

    // If this is default, remove default from others
    if (data.isDefault) {
      await prisma.role.updateMany({
        where: { teamId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: JSON.stringify(data.permissions),
        isDefault: data.isDefault || false,
        teamId,
      },
    });
  }

  async updateRole(roleId: string, data: Partial<CreateRoleDTO>) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundError('Função não encontrada');
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await prisma.role.updateMany({
        where: { teamId: role.teamId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions ? JSON.stringify(data.permissions) : undefined,
        isDefault: data.isDefault,
      },
    });
  }

  async deleteRole(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { members: true },
    });

    if (!role) {
      throw new NotFoundError('Função não encontrada');
    }

    if (role.members.length > 0) {
      throw new ConflictError('Não é possível excluir função com membros associados');
    }

    await prisma.role.delete({ where: { id: roleId } });
  }

  async getTeamRoles(teamId: string) {
    const roles = await prisma.role.findMany({
      where: { teamId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return roles;
  }

  // ========== HELPERS ==========

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    return member?.isActive ?? false;
  }

  async isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
      include: { role: true },
    });

    if (!member || !member.isActive) return false;

    const permissions = JSON.parse(member.role.permissions as string);
    return permissions.includes('*');
  }
}

export const teamService = new TeamService();
