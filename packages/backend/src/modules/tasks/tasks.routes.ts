import { Router } from 'express';
import { taskController } from './tasks.controller';
import { authMiddleware, validate } from '../../middlewares';
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  taskFiltersValidation,
  assignTaskValidation,
  unassignTaskValidation,
  addTagValidation,
  removeTagValidation,
  createTagValidation,
  updateTagValidation,
  tagIdValidation,
} from './tasks.validation';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ========== MY TASKS ==========
router.get('/my', taskController.getMyTasks.bind(taskController));

// ========== TAGS ==========
router.get('/tags', taskController.getAllTags.bind(taskController));

router.post(
  '/tags',
  validate(createTagValidation),
  taskController.createTag.bind(taskController)
);

router.patch(
  '/tags/:id',
  validate(updateTagValidation),
  taskController.updateTag.bind(taskController)
);

router.delete(
  '/tags/:id',
  validate(tagIdValidation),
  taskController.deleteTag.bind(taskController)
);

// ========== TASKS ==========
router.post(
  '/',
  validate(createTaskValidation),
  taskController.createTask.bind(taskController)
);

router.get(
  '/team/:teamId',
  validate(taskFiltersValidation),
  taskController.findAllTasks.bind(taskController)
);

router.get(
  '/:id',
  validate(taskIdValidation),
  taskController.findTaskById.bind(taskController)
);

router.patch(
  '/:id',
  validate(updateTaskValidation),
  taskController.updateTask.bind(taskController)
);

router.delete(
  '/:id',
  validate(taskIdValidation),
  taskController.deleteTask.bind(taskController)
);

// ========== TASK ASSIGNMENTS ==========
router.post(
  '/:id/assign',
  validate(assignTaskValidation),
  taskController.assignTask.bind(taskController)
);

router.delete(
  '/:id/assign/:userId',
  validate(unassignTaskValidation),
  taskController.unassignTask.bind(taskController)
);

// ========== TASK TAGS ==========
router.post(
  '/:id/tags',
  validate(addTagValidation),
  taskController.addTag.bind(taskController)
);

router.delete(
  '/:id/tags/:tagId',
  validate(removeTagValidation),
  taskController.removeTag.bind(taskController)
);

export default router;
