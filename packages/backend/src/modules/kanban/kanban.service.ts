import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { Priority } from '../../types';

export interface CreateBoardDTO {
  name: string;
  description?: string;
  teamId: string;
}

export interface UpdateBoardDTO {
  name?: string;
  description?: string;
}

export interface CreateSectionDTO {
  name: string;
  color?: string;
  position?: number;
  limit?: number;
}

export interface UpdateSectionDTO {
  name?: string;
  color?: string;
  isCollapsed?: boolean;
  limit?: number;
}

export interface CreateCardDTO {
  title: string;
  description?: string;
  sectionId: string;
  priority?: Priority;
  dueDate?: Date;
  labels?: { name: string; color: string }[];
  assigneeIds?: string[];
}

export interface UpdateCardDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date | null;
  labels?: { name: string; color: string }[];
}

export interface MoveCardDTO {
  sectionId: string;
  position: number;
}

export interface ReorderSectionsDTO {
  sectionIds: string[];
}

class KanbanService {
  // ========== BOARDS ==========

  async createBoard(data: CreateBoardDTO) {
    const board = await prisma.kanbanBoard.create({
      data: {
        name: data.name,
        description: data.description,
        teamId: data.teamId,
        sections: {
          create: [
            { name: 'Backlog', color: '#6366f1', position: 0 },
            { name: 'A Fazer', color: '#f59e0b', position: 1 },
            { name: 'Em Progresso', color: '#3b82f6', position: 2 },
            { name: 'Concluído', color: '#22c55e', position: 3 },
          ],
        },
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return board;
  }

  async findBoardsByTeam(teamId: string) {
    const boards = await prisma.kanbanBoard.findMany({
      where: { teamId, isActive: true },
      include: {
        _count: {
          select: { sections: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return boards;
  }

  async findBoardById(boardId: string) {
    const board = await prisma.kanbanBoard.findFirst({
      where: { id: boardId, isActive: true },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                assignments: {
                  include: {
                    user: {
                      select: { id: true, name: true, avatar: true },
                    },
                  },
                },
                createdBy: {
                  select: { id: true, name: true, avatar: true },
                },
                _count: {
                  select: { comments: true },
                },
              },
            },
          },
        },
        team: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('Quadro não encontrado');
    }

    return board;
  }

  async updateBoard(boardId: string, data: UpdateBoardDTO) {
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('Quadro não encontrado');
    }

    return prisma.kanbanBoard.update({
      where: { id: boardId },
      data,
    });
  }

  async deleteBoard(boardId: string) {
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('Quadro não encontrado');
    }

    await prisma.kanbanBoard.update({
      where: { id: boardId },
      data: { isActive: false },
    });
  }

  // ========== SECTIONS ==========

  async createSection(boardId: string, data: CreateSectionDTO) {
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('Quadro não encontrado');
    }

    // Get max position
    const maxPosition = await prisma.kanbanSection.aggregate({
      where: { boardId },
      _max: { position: true },
    });

    const position = data.position ?? (maxPosition._max.position ?? -1) + 1;

    return prisma.kanbanSection.create({
      data: {
        name: data.name,
        color: data.color,
        position,
        limit: data.limit,
        boardId,
      },
    });
  }

  async updateSection(sectionId: string, data: UpdateSectionDTO) {
    const section = await prisma.kanbanSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundError('Seção não encontrada');
    }

    return prisma.kanbanSection.update({
      where: { id: sectionId },
      data,
    });
  }

  async deleteSection(sectionId: string) {
    const section = await prisma.kanbanSection.findUnique({
      where: { id: sectionId },
      include: { cards: true },
    });

    if (!section) {
      throw new NotFoundError('Seção não encontrada');
    }

    // Delete section and all its cards
    await prisma.kanbanSection.delete({
      where: { id: sectionId },
    });
  }

  async reorderSections(boardId: string, sectionIds: string[]) {
    const updates = sectionIds.map((id, index) =>
      prisma.kanbanSection.update({
        where: { id },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);

    return this.findBoardById(boardId);
  }

  // ========== CARDS ==========

  async createCard(data: CreateCardDTO, createdById: string) {
    const section = await prisma.kanbanSection.findUnique({
      where: { id: data.sectionId },
      include: { cards: true },
    });

    if (!section) {
      throw new NotFoundError('Seção não encontrada');
    }

    // Check WIP limit
    if (section.limit && section.cards.length >= section.limit) {
      throw new ForbiddenError(
        `Limite de ${section.limit} cards nesta seção atingido`
      );
    }

    // Get max position
    const maxPosition = await prisma.kanbanCard.aggregate({
      where: { sectionId: data.sectionId },
      _max: { position: true },
    });

    const position = (maxPosition._max.position ?? -1) + 1;

    const card = await prisma.kanbanCard.create({
      data: {
        title: data.title,
        description: data.description,
        sectionId: data.sectionId,
        position,
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate,
        labels: data.labels ? JSON.stringify(data.labels) : '[]',
        createdById,
        assignments: data.assigneeIds
          ? {
              create: data.assigneeIds.map((userId) => ({ userId })),
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
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return card;
  }

  async findCardById(cardId: string) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: {
        section: {
          include: {
            board: {
              select: { id: true, name: true, teamId: true },
            },
          },
        },
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        task: true,
      },
    });

    if (!card) {
      throw new NotFoundError('Card não encontrado');
    }

    return card;
  }

  async updateCard(cardId: string, data: UpdateCardDTO) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundError('Card não encontrado');
    }

    return prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        labels: data.labels ? JSON.stringify(data.labels) : undefined,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });
  }

