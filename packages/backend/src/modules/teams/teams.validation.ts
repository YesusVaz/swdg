import { body, param } from 'express-validator';

// Team validations
export const createTeamValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
];

export const updateTeamValidation = [
  param('id').isUUID().withMessage('ID inválido'),
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

export const teamIdValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
];

export const teamSlugValidation = [
  param('slug')
    .isLength({ min: 1 })
    .withMessage('Slug é obrigatório'),
];

// Member validations
export const addMemberValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
  body('userId').isUUID().withMessage('ID do usuário inválido'),
  body('roleId').isUUID().withMessage('ID da função inválido'),
];

export const updateMemberRoleValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
  param('userId').isUUID().withMessage('ID do usuário inválido'),
  body('roleId').isUUID().withMessage('ID da função inválido'),
];

export const memberIdValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
  param('userId').isUUID().withMessage('ID do usuário inválido'),
];

// Role validations
export const createRoleValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome da função deve ter entre 2 e 50 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição deve ter no máximo 200 caracteres'),
  body('permissions')
    .isArray()
    .withMessage('Permissões devem ser um array'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault deve ser booleano'),
];

export const updateRoleValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
  param('roleId').isUUID().withMessage('ID da função inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome da função deve ter entre 2 e 50 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição deve ter no máximo 200 caracteres'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissões devem ser um array'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault deve ser booleano'),
];

export const roleIdValidation = [
  param('id').isUUID().withMessage('ID do time inválido'),
  param('roleId').isUUID().withMessage('ID da função inválido'),
];
