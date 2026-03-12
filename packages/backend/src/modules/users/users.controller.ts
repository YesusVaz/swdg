import { Response } from 'express';
import { userService } from './users.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess, sendPaginated } from '../../utils/response';

class UserController {
  async findAll(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await userService.findAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    return sendPaginated(res, result.data, result.pagination);
  }

  async findById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;

    const user = await userService.findById(id);

    return sendSuccess(res, user);
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, avatar } = req.body;

    // Users can only update their own profile (unless admin)
    if (req.user!.userId !== id) {
      // TODO: Check if user is admin
    }

    const user = await userService.update(id, { name, avatar });

    return sendSuccess(res, user, 'Usuário atualizado com sucesso');
  }

  async deactivate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params;

    await userService.deactivate(id);

    return sendSuccess(res, null, 'Usuário desativado com sucesso');
  }

  async search(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { email, name } = req.query;

    if (email) {
      const users = await userService.searchByEmail(email as string);
      return sendSuccess(res, users);
    }

    if (name) {
      const users = await userService.searchByName(name as string);
      return sendSuccess(res, users);
    }

    return sendSuccess(res, []);
  }
}

export const userController = new UserController();
