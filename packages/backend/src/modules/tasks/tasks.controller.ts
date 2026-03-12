import { Response } from 'express';
import { taskService } from './tasks.service';
import { teamService } from '../teams/teams.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { ForbiddenError } from '../../utils/errors';

class TaskController {
  async createTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      teamId,
      parentId,
      assigneeIds,
      tagIds,
    } = req.body;
    const userId = req.user!.userId;

    // Check if user is team member
    const isMember = await teamService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const task = await taskService.createTask(
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        estimatedHours,
        teamId,
        parentId,
        assigneeIds,
        tagIds,
      },
      userId
    );

    return sendSuccess(res, task, 'Tarefa criada com sucesso', 201);
  }

  async findAllTasks(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { teamId } = req.params;
    const { page, limit, sortBy, sortOrder, status, priority, assigneeId, tagId, search } =
      req.query;
    const userId = req.user!.userId;

    // Check if user is team member
    const isMember = await teamService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const result = await taskService.findAllTasks(
      teamId,
      {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      },
      {
        status: status as any,
        priority: priority as any,
        assigneeId: assigneeId as string,
        tagId: tagId as string,
        search: search as string,
      }
    );

    return sendPaginated(res, result.data, result.pagination);
  }

  async findTaskById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const task = await taskService.findTaskById(id);

    return sendSuccess(res, task);
  }

  async updateTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, estimatedHours, actualHours } =
      req.body;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const task = await taskService.updateTask(id, {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
      estimatedHours,
      actualHours,
    });

    return sendSuccess(res, task, 'Tarefa atualizada com sucesso');
  }

  async deleteTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    await taskService.deleteTask(id);

    return sendSuccess(res, null, 'Tarefa excluída com sucesso');
  }

  async assignTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { userId: assigneeId } = req.body;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const assignment = await taskService.assignTask(id, assigneeId);

    return sendSuccess(res, assignment, 'Usuário atribuído à tarefa');
  }

  async unassignTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id, userId: assigneeId } = req.params;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    await taskService.unassignTask(id, assigneeId);

    return sendSuccess(res, null, 'Atribuição removida');
  }

  async addTag(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { tagId } = req.body;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const taskTag = await taskService.addTag(id, tagId);

    return sendSuccess(res, taskTag, 'Tag adicionada à tarefa');
  }

  async removeTag(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id, tagId } = req.params;
    const userId = req.user!.userId;

    const teamId = await taskService.getTaskTeamId(id);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    await taskService.removeTag(id, tagId);

    return sendSuccess(res, null, 'Tag removida da tarefa');
  }

  async getMyTasks(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { page, limit } = req.query;
    const userId = req.user!.userId;

    const result = await taskService.getMyTasks(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    return sendPaginated(res, result.data, result.pagination);
  }

  // ========== TAGS ==========

  async getAllTags(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const tags = await taskService.getAllTags();

    return sendSuccess(res, tags);
  }

  async createTag(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { name, color } = req.body;

    const tag = await taskService.createTag(name, color);

    return sendSuccess(res, tag, 'Tag criada com sucesso', 201);
  }

  async updateTag(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, color } = req.body;

    const tag = await taskService.updateTag(id, name, color);

    return sendSuccess(res, tag, 'Tag atualizada com sucesso');
  }

  async deleteTag(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;

    await taskService.deleteTag(id);

    return sendSuccess(res, null, 'Tag excluída com sucesso');
  }
}

export const taskController = new TaskController();
