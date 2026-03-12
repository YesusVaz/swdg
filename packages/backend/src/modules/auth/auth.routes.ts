import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware, validate } from '../../middlewares';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
} from './auth.validation';

const router = Router();

// Public routes
router.post(
  '/register',
  validate(registerValidation),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate(loginValidation),
  authController.login.bind(authController)
);

router.post(
  '/refresh-token',
  validate(refreshTokenValidation),
  authController.refreshToken.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.use(authMiddleware);

router.post('/logout-all', authController.logoutAll.bind(authController));

router.get('/profile', authController.getProfile.bind(authController));

router.patch(
  '/change-password',
  validate(changePasswordValidation),
  authController.changePassword.bind(authController)
);

export default router;
