import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { calculatePagination } from '../../utils/response';
import { PaginationParams } from '../../types';

export interface UpdateUserDTO {
  name?: string;
  avatar?: string;
}

class UserService {
  async findAll(params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const total = await prisma.user.count({
      where: { isActive: true },
    });

    const { skip, take, pagination } = calculatePagination(page, limit, total);

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        teamMembers: {
          where: { isActive: true },
          select: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    });

    return { data: users, pagination };
  }

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        teamMembers: {
          where: { isActive: true },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                slug: true,
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
        tasksAssigned: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDTO) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deactivate(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Remove from all teams
    await prisma.teamMember.updateMany({
      where: { userId: id },
      data: { isActive: false },
    });

    // Delete all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: id },
    });
  }

  async searchByEmail(email: string) {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
      take: 10,
    });

    return users;
  }

  async searchByName(name: string) {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
      take: 10,
    });

    return users;
  }
}

export const userService = new UserService();
