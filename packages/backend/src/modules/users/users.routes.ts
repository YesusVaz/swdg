import { Router } from 'express';
import { userController } from './users.controller';
import { authMiddleware, validate } from '../../middlewares';
import {
  getUserValidation,
  updateUserValidation,
  searchUserValidation,
} from './users.validation';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', userController.findAll.bind(userController));

router.get(
  '/search',
  validate(searchUserValidation),
  userController.search.bind(userController)
);

router.get(
  '/:id',
  validate(getUserValidation),
  userController.findById.bind(userController)
);

router.patch(
  '/:id',
  validate(updateUserValidation),
  userController.update.bind(userController)
);

router.delete(
  '/:id',
  validate(getUserValidation),
  userController.deactivate.bind(userController)
);

export default router;
