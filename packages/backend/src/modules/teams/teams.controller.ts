import { Response } from 'express';
import { teamService } from './teams.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { ForbiddenError } from '../../utils/errors';

class TeamController {
  // ========== TEAMS ==========

  async createTeam(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { name, description } = req.body;
    const userId = req.user!.userId;

    const team = await teamService.createTeam({ name, description }, userId);

    return sendSuccess(res, team, 'Time criado com sucesso', 201);
  }

  async findAllTeams(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { page, limit } = req.query;
    const userId = req.user!.userId;

    const result = await teamService.findAllTeams(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    return sendPaginated(res, result.data, result.pagination);
  }

  async findTeamById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if user is member
    const isMember = await teamService.isTeamMember(id, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const team = await teamService.findTeamById(id);

    return sendSuccess(res, team);
  }

  async findTeamBySlug(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { slug } = req.params;

    const team = await teamService.findTeamBySlug(slug);

    return sendSuccess(res, team);
  }

  async updateTeam(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user!.userId;

    // Check if user is admin
    const isAdmin = await teamService.isTeamAdmin(id, userId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem editar o time');
    }

    const team = await teamService.updateTeam(id, { name, description });

    return sendSuccess(res, team, 'Time atualizado com sucesso');
  }

  async deleteTeam(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if user is admin
    const isAdmin = await teamService.isTeamAdmin(id, userId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem excluir o time');
    }

    await teamService.deleteTeam(id);

    return sendSuccess(res, null, 'Time excluído com sucesso');
  }

  // ========== MEMBERS ==========

  async addMember(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId } = req.params;
    const { userId, roleId } = req.body;
    const currentUserId = req.user!.userId;

    // Check if current user is admin
    const isAdmin = await teamService.isTeamAdmin(teamId, currentUserId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem adicionar membros');
    }

    const member = await teamService.addMember(teamId, { userId, roleId });

    return sendSuccess(res, member, 'Membro adicionado com sucesso', 201);
  }

  async removeMember(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId, userId } = req.params;
    const currentUserId = req.user!.userId;

    // Check if current user is admin or removing themselves
    const isAdmin = await teamService.isTeamAdmin(teamId, currentUserId);
    if (!isAdmin && currentUserId !== userId) {
      throw new ForbiddenError('Sem permissão para remover este membro');
    }

    await teamService.removeMember(teamId, userId);

    return sendSuccess(res, null, 'Membro removido com sucesso');
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId, userId } = req.params;
    const { roleId } = req.body;
    const currentUserId = req.user!.userId;

    // Check if current user is admin
    const isAdmin = await teamService.isTeamAdmin(teamId, currentUserId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem alterar funções');
    }

    const member = await teamService.updateMemberRole(teamId, userId, roleId);

    return sendSuccess(res, member, 'Função do membro atualizada');
  }

  async getTeamMembers(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId } = req.params;
    const userId = req.user!.userId;

    // Check if user is member
    const isMember = await teamService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const members = await teamService.getTeamMembers(teamId);

    return sendSuccess(res, members);
  }

  // ========== ROLES ==========

  async createRole(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId } = req.params;
    const { name, description, permissions, isDefault } = req.body;
    const userId = req.user!.userId;

    // Check if user is admin
    const isAdmin = await teamService.isTeamAdmin(teamId, userId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem criar funções');
    }

    const role = await teamService.createRole(teamId, {
      name,
      description,
      permissions,
      isDefault,
    });

    return sendSuccess(res, role, 'Função criada com sucesso', 201);
  }

  async updateRole(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId, roleId } = req.params;
    const { name, description, permissions, isDefault } = req.body;
    const userId = req.user!.userId;

    // Check if user is admin
    const isAdmin = await teamService.isTeamAdmin(teamId, userId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem editar funções');
    }

    const role = await teamService.updateRole(roleId, {
      name,
      description,
      permissions,
      isDefault,
    });

    return sendSuccess(res, role, 'Função atualizada com sucesso');
  }

  async deleteRole(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId, roleId } = req.params;
    const userId = req.user!.userId;

    // Check if user is admin
    const isAdmin = await teamService.isTeamAdmin(teamId, userId);
    if (!isAdmin) {
      throw new ForbiddenError('Apenas administradores podem excluir funções');
    }

    await teamService.deleteRole(roleId);

    return sendSuccess(res, null, 'Função excluída com sucesso');
  }

  async getTeamRoles(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: teamId } = req.params;
    const userId = req.user!.userId;

    // Check if user is member
    const isMember = await teamService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const roles = await teamService.getTeamRoles(teamId);

    return sendSuccess(res, roles);
  }
}

export const teamController = new TeamController();
