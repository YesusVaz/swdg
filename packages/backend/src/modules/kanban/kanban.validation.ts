import { body, param } from 'express-validator';

// Board validations
export const createBoardValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('teamId').isUUID().withMessage('ID do time inválido'),
];

export const updateBoardValidation = [
  param('id').isUUID().withMessage('ID do quadro inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
];

export const boardIdValidation = [
  param('id').isUUID().withMessage('ID do quadro inválido'),
];

export const teamIdValidation = [
  param('teamId').isUUID().withMessage('ID do time inválido'),
];

// Section validations
export const createSectionValidation = [
  param('id').isUUID().withMessage('ID do quadro inválido'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve ser um código hexadecimal válido'),
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Posição deve ser um número inteiro positivo'),
  body('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limite deve ser um número inteiro positivo'),
];

export const updateSectionValidation = [
  param('sectionId').isUUID().withMessage('ID da seção inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve ser um código hexadecimal válido'),
  body('isCollapsed')
    .optional()
    .isBoolean()
    .withMessage('isCollapsed deve ser booleano'),
  body('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limite deve ser um número inteiro positivo'),
];

export const sectionIdValidation = [
  param('sectionId').isUUID().withMessage('ID da seção inválido'),
];

export const reorderSectionsValidation = [
  param('id').isUUID().withMessage('ID do quadro inválido'),
  body('sectionIds')
    .isArray({ min: 1 })
    .withMessage('sectionIds deve ser um array'),
  body('sectionIds.*').isUUID().withMessage('IDs de seção inválidos'),
];

// Card validations
export const createCardValidation = [
  body('sectionId').isUUID().withMessage('ID da seção inválido'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Descrição deve ter no máximo 2000 caracteres'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Prioridade inválida'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento inválida'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels devem ser um array'),
  body('assigneeIds')
    .optional()
    .isArray()
    .withMessage('assigneeIds deve ser um array'),
  body('assigneeIds.*')
    .optional()
    .isUUID()
    .withMessage('IDs de assignee inválidos'),
];

export const updateCardValidation = [
  param('cardId').isUUID().withMessage('ID do card inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Descrição deve ter no máximo 2000 caracteres'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Prioridade inválida'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Data de vencimento inválida'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels devem ser um array'),
];

export const cardIdValidation = [
  param('cardId').isUUID().withMessage('ID do card inválido'),
];

export const moveCardValidation = [
  param('cardId').isUUID().withMessage('ID do card inválido'),
  body('sectionId').isUUID().withMessage('ID da seção inválido'),
  body('position')
    .isInt({ min: 0 })
    .withMessage('Posição deve ser um número inteiro positivo'),
];

// Assignment validations
export const assignCardValidation = [
  param('cardId').isUUID().withMessage('ID do card inválido'),
  body('userId').isUUID().withMessage('ID do usuário inválido'),
];

export const unassignCardValidation = [
  param('cardId').isUUID().withMessage('ID do card inválido'),
  param('userId').isUUID().withMessage('ID do usuário inválido'),
];

// Comment validations
export const addCommentValidation = [
  param('cardId').isUUID().withMessage('ID do card inválido'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Conteúdo deve ter entre 1 e 2000 caracteres'),
];

export const updateCommentValidation = [
  param('commentId').isUUID().withMessage('ID do comentário inválido'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Conteúdo deve ter entre 1 e 2000 caracteres'),
];

export const commentIdValidation = [
  param('commentId').isUUID().withMessage('ID do comentário inválido'),
];