  async deleteCard(cardId: string) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundError('Card não encontrado');
    }

    await prisma.kanbanCard.delete({
      where: { id: cardId },
    });
  }

  async moveCard(cardId: string, data: MoveCardDTO) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundError('Card não encontrado');
    }

    const targetSection = await prisma.kanbanSection.findUnique({
      where: { id: data.sectionId },
      include: { cards: { where: { id: { not: cardId } } } },
    });

    if (!targetSection) {
      throw new NotFoundError('Seção de destino não encontrada');
    }

    // Check WIP limit if moving to different section
    if (
      card.sectionId !== data.sectionId &&
      targetSection.limit &&
      targetSection.cards.length >= targetSection.limit
    ) {
      throw new ForbiddenError(
        `Limite de ${targetSection.limit} cards na seção de destino atingido`
      );
    }

    // Update positions in target section
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // If same section, shift cards
      if (card.sectionId === data.sectionId) {
        if (data.position > card.position) {
          // Moving down
          await tx.kanbanCard.updateMany({
            where: {
              sectionId: data.sectionId,
              position: { gt: card.position, lte: data.position },
            },
            data: { position: { decrement: 1 } },
          });
        } else {
          // Moving up
          await tx.kanbanCard.updateMany({
            where: {
              sectionId: data.sectionId,
              position: { gte: data.position, lt: card.position },
            },
            data: { position: { increment: 1 } },
          });
        }
      } else {
        // Different section - shift cards in target section
        await tx.kanbanCard.updateMany({
          where: {
            sectionId: data.sectionId,
            position: { gte: data.position },
          },
          data: { position: { increment: 1 } },
        });

        // Shift cards in source section
        await tx.kanbanCard.updateMany({
          where: {
            sectionId: card.sectionId,
            position: { gt: card.position },
          },
          data: { position: { decrement: 1 } },
        });
      }

      // Update the card
      await tx.kanbanCard.update({
        where: { id: cardId },
        data: {
          sectionId: data.sectionId,
          position: data.position,
        },
      });
    });

    return this.findCardById(cardId);
  }

  // ========== CARD ASSIGNMENTS ==========

  async assignCard(cardId: string, userId: string) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundError('Card não encontrado');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Check if already assigned
    const existing = await prisma.kanbanCardAssignment.findUnique({
      where: { cardId_userId: { cardId, userId } },
    });

    if (existing) {
      return existing;
    }

    return prisma.kanbanCardAssignment.create({
      data: { cardId, userId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async unassignCard(cardId: string, userId: string) {
    const assignment = await prisma.kanbanCardAssignment.findUnique({
      where: { cardId_userId: { cardId, userId } },
    });

    if (!assignment) {
      throw new NotFoundError('Atribuição não encontrada');
    }

    await prisma.kanbanCardAssignment.delete({
      where: { id: assignment.id },
    });
  }

  // ========== COMMENTS ==========

  async addComment(cardId: string, content: string, authorId: string) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundError('Card não encontrado');
    }

    return prisma.comment.create({
      data: {
        content,
        cardId,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async updateComment(commentId: string, content: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('Você só pode editar seus próprios comentários');
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('Você só pode excluir seus próprios comentários');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // ========== HELPERS ==========

  async getBoardTeamId(boardId: string): Promise<string | null> {
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      select: { teamId: true },
    });
    return board?.teamId ?? null;
  }

  async getSectionBoardId(sectionId: string): Promise<string | null> {
    const section = await prisma.kanbanSection.findUnique({
      where: { id: sectionId },
      select: { boardId: true },
    });
    return section?.boardId ?? null;
  }

  async getCardTeamId(cardId: string): Promise<string | null> {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: {
        section: {
          include: {
            board: {
              select: { teamId: true },
            },
          },
        },
      },
    });
    return card?.section?.board?.teamId ?? null;
  }
}

export const kanbanService = new KanbanService();
