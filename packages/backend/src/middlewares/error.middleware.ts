import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return sendError(
          res,
          'Registro duplicado. Este valor já existe.',
          409
        );
      case 'P2025':
        return sendError(res, 'Registro não encontrado.', 404);
      case 'P2003':
        return sendError(
          res,
          'Operação falhou devido a restrição de chave estrangeira.',
          400
        );
      default:
        return sendError(res, 'Erro no banco de dados.', 500);
    }
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    return sendError(res, 'Erro de validação', 422);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expirado', 401);
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 'JSON inválido no corpo da requisição', 400);
  }

  // Default error
  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message,
    500
  );
}
