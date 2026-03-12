import { Response } from 'express';
import { kanbanService } from './kanban.service';
import { teamService } from '../teams/teams.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess } from '../../utils/response';
import { ForbiddenError } from '../../utils/errors';

class KanbanController {
  // ========== BOARDS ==========

  async createBoard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { name, description, teamId } = req.body;
    const userId = req.user!.userId;

    // Check if user is team member
    const isMember = await teamService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const board = await kanbanService.createBoard({ name, description, teamId });

    return sendSuccess(res, board, 'Quadro criado com sucesso', 201);
  }

  async findBoardsByTeam(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { teamId } = req.params;
    const userId = req.user!.userId;

    // Check if user is team member
    const isMember = await teamService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste time');
    }

    const boards = await kanbanService.findBoardsByTeam(teamId);

    return sendSuccess(res, boards);
  }

  async findBoardById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: boardId } = req.params;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getBoardTeamId(boardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const board = await kanbanService.findBoardById(boardId);

    return sendSuccess(res, board);
  }

  async updateBoard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: boardId } = req.params;
    const { name, description } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getBoardTeamId(boardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const board = await kanbanService.updateBoard(boardId, { name, description });

    return sendSuccess(res, board, 'Quadro atualizado com sucesso');
  }

  async deleteBoard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: boardId } = req.params;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getBoardTeamId(boardId);
    if (teamId) {
      const isAdmin = await teamService.isTeamAdmin(teamId, userId);
      if (!isAdmin) {
        throw new ForbiddenError('Apenas administradores podem excluir quadros');
      }
    }

    await kanbanService.deleteBoard(boardId);

    return sendSuccess(res, null, 'Quadro excluído com sucesso');
  }

  // ========== SECTIONS ==========

  async createSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: boardId } = req.params;
    const { name, color, position, limit } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getBoardTeamId(boardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const section = await kanbanService.createSection(boardId, {
      name,
      color,
      position,
      limit,
    });

    return sendSuccess(res, section, 'Seção criada com sucesso', 201);
  }

  async updateSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { sectionId } = req.params;
    const { name, color, isCollapsed, limit } = req.body;
    const userId = req.user!.userId;

    const boardId = await kanbanService.getSectionBoardId(sectionId);
    if (boardId) {
      const teamId = await kanbanService.getBoardTeamId(boardId);
      if (teamId) {
        const isMember = await teamService.isTeamMember(teamId, userId);
        if (!isMember) {
          throw new ForbiddenError('Você não é membro deste time');
        }
      }
    }

    const section = await kanbanService.updateSection(sectionId, {
      name,
      color,
      isCollapsed,
      limit,
    });

    return sendSuccess(res, section, 'Seção atualizada com sucesso');
  }

  async deleteSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { sectionId } = req.params;
    const userId = req.user!.userId;

    const boardId = await kanbanService.getSectionBoardId(sectionId);
    if (boardId) {
      const teamId = await kanbanService.getBoardTeamId(boardId);
      if (teamId) {
        const isMember = await teamService.isTeamMember(teamId, userId);
        if (!isMember) {
          throw new ForbiddenError('Você não é membro deste time');
        }
      }
    }

    await kanbanService.deleteSection(sectionId);

    return sendSuccess(res, null, 'Seção excluída com sucesso');
  }

  async reorderSections(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id: boardId } = req.params;
    const { sectionIds } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getBoardTeamId(boardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const board = await kanbanService.reorderSections(boardId, sectionIds);

    return sendSuccess(res, board, 'Seções reordenadas com sucesso');
  }

  // ========== CARDS ==========

  async createCard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { sectionId, title, description, priority, dueDate, labels, assigneeIds } =
      req.body;
    const userId = req.user!.userId;

    const boardId = await kanbanService.getSectionBoardId(sectionId);
    if (boardId) {
      const teamId = await kanbanService.getBoardTeamId(boardId);
      if (teamId) {
        const isMember = await teamService.isTeamMember(teamId, userId);
        if (!isMember) {
          throw new ForbiddenError('Você não é membro deste time');
        }
      }
    }

    const card = await kanbanService.createCard(
      {
        sectionId,
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        labels,
        assigneeIds,
      },
      userId
    );

    return sendSuccess(res, card, 'Card criado com sucesso', 201);
  }

  async findCardById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId } = req.params;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const card = await kanbanService.findCardById(cardId);

    return sendSuccess(res, card);
  }

  async updateCard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId } = req.params;
    const { title, description, priority, dueDate, labels } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const card = await kanbanService.updateCard(cardId, {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
      labels,
    });

    return sendSuccess(res, card, 'Card atualizado com sucesso');
  }

  async deleteCard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId } = req.params;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    await kanbanService.deleteCard(cardId);

    return sendSuccess(res, null, 'Card excluído com sucesso');
  }

  async moveCard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId } = req.params;
    const { sectionId, position } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const card = await kanbanService.moveCard(cardId, { sectionId, position });

    return sendSuccess(res, card, 'Card movido com sucesso');
  }

  // ========== CARD ASSIGNMENTS ==========

  async assignCard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId } = req.params;
    const { userId: assigneeId } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const assignment = await kanbanService.assignCard(cardId, assigneeId);

    return sendSuccess(res, assignment, 'Usuário atribuído ao card');
  }

  async unassignCard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId, userId: assigneeId } = req.params;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    await kanbanService.unassignCard(cardId, assigneeId);

    return sendSuccess(res, null, 'Atribuição removida');
  }

  // ========== COMMENTS ==========

  async addComment(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { cardId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const teamId = await kanbanService.getCardTeamId(cardId);
    if (teamId) {
      const isMember = await teamService.isTeamMember(teamId, userId);
      if (!isMember) {
        throw new ForbiddenError('Você não é membro deste time');
      }
    }

    const comment = await kanbanService.addComment(cardId, content, userId);

    return sendSuccess(res, comment, 'Comentário adicionado', 201);
  }

  async updateComment(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const comment = await kanbanService.updateComment(commentId, content, userId);

    return sendSuccess(res, comment, 'Comentário atualizado');
  }

  async deleteComment(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    await kanbanService.deleteComment(commentId, userId);

    return sendSuccess(res, null, 'Comentário excluído');
  }
}

export const kanbanController = new KanbanController();
