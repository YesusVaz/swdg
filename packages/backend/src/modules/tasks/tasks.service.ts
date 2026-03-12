import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { calculatePagination } from '../../utils/response';
import { PaginationParams, Priority, TaskStatus } from '../../types';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  estimatedHours?: number;
  teamId: string;
  parentId?: string;
  assigneeIds?: string[];
  tagIds?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  tagId?: string;
  search?: string;
}

class TaskService {
  async createTask(data: CreateTaskDTO, createdById: string) {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        teamId: data.teamId,
        createdById,
        parentId: data.parentId,
        assignments: data.assigneeIds
          ? {
              create: data.assigneeIds.map((userId) => ({ userId })),
            }
          : undefined,
        tags: data.tagIds
          ? {
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return task;
  }

  async findAllTasks(
    teamId: string,
    params: PaginationParams,
    filters: TaskFilters = {}
  ) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const where: any = {
      teamId,
      parentId: null, // Only root tasks
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assignments = {
        some: { userId: filters.assigneeId },
      };
    }

    if (filters.tagId) {
      where.tags = {
        some: { tagId: filters.tagId },
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.task.count({ where });

    const { skip, take, pagination } = calculatePagination(page, limit, total);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { subtasks: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    });

    return { data: tasks, pagination };
  }

  async findTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        subtasks: {
          include: {
            assignments: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          },
        },
        parent: {
          select: { id: true, title: true },
        },
        kanbanCard: {
          select: { id: true, sectionId: true },
        },
        team: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Tarefa não encontrada');
    }

    return task;
  }

  async updateTask(id: string, data: UpdateTaskDTO) {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundError('Tarefa não encontrada');
    }

    return prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        actualHours: data.actualHours,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async deleteTask(id: string) {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundError('Tarefa não encontrada');
    }

    await prisma.task.delete({ where: { id } });
  }

  async assignTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundError('Tarefa não encontrada');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Check if already assigned
    const existing = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });

    if (existing) {
      return existing;
    }

    return prisma.taskAssignment.create({
      data: { taskId, userId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async unassignTask(taskId: string, userId: string) {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });

    if (!assignment) {
      throw new NotFoundError('Atribuição não encontrada');
    }

    await prisma.taskAssignment.delete({ where: { id: assignment.id } });
  }

  async addTag(taskId: string, tagId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundError('Tarefa não encontrada');
    }

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });

    if (!tag) {
      throw new NotFoundError('Tag não encontrada');
    }

    // Check if already has tag
    const existing = await prisma.taskTag.findUnique({
      where: { taskId_tagId: { taskId, tagId } },
    });

    if (existing) {
      return existing;
    }

    return prisma.taskTag.create({
      data: { taskId, tagId },
    });
  }

  async removeTag(taskId: string, tagId: string) {
    await prisma.taskTag.delete({
      where: { taskId_tagId: { taskId, tagId } },
    });
  }

  async getMyTasks(userId: string, params: PaginationParams) {
    const { page = 1, limit = 10 } = params;

    const total = await prisma.taskAssignment.count({
      where: { userId },
    });

    const { skip, take, pagination } = calculatePagination(page, limit, total);

    const assignments = await prisma.taskAssignment.findMany({
      where: { userId },
      include: {
        task: {
          include: {
            team: {
              select: { id: true, name: true },
            },
            tags: {
              include: { tag: true },
            },
          },
        },
      },
      skip,
      take,
    });

    type TaskAssignmentWithTask = (typeof assignments)[number];

    const tasks = assignments.map(
      (assignment: TaskAssignmentWithTask) => assignment.task
    );

    return { data: tasks, pagination };
  }

  // ========== TAGS ==========

  async getAllTags() {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTag(name: string, color: string) {
    return prisma.tag.create({
      data: { name, color },
    });
  }

  async updateTag(id: string, name?: string, color?: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      throw new NotFoundError('Tag não encontrada');
    }

    return prisma.tag.update({
      where: { id },
      data: { name, color },
    });
  }

  async deleteTag(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      throw new NotFoundError('Tag não encontrada');
    }

    await prisma.tag.delete({ where: { id } });
  }

  // ========== HELPERS ==========

  async getTaskTeamId(taskId: string): Promise<string | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { teamId: true },
    });
    return task?.teamId ?? null;
  }
}

export const taskService = new TaskService();
