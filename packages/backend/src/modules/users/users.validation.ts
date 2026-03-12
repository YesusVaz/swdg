import { body, param, query } from 'express-validator';

export const getUserValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
];

export const updateUserValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar deve ser uma URL válida'),
];

export const searchUserValidation = [
  query('email')
    .optional()
    .isEmail()
    .withMessage('E-mail inválido'),
  query('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres'),
];
