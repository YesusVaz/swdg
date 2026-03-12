import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess } from '../../utils/response';

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    const { email, password, name } = req.body;
    
    const result = await authService.register({ email, password, name });
    
    return sendSuccess(res, result, 'Usuário registrado com sucesso', 201);
  }

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    
    const result = await authService.login({ email, password });
    
    return sendSuccess(res, result, 'Login realizado com sucesso');
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;
    
    const result = await authService.refreshToken(refreshToken);
    
    return sendSuccess(res, result, 'Token atualizado com sucesso');
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;
    
    await authService.logout(refreshToken);
    
    return sendSuccess(res, null, 'Logout realizado com sucesso');
  }

  async logoutAll(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    
    await authService.logoutAll(userId);
    
    return sendSuccess(res, null, 'Logout de todas as sessões realizado');
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    
    const profile = await authService.getProfile(userId);
    
    return sendSuccess(res, profile);
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    
    await authService.changePassword(userId, currentPassword, newPassword);
    
    return sendSuccess(res, null, 'Senha alterada com sucesso');
  }
}

export const authController = new AuthController();
