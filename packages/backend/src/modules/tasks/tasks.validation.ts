import { body, param, query } from 'express-validator';

// Task validations
export const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Descrição deve ter no máximo 5000 caracteres'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'])
    .withMessage('Status inválido'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Prioridade inválida'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento inválida'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Horas estimadas deve ser um número positivo'),
  body('teamId').isUUID().withMessage('ID do time inválido'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('ID da tarefa pai inválido'),
  body('assigneeIds')
    .optional()
    .isArray()
    .withMessage('assigneeIds deve ser um array'),
  body('assigneeIds.*')
    .optional()
    .isUUID()
    .withMessage('IDs de assignee inválidos'),
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('tagIds deve ser um array'),
  body('tagIds.*')
    .optional()
    .isUUID()
    .withMessage('IDs de tag inválidos'),
];

export const updateTaskValidation = [
  param('id').isUUID().withMessage('ID da tarefa inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Descrição deve ter no máximo 5000 caracteres'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'])
    .withMessage('Status inválido'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Prioridade inválida'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Data de vencimento inválida'),
  body('estimatedHours')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Horas estimadas deve ser um número positivo'),
  body('actualHours')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Horas reais deve ser um número positivo'),
];

export const taskIdValidation = [
  param('id').isUUID().withMessage('ID da tarefa inválido'),
];

export const teamIdValidation = [
  param('teamId').isUUID().withMessage('ID do time inválido'),
];

export const taskFiltersValidation = [
  param('teamId').isUUID().withMessage('ID do time inválido'),
  query('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'])
    .withMessage('Status inválido'),
  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Prioridade inválida'),
  query('assigneeId')
    .optional()
    .isUUID()
    .withMessage('ID do assignee inválido'),
  query('tagId')
    .optional()
    .isUUID()
    .withMessage('ID da tag inválido'),
];

// Assignment validations
export const assignTaskValidation = [
  param('id').isUUID().withMessage('ID da tarefa inválido'),
  body('userId').isUUID().withMessage('ID do usuário inválido'),
];

export const unassignTaskValidation = [
  param('id').isUUID().withMessage('ID da tarefa inválido'),
  param('userId').isUUID().withMessage('ID do usuário inválido'),
];

// Tag validations
export const addTagValidation = [
  param('id').isUUID().withMessage('ID da tarefa inválido'),
  body('tagId').isUUID().withMessage('ID da tag inválido'),
];

export const removeTagValidation = [
  param('id').isUUID().withMessage('ID da tarefa inválido'),
  param('tagId').isUUID().withMessage('ID da tag inválido'),
];

export const createTagValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('color')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve ser um código hexadecimal válido'),
];

export const updateTagValidation = [
  param('id').isUUID().withMessage('ID da tag inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve ser um código hexadecimal válido'),
];

export const tagIdValidation = [
  param('id').isUUID().withMessage('ID da tag inválido'),
];
