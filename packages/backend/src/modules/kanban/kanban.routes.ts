import { Router } from 'express';
import { kanbanController } from './kanban.controller';
import { authMiddleware, validate } from '../../middlewares';
import {
  createBoardValidation,
  updateBoardValidation,
  boardIdValidation,
  teamIdValidation,
  createSectionValidation,
  updateSectionValidation,
  sectionIdValidation,
  reorderSectionsValidation,
  createCardValidation,
  updateCardValidation,
  cardIdValidation,
  moveCardValidation,
  assignCardValidation,
  unassignCardValidation,
  addCommentValidation,
  updateCommentValidation,
  commentIdValidation,
} from './kanban.validation';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ========== BOARDS ==========
router.post(
  '/boards',
  validate(createBoardValidation),
  kanbanController.createBoard.bind(kanbanController)
);

router.get(
  '/boards/team/:teamId',
  validate(teamIdValidation),
  kanbanController.findBoardsByTeam.bind(kanbanController)
);

router.get(
  '/boards/:id',
  validate(boardIdValidation),
  kanbanController.findBoardById.bind(kanbanController)
);

router.patch(
  '/boards/:id',
  validate(updateBoardValidation),
  kanbanController.updateBoard.bind(kanbanController)
);

router.delete(
  '/boards/:id',
  validate(boardIdValidation),
  kanbanController.deleteBoard.bind(kanbanController)
);

// ========== SECTIONS ==========
router.post(
  '/boards/:id/sections',
  validate(createSectionValidation),
  kanbanController.createSection.bind(kanbanController)
);

router.patch(
  '/sections/:sectionId',
  validate(updateSectionValidation),
  kanbanController.updateSection.bind(kanbanController)
);

router.delete(
  '/sections/:sectionId',
  validate(sectionIdValidation),
  kanbanController.deleteSection.bind(kanbanController)
);

router.put(
  '/boards/:id/sections/reorder',
  validate(reorderSectionsValidation),
  kanbanController.reorderSections.bind(kanbanController)
);

// ========== CARDS ==========
router.post(
  '/cards',
  validate(createCardValidation),
  kanbanController.createCard.bind(kanbanController)
);

router.get(
  '/cards/:cardId',
  validate(cardIdValidation),
  kanbanController.findCardById.bind(kanbanController)
);

router.patch(
  '/cards/:cardId',
  validate(updateCardValidation),
  kanbanController.updateCard.bind(kanbanController)
);

router.delete(
  '/cards/:cardId',
  validate(cardIdValidation),
  kanbanController.deleteCard.bind(kanbanController)
);

router.put(
  '/cards/:cardId/move',
  validate(moveCardValidation),
  kanbanController.moveCard.bind(kanbanController)
);

// ========== CARD ASSIGNMENTS ==========
router.post(
  '/cards/:cardId/assign',
  validate(assignCardValidation),
  kanbanController.assignCard.bind(kanbanController)
);

router.delete(
  '/cards/:cardId/assign/:userId',
  validate(unassignCardValidation),
  kanbanController.unassignCard.bind(kanbanController)
);

// ========== COMMENTS ==========
router.post(
  '/cards/:cardId/comments',
  validate(addCommentValidation),
  kanbanController.addComment.bind(kanbanController)
);

router.patch(
  '/comments/:commentId',
  validate(updateCommentValidation),
  kanbanController.updateComment.bind(kanbanController)
);

router.delete(
  '/comments/:commentId',
  validate(commentIdValidation),
  kanbanController.deleteComment.bind(kanbanController)
);

export default router;
